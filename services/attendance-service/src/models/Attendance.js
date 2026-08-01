const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  courseId: { type: String, required: true },
  status: { type: String, required: true, enum: ['present', 'absent'] },
  date: { type: String, required: true },
  markedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
AttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', AttendanceSchema);