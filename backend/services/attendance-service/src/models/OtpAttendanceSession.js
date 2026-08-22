const mongoose = require('mongoose');

const OtpAttendanceSessionSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  facultyId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  sessionSecret: { type: String, required: true, select: false }, // Never exposed
  status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OtpAttendanceSession', OtpAttendanceSessionSchema);
