const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/requests', authMiddleware, leaveController.applyForLeave);
router.get('/requests', authMiddleware, leaveController.getLeaveRequests);
router.patch('/requests/:id/approve', authMiddleware, leaveController.approveLeave);
router.patch('/requests/:id/reject', authMiddleware, leaveController.rejectLeave);
router.patch('/requests/:id/withdraw', authMiddleware, leaveController.withdrawLeave);

router.get('/policy', authMiddleware, leaveController.getPolicy);
router.patch('/policy', authMiddleware, leaveController.updatePolicy);

router.get('/quota/:studentId', authMiddleware, leaveController.getLeaveQuota);
router.get('/calendar', authMiddleware, leaveController.getLeaveCalendar);

module.exports = router;
