const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, sparse: true, index: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  password: { type: String, required: false }, // Made false to support SSO users
  googleId: { type: String, sparse: true, unique: true },
  role: { type: String, required: true }, // Supports student, faculty, admin, management, ROOT_ADMIN, HOD, etc.
  status: { type: String, default: 'ACTIVE' },
  forcePasswordChangeOnFirstLogin: { type: Boolean, default: true },
  organizationScope: { type: mongoose.Schema.Types.Mixed },
  academicScope: { type: mongoose.Schema.Types.Mixed },
  responsibilityScope: { type: mongoose.Schema.Types.Mixed },
  permissionsProfile: { type: String },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('User', UserSchema);

