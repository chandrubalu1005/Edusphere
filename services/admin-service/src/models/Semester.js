const mongoose = require(''mongoose'');
const SemesterSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  year:       { type: String, required: true },
  startDate:  { type: Date,   required: true },
  endDate:    { type: Date,   required: true },
  status:     { type: String, enum: [''upcoming'',''active'',''completed''], default: ''upcoming'' },
}, { timestamps: true });
module.exports = mongoose.model(''Semester'', SemesterSchema);
