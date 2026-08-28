const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
  classSessionId: { type: String, required: true, unique: true }, // 1:1 mapping with ClassSession
  courseId: { type: String, required: true, index: true },
  facultyId: { type: String, required: true },
  date: { type: Date, required: true },
  slotId: { type: String, required: true },
  startAt: { type: Date, default: Date.now },
  scheduledEndAt: { type: Date, required: true },
  actualStartedAt: { type: Date },
  actualEndedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'READY', 'LIVE', 'CHECK_IN_OPEN', 'CHECK_IN_CLOSED', 'ENDING', 'COMPLETED', 'FINALIZED', 'LOCKED'],
    default: 'READY' 
  },
  attendancePolicyId: { type: String, required: true },
  sessionSecret: { type: String, required: true, select: false }, // Cryptographic secret for OTP, never exposed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AttendanceSessionSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
