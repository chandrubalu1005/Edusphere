const express = require('express');
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', authMiddleware, calendarController.getEvents);
router.post('/', authMiddleware, calendarController.createEvent);
module.exports = router;