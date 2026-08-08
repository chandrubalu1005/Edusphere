const Course = require('../models/Course');
const { publishEvent } = require('../config/rabbitmq');

// Meilisearch client — optional; falls back to Mongo regex if unavailable
let meiliIndex = null;
try {
  const { MeiliSearch } = require('meilisearch');
  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY || '',
  });
  meiliIndex = client.index('courses');
  console.log('course-service: Meilisearch configured');
} catch (e) {
  console.warn('course-service: meilisearch package not available, using Mongo regex fallback');
}

exports.listCourses = async (req, res) => {
  try {
    const { page = 1, limit = 50, department, status, facultyOwnerId } = req.query;
    const filter = {};
    if (req.user.role === 'student') filter.status = 'published';
    else if (status) filter.status = status;
    if (department)      filter.department = department;
    if (facultyOwnerId)  filter.facultyOwnerId = facultyOwnerId;
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Course.countDocuments(filter);
    res.json({ courses, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Full-text search endpoint — uses Meilisearch with Mongo regex fallback
exports.searchCourses = async (req, res) => {
  try {
    const { q = '', limit = 20 } = req.query;
    if (!q.trim()) return res.json({ courses: [], total: 0 });

    if (meiliIndex) {
      try {
        const result = await meiliIndex.search(q, { limit: Number(limit) });
        return res.json({ courses: result.hits, total: result.estimatedTotalHits || result.hits.length, source: 'meilisearch' });
      } catch (meiliErr) {
        console.warn('Meilisearch search failed, falling back to Mongo:', meiliErr.message);
      }
    }

    // Mongo regex fallback
    const filter = {
      $or: [
        { title:       new RegExp(q, 'i') },
        { code:        new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { department:  new RegExp(q, 'i') },
      ]
    };
    if (req.user.role === 'student') filter.status = 'published';
    const courses = await Course.find(filter).limit(Number(limit));
    res.json({ courses, total: courses.length, source: 'mongo' });
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

    if (meiliIndex) {
      try {
        await meiliIndex.addDocuments([{
          id: String(course._id),
          code: course.code,
          title: course.title,
          description: course.description || '',
          department: course.department,
          status: course.status
        }]);
      } catch (meiliErr) {
        console.warn('Meilisearch indexing failed:', meiliErr.message);
      }
    }

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

    if (meiliIndex) {
      try {
        await meiliIndex.addDocuments([{
          id: String(course._id),
          code: course.code,
          title: course.title,
          description: course.description || '',
          department: course.department,
          status: course.status
        }]);
      } catch (meiliErr) {
        console.warn('Meilisearch indexing failed:', meiliErr.message);
      }
    }

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

    if (meiliIndex) {
      try {
        await meiliIndex.addDocuments([{
          id: String(course._id),
          code: course.code,
          title: course.title,
          description: course.description || '',
          department: course.department,
          status: course.status
        }]);
      } catch (meiliErr) {
        console.warn('Meilisearch indexing failed:', meiliErr.message);
      }
    }

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

exports.bulkEnroll = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Access forbidden.' });
    }
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!course.enrolledStudents) course.enrolledStudents = [];

    // Add unique students
    studentIds.forEach(id => {
      if (!course.enrolledStudents.includes(id)) {
        course.enrolledStudents.push(id);
      }
    });

    await course.save();
    res.json({ message: `Successfully enrolled ${studentIds.length} students.`, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
