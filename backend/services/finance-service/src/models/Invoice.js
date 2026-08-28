const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true }, // Global User ID
  departmentId: { type: String, required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT', index: true },
  
  // Breakdown of charges
  lineItems: [{
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  
  // Reductions
  scholarships: [{
    scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
    description: { type: String },
    amountApplied: { type: Number, required: true }
  }],
  
  // Penalties
  lateFeesApplied: { type: Number, default: 0 },
  
  // Aggregates
  subtotal: { type: Number, required: true }, // Sum of lineItems
  totalDiscount: { type: Number, default: 0 }, // Sum of scholarships
  totalAmount: { type: Number, required: true }, // subtotal - totalDiscount + lateFeesApplied
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true }, // totalAmount - paidAmount
  
  currency: { type: String, default: 'USD' },
  issuedAt: { type: Date },
  dueDate: { type: Date, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
