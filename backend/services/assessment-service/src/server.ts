try { require('../../../../fix-dns.js'); } catch (e) { try { require('../../../fix-dns.js'); } catch (e2) {} }
import express from 'express';
import mongoose, { Schema, Document, Types } from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import amqp from 'amqplib';

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
interface IQuestion {
  id:       string;
  text:     string;
  type:     'mcq' | 'true_false' | 'short_answer';
  options:  string[];
  correct?: number | string;
  marks:    number;
  explanation?: string;
}

interface IAssessment extends Document {
  courseId:      string;
  title:         string;
  description:   string;
  type:          'quiz' | 'exam' | 'assignment' | 'practice';
  status:        'draft' | 'published' | 'active' | 'closed';
  duration:      number; // minutes
  totalMarks:    number;
  passMarks:     number;
  maxAttempts:   number;
  shuffle:       boolean;
  showResults:   boolean;
  startAt?:      Date;
  endAt?:        Date;
  questions:     IQuestion[];
  createdBy:     string;
  createdAt:     Date;
  updatedAt:     Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id:          { type: String, default: uuidv4 },
  text:        { type: String, required: true },
  type:        { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
  options:     [{ type: String }],
  correct:     { type: Schema.Types.Mixed, required: true },
  marks:       { type: Number, default: 1 },
  explanation: String,
}, { _id: false });

const AssessmentSchema = new Schema<IAssessment>({
  courseId:    { type: String, required: true, index: true },
  title:       { type: String, required: true },
  description: String,
  type:        { type: String, enum: ['quiz', 'exam', 'assignment', 'practice'], default: 'quiz' },
  status:      { type: String, enum: ['draft', 'published', 'active', 'closed'], default: 'draft' },
  duration:    { type: Number, required: true },
  totalMarks:  { type: Number, required: true },
  passMarks:   { type: Number, required: true },
  maxAttempts: { type: Number, default: 1 },
  shuffle:     { type: Boolean, default: false },
  showResults: { type: Boolean, default: true },
  startAt:     Date,
  endAt:       Date,
  questions:   [QuestionSchema],
  createdBy:   { type: String, required: true },
}, { timestamps: true });

const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);

// ── Attempt Schema ─────────────────────────────────────────────────────────
interface IAttempt extends Document {
  assessmentId: Types.ObjectId;
  studentId:    string;
  sessionId:    string;
  answers:      Array<{ questionId: string; answer: number | string; timeTaken: number }>;
  score:        number;
  totalMarks:   number;
  percentage:   number;
  passed:       boolean;
  startedAt:    Date;
  submittedAt?: Date;
  status:       'in_progress' | 'submitted' | 'auto_submitted';
  ipAddress:    string;
  browserInfo:  string;
  tabSwitches:  number;
  proctoringEvents: Array<{ type: string; timestamp: Date }>;
}

const AttemptSchema = new Schema<IAttempt>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  studentId:    { type: String, required: true, index: true },
  sessionId:    { type: String, required: true, unique: true },
  answers:      [{ questionId: String, answer: Schema.Types.Mixed, timeTaken: Number }],
  score:        { type: Number, default: 0 },
  totalMarks:   { type: Number, default: 0 },
  percentage:   { type: Number, default: 0 },
  passed:       { type: Boolean, default: false },
  startedAt:    { type: Date, default: Date.now },
  submittedAt:  Date,
  status:       { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'in_progress' },
  ipAddress:    String,
  browserInfo:  String,
  tabSwitches:  { type: Number, default: 0 },
  proctoringEvents: [{ type: { type: String }, timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

const Attempt = mongoose.model<IAttempt>('Attempt', AttemptSchema);

// ── RabbitMQ Publisher ─────────────────────────────────────────────────────
let mqChannel: amqp.Channel | null = null;

async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    mqChannel = await conn.createChannel();
    await mqChannel.assertExchange('domain_events', 'topic', { durable: true });
    logger.info('RabbitMQ connected');
  } catch (err) {
    logger.warn('RabbitMQ unavailable — events disabled');
  }
}

function publishEvent(routingKey: string, data: object) {
  if (mqChannel) {
    mqChannel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
  }
}

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Redis client for session management and leaderboard
let redis: ReturnType<typeof createClient> | null = null;

async function connectRedis() {
  try {
    redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379', socket: { reconnectStrategy: false } });
    redis.on('error', (err) => logger.error('Redis error', err));
    await redis.connect();
    logger.info('Redis connected');
  } catch (err) {
    logger.warn('Redis unavailable — session management disabled');
  }
}

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
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ── ASSESSMENT ENDPOINTS ───────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'assessment-service' }));
app.get('/assessments/health', (_req, res) => res.json({ status: 'ok', service: 'assessment-service' }));

// GET /assessments?courseId=&status=&type=
app.get('/assessments', auth, async (req, res) => {
  try {
    const { courseId, status, type, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (courseId) filter.courseId = courseId;
    if (status)   filter.status = status;
    if (type)     filter.type = type;

    const assessments = await Assessment
      .find(filter)
      .select('-questions.correct -questions.explanation') // hide answers by default
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Math.min(Number(limit), 1000));
    const total = await Assessment.countDocuments(filter);
    res.json({ assessments, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET /assessments/:id
app.get('/assessments/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    // Strip correct answers for students
    const user = (req as any).user;
    if (user.role === 'student') {
      const safe = assessment.toObject();
      safe.questions = safe.questions.map(q => ({ ...q, correct: undefined, explanation: undefined }));
      return res.json(safe);
    }
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// POST /assessments (faculty/admin only)
app.post('/assessments', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const user = (req as any).user;
    const assessment = await Assessment.create({ ...req.body, createdBy: user.userId });
    logger.info(`Assessment created: ${assessment._id} by ${user.userId}`);
    res.status(201).json(assessment);
  } catch (err: any) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// PATCH /assessments/:id
app.patch('/assessments/:id', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assessment) return res.status(404).json({ error: 'Not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// DELETE /assessments/:id
app.delete('/assessments/:id', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

// ── ATTEMPT / SUBMISSION ENDPOINTS ────────────────────────────────────────

// POST /assessments/:id/start — begin attempt
app.post('/assessments/:id/start', auth, requireRole('student'), async (req, res) => {
  try {
    const user = (req as any).user;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status !== 'active' && assessment.status !== 'published') {
      return res.status(400).json({ error: 'Assessment is not currently active' });
    }

    // Check max attempts
    const prevAttempts = await Attempt.countDocuments({ assessmentId: req.params.id, studentId: user.userId });
    if (prevAttempts >= assessment.maxAttempts) {
      return res.status(400).json({ error: `Max attempts (${assessment.maxAttempts}) reached` });
    }

    const sessionId = uuidv4();
    const attempt = await Attempt.create({
      assessmentId: assessment._id,
      studentId:    user.userId,
      sessionId,
      totalMarks:   assessment.totalMarks,
      ipAddress:    req.ip,
      browserInfo:  req.headers['user-agent'] || '',
    });

    // Store session in Redis with TTL matching quiz duration
    if (redis) {
      await redis.setEx(`quiz_session:${sessionId}`, assessment.duration * 60, JSON.stringify({
        assessmentId: req.params.id,
        studentId: user.userId,
        attemptId: attempt._id,
        expiresAt: Date.now() + assessment.duration * 60 * 1000,
      }));
    }

    // Return questions (shuffled if configured)
    let questions = assessment.toObject().questions;
    if (assessment.shuffle) questions = questions.sort(() => Math.random() - 0.5);
    
    // Strip correct answers
    const safeQuestions = questions.map(q => ({ ...q, correct: undefined, explanation: undefined }));

    res.status(201).json({
      sessionId,
      attemptId: attempt._id,
      questions: safeQuestions,
      duration:  assessment.duration,
      expiresAt: Date.now() + assessment.duration * 60 * 1000,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

// POST /assessments/:id/submit — grade attempt
app.post('/assessments/:id/submit', auth, requireRole('student'), async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const user = (req as any).user;

    // Find the in-progress attempt
    const attempt = await Attempt.findOne({ sessionId, studentId: user.userId, status: 'in_progress' });
    if (!attempt) return res.status(404).json({ error: 'Active attempt not found' });

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    // Grade answers
    let score = 0;
    const gradedAnswers = answers.map((ans: { questionId: string; answer: number | string }) => {
      const question = assessment.questions.find(q => q.id === ans.questionId);
      if (!question) return { ...ans, correct: false, marks: 0 };
      const isCorrect = String(question.correct) === String(ans.answer);
      if (isCorrect) score += question.marks;
      return { ...ans, isCorrect, correctAnswer: question.correct, explanation: question.explanation };
    });

    const percentage = Math.round((score / assessment.totalMarks) * 100);
    const passed = score >= assessment.passMarks;

    // Update attempt
    attempt.answers    = answers;
    attempt.score      = score;
    attempt.percentage = percentage;
    attempt.passed     = passed;
    attempt.submittedAt = new Date();
    attempt.status     = 'submitted';
    await attempt.save();

    // Update leaderboard in Redis
    if (redis) {
      await redis.zAdd(`leaderboard:${req.params.id}`, { score: percentage, value: user.userId });
      await redis.del(`quiz_session:${sessionId}`);
    }

    logger.info(`Assessment ${req.params.id} submitted by ${user.userId}: ${score}/${assessment.totalMarks} (${percentage}%)`);

    // Publish assessment.graded event for analytics service
    publishEvent('assessment.graded', {
      studentId:    user.userId,
      courseId:     assessment.courseId,
      assessmentId: String(assessment._id),
      score,
      totalMarks:   assessment.totalMarks,
      percentage,
      passed,
    });

    const response: Record<string, unknown> = { score, totalMarks: assessment.totalMarks, percentage, passed };
    if (assessment.showResults) response.gradedAnswers = gradedAnswers;
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// POST /assessments/:id/log-event — tab switches / proctoring
app.post('/assessments/:id/log-event', auth, requireRole('student'), async (req, res) => {
  try {
    const { sessionId, type } = req.body;
    const user = (req as any).user;
    
    const updateQuery: any = { 
      $push: { proctoringEvents: { type, timestamp: new Date() } } 
    };
    if (type === 'tab_switch') {
      updateQuery.$inc = { tabSwitches: 1 };
    }
    
    let attempt = await Attempt.findOneAndUpdate(
      { sessionId, studentId: user.userId, status: 'in_progress' },
      updateQuery,
      { new: true }
    );
    
    if (!attempt) return res.status(404).json({ error: 'Active attempt not found' });
    
    if (type === 'tab_switch') {
      // Auto-submit if > 3 switches
      if (attempt.tabSwitches > 3) {
        attempt = await Attempt.findOneAndUpdate(
          { _id: attempt._id, status: 'in_progress' },
          { $set: { status: 'auto_submitted', submittedAt: new Date() } },
          { new: true }
        ) || attempt;
        
        logger.warn(`Assessment auto-submitted for ${user.userId} due to excessive tab switches.`);
        return res.json({ autoSubmitted: true, message: 'Excessive tab switching detected. Assessment auto-submitted.' });
      }
    }
    
    res.json({ success: true, tabSwitches: attempt.tabSwitches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// GET /assessments/:id/results — faculty view all results
app.get('/assessments/:id/results', auth, requireRole('faculty', 'admin', 'management'), async (req, res) => {
  try {
    const attempts = await Attempt.find({ assessmentId: req.params.id, status: 'submitted' })
      .sort({ score: -1 })
      .lean();
    const stats = {
      totalAttempts: attempts.length,
      avgScore:   attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0,
      passCount:  attempts.filter(a => a.passed).length,
      passRate:   attempts.length ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100) : 0,
      highest:    attempts.length ? Math.max(...attempts.map(a => a.percentage)) : 0,
      lowest:     attempts.length ? Math.min(...attempts.map(a => a.percentage)) : 0,
    };
    res.json({ attempts, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// GET /assessments/:id/leaderboard
app.get('/assessments/:id/leaderboard', auth, async (req, res) => {
  try {
    const top = await Attempt
      .find({ assessmentId: req.params.id, status: 'submitted' })
      .sort({ score: -1 })
      .limit(10)
      .lean();
    res.json(top.map((a, i) => ({ rank: i + 1, studentId: a.studentId, score: a.score, percentage: a.percentage })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /students/:studentId/attempts — student history
app.get('/students/:studentId/attempts', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role === 'student' && user.userId !== req.params.studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const attempts = await Attempt
      .find({ studentId: req.params.studentId, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('assessmentId', 'title courseId type')
      .sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// ── Bootstrap ─────────────────────────────────────────────────────────────
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
  await connectMongoWithRetry(process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_assessments');
  await connectRedis();
  await connectRabbitMQ();

  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => logger.info(`⚡ Assessment Service running on :${PORT}`));
}

bootstrap().catch(err => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });


