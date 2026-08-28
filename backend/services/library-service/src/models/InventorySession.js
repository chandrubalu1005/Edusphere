const mongoose = require('mongoose');

const InventorySessionSchema = new mongoose.Schema({
  sessionNumber: { type: String, required: true, unique: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch', required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', index: true }, // Optional scoped inventory
  startedBy: { type: String, required: true }, // User ID of admin
  startedAt: { type: Date, required: true, default: Date.now },
  completedAt: { type: Date },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'IN_PROGRESS', index: true },
  totalExpected: { type: Number, default: 0 },
  totalScanned: { type: Number, default: 0 },
  totalMissing: { type: Number, default: 0 },
  totalMisplaced: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InventorySession', InventorySessionSchema);
