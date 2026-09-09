const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  unitId: { type: String, required: true, unique: true }, // e.g. "<offeringId>-U1"
  offeringId: { type: String, required: true },
  unitNumber: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: null },
  documentCount: { type: Number, default: 0 }
}, { 
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Unit', UnitSchema);
