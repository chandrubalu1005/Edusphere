const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true }, // e.g. "2026-2030"
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['ACTIVE', 'GRADUATED', 'ARCHIVED'],
    default: 'ACTIVE'
  }
});

module.exports = mongoose.model('Batch', BatchSchema);
