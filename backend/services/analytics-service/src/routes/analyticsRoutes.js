const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const facultyAnalyticsController = require('../controllers/facultyAnalyticsController');
const managementAnalyticsController = require('../controllers/managementAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/kpis',    authMiddleware, analyticsController.getKPIs);
router.get('/budgets', authMiddleware, analyticsController.getBudgets);

// Heatmap (student own data or faculty/admin for any student)
router.get('/heatmap/:studentId',        authMiddleware, analyticsController.getStudentHeatmap);

// Peer comparison (course-level anonymized percentile)
router.get('/peer-comparison/:studentId', authMiddleware, analyticsController.getPeerComparison);

// Student risk modeling
router.get('/risk/:studentId', authMiddleware, analyticsController.getStudentRisk);

// Department KPIs (management/admin)
router.get('/department/:departmentId/kpis', authMiddleware, analyticsController.getDepartmentKPIs);

// Student Performance (Faculty)
router.get('/faculty/students', authMiddleware, facultyAnalyticsController.getFacultyStudents);
router.get('/faculty/courses/:courseId/export', authMiddleware, facultyAnalyticsController.exportCourseReport);

// Student Performance (Management)
router.get('/management/department-performance', authMiddleware, managementAnalyticsController.getDepartmentPerformance);

module.exports = router;