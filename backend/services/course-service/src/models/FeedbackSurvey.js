const mongoose = require('mongoose');

const FeedbackSurveySchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  studentId: { type: String, required: true },
  responses: [{
    questionId: { type: String, required: true },
    answerText: { type: String },
    score: { type: Number, min: 1, max: 5 }
  }],
  overallRating: { type: Number, min: 1, max: 5 },
  comments: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

FeedbackSurveySchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackSurvey', FeedbackSurveySchema);
