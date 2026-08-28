const mongoose = require('mongoose');

const AttendancePolicySchema = new mongoose.Schema({
  institutionId: { type: String, default: 'default_institution', required: true, unique: true },
  minimumAttendancePercent: { type: Number, default: 75 },
  earlyCheckInMinutes: { type: Number, default: 5 },
  lateAfterMinutes: { type: Number, default: 10 },
  checkInCloseMinutes: { type: Number, default: 15 },
  checkOutRequired: { type: Boolean, default: false },
  partialAttendanceEnabled: { type: Boolean, default: false },
  minimumParticipationMinutes: { type: Number, default: 45 },
  manualCorrectionAllowed: { type: Boolean, default: true },
  correctionApprovalRequired: { type: Boolean, default: false },
  otpRotationSeconds: { type: Number, default: 25 }, // STRICT RULE
  otpMaxAttempts: { type: Number, default: 5 },
  sessionAutoClose: { type: Boolean, default: true },
  suspiciousDetectionEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttendancePolicy', AttendancePolicySchema);
