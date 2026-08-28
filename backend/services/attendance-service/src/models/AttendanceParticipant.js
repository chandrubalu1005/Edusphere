const mongoose = require('mongoose');

const AttendanceParticipantSchema = new mongoose.Schema({
  attendanceSessionId: { type: String, required: true },
  classSessionId: { type: String, required: true },
  courseId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentNameSnapshot: { type: String },
  registerNumberSnapshot: { type: String },
  checkInAt: { type: Date },
  checkOutAt: { type: Date },
  status: { type: String, enum: ['PRESENT', 'LATE', 'PARTIAL', 'ABSENT', 'EXCUSED', 'PENDING_REVIEW'], required: true },
  checkInMethod: { type: String, enum: ['OTP', 'QR', 'MANUAL', 'SYSTEM'] },
  checkOutMethod: { type: String, enum: ['OTP', 'MANUAL', 'SYSTEM', 'NONE'] },
  suspicious: { type: Boolean, default: false },
  suspiciousReasons: [{ type: String }],
  deviceFingerprint: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// A student can only have ONE participation record per ATTENDANCE SESSION
AttendanceParticipantSchema.index({ attendanceSessionId: 1, studentId: 1 }, { unique: true });
AttendanceParticipantSchema.index({ studentId: 1, date: 1 });
AttendanceParticipantSchema.index({ courseId: 1, studentId: 1 });

module.exports = mongoose.model('AttendanceParticipant', AttendanceParticipantSchema);
