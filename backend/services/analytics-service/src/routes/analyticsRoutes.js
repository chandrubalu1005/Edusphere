const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const facultyAnalyticsController = require('../controllers/facultyAnalyticsController');
const managementAnalyticsController = require('../controllers/managementAnalyticsController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

// ── Management / Admin KPIs & Budgets ─────────────────────────────────────
router.get('/kpis',    authMiddleware, requireRole('management', 'admin'), analyticsController.getKPIs);
router.get('/budgets', authMiddleware, requireRole('management', 'admin'), analyticsController.getBudgets);

// ── Student-level analytics ────────────────────────────────────────────────
// Heatmap (student own data, or faculty/admin for any student)
router.get('/heatmap/:studentId',         authMiddleware, analyticsController.getStudentHeatmap);
// Peer comparison (course-level anonymized percentile)
router.get('/peer-comparison/:studentId', authMiddleware, analyticsController.getPeerComparison);
// Risk modeling (student own, or faculty/admin)
router.get('/risk/:studentId',            authMiddleware, analyticsController.getStudentRisk);
// Grades / Transcript
router.get('/grades/:studentId',          authMiddleware, analyticsController.getStudentGrades);

// ── Department KPIs ────────────────────────────────────────────────────────
router.get('/department/:departmentId/kpis', authMiddleware, requireRole('management', 'admin'), analyticsController.getDepartmentKPIs);

// ── Faculty analytics ──────────────────────────────────────────────────────
router.get('/faculty/students',                         authMiddleware, requireRole('faculty', 'admin'), facultyAnalyticsController.getFacultyStudents);
router.get('/faculty/courses/:courseId/export',         authMiddleware, requireRole('faculty', 'admin'), facultyAnalyticsController.exportCourseReport);

// ── Management analytics ───────────────────────────────────────────────────
router.get('/management/department-performance',        authMiddleware, requireRole('management', 'admin'), managementAnalyticsController.getDepartmentPerformance);
router.post('/management/freeze-snapshots',             authMiddleware, requireRole('management', 'admin'), managementAnalyticsController.freezeSemesterSnapshots);
router.get('/management/faculty-performance',           authMiddleware, requireRole('management', 'admin'), analyticsController.getFacultyPerformance);
router.get('/management/placement-stats',               authMiddleware, requireRole('management', 'admin'), analyticsController.getPlacementStats);

// ── AI Heuristic Endpoints (deterministic, no LLM) ────────────────────────
router.get('/ai/rubric-templates', authMiddleware, requireRole('faculty', 'admin'), analyticsController.getRubricTemplates);
router.get('/ai/kpi-forecast',     authMiddleware, requireRole('management', 'admin'), analyticsController.getKPIForecast);

module.exports = router;