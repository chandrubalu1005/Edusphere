const mongoose = require('mongoose');
const PlacementApplicationSchema = new mongoose.Schema({
  driveId:     { type: String, required: true, index: true },
  companyName: { type: String, default: '' },
  studentId:   { type: String, required: true, index: true },
  studentName: { type: String, default: '' },
  status:      { type: String, enum: ['applied', 'shortlisted', 'selected', 'rejected'], default: 'applied' },
  appliedAt:   { type: Date, default: Date.now },
});
PlacementApplicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });
module.exports = mongoose.model('PlacementApplication', PlacementApplicationSchema);