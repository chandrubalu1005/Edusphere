const express = require('express');
const liveController = require('../controllers/liveController');
const sessionController = require('../controllers/sessionController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Session Management (Faculty)
router.post('/sessions/start', authMiddleware, requireRole('faculty', 'admin'), sessionController.startSession);
router.patch('/sessions/:sessionId/status', authMiddleware, requireRole('faculty', 'admin'), sessionController.changeStatus);

// Live OTP Generation (Faculty)
router.get('/sessions/:sessionId/current-otp', authMiddleware, requireRole('faculty', 'admin'), liveController.getCurrentOtp);

// Participant Join & Checkout (Student)
router.post('/sessions/:sessionId/join', authMiddleware, requireRole('student'), liveController.joinSession);
router.post('/sessions/:sessionId/checkout', authMiddleware, requireRole('student'), liveController.checkoutSession);

module.exports = router;
