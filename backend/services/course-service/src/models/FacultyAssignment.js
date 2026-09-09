const mongoose = require('mongoose');

const FacultyAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, unique: true },
  facultyUserId: { type: String, required: true },
  departmentId: { type: String, required: true },
  offeringId: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  semester: { type: Number, required: true },
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['ACTIVE', 'REVOKED'],
    default: 'ACTIVE'
  }
});

// Indexes
FacultyAssignmentSchema.index({ facultyUserId: 1, status: 1 });
FacultyAssignmentSchema.index({ offeringId: 1 });

module.exports = mongoose.model('FacultyAssignment', FacultyAssignmentSchema);
