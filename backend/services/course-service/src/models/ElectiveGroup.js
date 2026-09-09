const mongoose = require('mongoose');

const ElectiveGroupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true }, // e.g. "EG-CSE-Y2-S4-A"
  departmentId: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  semester: { type: Number, required: true },
  name: { type: String, required: true }, // e.g. "Elective Group A"
  requiredSelectionCount: { type: Number, required: true },
  memberOfferingIds: { type: [String], default: [] }
}, { 
  timestamps: { createdAt: true, updatedAt: false } // only createdAt according to spec, but timestamps:true is fine, let's stick to spec exactly or standard Mongoose. We'll add standard timestamps.
});

module.exports = mongoose.model('ElectiveGroup', ElectiveGroupSchema);
