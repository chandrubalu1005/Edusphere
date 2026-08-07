const mongoose = require(''mongoose'');

// Each QR session represents a single attendance-taking window for a course on a date.
// TTL index auto-deletes expired sessions from Mongo after windowMins expires.
// Redis is the primary TTL store; Mongo TTL is the fallback.
const QRSessionSchema = new mongoose.Schema({
  sessionId:  { type: String, required: true, unique: true, index: true },
  courseId:   { type: String, required: true },
  date:       { type: String, required: true },
  facultyId:  { type: String, required: true },
  windowMins: { type: Number, default: 10 },
  expiresAt:  { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  active:     { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model(''QRSession'', QRSessionSchema);
