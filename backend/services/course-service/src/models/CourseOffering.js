const mongoose = require('mongoose');

const CourseOfferingSchema = new mongoose.Schema({
  offeringId: { type: String, required: true, unique: true }, // e.g. "OFF-CSE-Y1-S1-22MA101-2026"
  masterCourseId: { type: String, required: true },
  departmentId: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  semester: { type: Number, required: true },
  batchId: { type: String, required: true },
  academicYearId: { type: String, required: true },
  assignedFacultyIds: { type: [String], default: [] },
  status: { 
    type: String, 
    required: true,
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
    default: 'DRAFT'
  }
}, { 
  timestamps: true 
});

// Indexes
CourseOfferingSchema.index({ departmentId: 1, yearOfStudy: 1, semester: 1 });
CourseOfferingSchema.index({ masterCourseId: 1 });
CourseOfferingSchema.index({ assignedFacultyIds: 1 });

module.exports = mongoose.model('CourseOffering', CourseOfferingSchema);
