const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true }, // Gateway reference or internal ID
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  studentId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'WALLET'], required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed }, // Raw payload from Stripe/PayPal
  processedBy: { type: String }, // Admin ID if done manually
  receiptUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
