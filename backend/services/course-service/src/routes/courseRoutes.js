const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',       authMiddleware, courseController.listCourses);
router.post('/',      authMiddleware, courseController.createCourse);
// /search must come before /:id to avoid Express treating 'search' as an :id value
router.get('/search', authMiddleware, courseController.searchCourses);
router.get('/:id',    authMiddleware, courseController.getCourse);
router.put('/:id',    authMiddleware, courseController.updateCourse);
router.post('/:id/content',  authMiddleware, courseController.addContent);
router.post('/:id/syllabus', authMiddleware, courseController.updateSyllabus);
router.post('/:id/approve',  authMiddleware, courseController.approveCourse);
router.post('/:id/reject',   authMiddleware, courseController.rejectCourse);
router.post('/:id/enrollments/bulk', authMiddleware, courseController.bulkEnroll);
router.post('/:id/enroll',   authMiddleware, courseController.enroll);
router.post('/:id/rate',     authMiddleware, courseController.rateCourse);

module.exports = router;
