const express = require('express');
const discussionController = require('../controllers/discussionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/threads/:courseId',      authMiddleware, discussionController.getThreads);
router.post('/threads',               authMiddleware, discussionController.createThread);
// Single thread + replies — must come before /:id/reply to avoid route collision
router.get('/thread/:id',             authMiddleware, discussionController.getThread);
router.post('/threads/:id/reply',     authMiddleware, discussionController.replyToThread);
router.post('/threads/:id/vote',      authMiddleware, discussionController.voteThread);
router.post('/replies/:replyId/vote', authMiddleware, discussionController.voteReply);

module.exports = router;