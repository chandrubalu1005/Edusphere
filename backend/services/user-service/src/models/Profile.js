const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, default: 'student' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  links: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  preferences: {
    darkMode: { type: Boolean, default: false },
    themeName: { type: String, default: 'university' }
  },
  active: { type: Boolean, default: true },
  displayName: { type: String, default: '' },
  department: { type: String, default: '' },
  organizationScope: { type: mongoose.Schema.Types.Mixed },
  academicScope: { type: mongoose.Schema.Types.Mixed },
  responsibilityScope: { type: mongoose.Schema.Types.Mixed },
  permissionsProfile: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Profile', ProfileSchema);

