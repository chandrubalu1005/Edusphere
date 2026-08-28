const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  institutionId: { type: String, default: 'default_institution', required: true },
  code: { type: String, required: true }, // e.g., 'P1', 'P2'
  name: { type: String, required: true }, // e.g., 'Period 1'
  startTime: { type: String, required: true }, // e.g., '08:45'
  endTime: { type: String, required: true }, // e.g., '10:25'
  displayOrder: { type: Number, required: true },
  active: { type: Boolean, default: true },
  graceBeforeMinutes: { type: Number, default: 5 },
  graceAfterMinutes: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TimeSlotSchema.index({ institutionId: 1, code: 1 }, { unique: true });
TimeSlotSchema.index({ institutionId: 1, displayOrder: 1 });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);
