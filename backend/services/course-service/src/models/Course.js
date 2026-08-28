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
