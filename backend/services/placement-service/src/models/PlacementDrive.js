const mongoose = require('mongoose');
const PlacementDriveSchema = new mongoose.Schema({
  companyName: String, jobTitle: String, salaryPackage: String, date: String, eligibilityCriteria: String, description: String, status: { type: String, default: 'active' }
});
module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);