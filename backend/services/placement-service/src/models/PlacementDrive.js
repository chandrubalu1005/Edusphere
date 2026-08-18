const mongoose = require('mongoose');
const PlacementDriveSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  salaryPackage: { type: String, required: true },
  date: { type: Date, required: true },
  eligibilityCriteria: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
});
module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);