const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  taxId: { type: String },
  paymentTerms: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
