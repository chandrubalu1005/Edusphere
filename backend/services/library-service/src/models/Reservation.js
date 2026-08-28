const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  reservationNumber: { type: String, required: true, unique: true },
  bookTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookTitle', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryMember', required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBranch' },
  requestedAt: { type: Date, required: true, default: Date.now },
  queuePosition: { type: Number, required: true },
  status: { type: String, enum: ['WAITING', 'READY_FOR_PICKUP', 'FULFILLED', 'EXPIRED', 'CANCELLED'], default: 'WAITING', index: true },
  holdStartedAt: { type: Date },
  holdExpiresAt: { type: Date },
  fulfilledAt: { type: Date },
  cancelledAt: { type: Date },
  reservedCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
