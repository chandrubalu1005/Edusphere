const mongoose = require('mongoose');

const LibraryBranchSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  campusId: { type: String },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Central Library', 'Engineering Library', 'Department Library', 'Research Library', 'Digital Library', 'Other'], default: 'Central Library' },
  description: { type: String },
  operatingHours: { type: String },
  seatingCapacity: { type: Number, default: 0 },
  contact: {
    email: { type: String },
    phone: { type: String }
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('LibraryBranch', LibraryBranchSchema);
