const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  generatedBy: { type: String, required: true }, // Admin ID
  totalAmount: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['DRAFT', 'ISSUED', 'PARTIAL', 'FULFILLED', 'CANCELLED'], default: 'DRAFT', index: true },
  items: [{
    acquisitionRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcquisitionRequest' }, // Optional link
    title: { type: String, required: true },
    isbn: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    receivedQuantity: { type: Number, default: 0 }
  }],
  issuedAt: { type: Date },
  expectedDeliveryAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
