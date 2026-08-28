const mongoose = require('mongoose');

const DigitalResourceSchema = new mongoose.Schema({
  bookTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookTitle', required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['PDF', 'EPUB', 'AUDIO', 'VIDEO', 'ARCHIVE', 'OTHER'], required: true },
  mimeType: { type: String },
  fileSize: { type: Number }, // in bytes
  bucketName: { type: String, required: true, default: 'library-digital-assets' },
  objectName: { type: String, required: true, unique: true }, // The path in MinIO
  accessType: { type: String, enum: ['PUBLIC', 'RESTRICTED', 'SUBSCRIBED'], default: 'RESTRICTED' },
  uploadedBy: { type: String }, // User ID of admin
  licenseRestrictions: { type: String }, // e.g. "Max 10 concurrent views"
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'CORRUPTED'], default: 'ACTIVE' },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DigitalResource', DigitalResourceSchema);
