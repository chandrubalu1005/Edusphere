const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  unitId: { type: String, required: true },
  offeringId: { type: String, required: true },
  departmentId: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    required: true,
    enum: ['ACTIVE', 'TRASHED'],
    default: 'ACTIVE'
  }
});

// Indexes
DocumentSchema.index({ unitId: 1, status: 1 });
DocumentSchema.index({ offeringId: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
