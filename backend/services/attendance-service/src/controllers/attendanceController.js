const Attendance = require('../models/Attendance');
const QRSession  = require('../models/QRSession');
const ClassSession = require('../models/ClassSession');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceParticipant = require('../models/AttendanceParticipant');
const AttendanceEvent = require('../models/AttendanceEvent');
const { publishEvent } = require('../config/rabbitmq');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

let redisClient;
function setRedisClient(client) {
  redisClient = client;
}

async function invalidateCache(studentId, courseId, date) {
  if (!redisClient) return;
  try {
    if (courseId && date) await redisClient.del(`attendance:course:${courseId}:${date}`);
    if (studentId)        await redisClient.del(`attendance:student:${studentId}`);
    if (courseId)         await redisClient.del(`attendance:leaderboard:${courseId}`);
    console.log(`Cache invalidated for student:${studentId} and course:${courseId}`);
  } catch (err) {
    console.error('Cache invalidation failed:', err.message);
  }
}

// ── Distance Calculation (Haversine) ────────────────────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // in metres
}

// ── Manual Attendance Mark ──────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }
    const { studentId, studentName, courseId, status, date } = req.body;
    if (!studentId || !studentName || !courseId || !status || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1.4 Authorization Scoping Fix
    if (req.user.role === 'faculty') {
      try {
        const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
        const resp = await fetch(`${COURSE_URL}/courses/${courseId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        if (!resp.ok) return res.status(404).json({ error: 'Course not found' });
        const course = await resp.json();
        if (course.facultyOwnerId !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You are not the owner of this course' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to verify course ownership' });
      }
    }

    const record = await Attendance.findOneAndUpdate(
      { studentId, courseId, date },
      { studentName, status, markedBy: req.user.username, markMethod: 'manual', qrSessionId: null },
      { new: true, upsert: true }
    );
    await invalidateCache(studentId, courseId, date);
    publishEvent('attendance.marked', { studentId, courseId, status, date, markedBy: req.user.username, markMethod: 'manual' });
    res.json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Bulk Manual Mark ────────────────────────────────────────────────────────
exports.markAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }
    const { courseId, date, records } = req.body;
    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'CourseId, date, and records array are required' });
    }

    // 1.4 Authorization Scoping Fix
    if (req.user.role === 'faculty') {
      try {
        const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
        const resp = await fetch(`${COURSE_URL}/courses/${courseId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        if (!resp.ok) return res.status(404).json({ error: 'Course not found' });
        const course = await resp.json();
        if (course.facultyOwnerId !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You are not the owner of this course' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to verify course ownership' });
      }
    }

    const operations = records.map(rec => ({
      updateOne: {
        filter: { studentId: rec.studentId, courseId, date },
        update: { studentName: rec.studentName, status: rec.status, markedBy: req.user.username, markMethod: 'manual' },
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

// ── Course Attendance List ──────────────────────────────────────────────────
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
    const payload = { records, total: records.length };
    if (redisClient) await redisClient.setEx(cacheKey, 86400, JSON.stringify(payload));
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Student Attendance Metrics ─────────────────────────────────────────────
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
    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const percentage = Math.round((present / total) * 100);
    const breakdown  = {};
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

// ── Attendance Leaderboard ─────────────────────────────────────────────────
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
          _id: '$studentId',
          studentName: { $first: '$studentName' },
          total:       { $sum: 1 },
          present:     { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId:   '$_id',
          studentName: 1,
          total:       1,
          present:     1,
          percentage:  { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 0] }
        }
      },
      { $sort: { percentage: -1, studentName: 1 } },
      { $limit: 10 }
    ]);
    const payload = { leaderboard, total: leaderboard.length };
    if (redisClient) await redisClient.setEx(cacheKey, 86400, JSON.stringify(payload));
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── QR Session: Faculty Creates ────────────────────────────────────────────
exports.createQRSession = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }
    const { courseId, date, windowMins = 10, latitude, longitude, radius = 50 } = req.body;
    if (!courseId || !date) {
      return res.status(400).json({ error: 'courseId and date are required' });
    }

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + windowMins * 60 * 1000);

    // Persist to Mongo (TTL fallback)
    await QRSession.create({ sessionId, courseId, date, facultyId: req.user.userId, windowMins, expiresAt, latitude, longitude, radius });

    // Store in Redis with TTL (primary)
    if (redisClient) {
      await redisClient.setEx(
        `qrsession:${sessionId}`,
        windowMins * 60,
        JSON.stringify({ courseId, date, facultyId: req.user.userId, expiresAt, latitude, longitude, radius })
      );
    }

    // Generate QR code as base64 PNG (encodes the sessionId so the student app can scan it)
    const qrPayload = JSON.stringify({ sessionId, courseId, date });
    const qrBase64  = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });

    res.status(201).json({ sessionId, expiresAt, qrBase64, courseId, date, windowMins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── QR Session: Student Scans ──────────────────────────────────────────────
exports.scanQRSession = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Access forbidden. Students only.' });
    }
    const { sessionId } = req.params;
    const studentId   = req.user.userId;
    const studentName = req.user.username;

    // 1. Validate session (Redis first, Mongo fallback)
    let sessionData = null;
    if (redisClient) {
      const raw = await redisClient.get(`qrsession:${sessionId}`);
      if (raw) sessionData = JSON.parse(raw);
    }
    if (!sessionData) {
      // Mongo fallback
      const session = await QRSession.findOne({ sessionId, active: true });
      if (!session || session.expiresAt < new Date()) {
        return res.status(410).json({ error: 'QR session has expired or does not exist' });
      }
      sessionData = { courseId: session.courseId, date: session.date, latitude: session.latitude, longitude: session.longitude, radius: session.radius };
    }

    const { courseId, date, latitude: sessionLat, longitude: sessionLon, radius: sessionRadius } = sessionData;
    
    // Validate Geofencing
    if (sessionLat !== undefined && sessionLon !== undefined) {
      const { latitude, longitude } = req.body;
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Location required for this session' });
      }
      const distance = getDistance(sessionLat, sessionLon, latitude, longitude);
      if (distance > (sessionRadius || 50)) {
        return res.status(403).json({ error: `You are too far from the classroom (${Math.round(distance)}m)` });
      }
    }

    // 2. Mark attendance — let the DB unique index (studentId, courseId, date) enforce deduplication.
    // No findOne needed; code 11000 = already marked for this session date.
    const record = await Attendance.create({
      studentId,
      studentName,
      courseId,
      date,
      status:      'present',
      markedBy:    `qr:${sessionId}`,
      markMethod:  'qr',
      qrSessionId: sessionId,
    });

    await invalidateCache(studentId, courseId, date);


    // 4. Publish event (same payload shape as manual mark)
    publishEvent('attendance.marked', {
      studentId, courseId, status: 'present', date,
      markedBy: `qr:${sessionId}`, markMethod: 'qr'
    });

    res.status(201).json({ message: 'Attendance marked via QR', record });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Attendance already recorded for this session' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ── Weekly Attendance Summary (Faculty Dashboard) ──────────────────────────
exports.getWeeklySummary = async (req, res) => {
  try {
    const { courseId, facultyId } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dateStr = sevenDaysAgo.toISOString().slice(0, 10);

    const filter = {};
    if (courseId) filter.courseId = courseId;

    // Build last 7 dates
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const records = await Attendance.find({
      ...filter,
      date: { $gte: dateStr },
    }).lean();

    // Group by date
    const grouped = {};
    days.forEach(d => { grouped[d] = { date: d, present: 0, absent: 0, total: 0 }; });
    records.forEach(r => {
      if (grouped[r.date]) {
        grouped[r.date].total++;
        if (r.status === 'present') grouped[r.date].present++;
        else grouped[r.date].absent++;
      }
    });

    const summary = days.map(d => grouped[d]);
    res.json({ summary, days: days.length, courseId: courseId || 'all' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Class Sessions ─────────────────────────────────────────────────────────

exports.resolveTodaysClasses = async (req, res) => {
  try {
    const { dateStr } = req.body; // e.g., '2023-10-25'
    if (!dateStr) return res.status(400).json({ error: 'dateStr is required' });

    const targetDate = new Date(dateStr);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDate.getDay()];

    // Fetch timetable slots for the day
    const TIMETABLE_URL = process.env.TIMETABLE_SERVICE_URL || 'http://localhost:3009';
    const resp = await fetch(`${TIMETABLE_URL}/timetable`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!resp.ok) return res.status(500).json({ error: 'Failed to fetch timetable' });
    
    const allSlots = await resp.json();
    const todaysSlots = allSlots.filter(s => s.day === dayOfWeek);

    const createdSessions = [];
    
    for (const slot of todaysSlots) {
      // Check if session exists
      const existing = await ClassSession.findOne({
        courseId: slot.courseId,
        date: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        },
        slotId: slot._id
      });

      if (!existing) {
        const newSession = await ClassSession.create({
          date: targetDate,
          courseId: slot.courseId,
          facultyId: slot.instructorId,
          slotId: slot._id,
          room: slot.room,
          status: 'scheduled'
        });
        createdSessions.push(newSession);
      }
    }

    res.json({ message: 'Resolved todays classes', newSessions: createdSessions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassSessions = async (req, res) => {
  try {
    const { dateStr, courseId, facultyId } = req.query;
    let filter = {};
    
    if (dateStr) {
      const targetDate = new Date(dateStr);
      filter.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    }
    if (courseId) filter.courseId = courseId;
    if (facultyId) filter.facultyId = facultyId;

    const sessions = await ClassSession.find(filter);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Manual Corrections (New Architecture) ──────────────────────────────────

exports.manualAddParticipant = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') return res.status(403).json({ error: 'Access forbidden' });
    const { sessionId } = req.params;
    const { studentId, studentName, status = 'PRESENT', reason } = req.body;
    
    if (!reason) return res.status(400).json({ error: 'Reason is required for manual addition' });

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const participant = await AttendanceParticipant.create({
      attendanceSessionId: sessionId,
      classSessionId: session.classSessionId,
      courseId: session.courseId,
      studentId: studentId,
      studentNameSnapshot: studentName,
      status: status,
      checkInMethod: 'MANUAL',
      checkOutMethod: 'MANUAL' // Defaulting to complete presence
    });

    await AttendanceEvent.create({
      sessionId,
      studentId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      eventType: 'PARTICIPANT_MANUALLY_ADDED',
      metadata: { reason, status }
    });

    res.status(201).json({ message: 'Participant manually added', participant });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Participant already exists in this session' });
    res.status(500).json({ error: error.message });
  }
};

exports.setRedisClient = setRedisClient;