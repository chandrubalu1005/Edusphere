const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/kpis',    authMiddleware, analyticsController.getKPIs);
router.get('/budgets', authMiddleware, analyticsController.getBudgets);

// Heatmap (student own data or faculty/admin for any student)
router.get('/heatmap/:studentId',        authMiddleware, analyticsController.getStudentHeatmap);

// Peer comparison (course-level anonymized percentile)
router.get('/peer-comparison/:studentId', authMiddleware, analyticsController.getPeerComparison);

// Department KPIs (management/admin)
router.get('/department/:departmentId/kpis', authMiddleware, analyticsController.getDepartmentKPIs);

module.exports = router;