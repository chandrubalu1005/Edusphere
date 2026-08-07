const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  department: { type: String, required: true },
  facultyOwnerId: { type: String, required: true },
  facultyName: { type: String, required: true },
  status: { type: String, required: true, enum: ['draft', 'pending', 'published'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  content: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['document', 'video', 'link'], default: 'document' },
    url: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  enrolledStudents: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
