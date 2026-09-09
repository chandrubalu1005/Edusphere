const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  enrollmentId: { type: String, required: true, unique: true },
  studentUserId: { type: String, required: true },
  offeringId: { type: String, required: true },
  enrollmentType: { 
    type: String, 
    required: true,
    enum: ['CORE_AUTO', 'ELECTIVE_SELECTED', 'ADD_ON_OPTED_IN', 'HONORS', 'MINOR', 'PROJECT']
  },
  electiveGroupId: { type: String, default: null },
  status: { 
    type: String, 
    required: true,
    enum: ['ACTIVE', 'DROPPED', 'COMPLETED'],
    default: 'ACTIVE'
  },
  enrolledAt: { type: Date, default: Date.now },
  enrolledBy: { type: String, required: true }
});

// Indexes
EnrollmentSchema.index({ studentUserId: 1, status: 1 });
EnrollmentSchema.index({ offeringId: 1, status: 1 });
EnrollmentSchema.index({ studentUserId: 1, offeringId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
