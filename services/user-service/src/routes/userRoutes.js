const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, userController.searchProfiles);
router.patch('/bulk', authMiddleware, userController.bulkUpdateProfiles);
router.get('/:id', authMiddleware, userController.getProfile);
router.put('/:id', authMiddleware, userController.updateProfile);
router.patch('/:id/deactivate', authMiddleware, userController.deactivateProfile);

module.exports = router;
