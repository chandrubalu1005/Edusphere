const mongoose = require('mongoose');
const AttendancePolicy = require('../models/AttendancePolicy');

async function seedDefaultPolicy() {
  try {
    const existing = await AttendancePolicy.findOne({ institutionId: 'default_institution' });
    if (!existing) {
      await AttendancePolicy.create({
        institutionId: 'default_institution',
        minimumAttendancePercent: 75,
        earlyCheckInMinutes: 5,
        lateAfterMinutes: 10,
        checkInCloseMinutes: 15,
        checkOutRequired: true,
        partialAttendanceEnabled: true,
        otpRotationSeconds: 25,
        otpMaxAttempts: 5,
        sessionAutoClose: true
      });
      console.log('Seeded default Attendance Policy');
    }
  } catch (error) {
    console.error('Failed to seed default policy:', error.message);
  }
}

module.exports = { seedDefaultPolicy };
