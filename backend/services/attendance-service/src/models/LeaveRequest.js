const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  requesterId: { type: String, required: true },
  requesterRole: { type: String, required: true, enum: ['student', 'faculty'] },
  leaveType: { type: String, required: true }, 
  startDate: { type: Date, required: true }, // format YYYY-MM-DD
  endDate: { type: Date, required: true },
  daysCount: { type: Number, required: true },
  affectedCourses: [{ type: String }],
  reason: { type: String, required: true },
  supportingDocument: { type: String, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  approverId: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  isOverride: { type: Boolean, default: false },
  overriddenBy: { type: String, default: null },
}, { timestamps: true });

// Indexes for quota calculation and queue queries
LeaveRequestSchema.index({ requesterId: 1, status: 1 });
LeaveRequestSchema.index({ requesterId: 1, leaveType: 1, status: 1 });
LeaveRequestSchema.index({ status: 1, createdAt: -1 }); // For admin queue view

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
