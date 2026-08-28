const AttendanceSession = require('../models/AttendanceSession');
const AttendanceParticipant = require('../models/AttendanceParticipant');
const AttendanceEvent = require('../models/AttendanceEvent');
const otpEngine = require('../utils/otpEngine');
const { publishEvent } = require('../config/rabbitmq');

let redisClient;
function setRedisClient(client) { redisClient = client; }

let ioInstance;
function setIoInstance(io) { ioInstance = io; }

async function logEvent(sessionId, actorId, actorRole, eventType, metadata = {}) {
  await AttendanceEvent.create({ sessionId, actorId, actorRole, eventType, metadata });
  publishEvent(`attendance.${eventType.toLowerCase()}`, { sessionId, actorId, metadata });
}

// ── FACULTY ROUTES ────────────────────────────────────────────────────────

exports.getCurrentOtp = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { purpose = 'JOIN' } = req.query; // 'JOIN' or 'END'

    const session = await AttendanceSession.findById(sessionId).select('+sessionSecret');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.facultyId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status !== 'CHECK_IN_OPEN' && purpose === 'JOIN') {
      return res.status(400).json({ error: 'Check-in is not open' });
    }
    if (session.status !== 'ENDING' && purpose === 'END') {
      return res.status(400).json({ error: 'End activity is not open' });
    }

    const currentOtp = otpEngine.generateCode(session.sessionSecret, purpose);
    const timeRemaining = otpEngine.getTimeRemaining();

    res.json({ currentOtp, timeRemaining, purpose, bucket: otpEngine.getCurrentBucket() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── STUDENT ROUTES ────────────────────────────────────────────────────────

exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { otp, deviceFingerprint } = req.body;
    
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const session = await AttendanceSession.findById(sessionId).select('+sessionSecret');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'CHECK_IN_OPEN') return res.status(400).json({ error: 'Check-in is closed' });

    const studentId = req.user.userId;

    // TODO: Phase 3 Verification (Verify if student is enrolled in session.courseId)
    // Assuming verified for now based on prompt constraints

    // Rate Limit (5 attempts per 10 mins)
    const rateLimitKey = `otp_attempts:${sessionId}:${studentId}`;
    if (redisClient) {
      const attempts = await redisClient.get(rateLimitKey);
      if (attempts && parseInt(attempts) >= 5) {
        return res.status(429).json({ error: 'Account locked for this session due to too many failed attempts' });
      }
    }

    // Strict 25-second OTP Verification
    const isValid = otpEngine.verify(otp, session.sessionSecret, 'JOIN');
    if (!isValid) {
      if (redisClient) {
        await redisClient.incr(rateLimitKey);
        await redisClient.expire(rateLimitKey, 600);
      }
      return res.status(400).json({ error: 'Invalid or expired OTP. Try again.' });
    }

    // Fingerprint Check
    let suspicious = false;
    let suspiciousReasons = [];
    if (deviceFingerprint && redisClient) {
      const fpKey = `otp_fp:${sessionId}:${deviceFingerprint}`;
      const usedBy = await redisClient.sMembers(fpKey);
      if (usedBy.length > 0 && !usedBy.includes(studentId)) {
        suspicious = true;
        suspiciousReasons.push('DEVICE_FINGERPRINT_REUSED');
      }
      await redisClient.sAdd(fpKey, studentId);
      await redisClient.expire(fpKey, 3600);
    }

    // Record Participation
    const participant = await AttendanceParticipant.create({
      attendanceSessionId: sessionId,
      classSessionId: session.classSessionId,
      courseId: session.courseId,
      studentId: studentId,
      studentNameSnapshot: req.user.username,
      checkInAt: new Date(),
      status: 'PRESENT', // Might adjust to LATE based on policy later
      checkInMethod: 'OTP',
      suspicious,
      suspiciousReasons,
      deviceFingerprint
    });

    await logEvent(sessionId, studentId, 'student', 'PARTICIPANT_JOINED', { method: 'OTP', suspicious });

    if (ioInstance) {
      ioInstance.to(`attendance_session_${sessionId}`).emit('participant_joined', {
        studentId,
        studentName: req.user.username,
        checkInAt: participant.checkInAt,
        status: participant.status,
        suspicious
      });
    }

    res.status(201).json({ message: 'Successfully checked in', participant });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already joined this session' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.checkoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { otp } = req.body;
    
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const session = await AttendanceSession.findById(sessionId).select('+sessionSecret');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'ENDING') return res.status(400).json({ error: 'End activity checkout is closed' });

    const studentId = req.user.userId;

    const participant = await AttendanceParticipant.findOne({ attendanceSessionId: sessionId, studentId });
    if (!participant) return res.status(404).json({ error: 'You are not checked into this session' });
    if (participant.checkOutAt) return res.status(400).json({ error: 'You have already checked out' });

    // Verify END OTP
    const isValid = otpEngine.verify(otp, session.sessionSecret, 'END');
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP. Try again.' });

    participant.checkOutAt = new Date();
    participant.checkOutMethod = 'OTP';
    await participant.save();

    await logEvent(sessionId, studentId, 'student', 'CHECKOUT_RECORDED', { method: 'OTP' });

    if (ioInstance) {
      ioInstance.to(`attendance_session_${sessionId}`).emit('participant_checkout', {
        studentId,
        checkOutAt: participant.checkOutAt
      });
    }

    res.json({ message: 'Successfully checked out', participant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setRedisClient = setRedisClient;
exports.setIoInstance = setIoInstance;
