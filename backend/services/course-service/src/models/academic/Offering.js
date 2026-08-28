const mongoose = require('mongoose');

const CourseOfferingSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  academicTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  curriculumVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CurriculumVersion', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  capacity: { type: Number, default: 0 }, // 0 means unlimited
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' }
}, { timestamps: true });

const SectionSchema = new mongoose.Schema({
  courseOfferingId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
  code: { type: String, required: true }, // e.g. "A", "B", "L1"
  capacity: { type: Number, required: true },
  room: { type: String }, // Should eventually link to a Facility/Room model
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'CANCELLED'], default: 'PLANNED' }
}, { timestamps: true });
SectionSchema.index({ courseOfferingId: 1, code: 1 }, { unique: true });

const FacultyAssignmentSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  facultyId: { type: String, required: true }, // User ID from user-service
  role: { type: String, enum: ['PRIMARY', 'CO_INSTRUCTOR', 'LAB_FACULTY', 'TEACHING_ASSISTANT'], required: true },
  assignedBy: { type: String }, // User ID
  status: { type: String, enum: ['PROPOSED', 'APPROVED', 'ACTIVE', 'COMPLETED'], default: 'PROPOSED' }
}, { timestamps: true });
FacultyAssignmentSchema.index({ sectionId: 1, facultyId: 1 }, { unique: true });

module.exports = {
  CourseOffering: mongoose.model('CourseOffering', CourseOfferingSchema),
  Section: mongoose.model('Section', SectionSchema),
  FacultyAssignment: mongoose.model('FacultyAssignment', FacultyAssignmentSchema)
};
