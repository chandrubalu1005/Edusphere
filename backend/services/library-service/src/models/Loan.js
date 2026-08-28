const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  loanNumber: { type: String, required: true, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember', required: true, index: true },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true, index: true },
  libraryBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch', required: true },
  issuedAt: { type: Date, required: true, default: Date.now },
  issuedBy: { type: String, required: true }, // User ID of the staff member
  dueAt: { type: Date, required: true, index: true },
  returnedAt: { type: Date },
  returnedBy: { type: String }, // User ID of the staff member
  renewalCount: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED', 'CANCELLED'], default: 'ACTIVE', index: true },
  conditionAtIssue: { type: String },
  conditionAtReturn: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Loan', LoanSchema);
