const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  action: String, userId: String, username: String, timestamp: { type: Date, default: Date.now }, details: String
});
module.exports = mongoose.model('AuditLog', AuditLogSchema);