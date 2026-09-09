const mongoose = require('mongoose');

const HonorsMinorApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  studentUserId: { type: String, required: true },
  pathwayType: { 
    type: String, 
    required: true,
    enum: ['HONORS', 'MINOR']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['APPLIED', 'ELIGIBILITY_CHECKED', 'APPROVED', 'REJECTED', 'ENROLLED', 'COMPLETED'],
    default: 'APPLIED'
  },
  appliedAt: { type: Date, default: Date.now },
  eligibilityCheckedAt: { type: Date, default: null },
  eligibilityNotes: { type: String, default: null },
  approvedBy: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  enrolledOfferingIds: { type: [String], default: [] }
});

module.exports = mongoose.model('HonorsMinorApplication', HonorsMinorApplicationSchema);
