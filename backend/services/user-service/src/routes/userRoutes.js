const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authMiddleware, userController.searchProfiles);
router.patch('/bulk', authMiddleware, userController.bulkUpdateProfiles);
router.get('/:id', authMiddleware, userController.getProfile);
router.put('/:id', authMiddleware, userController.updateProfile);
router.patch('/:id/deactivate', authMiddleware, userController.deactivateProfile);
router.post('/:id/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
