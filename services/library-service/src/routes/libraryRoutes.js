const express = require('express');
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/books', authMiddleware, libraryController.getBooks);
router.post('/books', authMiddleware, libraryController.createBook);
router.get('/issues/:userId', authMiddleware, libraryController.getIssues);
module.exports = router;