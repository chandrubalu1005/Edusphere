const mongoose = require('mongoose');
const DepartmentSchema = new mongoose.Schema({
  name:               { type: String, required: true, unique: true },
  code:               { type: String, required: true, unique: true },
  headOfDepartment:   { type: String, default: '' },
  headName:           { type: String, default: '' },
  studentCount:       { type: Number, default: 0 },
  facultyCount:       { type: Number, default: 0 },
  active:             { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Department', DepartmentSchema);
