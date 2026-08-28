const mongoose = require('mongoose');

const AttendanceEventSchema = new mongoose.Schema({
  sessionId: { type: String }, // Can be classSessionId or attendanceSessionId
  classSessionId: { type: String },
  courseId: { type: String },
  studentId: { type: String },
  actorId: { type: String, required: true }, // The user who triggered the event (faculty, student, system)
  actorRole: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: [
      'SESSION_CREATED', 'SESSION_STARTED', 'OTP_ROTATED', 'PARTICIPANT_JOINED', 
      'PARTICIPANT_REJECTED', 'PARTICIPANT_MANUALLY_ADDED', 'ATTENDANCE_MARKED', 
      'END_ACTIVITY_STARTED', 'END_OTP_ROTATED', 'CHECKOUT_RECORDED', 
      'ATTENDANCE_CORRECTED', 'SESSION_COMPLETED', 'SESSION_FINALIZED', 
      'SESSION_LOCKED', 'SESSION_CANCELLED', 'SUSPICIOUS_ACTIVITY_DETECTED'
    ],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }, // e.g. oldStatus, newStatus, reason, IP, etc.
  correlationId: { type: String }
});

AttendanceEventSchema.index({ sessionId: 1, timestamp: -1 });
AttendanceEventSchema.index({ studentId: 1, timestamp: -1 });

module.exports = mongoose.model('AttendanceEvent', AttendanceEventSchema);
