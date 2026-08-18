const mongoose = require('mongoose');

const LeavePolicySchema = new mongoose.Schema({
  leaveTypes: [{
    name: { type: String, required: true },
    requiresDocument: { type: Boolean, default: false },
    countsAgainstQuota: { type: Boolean, default: true },
    description: { type: String }
  }],
  annualQuotaByType: {
    type: Map,
    of: Number,
    default: {}
  },
  blackoutPeriods: [{
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    rule: { type: String, enum: ['blocked', 'highScrutiny'], required: true }
  }],
  minNoticeHours: { type: Number, default: 24 },
  updatedBy: { type: String, required: true }
}, { timestamps: true });

LeavePolicySchema.statics.getSingleton = async function() {
  let policy = await this.findOne();
  if (!policy) {
    policy = await this.create({
      leaveTypes: [
        { name: 'Sick', requiresDocument: true, countsAgainstQuota: true, description: 'Medical emergencies' },
        { name: 'Casual Leave', requiresDocument: false, countsAgainstQuota: true, description: 'Personal reasons' },
        { name: 'Medical Leave', requiresDocument: true, countsAgainstQuota: true, description: 'Extended medical leave' },
        { name: 'Earned Leave', requiresDocument: false, countsAgainstQuota: true, description: 'Earned time off' },
        { name: 'Conference', requiresDocument: true, countsAgainstQuota: false, description: 'Conference or On-Duty' },
        { name: 'Emergency', requiresDocument: false, countsAgainstQuota: false, description: 'Unplanned emergencies' },
        { name: 'Academic', requiresDocument: true, countsAgainstQuota: false, description: 'College events or placement' },
        { name: 'Other', requiresDocument: false, countsAgainstQuota: true, description: 'Specify reason' }
      ],
      annualQuotaByType: { 'Casual Leave': 10, 'Medical Leave': 12, 'Earned Leave': 15, 'Sick': 12, 'Other': 5 },
      blackoutPeriods: [],
      minNoticeHours: 24,
      updatedBy: 'system'
    });
  }
  return policy;
};

module.exports = mongoose.model('LeavePolicy', LeavePolicySchema);
