const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  departmentId: { type: String, required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  feeType: { type: String, enum: ['TUITION', 'HOSTEL', 'TRANSPORT', 'EXAM', 'LIBRARY', 'MISC'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  dueDate: { type: Date, required: true },
  lateFeePerDay: { type: Number, default: 0 },
  maxLateFee: { type: Number },
  description: { type: String }
}, { timestamps: true });

// Prevent duplicate fee structures for the same type, dept, and semester
FeeStructureSchema.index({ departmentId: 1, semester: 1, academicYear: 1, feeType: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
