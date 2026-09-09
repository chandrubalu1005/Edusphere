const Reservation = require('../models/Reservation');
const BookCopy = require('../models/BookCopy');
const LibraryMember = require('../models/LibraryMember');
const BorrowingPolicy = require('../models/BorrowingPolicy');
const crypto = require('crypto');
const { publishEvent } = require('../config/rabbitmq');
const AuditRecord = require('../models/AuditRecord');
const { getIO } = require('../config/socket');

exports.createReservation = async (req, res) => {
  try {
    const { memberId, titleId, branchId } = req.body;

    const member = await LibraryMember.findById(memberId).populate('borrowingPolicyId');
    if (!member) return res.status(404).json({ success: false, error: { code: 'MEMBER_NOT_FOUND', message: 'Member not found' } });
    if (member.status !== 'ACTIVE') return res.status(403).json({ success: false, error: { code: 'ACCOUNT_RESTRICTED', message: 'Account is restricted' } });

    if (member.borrowingPolicyId && member.borrowingPolicyId.reservationAllowed === false) {
      return res.status(403).json({ success: false, error: { code: 'RESERVATION_NOT_ALLOWED', message: 'Policy forbids reservations' } });
    }

    const existingReservation = await Reservation.findOne({ memberId, bookTitleId: titleId, status: { $in: ['WAITING', 'READY_FOR_PICKUP'] } });
    if (existingReservation) {
      return res.status(409).json({ success: false, error: { code: 'RESERVATION_EXISTS', message: 'You already have an active reservation for this title' } });
    }

    // Calculate queue position
    const activeReservations = await Reservation.countDocuments({ bookTitleId: titleId, status: 'WAITING' });
    const queuePosition = activeReservations + 1;

    const reservation = await Reservation.create({
      reservationNumber: `RES-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      bookTitleId: titleId,
      memberId,
      branchId,
      queuePosition,
      status: 'WAITING'
    });

    if (typeof publishEvent === 'function') {
      publishEvent('library.book_reserved', { reservationId: reservation._id });
    }

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reservation not found' } });
    if (reservation.status !== 'WAITING' && reservation.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Reservation cannot be cancelled in its current state' } });
    }

    reservation.status = 'CANCELLED';
    reservation.cancelledAt = new Date();
    await reservation.save();

    // If it was READY_FOR_PICKUP, we need to release the reserved copy for the next person
    if (reservation.reservedCopyId) {
       await BookCopy.findByIdAndUpdate(reservation.reservedCopyId, { status: 'AVAILABLE' });
       // Logic to assign to next in queue would go here (or triggered via event)
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const { memberId, status } = req.query;
    const filter = {};
    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter).populate('bookTitleId').sort({ queuePosition: 1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
