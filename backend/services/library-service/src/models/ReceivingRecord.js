const mongoose = require('mongoose');

const ReceivingRecordSchema = new mongoose.Schema({
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
  receivedBy: { type: String, required: true }, // Admin ID
  receivedAt: { type: Date, default: Date.now },
  invoiceNumber: { type: String },
  deliveryNotes: { type: String },
  items: [{
    poItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantityReceived: { type: Number, required: true, min: 1 },
    condition: { type: String, enum: ['NEW', 'GOOD', 'DAMAGED'], default: 'NEW' },
    accessioned: { type: Boolean, default: false } // Whether they've been turned into BookCopies yet
  }]
}, { timestamps: true });

module.exports = mongoose.model('ReceivingRecord', ReceivingRecordSchema);
