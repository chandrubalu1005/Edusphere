const CourseGrade = require('../models/CourseGrade');
const AttendanceEvent = require('../models/AttendanceEvent');
const CourseRatingEvent = require('../models/CourseRatingEvent');
const DepartmentSnapshot = require('../models/DepartmentSnapshot');
const redis = require('redis');

let redisClient;
try {
  redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.connect().catch(console.error);
} catch (e) {
  console.warn('Redis not available');
}

exports.getDepartmentPerformance = async (req, res) => {
  try {
    const cacheKey = 'analytics:management:departmentPerformance';
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
         return res.json(JSON.parse(cached));
      }
    }

    // 1. Get all grades, attendance, ratings
    // Fix Bug 1: Only query completed courses for institutional/department terminal metrics
    const allGrades = await CourseGrade.find({ courseStatus: 'completed' });
    const allAttendance = await AttendanceEvent.find();
    const allRatings = await CourseRatingEvent.find();

    // 2. Group by department
    const deptMap = {};

    allGrades.forEach(g => {
       const d = g.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].students.add(g.studentId);
       deptMap[d].totalGrades++;
       if (g.finalGrade && g.finalGrade.passed) deptMap[d].passes++;
       if (g.finalGrade) deptMap[d].cgpas.push(g.finalGrade.percentage);
    });

    allAttendance.forEach(a => {
       const d = a.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].students.add(a.studentId);
       deptMap[d].totalAtt++;
       if (a.status === 'present') deptMap[d].presentAtt++;
    });

    allRatings.forEach(r => {
       const d = r.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].ratings.push(r.rating);
    });

    // 3. Fetch latest snapshots to compute trends
    const snapshots = await DepartmentSnapshot.find().sort({ createdAt: -1 });

    const results = Object.keys(deptMap).map(dept => {
       const data = deptMap[dept];
       const averageCGPA = data.cgpas.length > 0 ? data.cgpas.reduce((s,v)=>s+v, 0)/data.cgpas.length : 0;
       const passRate = data.totalGrades > 0 ? (data.passes / data.totalGrades) * 100 : 0;
       const averageAttendance = data.totalAtt > 0 ? (data.presentAtt / data.totalAtt) * 100 : 0;
       const satisfactionIndex = data.ratings.length >= 5 ? data.ratings.reduce((s,v)=>s+v, 0)/data.ratings.length : null;

       const lastSnap = snapshots.find(s => s.departmentId === dept);
       const trendVsPreviousPeriod = lastSnap ? {
           cgpaChange: Math.round((averageCGPA - lastSnap.averageCGPA) * 10) / 10,
           passRateChange: Math.round((passRate - lastSnap.passRate) * 10) / 10,
           attendanceChange: Math.round((averageAttendance - lastSnap.averageAttendance) * 10) / 10
       } : null;

       return {
          departmentId: dept,
          departmentName: dept,
          studentCount: data.students.size,
          averageCGPA: Math.round(averageCGPA * 10) / 10,
          passRate: Math.round(passRate * 10) / 10,
          averageAttendance: Math.round(averageAttendance * 10) / 10,
          satisfactionIndex: satisfactionIndex ? Math.round(satisfactionIndex * 10) / 10 : null,
          trendVsPreviousPeriod
       };
    });

    const responseData = { departments: results };

    if (redisClient) {
       await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.freezeSemesterSnapshots = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester) return res.status(400).json({ error: 'semester identifier is required' });

    // Re-use logic from getDepartmentPerformance to compute current state
    const allGrades = await CourseGrade.find({ courseStatus: 'completed' });
    const allAttendance = await AttendanceEvent.find();
    const allRatings = await CourseRatingEvent.find();

    const deptMap = {};

    allGrades.forEach(g => {
       const d = g.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].students.add(g.studentId);
       deptMap[d].totalGrades++;
       if (g.finalGrade && g.finalGrade.passed) deptMap[d].passes++;
       if (g.finalGrade) deptMap[d].cgpas.push(g.finalGrade.percentage);
    });

    allAttendance.forEach(a => {
       const d = a.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].students.add(a.studentId);
       deptMap[d].totalAtt++;
       if (a.status === 'present') deptMap[d].presentAtt++;
    });

    allRatings.forEach(r => {
       const d = r.department || 'Unknown';
       if (!deptMap[d]) deptMap[d] = { students: new Set(), passes: 0, totalGrades: 0, totalAtt: 0, presentAtt: 0, ratings: [], cgpas: [] };
       deptMap[d].ratings.push(r.rating);
    });

    const snapshotsCreated = [];

    for (const dept of Object.keys(deptMap)) {
       const data = deptMap[dept];
       const averageCGPA = data.cgpas.length > 0 ? data.cgpas.reduce((s,v)=>s+v, 0)/data.cgpas.length : 0;
       const passRate = data.totalGrades > 0 ? (data.passes / data.totalGrades) * 100 : 0;
       const averageAttendance = data.totalAtt > 0 ? (data.presentAtt / data.totalAtt) * 100 : 0;
       const satisfactionIndex = data.ratings.length >= 5 ? data.ratings.reduce((s,v)=>s+v, 0)/data.ratings.length : null;

       const snap = await DepartmentSnapshot.findOneAndUpdate(
         { departmentId: dept, semester },
         {
           studentCount: data.students.size,
           averageCGPA: Math.round(averageCGPA * 10) / 10,
           passRate: Math.round(passRate * 10) / 10,
           averageAttendance: Math.round(averageAttendance * 10) / 10,
           satisfactionIndex: satisfactionIndex ? Math.round(satisfactionIndex * 10) / 10 : null,
         },
         { upsert: true, new: true }
       );
       snapshotsCreated.push(snap);
    }

    res.json({ message: `Froze snapshots for ${snapshotsCreated.length} departments`, snapshots: snapshotsCreated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
