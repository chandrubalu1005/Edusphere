const mongoose = require('mongoose');

const InventoryScanSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventorySession', required: true, index: true },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true, index: true },
  scannedAt: { type: Date, default: Date.now },
  scannedBy: { type: String, required: true }, // User ID of the librarian scanning
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Where it was physically found
  isExpected: { type: Boolean, required: true }, // Was it supposed to be here?
  condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'] } // Condition verified during scan
}, { timestamps: true });

module.exports = mongoose.model('InventoryScan', InventoryScanSchema);
