const AttendanceSession = require('../models/AttendanceSession');
const ClassSession = require('../models/ClassSession');
const AttendancePolicy = require('../models/AttendancePolicy');
const AttendanceEvent = require('../models/AttendanceEvent');
const crypto = require('crypto');
const { publishEvent } = require('../config/rabbitmq');

let ioInstance;
function setIoInstance(io) {
  ioInstance = io;
}

// ── State Machine Transitions ──────────────────────────────────────────────

const VALID_TRANSITIONS = {
  'SCHEDULED': ['READY', 'CANCELLED'],
  'READY': ['LIVE', 'CANCELLED'],
  'LIVE': ['CHECK_IN_OPEN', 'CHECK_IN_CLOSED', 'ENDING', 'CANCELLED'],
  'CHECK_IN_OPEN': ['CHECK_IN_CLOSED', 'ENDING'],
  'CHECK_IN_CLOSED': ['CHECK_IN_OPEN', 'ENDING', 'COMPLETED'],
  'ENDING': ['COMPLETED'],
  'COMPLETED': ['FINALIZED'],
  'FINALIZED': ['LOCKED']
};

async function logEvent(sessionId, actorId, actorRole, eventType, metadata = {}) {
  await AttendanceEvent.create({
    sessionId, actorId, actorRole, eventType, metadata
  });
  publishEvent(`attendance.${eventType.toLowerCase()}`, { sessionId, actorId, metadata });
}

exports.startSession = async (req, res) => {
  try {
    const { classSessionId } = req.body;
    if (!classSessionId) return res.status(400).json({ error: 'classSessionId is required' });

    // Validate Class Session
    const classSession = await ClassSession.findById(classSessionId);
    if (!classSession) return res.status(404).json({ error: 'Class Session not found' });
    if (classSession.facultyId !== req.user.userId) return res.status(403).json({ error: 'Access denied' });

    // Fetch Policy
    const policy = await AttendancePolicy.findOne({ institutionId: 'default_institution' });
    if (!policy) return res.status(500).json({ error: 'Attendance policy not configured' });

    // Create Attendance Session
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    const scheduledEndAt = new Date(Date.now() + 60 * 60 * 1000); // Need actual duration from slot

    const attendanceSession = await AttendanceSession.create({
      classSessionId,
      courseId: classSession.courseId,
      facultyId: classSession.facultyId,
      date: classSession.date,
      slotId: classSession.slotId,
      scheduledEndAt,
      actualStartedAt: new Date(),
      status: 'LIVE',
      attendancePolicyId: policy._id,
      sessionSecret
    });

    classSession.status = 'live';
    await classSession.save();

    await logEvent(attendanceSession._id, req.user.userId, req.user.role, 'SESSION_STARTED', { courseId: classSession.courseId });

    res.status(201).json({ message: 'Session Started', sessionId: attendanceSession._id });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Session already exists for this class' });
    res.status(500).json({ error: error.message });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newStatus } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.facultyId !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    // Validate Transition
    if (!VALID_TRANSITIONS[session.status] || !VALID_TRANSITIONS[session.status].includes(newStatus)) {
      return res.status(400).json({ error: `Invalid transition from ${session.status} to ${newStatus}` });
    }

    const oldStatus = session.status;
    session.status = newStatus;

    if (newStatus === 'COMPLETED') {
      session.actualEndedAt = new Date();
      await ClassSession.findByIdAndUpdate(session.classSessionId, { status: 'completed' });
    }

    await session.save();
    
    await logEvent(session._id, req.user.userId, req.user.role, 'SESSION_' + newStatus, { oldStatus, newStatus });

    if (ioInstance) {
      ioInstance.to(`attendance_session_${sessionId}`).emit('status_changed', { status: newStatus });
    }

    res.json({ message: 'Status updated', status: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setIoInstance = setIoInstance;
