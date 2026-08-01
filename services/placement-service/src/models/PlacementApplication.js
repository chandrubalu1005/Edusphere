const mongoose = require('mongoose');
const PlacementApplicationSchema = new mongoose.Schema({
  driveId: String, companyName: String, studentId: String, studentName: String, status: { type: String, default: 'applied' }
});
module.exports = mongoose.model('PlacementApplication', PlacementApplicationSchema);