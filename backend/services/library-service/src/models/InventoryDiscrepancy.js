const mongoose = require('mongoose');

const InventoryDiscrepancySchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventorySession', required: true, index: true },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true, index: true },
  type: { type: String, enum: ['MISSING', 'MISPLACED', 'CONDITION_MISMATCH'], required: true },
  expectedLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  foundLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Only for MISPLACED
  expectedStatus: { type: String }, // e.g., 'AVAILABLE'
  foundStatus: { type: String }, // e.g., 'MISSING' if it couldn't be found
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: String }, // User ID
  resolutionNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InventoryDiscrepancy', InventoryDiscrepancySchema);
