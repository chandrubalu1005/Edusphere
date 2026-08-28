const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "CSU"
  name: { type: String, required: true }, // e.g. "CampusSphere University"
  establishedYear: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  metadata: { type: Object }
}, { timestamps: true });

const CampusSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  code: { type: String, required: true }, // e.g. "MAIN"
  name: { type: String, required: true }, // e.g. "Main Campus"
  address: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });
CampusSchema.index({ institutionId: 1, code: 1 }, { unique: true });

const DepartmentSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' }, // Optional, some depts are multi-campus
  code: { type: String, required: true }, // e.g. "CSE"
  name: { type: String, required: true }, // e.g. "Computer Science & Engineering"
  hodId: { type: String }, // User ID of the Head of Department
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });
DepartmentSchema.index({ institutionId: 1, code: 1 }, { unique: true });

const AcademicYearSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  code: { type: String, required: true }, // e.g. "2026-2027"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'COMPLETED'], default: 'PLANNED' }
}, { timestamps: true });
AcademicYearSchema.index({ institutionId: 1, code: 1 }, { unique: true });

const AcademicTermSchema = new mongoose.Schema({
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  code: { type: String, required: true }, // e.g. "FALL_2026", "ODD_SEM_2026"
  name: { type: String, required: true }, // e.g. "Odd Semester", "Fall Term"
  type: { type: String, enum: ['SEMESTER', 'TRIMESTER', 'QUARTER', 'SUMMER'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationStartDate: { type: Date },
  registrationEndDate: { type: Date },
  addDropDeadline: { type: Date },
  withdrawalDeadline: { type: Date },
  status: { type: String, enum: ['DRAFT', 'UPCOMING', 'REGISTRATION_OPEN', 'ACTIVE', 'FROZEN', 'COMPLETED'], default: 'DRAFT' }
}, { timestamps: true });
AcademicTermSchema.index({ academicYearId: 1, code: 1 }, { unique: true });

module.exports = {
  Institution: mongoose.model('Institution', InstitutionSchema),
  Campus: mongoose.model('Campus', CampusSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  AcademicYear: mongoose.model('AcademicYear', AcademicYearSchema),
  AcademicTerm: mongoose.model('AcademicTerm', AcademicTermSchema)
};
