const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/kpis', authMiddleware, analyticsController.getKPIs);
router.get('/budgets', authMiddleware, analyticsController.getBudgets);
module.exports = router;