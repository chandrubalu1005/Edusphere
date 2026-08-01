const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/health', authMiddleware, adminController.getHealth);
router.post('/backup', authMiddleware, adminController.triggerBackup);
module.exports = router;