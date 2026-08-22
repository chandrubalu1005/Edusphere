const mongoose = require('mongoose');

const OtpSubmissionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  studentId: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  otpRotationIndex: { type: Number, required: true },
  deviceFingerprint: { type: String },
  flaggedSuspicious: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Deduplication requirement: one submission per student per session
OtpSubmissionSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('OtpSubmission', OtpSubmissionSchema);
