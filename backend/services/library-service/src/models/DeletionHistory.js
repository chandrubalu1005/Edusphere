const mongoose = require('mongoose');

const DeletionHistorySchema = new mongoose.Schema({
  entryId: { type: String, required: true, unique: true },
  resourceType: { 
    type: String, 
    required: true,
    enum: ['DOCUMENT', 'UNIT_CONTENT', 'COURSE_OFFERING', 'MASTER_COURSE', 'USER', 'ENROLLMENT', 'OTHER']
  },
  resourceId: { type: String, required: true },
  originalLocation: { type: mongoose.Schema.Types.Mixed, default: {} },
  snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  deletedBy: { type: String, required: true },
  deletedByRole: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now },
  reason: { type: String, default: null },
  purgeAt: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['RECOVERABLE', 'RESTORED', 'PURGED'],
    default: 'RECOVERABLE'
  },
  restoreHistory: [{
    restoredBy: { type: String },
    restoredAt: { type: Date, default: Date.now }
  }],
  permanentlyDeletedBy: { type: String, default: null },
  permanentlyDeletedAt: { type: Date, default: null }
});

// Indexes
DeletionHistorySchema.index({ resourceType: 1, resourceId: 1 });
DeletionHistorySchema.index({ status: 1, purgeAt: 1 });
DeletionHistorySchema.index({ deletedBy: 1 });

module.exports = mongoose.model('DeletionHistory', DeletionHistorySchema);
