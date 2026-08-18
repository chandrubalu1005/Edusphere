const mongoose = require('mongoose');

const CourseGradeSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  department: { type: String }, // Helps with department-level aggregations
  
  courseStatus: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing', index: true },

  currentGrade: {
    assessments: { 
      type: Map, 
      of: new mongoose.Schema({
        score: Number,
        totalMarks: Number,
        percentage: Number
      }, { _id: false })
    },
    lastUpdatedAt: { type: Date, default: Date.now }
  },

  finalGrade: {
    percentage: { type: Number },
    passed: { type: Boolean },
    gradePoint: { type: Number }, // Optional mapping for CGPA contribution
    finalizedAt: { type: Date }
  }
});

CourseGradeSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
CourseGradeSchema.index({ courseId: 1, courseStatus: 1 });

module.exports = mongoose.model('CourseGrade', CourseGradeSchema);
