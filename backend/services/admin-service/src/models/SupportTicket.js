const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  studentId:   { type: String, required: true, index: true },
  studentName: { type: String },
  subject:     { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  category:    { type: String, enum: ['technical', 'academic', 'administrative', 'library', 'other'], default: 'other' },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  // Admin response
  response:     { type: String, maxlength: 2000 },
  respondedBy:  { type: String },
  respondedAt:  { type: Date },
  resolvedAt:   { type: Date },
}, { timestamps: true });

supportTicketSchema.index({ studentId: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
