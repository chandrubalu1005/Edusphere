const mongoose = require('mongoose');

const PageActivitySessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  role: { type: String, required: true },
  page: { type: String, required: true },
  departmentId: { type: String, default: null },
  startedAt: { type: Date, required: true, default: Date.now },
  lastHeartbeatAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date, default: null },
  durationSeconds: { type: Number, default: null }
});

module.exports = mongoose.model('PageActivitySession', PageActivitySessionSchema);
