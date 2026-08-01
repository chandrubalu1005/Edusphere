const express = require('express');
const placementController = require('../controllers/placementController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/drives', authMiddleware, placementController.getDrives);
router.post('/drives', authMiddleware, placementController.createDrive);
router.get('/applications/:studentId', authMiddleware, placementController.getApplications);
module.exports = router;