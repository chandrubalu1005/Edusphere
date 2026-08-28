const mongoose = require('mongoose');

const BorrowingPolicySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Student Default", "Faculty Extended"
  memberType: { type: String, enum: ['STUDENT', 'FACULTY', 'STAFF', 'RESEARCH_SCHOLAR', 'GUEST', 'ALUMNI'] },
  department: { type: String }, // Optional scoped policy
  programme: { type: String }, // Optional scoped policy
  academicLevel: { type: String }, // Optional scoped policy
  bookCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Optional rule override for specific categories
  bookFormat: { type: String, enum: ['PRINT', 'EBOOK', 'AUDIOBOOK', 'JOURNAL', 'REFERENCE', 'THESIS', 'REPORT', 'OTHER'] }, // Reference books usually have 0 days loan
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch' }, // Optional scoped rule
  
  maximumActiveLoans: { type: Number, required: true, default: 3 },
  loanPeriodDays: { type: Number, required: true, default: 14 },
  maximumRenewals: { type: Number, required: true, default: 1 },
  finePerDay: { type: Number, required: true, default: 1.0 },
  gracePeriodDays: { type: Number, required: true, default: 0 },
  maximumFine: { type: Number },
  reservationAllowed: { type: Boolean, default: true },
  digitalAccessAllowed: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BorrowingPolicy', BorrowingPolicySchema);
