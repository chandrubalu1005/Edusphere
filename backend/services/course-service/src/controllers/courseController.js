const Course = require('../models/Course');
const CourseRating = require('../models/CourseRating');
const { publishEvent } = require('../config/rabbitmq');
const axios = require('axios');
const CERT_URL = process.env.CERT_SERVICE_URL || 'http://localhost:3007';

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
    const { page = 1, limit = 50, department, status, facultyOwnerId, enrolledStudentId } = req.query;
    const filter = {};
    if (req.user.role === 'student') filter.status = 'published';
    else if (status) filter.status = status;
    if (department)      filter.department = department;
    if (facultyOwnerId)  filter.facultyOwnerId = facultyOwnerId;
    if (enrolledStudentId) filter.enrolledStudents = enrolledStudentId;
    
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

    const { code, title, description, department, capacity, coInstructors } = req.body;
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
      capacity: capacity || 60,
      coInstructors: coInstructors || [],
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

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.facultyOwnerId !== req.user.userId && (!course.coInstructors || !course.coInstructors.includes(req.user.userId)) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Only the course owner or co-instructor can edit the course.' });
    }
    
    const { title, description, department, capacity, coInstructors } = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, department, capacity, coInstructors } },
      { new: true }
    );
    
    if (meiliIndex) {
      try {
        await meiliIndex.updateDocuments([{
          id: String(course._id),
          title: updatedCourse.title,
          description: updatedCourse.description || '',
          department: updatedCourse.department
        }]);
      } catch (meiliErr) {
        console.warn('Meilisearch indexing failed:', meiliErr.message);
      }
    }
    
    res.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSyllabus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.facultyOwnerId !== req.user.userId && (!course.coInstructors || !course.coInstructors.includes(req.user.userId)) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Only the course owner or co-instructor can update syllabus.' });
    }
    
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Syllabus content is required' });
    
    const versionId = `v${course.syllabusVersions.length + 1}`;
    
    // 1.2 Race Condition Fix
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          syllabusVersions: {
            versionId,
            content,
            updatedBy: req.user.username
          }
        }
      },
      { new: true }
    );
    
    res.json({ message: `Syllabus updated to ${versionId}`, course: updatedCourse });
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

    if (course.facultyOwnerId !== req.user.userId && (!course.coInstructors || !course.coInstructors.includes(req.user.userId)) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Only the course owner or co-instructor can add materials.' });
    }

    const { title, type, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    // 1.2 Race Condition Fix
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          content: { title, type, url }
        }
      },
      { new: true }
    );

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

    // 1.2 Race Condition Fix
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'published', rejectionReason: '' } },
      { new: true }
    );
    // Overwrite local reference for downstream indexing
    Object.assign(course, updatedCourse.toObject());

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

    // 1.2 Race Condition Fix
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'draft', rejectionReason: reason } },
      { new: true }
    );
    Object.assign(course, updatedCourse.toObject());

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

    // Add unique students atomically
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { enrolledStudents: { $each: studentIds } } },
      { new: true }
    );

    res.json({ message: `Successfully enrolled ${studentIds.length} students.`, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.status !== 'published') {
      return res.status(400).json({ error: 'Course is not published yet' });
    }
    
    const studentId = req.user.userId;
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    
    if (course.prerequisites && course.prerequisites.length > 0) {
      try {
        const token = req.headers.authorization;
        const resp = await axios.get(`${CERT_URL}/certificates?studentId=${studentId}`, {
          headers: { Authorization: token },
          timeout: 5000
        });
        const certs = resp.data.certificates || [];
        const completedCourseIds = certs.map(c => c.courseId);
        
        for (const prereq of course.prerequisites) {
          if (!completedCourseIds.includes(prereq)) {
            return res.status(403).json({ error: `Missing prerequisite: ${prereq}` });
          }
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to verify prerequisites via certificate-service' });
      }
    }
    
    // Capacity enforcement: atomically add student only if capacity not exceeded.
    // Using $expr to compare array length with capacity field in one DB round-trip.
    const updatedCourse = await Course.findOneAndUpdate(
      {
        _id: req.params.id,
        $expr: { $lt: [{ $size: '$enrolledStudents' }, '$capacity'] }
      },
      { $addToSet: { enrolledStudents: studentId } },
      { new: true }
    );
    
    if (!updatedCourse) {
      // Either course doesn't exist or capacity is full
      const check = await Course.findById(req.params.id);
      if (!check) return res.status(404).json({ error: 'Course not found' });
      return res.status(400).json({ error: `Course is full (capacity: ${check.capacity} students).` });
    }
    
    publishEvent('course.enrolled', { courseId: course._id, studentId });
    res.json({ message: 'Enrolled successfully', course: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rateCourse = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can rate courses.' });
    }
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Check if enrolled
    if (!course.enrolledStudents.includes(req.user.userId)) {
      return res.status(403).json({ error: 'You must be enrolled to rate this course.' });
    }

    const newRating = new CourseRating({
      courseId: course._id,
      studentId: req.user.userId,
      rating: Number(rating),
      comment: comment || ''
    });

    try {
      await newRating.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'You have already rated this course.' });
      }
      throw err;
    }

    publishEvent('course.rated', {
      courseId: course._id,
      department: course.department,
      studentId: req.user.userId,
      rating: newRating.rating
    });

    res.status(201).json({ message: 'Course rated successfully', rating: newRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
