const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/academicAuth');
const { Institution, Campus, Department, AcademicYear, AcademicTerm } = require('../models/academic/Institution');
const { Programme, Regulation, CurriculumVersion, Semester, CourseGroup } = require('../models/academic/Programme');
const { CourseMaster, CoursePrerequisite, CourseEquivalence } = require('../models/academic/CourseMaster');
const { CourseOffering, Section, FacultyAssignment } = require('../models/academic/Offering');
const { Enrollment } = require('../models/academic/Student');
const { publishEvent, EVENTS } = require('../utils/events');

// ==========================================
// INSTITUTION CONFIGURATION
// ==========================================
router.get('/institutions', requirePermission('academic.programme.view'), async (req, res) => {
  try {
    const data = await Institution.find();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/departments', requirePermission('academic.programme.view'), async (req, res) => {
  try {
    const data = await Department.find();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// PROGRAMMES & CURRICULUM
// ==========================================
router.get('/programmes', requirePermission('academic.programme.view'), async (req, res) => {
  try {
    const data = await Programme.find().populate('departmentId');
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/programmes', requirePermission('academic.programme.create'), async (req, res) => {
  try {
    const prog = new Programme(req.body);
    await prog.save();
    res.status(201).json(prog);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/curricula', requirePermission('academic.curriculum.view'), async (req, res) => {
  try {
    const data = await CurriculumVersion.find().populate('regulationId');
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// COURSE MASTER
// ==========================================
router.get('/courses', requirePermission('academic.course.view'), async (req, res) => {
  try {
    const data = await CourseMaster.find().populate('departmentId');
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/courses', requirePermission('academic.course.create'), async (req, res) => {
  try {
    const course = new CourseMaster(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// OFFERINGS & SECTIONS
// ==========================================
router.get('/offerings', requirePermission('academic.offering.view'), async (req, res) => {
  try {
    const data = await CourseOffering.find().populate('courseId academicTermId programmeId');
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/sections', requirePermission('academic.section.view'), async (req, res) => {
  try {
    const data = await Section.find().populate('courseOfferingId');
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/enrollments', requirePermission('academic.registration.create'), async (req, res) => {
  try {
    const enrollment = new Enrollment(req.body);
    await enrollment.save();

    // Event-Driven Boundary Implementation
    await publishEvent(EVENTS.ENROLLMENT_CREATED, {
      enrollmentId: enrollment._id,
      studentId: enrollment.studentId,
      sectionId: enrollment.sectionId,
      courseId: enrollment.courseId,
      academicTermId: enrollment.academicTermId
    });

    res.status(201).json(enrollment);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
