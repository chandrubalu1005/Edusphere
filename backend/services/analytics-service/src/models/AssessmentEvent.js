const mongoose = require('mongoose');
const AssessmentEventSchema = new mongoose.Schema({
  studentId:    { type: String, required: true, index: true },
  courseId:     { type: String, required: true, index: true },
  assessmentId: { type: String, required: true },
  score:        { type: Number, required: true },
  totalMarks:   { type: Number, required: true },
  percentage:   { type: Number, required: true },
  passed:       { type: Boolean, required: true },
  timestamp:    { type: Date, default: Date.now, index: true },
});
module.exports = mongoose.model('AssessmentEvent', AssessmentEventSchema);
