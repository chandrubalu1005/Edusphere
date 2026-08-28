const mongoose = require('mongoose');

const FineTransactionSchema = new mongoose.Schema({
  transactionNumber: { type: String, required: true, unique: true },
  fineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fine', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember', required: true },
  type: { type: String, enum: ['PAYMENT', 'WAIVER'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'ONLINE', 'ADJUSTMENT', 'NONE'], default: 'NONE' },
  referenceId: { type: String }, // Transaction ID from payment gateway if online
  processedBy: { type: String, required: true }, // User ID of admin processing it
  notes: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FineTransaction', FineTransactionSchema);
