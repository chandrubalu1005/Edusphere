const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null }, // Self-referencing for hierarchy
  type: { type: String, enum: ['Floor', 'Section', 'Rack', 'Shelf'], required: true },
  code: { type: String, required: true }, // e.g., "FL1-CSE-R1-S1"
  name: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'FULL', 'MAINTENANCE'], default: 'ACTIVE' }
}, { timestamps: true });

LocationSchema.index({ branchId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Location', LocationSchema);
