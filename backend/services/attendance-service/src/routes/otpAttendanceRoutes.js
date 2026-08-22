const express = require('express');
const otpController = require('../controllers/otpAttendanceController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Session Management (Faculty)
router.post('/sessions', authMiddleware, requireRole('faculty'), otpController.createSession);
router.get('/sessions', authMiddleware, requireRole('faculty', 'student'), otpController.getActiveSessions);
router.patch('/sessions/:sessionId/end', authMiddleware, requireRole('faculty'), otpController.endSession);

// OTP Generation & Display (Faculty)
router.get('/sessions/:sessionId/current-otp', authMiddleware, requireRole('faculty'), otpController.getCurrentOtp);

// Session Submissions (Faculty)
router.get('/sessions/:sessionId/submissions', authMiddleware, requireRole('faculty'), otpController.getSessionSubmissions);

// OTP Submission (Student)
router.post('/submit', authMiddleware, requireRole('student'), otpController.submitOtp);

module.exports = router;
