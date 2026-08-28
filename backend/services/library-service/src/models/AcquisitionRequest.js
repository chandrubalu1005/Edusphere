const mongoose = require('mongoose');

const AcquisitionRequestSchema = new mongoose.Schema({
  requestedBy: { type: String, required: true, index: true }, // User ID (student or faculty)
  title: { type: String, required: true },
  authors: { type: String },
  isbn: { type: String },
  format: { type: String, enum: ['PRINT', 'EBOOK', 'AUDIO', 'ANY'], default: 'ANY' },
  reason: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'REJECTED'], default: 'PENDING', index: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  departmentId: { type: String }, // Which department is requesting it (budgeting)
  reviewedBy: { type: String }, // Admin ID
  reviewNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AcquisitionRequest', AcquisitionRequestSchema);
