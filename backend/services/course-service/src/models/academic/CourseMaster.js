const mongoose = require('mongoose');

const CourseMasterSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  code: { type: String, required: true, unique: true }, // e.g. "CS501"
  title: { type: String, required: true },
  shortName: { type: String },
  description: { type: String },
  level: { type: String, enum: ['UG', 'PG', 'PHD'], required: true },
  type: { type: String, enum: ['THEORY', 'PRACTICAL', 'LAB', 'PROJECT', 'SEMINAR'], default: 'THEORY' },
  credits: { type: Number, required: true },
  hours: {
    lecture: { type: Number, default: 0 },
    tutorial: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    totalContact: { type: Number, default: 0 }
  },
  learningOutcomes: [{ type: String }],
  syllabus: { type: String }, // Can be a URL or text
  gradingType: { type: String, enum: ['LETTER', 'PASS_FAIL', 'PERCENTAGE'], default: 'LETTER' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' }
}, { timestamps: true });

const CoursePrerequisiteSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster', required: true },
  ruleType: { 
    type: String, 
    enum: [
      'COURSE_REQUIRED', 'CREDIT_REQUIRED', 'GRADE_REQUIRED', 
      'CGPA_REQUIRED', 'COURSE_GROUP_REQUIRED', 'ALL_OF', 'ANY_OF'
    ], 
    required: true 
  },
  // If rule involves specific courses (e.g. COURSE_REQUIRED, GRADE_REQUIRED)
  targetCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' },
  targetGrade: { type: String }, // e.g. 'B'
  // If rule involves metrics (e.g. CREDIT_REQUIRED, CGPA_REQUIRED)
  targetValue: { type: Number },
  // For compound rules (ALL_OF, ANY_OF) - recursive structures can be complex in flat mongo schema, 
  // so we might store an array of other rule IDs or a JSON representation of sub-rules
  compoundRules: [{ type: mongoose.Schema.Types.Mixed }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

const CourseEquivalenceSchema = new mongoose.Schema({
  sourceCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster', required: true },
  targetCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster', required: true },
  equivalenceType: { type: String, enum: ['EXACT', 'CREDIT_ONLY', 'CONTENT_ONLY'], default: 'EXACT' },
  effectiveDate: { type: Date, required: true },
  approvedBy: { type: String }, // User ID
  approvalDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = {
  CourseMaster: mongoose.model('CourseMaster', CourseMasterSchema),
  CoursePrerequisite: mongoose.model('CoursePrerequisite', CoursePrerequisiteSchema),
  CourseEquivalence: mongoose.model('CourseEquivalence', CourseEquivalenceSchema)
};
