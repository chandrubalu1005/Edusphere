try { require('../../../../fix-dns.js'); } catch (e) { try { require('../../../fix-dns.js'); } catch (e2) {} }
import express from 'express';
import mongoose, { Schema, Document, Types } from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import amqplib from 'amqplib';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// ── RabbitMQ ───────────────────────────────────────────────────────────────
let channel: amqplib.Channel;
async function connectRabbitMQ() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    logger.info('RabbitMQ connected');
  } catch (err) {
    logger.error('Failed to connect to RabbitMQ', err);
  }
}
function publishEvent(routingKey: string, data: any) {
  if (channel) {
    channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)));
  }
}

// ── Schemas ────────────────────────────────────────────────────────────────
interface IAssignment extends Document {
  courseId:      string;
  title:         string;
  description:   string;
  instructions:  string;
  totalMarks:    number;
  passMarks:     number;
  dueDate:       Date;
  latePenalty:   number; // % per day after due date
  maxFileSize:   number; // MB
  allowedTypes:  string[];
  status:        'draft' | 'published' | 'closed';
  createdBy:     string;
  allowResubmit: boolean;
  rubric:        Array<{ criterion: string; maxMarks: number; description: string }>;
  deadlineOverrides: Array<{ studentId: string; dueDate: Date }>;
  groupId:       string | null;
  createdAt:     Date;
  updatedAt:     Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  courseId:      { type: String, required: true, index: true },
  title:         { type: String, required: true },
  description:   String,
  instructions:  { type: String, required: true },
  totalMarks:    { type: Number, required: true },
  passMarks:     { type: Number, required: true },
  dueDate:       { type: Date, required: true },
  latePenalty:   { type: Number, default: 5 },
  maxFileSize:   { type: Number, default: 50 },
  allowedTypes:  { type: [String], default: ['pdf', 'doc', 'docx', 'zip', 'txt', 'py', 'js', 'ts', 'java'] },
  status:        { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  createdBy:     { type: String, required: true },
  allowResubmit: { type: Boolean, default: false },
  rubric:        [{
    criterion:   String,
    maxMarks:    Number,
    description: String,
  }],
  deadlineOverrides: [{
    studentId: String,
    dueDate: Date
  }],
  groupId: { type: String, default: null } // Added for future group assignments support
}, { timestamps: true });

const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

// ── Submission Schema ──────────────────────────────────────────────────────
interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId:    string;
  fileUrl:      string;
  fileName:     string;
  fileSize:     number;
  mimeType:     string;
  remarks:      string;
  grade:        number | null;
  feedback:     string;
  rubricGrades: Array<{ criterion: string; marks: number; comment: string }>;
  isLate:       boolean;
  lateDays:     number;
  penaltyApplied: number;
  finalGrade:   number | null;
  status:       'submitted' | 'graded' | 'returned';
  gradedBy:     string;
  gradedAt?:    Date;
  submittedAt:  Date;
  attempt:      number;
  plagiarismScore?: number;
  plagiarismFlags?: string[];
  disputeStatus:  'none' | 'open' | 'resolved';
  disputeReason?: string;
  disputeResolution?: string;
}

const SubmissionSchema = new Schema<ISubmission>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  studentId:    { type: String, required: true, index: true },
  fileUrl:      { type: String, required: true },
  fileName:     String,
  fileSize:     Number,
  mimeType:     String,
  remarks:      String,
  grade:        { type: Number, default: null },
  feedback:     String,
  rubricGrades: [{
    criterion: String,
    marks:     Number,
    comment:   String,
  }],
  isLate:         { type: Boolean, default: false },
  lateDays:       { type: Number, default: 0 },
  penaltyApplied: { type: Number, default: 0 },
  finalGrade:     { type: Number, default: null },
  status:         { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  gradedBy:       String,
  gradedAt:       Date,
  submittedAt:    { type: Date, default: Date.now },
  attempt:        { type: Number, default: 1 },
  plagiarismScore:{ type: Number, default: null },
  plagiarismFlags:[{ type: String }],
  disputeStatus:  { type: String, enum: ['none', 'open', 'resolved'], default: 'none' },
  disputeReason:  { type: String, default: null },
  disputeResolution:{ type: String, default: null },
}, { timestamps: true });

// Unique constraint: one active submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1, attempt: -1 });

const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);

// ── Multer File Storage ────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'assignments');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = diskStorage({
  destination: (req, _file, cb) => {
    const assignmentId = req.params.id;
    const dir = path.join(UPLOAD_DIR, assignmentId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB hard limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const allowed = ['pdf','doc','docx','zip','txt','py','js','ts','java','cpp','c','cs','rb','go','rs'];
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error(`File type .${ext} not allowed`));
  },
});

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

// ── JWT Middleware ─────────────────────────────────────────────────────────
function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123') as any;
    (req as any).user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

function requireRole(...roles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!roles.includes((req as any).user?.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// ── ASSIGNMENT ENDPOINTS ───────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'assignment-service' }));
app.get('/assignments/health', (_req, res) => res.json({ status: 'ok', service: 'assignment-service' }));

// GET /assignments
app.get('/assignments', auth, async (req, res) => {
  try {
    const { courseId, status, page = 1, limit = 20 } = req.query;
    const user = (req as any).user;
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (status)   filter.status = status;
    if (user.role === 'faculty') filter.createdBy = user.userId;

    if (user.role === 'student') {
      try {
        const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
        const resp = await fetch(`${COURSE_URL}/courses?enrolledStudentId=${user.userId}&limit=1000`, {
          headers: { Authorization: req.headers.authorization as string }
        });
        if (resp.ok) {
          const data = (await resp.json()) as any;
          const enrolledCourseIds = data.courses.map((c: any) => c._id);
          if (courseId) {
             if (!enrolledCourseIds.includes(courseId)) {
                filter.courseId = null; // Deny access
             }
          } else {
             filter.courseId = { $in: enrolledCourseIds };
          }
        } else {
          filter.courseId = null;
        }
      } catch (err) {
        filter.courseId = null;
      }
    }
    
    const assignments = await Assignment.find(filter).sort({ dueDate: 1 })
      .skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    const total = await Assignment.countDocuments(filter);
    res.json({ assignments, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /assignments/:id
app.get('/assignments/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// POST /assignments
app.post('/assignments', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Verify course ownership
    if (user.role === 'faculty' && req.body.courseId) {
      try {
        const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
        const resp = await fetch(`${COURSE_URL}/courses/${req.body.courseId}`, {
          headers: { Authorization: req.headers.authorization as string }
        });
        if (!resp.ok) return res.status(404).json({ error: 'Course not found' });
        const data = (await resp.json()) as any;
        if (data.facultyOwnerId !== user.userId && !data.coInstructors?.includes(user.userId)) {
          return res.status(403).json({ error: 'Access denied: You do not own this course' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to verify course ownership' });
      }
    }

    const assignment = await Assignment.create({ ...req.body, createdBy: user.userId });
    logger.info(`Assignment created: ${assignment._id} — "${assignment.title}"`);
    res.status(201).json(assignment);
  } catch (err: any) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// PATCH /assignments/:id
app.patch('/assignments/:id', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// GET /assignments/stats — server-computed aggregate counts
app.get('/assignments/stats', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      { $group: {
          _id: '$assignmentId',
          submissionsCount: { $sum: 1 },
          gradedCount: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
          lateCount: { $sum: { $cond: ['$isLate', 1, 0] } }
      }}
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// DELETE /assignments/:id
app.delete('/assignments/:id', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ── SUBMISSION ENDPOINTS ───────────────────────────────────────────────────

// POST /assignments/:id/submit — student file upload
app.post('/assignments/:id/submit', auth, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const user     = (req as any).user;
    const file     = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (assignment.status !== 'published') return res.status(400).json({ error: 'Assignment is not accepting submissions' });

    // Verify course enrollment
    try {
      const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
      const resp = await fetch(`${COURSE_URL}/courses/${assignment.courseId}`, {
        headers: { Authorization: req.headers.authorization as string }
      });
      if (!resp.ok) return res.status(404).json({ error: 'Course not found' });
      const course = (await resp.json()) as any;
      if (!course.enrolledStudents || !course.enrolledStudents.includes(user.userId)) {
        return res.status(403).json({ error: 'Access denied: You are not enrolled in this course' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify course enrollment' });
    }

    // Check if re-submission is allowed
    const existingCount = await Submission.countDocuments({ assignmentId: req.params.id, studentId: user.userId });
    if (existingCount > 0 && !assignment.allowResubmit) {
      return res.status(400).json({ error: 'Resubmission not allowed for this assignment' });
    }

    // Check deadline overrides
    let activeDueDate = assignment.dueDate;
    if (assignment.deadlineOverrides && assignment.deadlineOverrides.length > 0) {
      const override = assignment.deadlineOverrides.find((o: any) => o.studentId === user.userId);
      if (override) activeDueDate = new Date(override.dueDate);
    }

    // Calculate late penalty
    const now      = new Date();
    const isLate   = now > activeDueDate;
    const lateDays = isLate ? Math.ceil((now.getTime() - activeDueDate.getTime()) / 86400000) : 0;
    const penalty  = Math.min(isLate ? lateDays * assignment.latePenalty : 0, 100);

    // Mock plagiarism score (0-100)
    const plagiarismScore = Math.floor(Math.random() * 30); // Mostly innocent for demo
    const plagiarismFlags = plagiarismScore > 20 ? ['High similarity detected in section 2'] : [];

    const submission = await Submission.create({
      assignmentId: assignment._id,
      studentId:    user.userId,
      fileUrl:      `/uploads/assignments/${req.params.id}/${file.filename}`,
      fileName:     file.originalname,
      fileSize:     file.size,
      mimeType:     file.mimetype,
      remarks:      req.body.remarks || '',
      isLate,
      lateDays,
      penaltyApplied: penalty,
      attempt:      existingCount + 1,
      plagiarismScore,
      plagiarismFlags,
    });

    logger.info(`Submission: assignment=${req.params.id} student=${user.userId} file=${file.originalname} late=${isLate}`);
    res.status(201).json(submission);
  } catch (err: any) {
    if (err.code === 11000) {
       return res.status(409).json({ error: 'A submission for this attempt is already in progress. Please wait.' });
    }
    res.status(500).json({ error: err.message || 'Failed to submit' });
  }
});

// GET /assignments/:id/submissions — faculty view all submissions
app.get('/assignments/:id/submissions', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission
      .find({ assignmentId: req.params.id })
      .sort({ submittedAt: -1 });
    const stats = {
      total:   submissions.length,
      graded:  submissions.filter(s => s.status === 'graded').length,
      late:    submissions.filter(s => s.isLate).length,
      avgGrade: submissions.filter(s => s.finalGrade !== null).length
        ? Math.round(submissions.reduce((sum, s) => sum + (s.finalGrade || 0), 0) / submissions.filter(s => s.finalGrade !== null).length)
        : null,
    };
    res.json({ submissions, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /assignments/:id/submissions/mine — student's own submission
app.get('/assignments/:id/submissions/mine', auth, requireRole('student'), async (req, res) => {
  try {
    const user = (req as any).user;
    const submission = await Submission.findOne({ assignmentId: req.params.id, studentId: user.userId }).sort({ attempt: -1 });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// PATCH /submissions/:submissionId/grade — faculty grade
app.patch('/submissions/:submissionId/grade', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { grade, feedback, rubricGrades } = req.body;
    if (typeof grade !== 'number') return res.status(400).json({ error: 'grade must be a number' });

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Apply late penalty to final grade
    const finalGrade = Math.max(0, Math.round(grade * (1 - (submission.penaltyApplied || 0) / 100)));
    const passed = finalGrade >= assignment.passMarks;
    const percentage = Math.round((finalGrade / assignment.totalMarks) * 100);

    const updated = await Submission.findOneAndUpdate(
      { _id: req.params.submissionId },
      {
        $set: {
          grade,
          feedback: feedback || '',
          rubricGrades: rubricGrades || [],
          finalGrade,
          status: 'graded',
          gradedBy: user.userId,
          gradedAt: new Date()
        }
      },
      { new: true }
    );

    // Only fire event if the grade actually changed or was previously ungraded
    if (submission.finalGrade !== finalGrade) {
        publishEvent('assessment.grade_recorded', {
          studentId: submission.studentId,
          courseId: assignment.courseId,
          assessmentId: assignment._id,
          score: grade,
          totalMarks: assignment.totalMarks,
          percentage: percentage,
          passed: passed
        } as any);
    }

    logger.info(`Graded: submission=${req.params.submissionId} grade=${grade} final=${finalGrade}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// POST /submissions/:submissionId/dispute — student challenges grade
app.post('/submissions/:submissionId/dispute', auth, requireRole('student'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason for dispute is required' });
    }
    
    const submission = await Submission.findOne({ _id: req.params.submissionId, studentId: user.userId });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.status !== 'graded') return res.status(400).json({ error: 'Cannot dispute an ungraded submission' });
    if (submission.disputeStatus !== 'none') return res.status(400).json({ error: 'Dispute already opened or resolved' });

    submission.disputeStatus = 'open';
    submission.disputeReason = reason;
    await submission.save();

    // Notify faculty via rabbitmq
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment) {
      publishEvent('submission.disputeOpened', {
        submissionId: submission._id,
        assignmentId: assignment._id,
        studentId: user.userId,
        courseId: assignment.courseId,
        facultyOwnerId: assignment.createdBy
      });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to open dispute' });
  }
});

// PATCH /submissions/:submissionId/resolve-dispute — faculty resolves grade dispute
app.patch('/submissions/:submissionId/resolve-dispute', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { resolution, newGrade } = req.body;
    
    if (!resolution || resolution.trim().length === 0) {
      return res.status(400).json({ error: 'Resolution details are required' });
    }

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.disputeStatus !== 'open') return res.status(400).json({ error: 'No open dispute to resolve' });

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    let updateData: any = {
      disputeStatus: 'resolved',
      disputeResolution: resolution
    };

    if (typeof newGrade === 'number') {
      const finalGrade = Math.max(0, Math.round(newGrade * (1 - (submission.penaltyApplied || 0) / 100)));
      updateData.grade = newGrade;
      updateData.finalGrade = finalGrade;
      
      publishEvent('assessment.graded', {
        studentId:    submission.studentId,
        courseId:     assignment.courseId,
        assessmentId: String(assignment._id),
        score:        finalGrade,
        totalMarks:   assignment.totalMarks,
        percentage:   Math.round((finalGrade / assignment.totalMarks) * 100),
        passed:       finalGrade >= assignment.passMarks,
      });
    }

    const updated = await Submission.findByIdAndUpdate(req.params.submissionId, { $set: updateData }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

// POST /assignments/:id/bulk-grade — faculty CSV import
app.post('/assignments/:id/bulk-grade', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { grades } = req.body; // Array of { studentId, grade, feedback }
    
    if (!grades || !Array.isArray(grades)) return res.status(400).json({ error: 'grades array required' });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Validate ownership
    if (user.role === 'faculty') {
      try {
        const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
        const resp = await fetch(`${COURSE_URL}/courses/${assignment.courseId}`, {
          headers: { Authorization: req.headers.authorization as string }
        });
        if (resp.ok) {
           const course = (await resp.json()) as any;
           if (course.facultyOwnerId !== user.userId) return res.status(403).json({ error: 'Access denied' });
        }
      } catch (err) {}
    }

    const submissions = await Submission.find({ assignmentId: assignment._id });
    const bulkOps = grades.map((g: any) => {
      const sub = submissions.find(s => s.studentId === g.studentId);
      if (sub && typeof g.grade === 'number') {
        const finalGrade = Math.max(0, Math.round(g.grade * (1 - (sub.penaltyApplied || 0) / 100)));
        const passed = finalGrade >= assignment.passMarks;
        const percentage = Math.round((finalGrade / assignment.totalMarks) * 100);

        return {
          updateOne: {
            filter: { _id: sub._id },
            update: {
              $set: {
                grade: g.grade,
                feedback: g.feedback,
                finalGrade,
                status: 'graded',
                gradedBy: user.userId,
                gradedAt: new Date()
              }
            }
          }
        } as any;
      }
      return null;
    }).filter(Boolean);

    const eventsToPublish = grades.map((g: any) => {
      const sub = submissions.find(s => s.studentId === g.studentId);
      if (sub && typeof g.grade === 'number') {
        const finalGrade = Math.max(0, Math.round(g.grade * (1 - (sub.penaltyApplied || 0) / 100)));
        const percentage = Math.round((finalGrade / assignment.totalMarks) * 100);
        const passed = percentage >= assignment.passMarks;
        if (sub.finalGrade !== finalGrade) {
          return {
            studentId:    sub.studentId,
            courseId:     assignment.courseId,
            assessmentId: String(assignment._id),
            score:        finalGrade,
            totalMarks:   assignment.totalMarks,
            percentage:   percentage,
            passed:       passed,
          };
        }
      }
      return null;
    }).filter(Boolean);

    if (bulkOps.length > 0) {
      await Submission.bulkWrite(bulkOps);
      eventsToPublish.forEach(ev => publishEvent('assessment.graded', ev));
    }

    logger.info(`Bulk graded ${bulkOps.length} submissions for assignment ${assignment._id}`);
    res.json({ message: `Bulk graded ${bulkOps.length} submissions`, updated: bulkOps.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk grade' });
  }
});

// GET /students/:studentId/submissions
app.get('/students/:studentId/submissions', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role === 'student' && user.userId !== req.params.studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const submissions = await Submission
      .find({ studentId: req.params.studentId })
      .populate('assignmentId', 'title courseId dueDate totalMarks')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

async function connectMongoWithRetry(uri: string, maxRetries = 10, delay = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri);
      logger.info('MongoDB connected');
      return;
    } catch (err: any) {
      logger.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function bootstrap() {
  await connectMongoWithRetry(process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_assignments');
  await connectRabbitMQ();
  const PORT = process.env.PORT || 3006;
  app.listen(PORT, () => logger.info(`📝 Assignment Service running on :${PORT}`));
}

bootstrap().catch(err => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

