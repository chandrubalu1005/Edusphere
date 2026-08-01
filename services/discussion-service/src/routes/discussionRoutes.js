const express = require('express');
const discussionController = require('../controllers/discussionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/threads/:courseId', authMiddleware, discussionController.getThreads);
router.post('/threads', authMiddleware, discussionController.createThread);
router.post('/threads/:id/reply', authMiddleware, discussionController.replyToThread);
module.exports = router;