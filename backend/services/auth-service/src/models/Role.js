const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  permissions: [{ type: String }] // Array of permission names
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
