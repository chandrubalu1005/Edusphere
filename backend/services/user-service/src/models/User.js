const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true,
    enum: ['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT', 'HOD', 'FACULTY', 'STUDENT']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['ACTIVE', 'DISABLED', 'PENDING'],
    default: 'ACTIVE'
  },
  
  // Department/academic scope
  departmentId: { type: String, default: null },
  facultyType: { 
    type: String, 
    enum: ['NORMAL', 'HOD', null],
    default: null 
  },
  program: { type: String, default: null },
  batch: { type: String, default: null },
  admissionYear: { type: Number, default: null },
  academicYear: { type: String, default: null },
  yearOfStudy: { type: Number, default: null },
  currentSemester: { type: Number, default: null },

  // Management responsibility metadata
  responsibility: {
    departmentId: { type: String, default: null },
    years: { type: [Number], default: null },
    semesters: { type: [Number], default: null }
  },

  createdBy: { type: String, default: null },
  lastLoginAt: { type: Date, default: null }
}, { 
  timestamps: true 
});

// Indexes
UserSchema.index({ role: 1, departmentId: 1 });
UserSchema.index({ departmentId: 1, yearOfStudy: 1, currentSemester: 1 });

module.exports = mongoose.model('User', UserSchema);
