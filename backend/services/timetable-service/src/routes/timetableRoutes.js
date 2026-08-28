const express = require('express');
const timetableController = require('../controllers/timetableController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', authMiddleware, timetableController.getTimetables);
router.post('/', authMiddleware, timetableController.createSlot);

// TimeSlot Routes
router.get('/slots', authMiddleware, timetableController.getTimeSlots);
router.post('/slots', authMiddleware, timetableController.createTimeSlot);
module.exports = router;