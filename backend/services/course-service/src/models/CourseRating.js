const mongoose = require('mongoose');

const CourseRatingSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  studentId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// A student can only rate a course once
CourseRatingSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('CourseRating', CourseRatingSchema);
