const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  departmentId: { type: String, required: true, unique: true }, // e.g. "CSE"
  name: { type: String, required: true },
  program: { 
    type: String, 
    required: true,
    enum: ['BE', 'BTECH']
  },
  hodUserId: { type: String, default: null } // FK -> users.userId
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Department', DepartmentSchema);
