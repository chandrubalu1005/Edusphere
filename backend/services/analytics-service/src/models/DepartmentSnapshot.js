const mongoose = require('mongoose');

const DepartmentSnapshotSchema = new mongoose.Schema({
  departmentId: { type: String, required: true },
  semester: { type: String, required: true }, // Identifier for the period
  studentCount: { type: Number, default: 0 },
  averageCGPA: { type: Number, default: 0 },
  passRate: { type: Number, default: 0 },
  averageAttendance: { type: Number, default: 0 },
  satisfactionIndex: { type: Number, default: null }, // Null if insufficient data
  createdAt: { type: Date, default: Date.now }
});

DepartmentSnapshotSchema.index({ departmentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('DepartmentSnapshot', DepartmentSnapshotSchema);
