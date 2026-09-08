const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, unique: true, sparse: true, index: true },
  masterCourseId: { type: String, index: true },
  code: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  department: { type: String, required: true },
  program: { type: String },
  yearOfStudy: { type: Number },
  semester: { type: Number },
  category: { type: String, default: 'CORE' },
  categorySource: { type: String },
  facultyOwnerId: { type: String },
  facultyName: { type: String },
  coInstructors: [{ type: String }], // Array of user IDs
  status: { type: String, required: true, enum: ['draft', 'pending', 'published', 'active', 'completed'], default: 'published' },
  rejectionReason: { type: String, default: '' },
  capacity: { type: Number, default: 60 },
  credits: { type: Number, default: 3 },
  units: [{
    unitNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    documents: [{
      title: { type: String },
      type: { type: String, default: 'document' },
      url: { type: String },
      addedAt: { type: Date, default: Date.now }
    }]
  }],
  content: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['document', 'video', 'link'], default: 'document' },
    url: { type: String, required: true },
    unlockDate: { type: Date, default: null },
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
}, { strict: false });

module.exports = mongoose.model('Course', CourseSchema);
