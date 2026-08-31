const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mark',                          authMiddleware, attendanceController.markAttendance);
router.post('/mark-all',                      authMiddleware, attendanceController.markAllAttendance);
router.get('/course/:courseId',               authMiddleware, attendanceController.getCourseAttendance);
router.get('/student/:studentId',             authMiddleware, attendanceController.getStudentMetrics);
router.get('/leaderboard/:courseId',          authMiddleware, attendanceController.getLeaderboard);
router.get('/weekly-summary',                 authMiddleware, attendanceController.getWeeklySummary);

// QR Attendance
router.post('/sessions',                      authMiddleware, attendanceController.createQRSession);
router.post('/sessions/:sessionId/scan',      authMiddleware, attendanceController.scanQRSession);

// Class Sessions
router.post('/class-sessions/resolve',        authMiddleware, attendanceController.resolveTodaysClasses);
router.get('/class-sessions',                 authMiddleware, attendanceController.getClassSessions);

// Manual Operations
router.post('/sessions/:sessionId/manual-add', authMiddleware, attendanceController.manualAddParticipant);

// OTP Attendance
router.get('/otp-attendance/sessions',        authMiddleware, attendanceController.getOtpSessions);
router.post('/otp-attendance/submit',         authMiddleware, attendanceController.submitOtp);

module.exports = router;