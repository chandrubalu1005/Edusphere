const mongoose = require('mongoose');

const LibraryMemberSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Links to external User Service ID
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  memberNumber: { type: String, required: true, unique: true },
  memberType: { type: String, enum: ['STUDENT', 'FACULTY', 'STAFF', 'RESEARCH_SCHOLAR', 'GUEST', 'ALUMNI'], required: true },
  membershipDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'BLOCKED'], default: 'ACTIVE' },
  borrowingPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowingPolicy' },
  restrictions: [{
    type: { type: String }, // e.g., 'MAX_LOANS_REACHED', 'OVERDUE_FINE'
    reason: { type: String },
    appliedAt: { type: Date, default: Date.now }
  }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LibraryMember', LibraryMemberSchema);
