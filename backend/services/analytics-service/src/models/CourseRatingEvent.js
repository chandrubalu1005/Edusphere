const mongoose = require('mongoose');

const CourseRatingEventSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  studentId: { type: String, required: true },
  department: { type: String },
  rating: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

CourseRatingEventSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('CourseRatingEvent', CourseRatingEventSchema);
