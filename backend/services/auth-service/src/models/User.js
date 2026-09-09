const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, index: true, required: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String },
  displayName: { type: String, required: true },
  passwordHash: { type: String, required: false }, 
  role: { 
    type: String, 
    required: true,
    enum: ['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT', 'HOD', 'FACULTY', 'STUDENT'] 
  },
  status: { 
    type: String, 
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] 
  },
  departmentId: { type: String, index: true },
  
  // Academic Context
  program: { type: String },
  batch: { type: String },
  admissionYear: { type: Number },
  academicYear: { type: String },
  yearOfStudy: { type: Number },
  currentSemester: { type: Number },
  
  // Faculty Specific
  defaultYearOfStudy: { type: Number },
  defaultSemesters: [{ type: Number }],

  // Legacy/Compatibility fields (to not break everything immediately if other modules expect them)
  organizationScope: { type: mongoose.Schema.Types.Mixed },
  academicScope: { type: mongoose.Schema.Types.Mixed },
  responsibilityScope: { type: mongoose.Schema.Types.Mixed },

  forcePasswordChangeOnFirstLogin: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  lastLoginAt: { type: Date }
}, { strict: true, timestamps: true });

module.exports = mongoose.model('User', UserSchema);
