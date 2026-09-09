const mongoose = require('mongoose');

const DocumentVersionSchema = new mongoose.Schema({
  courseResourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseResource', required: true, index: true },
  versionNumber: { type: Number, required: true },
  uploadedBy: { type: String, required: true },
  checksum: { type: String }, // MD5 or SHA-256 hash for integrity
  fileSize: { type: Number, required: true }, // bytes
  mimeType: { type: String, required: true },
  bucketName: { type: String, required: true, default: 'library-course-resources' },
  objectKey: { type: String, required: true },
  changeNote: { type: String },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'CORRUPTED'], default: 'ACTIVE' },
}, { timestamps: true });

// Ensure version numbers are unique per resource
DocumentVersionSchema.index({ courseResourceId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('DocumentVersion', DocumentVersionSchema);
