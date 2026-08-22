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

module.exports = router;