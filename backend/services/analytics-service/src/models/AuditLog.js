const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  actorUserId: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'USER_CREATED', 'USER_UPDATED', 'USER_DISABLED', 'USER_ENABLED',
      'LOGIN_SUCCESS', 'LOGIN_FAILURE',
      'MASTER_COURSE_CREATED', 'MASTER_COURSE_UPDATED',
      'COURSE_OFFERING_CREATED', 'COURSE_OFFERING_UPDATED', 'COURSE_OFFERING_DELETED',
      'DOCUMENT_UPLOADED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'DOCUMENT_RESTORED', 'DOCUMENT_PERMANENTLY_DELETED',
      'ENROLLMENT_CREATED', 'ENROLLMENT_CHANGED', 'ENROLLMENT_DROPPED',
      'ELECTIVE_GROUP_CREATED', 'HONORS_MINOR_STATUS_CHANGED',
      'ROLE_CHANGED', 'PERMISSION_CHANGED',
      'FACULTY_ASSIGNMENT_CREATED', 'FACULTY_ASSIGNMENT_REVOKED',
      'ACCESS_DENIED'
    ]
  },
  resourceType: { type: String, required: true },
  resourceId: { type: String, required: true },
  departmentId: { type: String, default: null },
  academicScope: {
    yearOfStudy: { type: Number, default: null },
    semester: { type: Number, default: null }
  },
  result: { 
    type: String, 
    required: true,
    enum: ['SUCCESS', 'FAILURE', 'DENIED']
  },
  correlationId: { type: String, required: true },
  ip: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

// Indexes
AuditLogSchema.index({ actorUserId: 1, timestamp: -1 });
AuditLogSchema.index({ departmentId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ result: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
