const AttendanceEvent  = require('../models/AttendanceEvent');
const AssessmentEvent  = require('../models/AssessmentEvent');

// ── KPIs (management-facing, aggregated from read-models) ──────────────────
exports.getKPIs = async (req, res) => {
  try {
    const [totalAttendance, attendancePresent, totalAssessments, passedAssessments] = await Promise.all([
      AttendanceEvent.countDocuments(),
      AttendanceEvent.countDocuments({ status: 'present' }),
      AssessmentEvent.countDocuments(),
      AssessmentEvent.countDocuments({ passed: true }),
    ]);
    const attendanceRate = totalAttendance > 0 ? ((attendancePresent / totalAttendance) * 100).toFixed(1) : '0.0';
    const passRate       = totalAssessments > 0 ? ((passedAssessments / totalAssessments) * 100).toFixed(1) : '0.0';
    res.json({
      attendanceRate:    `${attendanceRate}%`,
      assessmentPassRate:`${passRate}%`,
      totalAttendance,
      totalAssessments,
      // Static institutional KPIs (admin-curated, not sourced from LMS events)
      NAAC_Score:         '3.62 / 4 (A++)',
      NBA_Accreditation:  '9 out of 11 Departments Accredited',
      researchIndex:      'H-Index 42',
      placementRatio:     '92.4% average salary ₹8.2 LPA',
      retentionRate:      `${attendanceRate}%`,
      studentSatisfaction:'4.7 / 5',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Budgets (static — not sourced from LMS events) ─────────────────────────
exports.getBudgets = async (req, res) => {
  try {
    res.json([
      { department: 'Computer Science',     allocated: 2500000, spent: 2100000 },
      { department: 'Electronics & Comm',   allocated: 1800000, spent: 1750000 },
      { department: 'Mechanical Engg',      allocated: 1200000, spent: 980000  },
      { department: 'Civil Engg',           allocated: 900000,  spent: 870000  },
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Student Attendance Heatmap ─────────────────────────────────────────────
// Returns daily attendance status for the last 90 days for one student
exports.getStudentHeatmap = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId }  = req.query;

    // Students can only see their own heatmap
    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filter = { studentId };
    if (courseId) filter.courseId = courseId;

    const records = await AttendanceEvent.find(filter)
      .select('date status courseId markMethod')
      .sort({ date: 1 });

    // Group by date for calendar heatmap
    const heatmap = {};
    records.forEach(r => {
      if (!heatmap[r.date]) {
        heatmap[r.date] = { date: r.date, status: r.status, courses: [] };
      }
      heatmap[r.date].courses.push({ courseId: r.courseId, status: r.status, markMethod: r.markMethod });
    });

    res.json({ studentId, heatmap: Object.values(heatmap), total: records.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Peer Comparison (anonymized) ──────────────────────────────────────────
exports.getPeerComparison = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId }  = req.query;

    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!courseId) return res.status(400).json({ error: 'courseId query param is required' });

    const allStudents = await AssessmentEvent.aggregate([
      { $match: { courseId } },
      { $group: { _id: '$studentId', avgPercentage: { $avg: '$percentage' }, attempts: { $sum: 1 } } },
      { $sort: { avgPercentage: -1 } }
    ]);

    if (allStudents.length === 0) {
      return res.json({ studentId, courseId, myAverage: null, courseAverage: null, percentile: null, rank: null, total: 0 });
    }

    const myRecord = allStudents.find(s => s._id === studentId);
    const myAverage = myRecord ? Math.round(myRecord.avgPercentage) : null;
    const courseAverage = Math.round(allStudents.reduce((sum, s) => sum + s.avgPercentage, 0) / allStudents.length);
    const rank = myRecord ? allStudents.findIndex(s => s._id === studentId) + 1 : null;
    const percentile = rank ? Math.round(((allStudents.length - rank) / allStudents.length) * 100) : null;

    res.json({ studentId, courseId, myAverage, courseAverage, rank, percentile, total: allStudents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Department KPIs (management-facing) ────────────────────────────────────
exports.getDepartmentKPIs = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const [attendanceStats, assessmentStats] = await Promise.all([
      AttendanceEvent.aggregate([
        { $match: { courseId: { $regex: departmentId, $options: 'i' } } },
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } }
      ]),
      AssessmentEvent.aggregate([
        { $match: { courseId: { $regex: departmentId, $options: 'i' } } },
        { $group: { _id: null, total: { $sum: 1 }, passed: { $sum: { $cond: ['$passed', 1, 0] } }, avgScore: { $avg: '$percentage' } } }
      ]),
    ]);

    const att  = attendanceStats[0]  || { total: 0, present: 0 };
    const asm  = assessmentStats[0]  || { total: 0, passed: 0, avgScore: 0 };

    res.json({
      departmentId,
      attendance: {
        rate: att.total > 0 ? ((att.present / att.total) * 100).toFixed(1) : '0.0',
        total: att.total,
        present: att.present,
      },
      assessments: {
        passRate:  asm.total > 0 ? ((asm.passed / asm.total) * 100).toFixed(1) : '0.0',
        avgScore:  Math.round(asm.avgScore || 0),
        total:     asm.total,
        passed:    asm.passed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Student Risk Modeling ──────────────────────────────────────────────────
exports.getStudentRisk = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Students can only see their own risk score, faculty/admin can see any
    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [attendanceStats, assessmentStats] = await Promise.all([
      AttendanceEvent.aggregate([
        { $match: { studentId } },
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } }
      ]),
      AssessmentEvent.aggregate([
        { $match: { studentId } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' }, total: { $sum: 1 } } }
      ])
    ]);

    const att = attendanceStats[0] || { total: 0, present: 0 };
    const asm = assessmentStats[0] || { total: 0, avgScore: 0 };

    const attendanceRate = att.total > 0 ? (att.present / att.total) * 100 : 100;
    const avgScore = asm.total > 0 ? asm.avgScore : 100;

    // Simple Risk Score: 
    // Attendance risk: < 75% is high risk (adds up to 50 points)
    // Grade risk: < 50% is high risk (adds up to 50 points)
    let riskScore = 0;
    
    if (attendanceRate < 75) {
      riskScore += ((75 - attendanceRate) / 75) * 50;
    }
    
    if (avgScore < 50) {
      riskScore += ((50 - avgScore) / 50) * 50;
    }

    // Cap at 100
    riskScore = Math.min(Math.round(riskScore), 100);

    let riskLevel = 'Low';
    if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Medium';

    res.json({
      studentId,
      riskScore,
      riskLevel,
      factors: {
        attendanceRate: Math.round(attendanceRate),
        avgScore: Math.round(avgScore)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};