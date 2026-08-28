const mongoose = require('mongoose');

const LoanEventSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  eventType: { 
    type: String, 
    enum: ['LOAN_CREATED', 'LOAN_RENEWED', 'LOAN_RETURNED', 'LOAN_OVERDUE', 'LOAN_MARKED_LOST', 'FINE_CREATED', 'FINE_PAID', 'FINE_WAIVED'],
    required: true
  },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember' },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy' },
  timestamp: { type: Date, default: Date.now, index: true },
  performedBy: { type: String }, // User ID performing the action
  metadata: { type: mongoose.Schema.Types.Mixed }, // Arbitrary data like { previousDueDate: "...", newDueDate: "..." }
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LoanEvent', LoanEventSchema);
