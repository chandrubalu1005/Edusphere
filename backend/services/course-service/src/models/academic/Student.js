const mongoose = require('mongoose');

const StudentAcademicPlanSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // User ID from user-service
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  regulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Regulation', required: true },
  curriculumVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CurriculumVersion', required: true },
  majorId: { type: String }, // Assuming major is just a string track name for now, could be its own collection
  minorId: { type: mongoose.Schema.Types.ObjectId, ref: 'MinorProgramme' },
  honoursId: { type: mongoose.Schema.Types.ObjectId, ref: 'HonoursProgramme' },
  expectedGraduation: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  academicStatus: { type: String, enum: ['ACTIVE', 'PROBATION', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED'], default: 'ACTIVE' }
}, { timestamps: true });
StudentAcademicPlanSchema.index({ studentId: 1, programmeId: 1 }, { unique: true });

const MinorProgrammeSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  minimumCredits: { type: Number, required: true },
  requiredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' }],
  electiveCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' }],
  minimumCGPA: { type: Number },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'RETIRED'], default: 'DRAFT' }
}, { timestamps: true });

const HonoursProgrammeSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  minimumAdditionalCredits: { type: Number, required: true },
  requiredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' }],
  minimumCGPA: { type: Number },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'RETIRED'], default: 'DRAFT' }
}, { timestamps: true });

const StudentRegistrationSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  academicTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
  requestedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'], default: 'DRAFT' },
  advisorApprovalRequired: { type: Boolean, default: false },
  approvedBy: { type: String }
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRegistration' },
  status: { type: String, enum: ['ENROLLED', 'WAITLISTED', 'DROPPED', 'WITHDRAWN', 'COMPLETED'], default: 'ENROLLED' },
  // Snapshot for historical preservation
  academicTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster', required: true },
  creditsAttempted: { type: Number, required: true },
  creditsEarned: { type: Number, default: 0 },
  grade: { type: String }, // e.g. 'A', 'B+', 'F'
  gradePoints: { type: Number }
}, { timestamps: true });
EnrollmentSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });

module.exports = {
  StudentAcademicPlan: mongoose.model('StudentAcademicPlan', StudentAcademicPlanSchema),
  MinorProgramme: mongoose.model('MinorProgramme', MinorProgrammeSchema),
  HonoursProgramme: mongoose.model('HonoursProgramme', HonoursProgrammeSchema),
  StudentRegistration: mongoose.model('StudentRegistration', StudentRegistrationSchema),
  Enrollment: mongoose.model('Enrollment', EnrollmentSchema)
};
