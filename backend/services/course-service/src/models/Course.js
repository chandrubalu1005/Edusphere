const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  department: { type: String, required: true },
  facultyOwnerId: { type: String, required: true },
  facultyName: { type: String, required: true },
  coInstructors: [{ type: String }], // Array of user IDs
  status: { type: String, required: true, enum: ['draft', 'pending', 'published'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  capacity: { type: Number, default: 60 },
  content: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['document', 'video', 'link'], default: 'document' },
    url: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  syllabusVersions: [{
    versionId: { type: String, required: true },
    content: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String }
  }],
  prerequisites: [{ type: String }], // Array of course codes
  enrolledStudents: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Indexes for common query patterns
CourseSchema.index({ department: 1, status: 1 });
CourseSchema.index({ facultyOwnerId: 1, status: 1 });
CourseSchema.index({ status: 1, createdAt: -1 });

// Virtual for backward compatibility: 'students_enrolled' used in some dashboard code
CourseSchema.virtual('students_enrolled').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);
