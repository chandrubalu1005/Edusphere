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
      // Static institutional KPIs (models do not exist, returning N/A to prevent fake data)
      NAAC_Score:         'N/A',
      NBA_Accreditation:  'N/A',
      researchIndex:      'N/A',
      placementRatio:     'N/A',
      retentionRate:      `${attendanceRate}%`,
      studentSatisfaction:'N/A',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Budgets (static — not sourced from LMS events) ─────────────────────────
exports.getBudgets = async (req, res) => {
  try {
    // Budget model does not exist. Returning empty array to avoid fake data.
    res.json([]);
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

    let riskScore = 0;
    if (attendanceRate < 75) riskScore += ((75 - attendanceRate) / 75) * 50;
    if (avgScore < 50)       riskScore += ((50 - avgScore) / 50) * 50;
    riskScore = Math.min(Math.round(riskScore), 100);

    let riskLevel = 'Low';
    if (riskScore > 60)      riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Medium';

    res.json({
      studentId, riskScore, riskLevel,
      factors: { attendanceRate: Math.round(attendanceRate), avgScore: Math.round(avgScore) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Student Grades / Transcript ────────────────────────────────────────────
// Returns per-course grade records for a student (for Grades & Transcript page)
const CourseGrade = require('../models/CourseGrade');
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const grades = await CourseGrade.find({ studentId }).sort({ semester: -1, courseTitle: 1 });
    const semesterMap = {};
    grades.forEach(g => {
      const sem = g.semester || 'N/A';
      if (!semesterMap[sem]) semesterMap[sem] = { semester: sem, courses: [], sgpa: null };
      semesterMap[sem].courses.push({
        courseId: g.courseId, courseTitle: g.courseTitle, courseCode: g.courseCode,
        credits: g.credits || 3,
        grade: g.finalGrade?.letterGrade || null,
        percentage: g.finalGrade?.percentage || null,
        passed: g.finalGrade?.passed ?? null,
        gradePoints: g.finalGrade?.gradePoints || null,
      });
    });
    // Compute SGPA per semester (grade points avg)
    Object.values(semesterMap).forEach(sem => {
      const valid = sem.courses.filter(c => c.gradePoints !== null);
      sem.sgpa = valid.length ? Math.round((valid.reduce((s, c) => s + c.gradePoints, 0) / valid.length) * 100) / 100 : null;
    });
    const semesters = Object.values(semesterMap);
    // CGPA = avg of all grade points
    const allGradePoints = grades.filter(g => g.finalGrade?.gradePoints).map(g => g.finalGrade.gradePoints);
    const cgpa = allGradePoints.length
      ? Math.round((allGradePoints.reduce((s, v) => s + v, 0) / allGradePoints.length) * 100) / 100
      : null;
    res.json({ studentId, semesters, cgpa, totalCourses: grades.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Management: Faculty Performance ───────────────────────────────────────
exports.getFacultyPerformance = async (req, res) => {
  try {
    // Aggregate course ratings and attendance events to compute faculty metrics
    const ratingAgg = await CourseGrade.aggregate([
      { $group: { _id: '$facultyId', avgGrade: { $avg: '$finalGrade.percentage' }, courseCount: { $addToSet: '$courseId' }, studentCount: { $sum: 1 } } },
      { $sort: { avgGrade: -1 } }
    ]);
    const faculty = ratingAgg.map(f => ({
      facultyId: f._id,
      avgStudentGrade: f.avgGrade !== null ? Math.round(f.avgGrade * 10) / 10 : null,
      coursesCount: f.courseCount.length,
      studentsCount: f.studentCount,
    }));
    res.json({ faculty, total: faculty.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Management: Placement Stats ────────────────────────────────────────────
exports.getPlacementStats = async (req, res) => {
  try {
    // Uses AssessmentEvent as proxy data — real placement data would come from placement-service
    // This is an aggregation endpoint — returns what's actually in the DB
    const stats = await AssessmentEvent.aggregate([
      { $group: { _id: '$department', totalStudents: { $addToSet: '$studentId' }, avgScore: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);
    const departments = stats.map(s => ({
      department: s._id || 'Unknown',
      eligibleStudents: s.totalStudents.length,
      avgAssessmentScore: s.avgScore ? Math.round(s.avgScore * 10) / 10 : null,
      passedCount: s.passed,
    }));
    res.json({ departments, total: departments.length, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── AI: Rubric Templates (Deterministic — no LLM) ─────────────────────────
exports.getRubricTemplates = (req, res) => {
  // Canned rubric library — deterministic, no external AI call
  const templates = [
    {
      id: 'essay',
      name: 'Essay / Report Rubric',
      description: 'For written assignments, project reports, and research papers',
      criteria: [
        { name: 'Content & Accuracy',      weight: 35, descriptors: { excellent: 'Thorough, accurate, well-researched', good: 'Mostly accurate with minor gaps', fair: 'Some inaccuracies, incomplete coverage', poor: 'Major inaccuracies or missing content' } },
        { name: 'Structure & Organization', weight: 25, descriptors: { excellent: 'Logical flow, clear sections, excellent transitions', good: 'Generally well-organized', fair: 'Some structure present but inconsistent', poor: 'No clear structure' } },
        { name: 'Analysis & Critical Thinking', weight: 25, descriptors: { excellent: 'Deep analysis, original insights', good: 'Good analysis with some depth', fair: 'Surface-level analysis', poor: 'Minimal analysis' } },
        { name: 'Language & Presentation', weight: 15, descriptors: { excellent: 'Clear, professional, error-free', good: 'Minor errors, generally clear', fair: 'Noticeable errors, unclear in places', poor: 'Many errors, difficult to follow' } },
      ],
    },
    {
      id: 'programming',
      name: 'Programming Assignment Rubric',
      description: 'For coding assignments, projects, and lab work',
      criteria: [
        { name: 'Correctness & Functionality', weight: 40, descriptors: { excellent: 'All test cases pass, handles edge cases', good: 'Most test cases pass, minor issues', fair: 'Core logic works, some bugs', poor: 'Does not compile or run correctly' } },
        { name: 'Code Quality & Style',        weight: 25, descriptors: { excellent: 'Clean, well-commented, follows conventions', good: 'Readable with minor style issues', fair: 'Some documentation, inconsistent style', poor: 'No comments, poor readability' } },
        { name: 'Algorithm Efficiency',        weight: 20, descriptors: { excellent: 'Optimal time/space complexity', good: 'Near-optimal, minimal overhead', fair: 'Works but inefficient', poor: 'Brute-force or extremely slow' } },
        { name: 'Testing & Validation',        weight: 15, descriptors: { excellent: 'Comprehensive tests, edge cases covered', good: 'Good test coverage', fair: 'Basic tests present', poor: 'No tests' } },
      ],
    },
    {
      id: 'presentation',
      name: 'Oral Presentation Rubric',
      description: 'For seminars, project demos, and viva',
      criteria: [
        { name: 'Content Mastery',    weight: 35, descriptors: { excellent: 'Demonstrates deep understanding, answers all questions', good: 'Good understanding, minor gaps', fair: 'Basic understanding, struggles with questions', poor: 'Poor understanding' } },
        { name: 'Delivery & Clarity', weight: 30, descriptors: { excellent: 'Confident, clear, engaging delivery', good: 'Generally clear delivery', fair: 'Some nervousness, unclear at times', poor: 'Difficult to follow' } },
        { name: 'Slides / Visuals',   weight: 20, descriptors: { excellent: 'Professional, enhances understanding', good: 'Good quality slides', fair: 'Adequate but basic', poor: 'Missing or poor quality' } },
        { name: 'Time Management',    weight: 15, descriptors: { excellent: 'Perfect timing', good: 'Within ±1 min', fair: 'Slightly over/under', poor: 'Significantly off time' } },
      ],
    },
  ];
  res.json({ templates, total: templates.length });
};

// ── AI: KPI Forecast (Deterministic linear trend) ─────────────────────────
exports.getKPIForecast = async (req, res) => {
  try {
    // Build a simple 3-point linear trend from the last 3 DepartmentSnapshot records
    const snapshots = await DepartmentSnapshot.find().sort({ createdAt: -1 }).limit(3);
    if (snapshots.length < 2) {
      return res.json({
        forecast: null,
        message: 'Insufficient historical data for forecasting (need at least 2 snapshots)',
        snapshots: snapshots.length,
      });
    }
    // Reverse to chronological order
    snapshots.reverse();
    // Linear projection: slope from first to last, then project forward by same interval
    const first = snapshots[0];
    const last  = snapshots[snapshots.length - 1];
    const periods = snapshots.length - 1;

    function projectField(fieldPath) {
      const getVal = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
      const v1 = getVal(first, fieldPath) || 0;
      const v2 = getVal(last, fieldPath)  || 0;
      const slope = (v2 - v1) / periods;
      return Math.round((v2 + slope) * 10) / 10;
    }

    res.json({
      forecast: {
        projectedAverageCGPA:       projectField('averageCGPA'),
        projectedPassRate:          projectField('passRate'),
        projectedAttendanceRate:    projectField('averageAttendance'),
      },
      basedOnPeriods: snapshots.length,
      generatedAt: new Date(),
      disclaimer: 'Linear projection from historical snapshots. For planning purposes only.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const DepartmentSnapshot = require('../models/DepartmentSnapshot');