const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
  academicYearId: { type: String, required: true, unique: true }, // e.g. "2027-28"
  isCurrent: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);
