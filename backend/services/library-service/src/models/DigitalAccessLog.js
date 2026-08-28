const mongoose = require('mongoose');

const DigitalAccessLogSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalResource', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember', required: true, index: true },
  accessType: { type: String, enum: ['VIEW', 'DOWNLOAD'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'RATE_LIMITED'], default: 'SUCCESS' },
  denialReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DigitalAccessLog', DigitalAccessLogSchema);
