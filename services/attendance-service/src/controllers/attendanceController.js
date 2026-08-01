const Attendance = require('../models/Attendance');
const { publishEvent } = require('../config/rabbitmq');

let redisClient;
function setRedisClient(client) {
  redisClient = client;
}

async function invalidateCache(studentId, courseId, date) {
  if (!redisClient) return;
  try {
    if (courseId && date) await redisClient.del(`attendance:course:${courseId}:${date}`);
    if (studentId) await redisClient.del(`attendance:student:${studentId}`);
    if (courseId) await redisClient.del(`attendance:leaderboard:${courseId}`);
    console.log(`Cache invalidated for student:${studentId} and course:${courseId}`);
  } catch (err) {
    console.error('Cache invalidation failed:', err.message);
  }
}

exports.markAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }
    const { studentId, studentName, courseId, status, date } = req.body;
    if (!studentId || !studentName || !courseId || !status || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const record = await Attendance.findOneAndUpdate(
      { studentId, courseId, date },
      { studentName, status, markedBy: req.user.username },
      { new: true, upsert: true }
    );
    await invalidateCache(studentId, courseId, date);
    publishEvent('attendance.marked', { studentId, courseId, status, date, markedBy: req.user.username });
    res.json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }
    const { courseId, date, records } = req.body;
    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'CourseId, date, and records array are required' });
    }
    const operations = records.map(rec => ({
      updateOne: {
        filter: { studentId: rec.studentId, courseId, date },
        update: { studentName: rec.studentName, status: rec.status, markedBy: req.user.username },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(operations);
    for (const rec of records) {
      await invalidateCache(rec.studentId, courseId, date);
    }
    publishEvent('attendance.marked_bulk', { courseId, date, count: records.length, markedBy: req.user.username });
    res.json({ message: `Successfully marked ${records.length} records.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
    const cacheKey = `attendance:course:${req.params.courseId}:${date}`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }
    const records = await Attendance.find({ courseId: req.params.courseId, date });
    if (redisClient) await redisClient.setEx(cacheKey, 86400, JSON.stringify(records));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentMetrics = async (req, res) => {
  try {
    const cacheKey = `attendance:student:${req.params.studentId}`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }
    const records = await Attendance.find({ studentId: req.params.studentId });
    if (records.length === 0) {
      return res.json({ percentage: 100, present: 0, total: 0, breakdown: {} });
    }
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const percentage = Math.round((present / total) * 100);
    const breakdown = {};
    records.forEach(rec => {
      if (!breakdown[rec.courseId]) breakdown[rec.courseId] = { present: 0, total: 0 };
      breakdown[rec.courseId].total++;
      if (rec.status === 'present') breakdown[rec.courseId].present++;
    });
    Object.keys(breakdown).forEach(courseId => {
      const course = breakdown[courseId];
      course.percentage = Math.round((course.present / course.total) * 100);
    });
    const metrics = { percentage, present, total, breakdown };
    if (redisClient) await redisClient.setEx(cacheKey, 604800, JSON.stringify(metrics));
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const cacheKey = `attendance:leaderboard:${req.params.courseId}`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }
    const leaderboard = await Attendance.aggregate([
      { $match: { courseId: req.params.courseId } },
      {
        $group: {
          _id: "$studentId",
          studentName: { $first: "$studentName" },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId: "$_id",
          studentName: 1,
          total: 1,
          present: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 0] }
        }
      },
      { $sort: { percentage: -1, studentName: 1 } },
      { $limit: 10 }
    ]);
    if (redisClient) await redisClient.setEx(cacheKey, 86400, JSON.stringify(leaderboard));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setRedisClient = setRedisClient;