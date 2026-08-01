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

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
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

// GET /assignments
app.get('/assignments', auth, async (req, res) => {
  try {
    const { courseId, status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (courseId) filter.courseId = courseId;
    if (status)   filter.status = status;
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

    // Check if re-submission is allowed
    const existingCount = await Submission.countDocuments({ assignmentId: req.params.id, studentId: user.userId });
    if (existingCount > 0 && !assignment.allowResubmit) {
      return res.status(400).json({ error: 'Resubmission not allowed for this assignment' });
    }

    // Calculate late penalty
    const now      = new Date();
    const isLate   = now > assignment.dueDate;
    const lateDays = isLate ? Math.ceil((now.getTime() - assignment.dueDate.getTime()) / 86400000) : 0;
    const penalty  = Math.min(isLate ? lateDays * assignment.latePenalty : 0, 100);

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
    });

    logger.info(`Submission: assignment=${req.params.id} student=${user.userId} file=${file.originalname} late=${isLate}`);
    res.status(201).json(submission);
  } catch (err: any) {
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

    // Apply late penalty to final grade
    const finalGrade = Math.max(0, Math.round(grade * (1 - submission.penaltyApplied / 100)));

    submission.grade       = grade;
    submission.feedback    = feedback || '';
    submission.rubricGrades = rubricGrades || [];
    submission.finalGrade  = finalGrade;
    submission.status      = 'graded';
    submission.gradedBy    = user.userId;
    submission.gradedAt    = new Date();
    await submission.save();

    logger.info(`Graded: submission=${req.params.submissionId} grade=${grade} final=${finalGrade}`);
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade submission' });
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

// ── Bootstrap ─────────────────────────────────────────────────────────────
async function bootstrap() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_assignments');
  logger.info('MongoDB connected');
  const PORT = process.env.PORT || 3006;
  app.listen(PORT, () => logger.info(`📝 Assignment Service running on :${PORT}`));
}

bootstrap().catch(err => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});
