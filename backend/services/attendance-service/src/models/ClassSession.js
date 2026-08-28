const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  courseId: { type: String, required: true },
  facultyId: { type: String, required: true },
  slotId: { type: String, required: true }, // Links to TimeSlot
  room: { type: String },
  status: { type: String, enum: ['scheduled', 'ready', 'live', 'completed', 'cancelled', 'rescheduled', 'no_class'], default: 'scheduled' },
  sessionType: { type: String, enum: ['regular', 'makeup', 'special'], default: 'regular' },
  specialReason: { type: String }, // Required if makeup/special
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index to prevent duplicate class sessions for the same course and slot on a specific date
ClassSessionSchema.index({ courseId: 1, date: 1, slotId: 1 }, { unique: true });
ClassSessionSchema.index({ facultyId: 1, date: 1, slotId: 1 });

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
