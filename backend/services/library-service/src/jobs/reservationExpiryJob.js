const Reservation = require('../models/Reservation');
const BookCopy = require('../models/BookCopy');
const { publishEvent } = require('../config/rabbitmq');

async function processExpiredReservations() {
  console.log('Running reservation expiry job...');
  try {
    const now = new Date();
    // Find READY_FOR_PICKUP reservations where holdExpiresAt has passed
    const expiredReservations = await Reservation.find({ status: 'READY_FOR_PICKUP', holdExpiresAt: { $lt: now } });

    for (const res of expiredReservations) {
      res.status = 'EXPIRED';
      await res.save();

      // Release the copy
      if (res.reservedCopyId) {
        await BookCopy.findByIdAndUpdate(res.reservedCopyId, { status: 'AVAILABLE' });
        if (typeof publishEvent === 'function') {
          publishEvent('library.book_available', { copyId: res.reservedCopyId, titleId: res.bookTitleId });
        }
      }

      if (typeof publishEvent === 'function') {
        publishEvent('library.reservation_expired', { reservationId: res._id, memberId: res.memberId });
      }

      // Check next in queue (Could be done via event handler or here)
      // Implementation omitted for brevity but noted.
    }
    console.log(`Processed ${expiredReservations.length} expired reservations.`);
  } catch (error) {
    console.error('Error in reservation expiry job:', error);
  }
}

module.exports = { processExpiredReservations };
