const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
  institutionId: { type: String, required: true },
  campusId: { type: String },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String },
  contact: {
    email: { type: String },
    phone: { type: String }
  },
  workingHours: { type: String }, // e.g., "08:00 - 20:00"
  holidayCalendar: [{ type: Date }],
  timezone: { type: String, default: 'UTC' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Library', LibrarySchema);
