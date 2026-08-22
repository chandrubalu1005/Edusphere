const OtpAttendanceSession = require('../models/OtpAttendanceSession');
const OtpSubmission = require('../models/OtpSubmission');
const Attendance = require('../models/Attendance');
const { TOTP } = require('otplib');
const crypto = require('crypto');
const { publishEvent } = require('../config/rabbitmq');

const authenticator = new TOTP({ step: 15 });
authenticator.timeRemaining = function() {
  const step = this.options.step || 30;
  return step - (Math.floor(Date.now() / 1000) % step);
};

let redisClient;
let ioInstance; // For socket.io

function setRedisClient(client) {
  redisClient = client;
}

function setIoInstance(io) {
  ioInstance = io;
}

// ── Session Management ──────────────────────────────────────────────────

exports.createSession = async (req, res) => {
  try {
    const { courseId, durationMins = 60 } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });

    // Validate course ownership
    const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
    const resp = await fetch(`${COURSE_URL}/courses/${courseId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!resp.ok) return res.status(404).json({ error: 'Course not found or access denied' });
    const course = await resp.json();
    if (course.facultyOwnerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied: You are not the owner of this course' });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);
    const sessionSecret = authenticator.generateSecret(); // 32 chars typically

    const session = await OtpAttendanceSession.create({
      courseId,
      facultyId: req.user.userId,
      startTime,
      endTime,
      sessionSecret
    });

    res.status(201).json({
      sessionId: session._id,
      courseId: session.courseId,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    // Return sessions based on role
    let filter = { status: 'active' };
    
    if (req.user.role === 'faculty') {
      filter.facultyId = req.user.userId;
    } else if (req.user.role === 'student') {
      // Find courses the student is enrolled in (in reality we'd fetch this from course-service)
      // For now, let's allow fetching by courseId if provided, or return all active and let frontend filter,
      // but ideally we ask course-service what they are enrolled in.
      if (req.query.courseId) filter.courseId = req.query.courseId;
    }

    const sessions = await OtpAttendanceSession.find(filter).select('-sessionSecret'); // NEVER EXPOSE SECRET
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await OtpAttendanceSession.findOneAndUpdate(
      { _id: sessionId, facultyId: req.user.userId },
      { status: 'closed', endTime: new Date() },
      { new: true }
    ).select('-sessionSecret');
    
    if (!session) return res.status(404).json({ error: 'Session not found or access denied' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Current OTP Endpoint (Faculty only) ─────────────────────────────────

exports.getCurrentOtp = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await OtpAttendanceSession.findOne({ _id: sessionId, facultyId: req.user.userId }).select('+sessionSecret');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session is closed' });

    const currentOtp = authenticator.generate(session.sessionSecret);
    const timeRemaining = authenticator.timeRemaining();
    
    res.json({ currentOtp, timeRemaining, step: 15 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── Submission ──────────────────────────────────────────────────────────

exports.submitOtp = async (req, res) => {
  try {
    const { sessionId, otp, deviceFingerprint } = req.body;
    if (!sessionId || !otp) return res.status(400).json({ error: 'sessionId and otp are required' });

    const session = await OtpAttendanceSession.findById(sessionId).select('+sessionSecret');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active' || session.endTime < new Date()) {
      return res.status(410).json({ error: 'Session is closed or expired' });
    }

    const studentId = req.user.userId;
    const rateLimitKey = `otp_attempts:${sessionId}:${studentId}`;

    // 1. Check Rate Limit
    if (redisClient) {
      const attempts = await redisClient.get(rateLimitKey);
      if (attempts && parseInt(attempts) >= 5) {
        return res.status(429).json({ error: 'Too many failed attempts. You are locked out of this session. Contact faculty.' });
      }
    }

    // 2. Verify OTP (Window: current step, or 1 previous step for grace)
    const isValid = authenticator.verify({ token: otp, secret: session.sessionSecret, window: [1, 0] });
    
    if (!isValid) {
      if (redisClient) {
        await redisClient.incr(rateLimitKey);
        await redisClient.expire(rateLimitKey, 3600); // 1 hour TTL
      }
      return res.status(400).json({ error: 'Incorrect or expired code' });
    }

    // 3. Deduplication is handled by OtpSubmission's compound unique index
    // 4. Device Fingerprint Check
    let flaggedSuspicious = false;
    if (deviceFingerprint && redisClient) {
      const fpKey = `otp_fp:${sessionId}:${deviceFingerprint}`;
      const usedBy = await redisClient.sMembers(fpKey);
      if (usedBy.length > 0 && !usedBy.includes(studentId)) {
        flaggedSuspicious = true; // Fingerprint used by someone else in this session
      }
      await redisClient.sAdd(fpKey, studentId);
      await redisClient.expire(fpKey, 3600);
    }

    const timeBucket = Math.floor(Date.now() / 15000);

    const submission = await OtpSubmission.create({
      sessionId,
      studentId,
      otpRotationIndex: timeBucket,
      deviceFingerprint,
      flaggedSuspicious
    });

    // 5. Create actual Attendance record
    const dateStr = new Date().toISOString().split('T')[0];
    const record = await Attendance.create({
      studentId,
      studentName: req.user.username,
      courseId: session.courseId,
      date: new Date(dateStr),
      status: 'present',
      markedBy: 'otp_system',
      markMethod: 'otp'
    });

    // Invalidate cache
    if (redisClient) {
      await redisClient.del(`attendance:student:${studentId}`);
      await redisClient.del(`attendance:course:${session.courseId}:${dateStr}`);
    }

    publishEvent('attendance.marked', {
      studentId, courseId: session.courseId, status: 'present', date: record.date, markMethod: 'otp'
    });

    // 6. Notify faculty via Socket.IO
    if (ioInstance) {
      ioInstance.to(`otp_session_${sessionId}`).emit('otp_submission', {
        studentId,
        studentName: req.user.username,
        submittedAt: submission.submittedAt,
        flaggedSuspicious
      });
    }

    res.status(201).json({ message: 'Marked Present', submission });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already marked attendance for this session' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionSubmissions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Basic verification that they own the session
    const session = await OtpAttendanceSession.findOne({ _id: sessionId, facultyId: req.user.userId });
    if (!session) return res.status(403).json({ error: 'Access denied' });

    const submissions = await OtpSubmission.find({ sessionId }).sort({ submittedAt: -1 });
    
    // We ideally want to join with student names, but for now we'll just return what we have.
    // If needed, we can augment with student names by fetching from auth-service, or we can store studentName in OtpSubmission.
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setRedisClient = setRedisClient;
exports.setIoInstance = setIoInstance;
