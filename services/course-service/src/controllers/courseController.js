const Course = require('../models/Course');
const { publishEvent } = require('../config/rabbitmq');

exports.listCourses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.status = 'published';
    }
    const courses = await Course.find(filter);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (req.user.role === 'student' && course.status !== 'published') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Faculty or Admin only.' });
    }

    const { code, title, description, department } = req.body;
    if (!code || !title || !department) {
      return res.status(400).json({ error: 'Code, title and department are required' });
    }

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const status = req.user.role === 'admin' ? 'published' : 'pending';

    const course = new Course({
      code,
      title,
      description,
      department,
      facultyOwnerId: req.user.userId,
      facultyName: req.user.username,
      status
    });

    await course.save();

    publishEvent('course.created', {
      courseId: course._id,
      code: course.code,
      title: course.title,
      facultyOwnerId: course.facultyOwnerId
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.facultyOwnerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Only the course owner can add materials.' });
    }

    const { title, type, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    course.content.push({ title, type, url });
    await course.save();

    publishEvent('course.content_added', {
      courseId: course._id,
      title,
      url
    });

    res.json({ message: 'Content added successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    if (req.user.role !== 'management' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Management or Admin roles only.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.status = 'published';
    course.rejectionReason = '';
    await course.save();

    publishEvent('course.published', {
      courseId: course._id,
      code: course.code,
      title: course.title
    });

    res.json({ message: 'Course approved and published successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectCourse = async (req, res) => {
  try {
    if (req.user.role !== 'management' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Management or Admin roles only.' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.status = 'draft';
    course.rejectionReason = reason;
    await course.save();

    publishEvent('course.rejected', {
      courseId: course._id,
      code: course.code,
      title: course.title,
      reason
    });

    res.json({ message: 'Course review completed. Rejection marked.', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
