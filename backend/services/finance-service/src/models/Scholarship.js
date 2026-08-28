const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  value: { type: Number, required: true }, // either % (e.g. 50) or fixed amount (e.g. 5000)
  maxAmount: { type: Number }, // Cap for percentage based
  applicableFeeTypes: [{ type: String, enum: ['TUITION', 'HOSTEL', 'TRANSPORT', 'EXAM', 'LIBRARY', 'MISC'] }], // Which fees can this apply to
  fundSource: { type: String }, // e.g. "Govt", "Alumni", "University"
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  validUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
