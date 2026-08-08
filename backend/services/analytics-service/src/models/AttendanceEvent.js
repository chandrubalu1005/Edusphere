const mongoose = require('mongoose');
const AttendanceEventSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  courseId:  { type: String, required: true, index: true },
  date:      { type: String, required: true },
  status:    { type: String, enum: ['present', 'absent'], required: true },
  markedBy:  String,
  markMethod:{ type: String, enum: ['manual', 'qr'], default: 'manual' },
  timestamp: { type: Date, default: Date.now, index: true },
});
AttendanceEventSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('AttendanceEvent', AttendanceEventSchema);
