const mongoose = require('mongoose');

const ProgrammeSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  code: { type: String, required: true, unique: true }, // e.g. "BTECH-CSE"
  name: { type: String, required: true }, // e.g. "Bachelor of Technology in Computer Science"
  degree: { type: String, required: true }, // e.g. "B.Tech"
  durationYears: { type: Number, required: true },
  totalSemesters: { type: Number, required: true },
  academicLevel: { type: String, enum: ['UG', 'PG', 'PHD', 'DIPLOMA', 'CERTIFICATE'], required: true },
  creditSystem: { type: String, default: 'CBCS' },
  minimumCredits: { type: Number, required: true },
  minimumCGPA: { type: Number, default: 5.0 },
  status: { type: String, enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'RETIRED'], default: 'DRAFT' }
}, { timestamps: true });

const RegulationSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  code: { type: String, required: true }, // e.g. "R2026"
  name: { type: String, required: true }, // e.g. "Regulation 2026"
  effectiveFromYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'RETIRED'], default: 'DRAFT' }
}, { timestamps: true });
RegulationSchema.index({ programmeId: 1, code: 1 }, { unique: true });

const CurriculumVersionSchema = new mongoose.Schema({
  regulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Regulation', required: true },
  versionNumber: { type: Number, required: true }, // e.g. 1.0, 1.1
  effectiveTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm' },
  totalCreditsRequired: { type: Number, required: true },
  // Aggregated rules for degree audit
  rules: {
    coreCredits: { type: Number },
    electiveCredits: { type: Number },
    projectRequired: { type: Boolean, default: false },
    internshipRequired: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['DRAFT', 'DEPARTMENT_REVIEW', 'ACADEMIC_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'RETIRED'], default: 'DRAFT' },
  approvedBy: { type: String }, // User ID
  approvalDate: { type: Date }
}, { timestamps: true });

const SemesterSchema = new mongoose.Schema({
  curriculumVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CurriculumVersion', required: true },
  sequenceNumber: { type: Number, required: true }, // e.g. 1, 2, 3... 8
  name: { type: String }, // e.g. "Semester 1"
  requiredCredits: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });
SemesterSchema.index({ curriculumVersionId: 1, sequenceNumber: 1 }, { unique: true });

const CourseGroupSchema = new mongoose.Schema({
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  type: { 
    type: String, 
    enum: [
      'CORE', 'PROFESSIONAL_CORE', 'PROFESSIONAL_ELECTIVE', 'OPEN_ELECTIVE', 
      'MINOR', 'HONOURS', 'ABILITY_ENHANCEMENT', 'SKILL_ENHANCEMENT', 
      'VALUE_ADDED', 'PROJECT', 'INTERNSHIP', 'SEMINAR', 'RESEARCH', 
      'LABORATORY', 'CAPSTONE', 'AUDIT'
    ], 
    required: true 
  },
  name: { type: String }, // Optional custom name
  minimumCredits: { type: Number },
  maximumCredits: { type: Number },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Permitted courses for this group
}, { timestamps: true });

module.exports = {
  Programme: mongoose.model('Programme', ProgrammeSchema),
  Regulation: mongoose.model('Regulation', RegulationSchema),
  CurriculumVersion: mongoose.model('CurriculumVersion', CurriculumVersionSchema),
  Semester: mongoose.model('Semester', SemesterSchema),
  CourseGroup: mongoose.model('CourseGroup', CourseGroupSchema)
};
