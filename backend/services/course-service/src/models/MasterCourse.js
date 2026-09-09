const mongoose = require('mongoose');

const MasterCourseSchema = new mongoose.Schema({
  masterCourseId: { type: String, required: true, unique: true }, // e.g. "MC-22MA101-ENGG-MATH-1"
  courseCode: { type: String, required: true },
  courseCodeVariants: { type: [String], default: [] },
  courseName: { type: String, required: true },
  description: { type: String, default: null },
  credits: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['CORE', 'ELECTIVE', 'PROFESSIONAL_ELECTIVE', 'OPEN_ELECTIVE', 'ADD_ON', 'HONORS', 'MINOR', 'PROJECT']
  },
  categorySource: { type: String, required: true }
}, { 
  timestamps: true 
});

// Indexes
MasterCourseSchema.index({ courseCode: 1 });

module.exports = mongoose.model('MasterCourse', MasterCourseSchema);
