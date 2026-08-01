const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, courseController.listCourses);
router.post('/', authMiddleware, courseController.createCourse);
router.get('/:id', authMiddleware, courseController.getCourse);
router.post('/:id/content', authMiddleware, courseController.addContent);
router.post('/:id/approve', authMiddleware, courseController.approveCourse);
router.post('/:id/reject', authMiddleware, courseController.rejectCourse);

module.exports = router;
