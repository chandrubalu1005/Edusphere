const mongoose = require('mongoose');

const CourseResourceSchema = new mongoose.Schema({
  courseOfferingId: { type: String, required: true, index: true },
  masterCourseId: { type: String, index: true },
  departmentId: { type: String, required: true, index: true },
  programId: { type: String },
  batchId: { type: String },
  academicYearId: { type: String },
  yearOfStudy: { type: Number },
  semesterId: { type: String },
  unitNumber: { 
    type: Number, 
    required: true, 
    enum: [1, 2, 3, 4, 5],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for unitNumber'
    }
  },
  title: { type: String, required: true },
  description: { type: String },
  resourceType: { 
    type: String, 
    enum: [
      'LECTURE_NOTES', 'PRESENTATION', 'QUESTION_BANK', 'REFERENCE_BOOK', 
      'VIDEO', 'ARTICLE', 'LAB_MATERIAL', 'ASSIGNMENT_REFERENCE', 
      'SYLLABUS', 'MODEL_QUESTION_PAPER', 'PREVIOUS_YEAR_PAPER', 
      'EXTERNAL_LINK', 'OTHER'
    ],
    required: true
  },
  visibility: { type: String, enum: ['PUBLIC', 'ENROLLED_ONLY', 'FACULTY_ONLY'], default: 'ENROLLED_ONLY' },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'DELETED', 'PENDING_APPROVAL'], default: 'ACTIVE' },
  ownerId: { type: String, required: true },
  activeVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentVersion' },
  isDocumentBacked: { type: Boolean, default: true },
  externalUrl: { type: String }, // Populated if not document backed
}, { timestamps: true });

// Ensure strict uniqueness: A specific resource title within a unit for a course offering should be unique
CourseResourceSchema.index({ courseOfferingId: 1, unitNumber: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('CourseResource', CourseResourceSchema);
