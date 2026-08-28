const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
  fineNumber: { type: String, required: true, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember', required: true, index: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', index: true },
  type: { type: String, enum: ['OVERDUE', 'LOST_BOOK', 'DAMAGED_BOOK', 'REPLACEMENT', 'OTHER'], required: true },
  amount: { type: Number, required: true, default: 0 },
  waivedAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number, required: true, default: 0 },
  reason: { type: String },
  calculatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'WAIVED', 'CANCELLED'], default: 'PENDING', index: true },
  createdBy: { type: String }, // 'SYSTEM' or userId
  waivedBy: { type: String },
  waiverReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Fine', FineSchema);
