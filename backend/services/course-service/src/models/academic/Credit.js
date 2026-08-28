const mongoose = require('mongoose');

const AcademicCreditLedgerEntrySchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  academicTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm' },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  sourceType: { type: String, enum: ['ENROLLMENT', 'TRANSFER', 'EXEMPTION'], required: true },
  sourceId: { type: String, required: true }, // e.g. Enrollment ID, Transfer Request ID
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' },
  credits: { type: Number, required: true },
  transactionType: { type: String, enum: ['EARNED', 'TRANSFERRED', 'EXEMPTED', 'REVERSED', 'ADJUSTED'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
  approvedBy: { type: String } // User ID
}, { timestamps: true });

const DegreeAuditSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  curriculumVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CurriculumVersion', required: true },
  lastRunDate: { type: Date, default: Date.now },
  totalCreditsEarned: { type: Number, default: 0 },
  totalCreditsRequired: { type: Number, required: true },
  cgpa: { type: Number, default: 0 },
  requirementGroups: [{
    groupType: { type: String }, // e.g. 'CORE', 'ELECTIVE', 'MINOR', 'HONOURS'
    creditsRequired: { type: Number },
    creditsEarned: { type: Number },
    isComplete: { type: Boolean, default: false },
    coursesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' }],
    coursesMissing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaster' }]
  }],
  graduationEligibility: { type: String, enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'PENDING_FINAL_GRADES'], default: 'NOT_ELIGIBLE' },
  overrideNotes: { type: String },
  overriddenBy: { type: String }
}, { timestamps: true });
DegreeAuditSchema.index({ studentId: 1, programmeId: 1 }, { unique: true });

module.exports = {
  AcademicCreditLedgerEntry: mongoose.model('AcademicCreditLedgerEntry', AcademicCreditLedgerEntrySchema),
  DegreeAudit: mongoose.model('DegreeAudit', DegreeAuditSchema)
};
