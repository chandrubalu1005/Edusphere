const mongoose = require('mongoose');

const AuditRecordSchema = new mongoose.Schema({
  actorId: { type: String, required: true, index: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, index: true }, // e.g. 'COURSE_RESOURCE_UPLOADED', 'LOAN_CREATED'
  resourceId: { type: String, required: true, index: true }, // The ID of the thing being mutated
  resourceModel: { type: String, required: true }, // 'CourseResource', 'Loan', 'BookCopy'
  scope: { type: Object }, // e.g. { departmentId: 'CSE' } for RBAC tracking
  changeSummary: { type: String }, // e.g. "Uploaded version 2"
  requestId: { type: String },
  correlationId: { type: String },
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'FAILED'], required: true },
  reason: { type: String }, // For adjustments, failures, or waivers
}, { timestamps: true });

// Immutable audits should never be modified. This is enforced at the application level,
// but we do not expose PUT/DELETE endpoints for this model.
module.exports = mongoose.model('AuditRecord', AuditRecordSchema);
