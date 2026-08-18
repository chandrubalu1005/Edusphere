try { require('../../../../fix-dns.js'); } catch (e) { try { require('../../../fix-dns.js'); } catch (e2) {} }
import express from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import cors from 'cors';

import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
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

// ── Schema ─────────────────────────────────────────────────────────────────
interface ICertificate extends Document {
  certificateNo:  string;
  studentId:      string;
  studentName:    string;
  courseId:       string;
  courseTitle:    string;
  grade:          string;
  score:          number;
  issuedBy:       string;
  institutionName: string;
  verificationHash: string;
  isRevoked:      boolean;
  revokedReason?: string;
  issuedAt:       Date;
  expiresAt?:     Date;
  fileUrl?:       string;
}

const CertificateSchema = new Schema<ICertificate>({
  certificateNo:    { type: String, required: true, unique: true, index: true },
  studentId:        { type: String, required: true, index: true },
  studentName:      { type: String, required: true },
  courseId:         { type: String, required: true },
  courseTitle:      { type: String, required: true },
  grade:            { type: String, required: true },
  score:            { type: Number, required: true },
  issuedBy:         { type: String, required: true },
  institutionName:  { type: String, default: 'EduSphere University' },
  verificationHash: { type: String, required: true, unique: true },
  isRevoked:        { type: Boolean, default: false },
  revokedReason:    String,
  issuedAt:         { type: Date, default: Date.now },
  expiresAt:        { type: Date },
  fileUrl:          String,
});

const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const CERT_DIR = process.env.CERT_DIR || path.join(process.cwd(), 'uploads', 'certificates');
fs.mkdirSync(CERT_DIR, { recursive: true });
app.use('/certs', express.static(CERT_DIR));

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

// ── Certificate Number Generator ───────────────────────────────────────────
function generateCertNo(courseId: string): string {
  const year = new Date().getFullYear();
  const seq  = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EDU-${year}-${courseId.toUpperCase().slice(0,6)}-${seq}`;
}

// ── Grade Calculator ───────────────────────────────────────────────────────
function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 55) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

// ── PDF Certificate Generator ──────────────────────────────────────────────
async function generateCertificatePDF(cert: ICertificate): Promise<string> {
  const filename = `${cert.certificateNo}.pdf`;
  const filepath = path.join(CERT_DIR, filename);

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Background
      doc.rect(0, 0, 842, 595).fill('#FFFDF5');
      
      // Border outer
      doc.rect(20, 20, 802, 555).lineWidth(3).stroke('#C98A3B');
      
      // Border inner
      doc.rect(30, 30, 782, 535).lineWidth(1).stroke('#C98A3B');

      // Header accent bar
      doc.rect(30, 30, 782, 80).fill('#1E2A4A');

      // Institution name
      doc.font('Helvetica-Bold').fontSize(14).fill('#C98A3B')
         .text('EDUSPHERE UNIVERSITY', 0, 52, { align: 'center' });
      doc.font('Helvetica').fontSize(9).fill('rgba(255,255,255,0.6)')
         .text('Accredited Institution · Established 2020', 0, 72, { align: 'center' });

      // Certificate title
      doc.font('Helvetica').fontSize(11).fill('#7A6540')
         .text('CERTIFICATE OF COMPLETION', 0, 130, { align: 'center', characterSpacing: 4 });

      doc.font('Helvetica').fontSize(14).fill('#666')
         .text('This is to certify that', 0, 165, { align: 'center' });

      // Student name (large)
      doc.font('Helvetica-Bold').fontSize(36).fill('#1E2A4A')
         .text(cert.studentName, 0, 190, { align: 'center' });

      // Divider
      doc.moveTo(250, 240).lineTo(592, 240).lineWidth(1).stroke('#C98A3B');

      doc.font('Helvetica').fontSize(13).fill('#555')
         .text('has successfully completed the course', 0, 255, { align: 'center' });

      // Course title
      doc.font('Helvetica-Bold').fontSize(20).fill('#1E2A4A')
         .text(cert.courseTitle, 60, 280, { align: 'center', width: 722 });

      // Grade and Score
      doc.font('Helvetica-Bold').fontSize(15).fill('#C98A3B')
         .text(`Grade: ${cert.grade}  ·  Score: ${cert.score}%`, 0, 330, { align: 'center' });

      // Issue date
      doc.font('Helvetica').fontSize(11).fill('#888')
         .text(`Issued on ${new Date(cert.issuedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, 0, 360, { align: 'center' });

      // Certificate number
      doc.font('Helvetica').fontSize(9).fill('#aaa')
         .text(`Certificate No: ${cert.certificateNo}`, 60, 480);

      // QR Code for verification
      const qrData = `${process.env.BASE_URL || 'http://localhost:3007'}/verify/${cert.verificationHash}`;
      const qrBuffer = await QRCode.toBuffer(qrData, { width: 80, margin: 1 });
      doc.image(qrBuffer, 730, 460, { width: 70 });

      // Signature line
      doc.moveTo(580, 490).lineTo(760, 490).lineWidth(1).stroke('#ccc');
      doc.font('Helvetica').fontSize(9).fill('#888')
         .text('Academic Director', 580, 498, { width: 180, align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

// ── ENDPOINTS ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'certificate-service' }));
app.get('/certificates/health', (_req, res) => res.json({ status: 'ok', service: 'certificate-service' }));

// GET /certificates?studentId=
app.get('/certificates', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { studentId } = req.query;
    
    let filter: Record<string, unknown> = {};
    if (user.role === 'student') {
      filter.studentId = user.userId; // students can only see their own
    } else if (studentId) {
      filter.studentId = studentId;
    }

    const certs = await Certificate.find(filter).sort({ issuedAt: -1 });
    res.json({ certificates: certs, total: certs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /certificates/:id
app.get('/certificates/:id', auth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// POST /certificates — issue a new certificate (faculty/admin only)
app.post('/certificates', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { studentId, studentName, courseId, courseTitle, score, issuedBy } = req.body;
    if (!studentId || !studentName || !courseId || !courseTitle || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const grade = getGrade(score);
    const certificateNo = generateCertNo(courseId);
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${certificateNo}${studentId}${courseId}${Date.now()}`)
      .digest('hex');

    const cert = await Certificate.create({
      certificateNo, studentId, studentName, courseId, courseTitle,
      grade, score, issuedBy: issuedBy || (req as any).user.userId,
      verificationHash,
    });

    // Generate PDF asynchronously
    generateCertificatePDF(cert).then(async (filename) => {
      await Certificate.findByIdAndUpdate(cert._id, { fileUrl: `/certs/${filename}` });
      logger.info(`Certificate PDF generated: ${filename}`);
    }).catch(err => logger.error('PDF generation failed', err));

    logger.info(`Certificate issued: ${certificateNo} for ${studentName} — ${courseTitle}`);
    res.status(201).json(cert);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Certificate already issued for this course' });
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// GET /verify/:hash — public verification endpoint
app.get('/verify/:hash', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ verificationHash: req.params.hash });
    if (!cert) return res.status(404).json({ valid: false, error: 'Certificate not found' });
    if (cert.isRevoked) return res.json({ valid: false, reason: cert.revokedReason });
    res.json({
      valid: true,
      certificate: {
        certificateNo: cert.certificateNo,
        studentName:   cert.studentName,
        courseTitle:   cert.courseTitle,
        grade:         cert.grade,
        issuedAt:      cert.issuedAt,
        institutionName: cert.institutionName,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /certificates/:id/download — download PDF
app.get('/certificates/:id/download', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    if (user.role === 'student' && cert.studentId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!cert.fileUrl) {
      // Regenerate if missing
      const filename = await generateCertificatePDF(cert);
      await Certificate.findByIdAndUpdate(cert._id, { fileUrl: `/certs/${filename}` });
      return res.download(path.join(CERT_DIR, filename), `${cert.certificateNo}.pdf`);
    }
    const filepath = path.join(CERT_DIR, path.basename(cert.fileUrl));
    if (!fs.existsSync(filepath)) {
      const filename = await generateCertificatePDF(cert);
      return res.download(path.join(CERT_DIR, filename), `${cert.certificateNo}.pdf`);
    }
    res.download(filepath, `${cert.certificateNo}.pdf`);
  } catch (err) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// PATCH /certificates/:id/revoke
app.patch('/certificates/:id/revoke', auth, requireRole('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isRevoked: true, revokedReason: req.body.reason || 'Revoked by administrator' },
      { new: true }
    );
    if (!cert) return res.status(404).json({ error: 'Not found' });
    logger.warn(`Certificate revoked: ${cert.certificateNo}`);
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

// ── RabbitMQ Consumer ──────────────────────────────────────────────────────
async function consumeEvents() {
  if (!process.env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL not set — auto-issuance disabled');
    return;
  }
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch   = await conn.createChannel();
    await ch.assertExchange('domain_events', 'topic', { durable: true });
    
    const q = await ch.assertQueue('certificate_auto_issue', { durable: true });
    await ch.bindQueue(q.queue, 'domain_events', 'assessment.graded');
    
    ch.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        // Auto issue if passed
        if (event.passed) {
          const courseId = event.courseId;
          const studentId = event.studentId;
          
          // Check if already issued
          const existing = await Certificate.findOne({ studentId, courseId });
          if (!existing) {
            const grade = getGrade(event.percentage);
            const certificateNo = generateCertNo(courseId);
            const verificationHash = crypto.createHash('sha256').update(`${certificateNo}${studentId}${courseId}${Date.now()}`).digest('hex');

            const cert = await Certificate.create({
              certificateNo, studentId, studentName: event.studentName || studentId, courseId, courseTitle: event.courseTitle || courseId,
              grade, score: event.percentage, issuedBy: 'System', verificationHash
            });

            generateCertificatePDF(cert).then(async (filename) => {
              await Certificate.findByIdAndUpdate(cert._id, { fileUrl: `/certs/${filename}` });
              logger.info(`Auto-issued certificate PDF generated: ${filename}`);
            }).catch(err => logger.error('PDF generation failed', err));
          }
        }
        ch.ack(msg);
      } catch (err) {
        logger.error('Failed to process event', err);
        ch.nack(msg, false, false);
      }
    });
  } catch (err) {
    logger.error('RabbitMQ consumer failed, retrying in 10s...', err);
    setTimeout(consumeEvents, 10000);
  }
}

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
  await connectMongoWithRetry(process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_certificates');
  await consumeEvents();
  const PORT = process.env.PORT || 3007;
  app.listen(PORT, () => logger.info(`🏆 Certificate Service running on :${PORT}`));
}

bootstrap().catch(err => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});
