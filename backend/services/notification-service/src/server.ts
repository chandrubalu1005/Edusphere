try { require('../../../../fix-dns.js'); } catch (e) { try { require('../../../fix-dns.js'); } catch (e2) {} }
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mongoose, { Schema, Document } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import winston from 'winston';
import amqp from 'amqplib';
import webpush from 'web-push';
import twilio from 'twilio';

dotenv.config();

// Web Push setup
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BHwg1I4s-HOjfkKVuz7pGwRmMxTVMFBNmH-CHAYwhS7k4JVQHiVviXnz19RdzLJJB_liWhoT8tYyzEEp5m60f-U';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'KMdoUSat_DsOPxKSLCLVkXIDkj-lfF4FqIybh0QH4oY';
webpush.setVapidDetails('mailto:support@edusphere.edu', vapidPublicKey, vapidPrivateKey);

// ── Logger ─────────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// ── Notification Schema ────────────────────────────────────────────────────
export interface INotification extends Document {
  userId:      string;
  title:       string;
  description: string;
  type:        'assignment' | 'quiz' | 'attendance' | 'certificate' | 'announcement' | 'grade' | 'system';
  read:        boolean;
  metadata:    Record<string, unknown>;
  createdAt:   Date;
}

const NotificationSchema = new Schema<INotification>({
  userId:      { type: String, required: true, index: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  type:        { type: String, enum: ['assignment','quiz','attendance','certificate','announcement','grade','system'], required: true },
  read:        { type: Boolean, default: false },
  metadata:    { type: Schema.Types.Mixed, default: {} },
  createdAt:   { type: Date, default: Date.now },
});

// TTL index — auto-delete notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
// Compound index for frequent unread count queries
NotificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// ── Web Push Subscription Schema ───────────────────────────────────────────
export interface IPushSubscription extends Document {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string; };
}
const PushSubscriptionSchema = new Schema<IPushSubscription>({
  userId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  }
});
const PushSubscription = mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

// ── App Setup ──────────────────────────────────────────────────────────────
const app  = express();
const http = createServer(app);
const io   = new SocketIOServer(http, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// ── In-memory room registry: userId → Set<socketId> ───────────────────────
const userRooms = new Map<string, Set<string>>();

// ── JWT Auth Middleware for REST ───────────────────────────────────────────
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123') as { userId: string; role: string };
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Socket.IO Auth ─────────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123') as { userId: string };
    (socket as any).userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket: Socket) => {
  const userId = (socket as any).userId as string;
  logger.info(`Socket connected: ${socket.id} → user:${userId}`);

  // Join personal room
  socket.join(`user:${userId}`);
  if (!userRooms.has(userId)) userRooms.set(userId, new Set());
  userRooms.get(userId)!.add(socket.id);

  // Send unread count on connect
  Notification.countDocuments({ userId, read: false }).then(count => {
    socket.emit('unread_count', count);
  });

  socket.on('mark_read', async (notifId: string) => {
    await Notification.findByIdAndUpdate(notifId, { read: true });
    const count = await Notification.countDocuments({ userId, read: false });
    socket.emit('unread_count', count);
  });

  socket.on('mark_all_read', async () => {
    await Notification.updateMany({ userId, read: false }, { read: true });
    socket.emit('unread_count', 0);
  });

  socket.on('disconnect', () => {
    userRooms.get(userId)?.delete(socket.id);
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ── REST Endpoints ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));
app.get('/notifications/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// GET /notifications - list for user
app.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, type } = req.query;
    const filter: Record<string, unknown> = { userId };
    if (type) filter.type = type;
    const notifs = await Notification
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Notification.countDocuments(filter);
    const unread = await Notification.countDocuments({ userId, read: false });
    res.json({ notifications: notifs, total, unread, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /notifications - create & emit (internal use or admin)
app.post('/notifications', async (req, res) => {
  try {
    const { userId, title, description, type, metadata = {} } = req.body;
    if (!userId || !title || !description || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const notif = await Notification.create({ userId, title, description, type, metadata });
    
    // Emit via Socket.IO
    io.to(`user:${userId}`).emit('new_notification', notif);
    
    // Update unread count
    const count = await Notification.countDocuments({ userId, read: false });
    io.to(`user:${userId}`).emit('unread_count', count);

    // Send Web Push Notification
    const subscriptions = await PushSubscription.find({ userId });
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, JSON.stringify({ title, body: description, type, url: '/' }));
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          logger.error('Web push failed', err);
        }
      }
    }

    // Twilio SMS Integration (Gated/Inert)
    // FLAG: Requires a paid Twilio account for production use.
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      if (metadata && metadata.phoneNumber) {
        try {
          const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await twilioClient.messages.create({
            body: `EduSphere: ${title}\n${description}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: metadata.phoneNumber as string
          });
          logger.info(`SMS sent to ${metadata.phoneNumber}`);
        } catch (smsErr) {
          logger.warn('Twilio SMS failed', smsErr);
        }
      }
    }

    // Queue email notification via RabbitMQ (if configured)
    if (process.env.RABBITMQ_URL) {
      try {
        await publishEmailEvent({ userId, title, description });
      } catch (mqErr) {
        logger.warn('RabbitMQ publish failed, continuing without email', mqErr);
      }
    }

    logger.info(`Notification sent to user:${userId} — ${type}: ${title}`);
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// POST /notifications/subscribe - register web push
app.post('/notifications/subscribe', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }
    await PushSubscription.updateOne(
      { endpoint: subscription.endpoint },
      { userId, endpoint: subscription.endpoint, keys: subscription.keys },
      { upsert: true }
    );
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /notifications/bulk - broadcast to multiple users
app.post('/notifications/bulk', async (req, res) => {
  try {
    const { userIds, title, description, type, metadata = {} } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }
    const docs = userIds.map(userId => ({ userId, title, description, type, metadata }));
    const notifs = await Notification.insertMany(docs);
    
    // Emit to all users
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('new_notification', notifs.find(n => n.userId === userId));
    });

    logger.info(`Bulk notification sent to ${userIds.length} users — ${type}`);
    res.status(201).json({ sent: notifs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

// PATCH /notifications/read-all
app.patch('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// PATCH /notifications/:id/read
app.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /notifications/:id
app.delete('/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    await Notification.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ── Announcement Schema ────────────────────────────────────────────────────
interface IAnnouncement extends Document {
  title:        string;
  content:      string;
  author:       string;
  authorId:     string;
  targetRoles:  string[];
  targetDept:   string | null;
  priority:     string;
  expiresAt:    Date | null;
  createdAt:    Date;
}
const AnnouncementSchema = new Schema<IAnnouncement>({
  title:        { type: String, required: true, maxlength: 200 },
  content:      { type: String, required: true, maxlength: 5000 },
  author:       { type: String, required: true },
  authorId:     { type: String, required: true },
  targetRoles:  { type: [String], default: ['student', 'faculty', 'admin', 'management'] },
  targetDept:   { type: String, default: null },
  priority:     { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  expiresAt:    { type: Date, default: null },
  createdAt:    { type: Date, default: Date.now },
});
// TTL: auto-delete expired announcements
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

// GET /notifications/announcements
app.get('/notifications/announcements', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 20, priority } = req.query;
    const filter: Record<string, unknown> = {
      $and: [
        { $or: [{ targetRoles: user.role }, { targetRoles: { $size: 0 } }] },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
      ]
    };
    if (priority) filter.priority = priority;
    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Announcement.countDocuments({ targetRoles: user.role });
    res.json({ announcements, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST /notifications/announcements — faculty/admin only
app.post('/notifications/announcements', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!['faculty', 'admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Faculty or admin access required' });
    }
    const { title, content, targetRoles, targetDept, priority, expiresAt } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });
    const announcement = await Announcement.create({
      title, content, priority: priority || 'normal',
      targetRoles: targetRoles || ['student', 'faculty', 'admin', 'management'],
      targetDept: targetDept || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      author:   user.username || user.userId,
      authorId: user.userId,
    });
    // Fan-out notification to all target users via Socket.IO broadcast
    const rooms = announcement.targetRoles.map((r: string) => `role:${r}`);
    io.to(rooms).emit('new_announcement', announcement);
    logger.info(`Announcement published by ${user.userId}: "${title}"`);
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
});

// ── RabbitMQ Email Publisher ───────────────────────────────────────────────
async function publishEmailEvent(payload: { userId: string; title: string; description: string }) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  const ch   = await conn.createChannel();
  await ch.assertQueue('email_notifications', { durable: true });
  ch.sendToQueue('email_notifications', Buffer.from(JSON.stringify(payload)), { persistent: true });
  await ch.close();
  await conn.close();
}

// ── RabbitMQ Event Consumer ────────────────────────────────────────────────
async function consumeEvents() {
  if (!process.env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL not set — event consumer disabled');
    return;
  }
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch   = await conn.createChannel();
    const QUEUE = 'notification_events';
    await ch.assertQueue(QUEUE, { durable: true });
    ch.prefetch(10);
    logger.info(`Consuming from RabbitMQ queue: ${QUEUE}`);

    ch.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        // Expected: { userId, title, description, type, metadata }
        const notif = await Notification.create(event);
        io.to(`user:${event.userId}`).emit('new_notification', notif);
        const count = await Notification.countDocuments({ userId: event.userId, read: false });
        io.to(`user:${event.userId}`).emit('unread_count', count);
        
        // Web push
        const subscriptions = await PushSubscription.find({ userId: event.userId });
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ title: event.title, body: event.description, type: event.type, url: '/' }));
          } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) await PushSubscription.deleteOne({ _id: sub._id });
          }
        }
        
        ch.ack(msg);
      } catch (err) {
        logger.error('Failed to process event', err);
        ch.nack(msg, false, false); // dead letter
      }
    });

    // ── Relay custom domain events to Socket.IO ──────────────────────────────
    const RELAY_QUEUE = 'socket_relay_events';
    await ch.assertQueue(RELAY_QUEUE, { durable: true, exclusive: false });
    await ch.assertExchange('domain_events', 'topic', { durable: true });
    
    // Bind the relay queue to specific topics that need real-time UI updates
    await ch.bindQueue(RELAY_QUEUE, 'domain_events', 'leave.requested');
    await ch.bindQueue(RELAY_QUEUE, 'domain_events', 'leave.statusChanged');
    await ch.bindQueue(RELAY_QUEUE, 'domain_events', 'assessment.graded');
    await ch.bindQueue(RELAY_QUEUE, 'domain_events', 'submission.received');

    ch.consume(RELAY_QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const routingKey = msg.fields.routingKey;
        const eventData = JSON.parse(msg.content.toString());

        if (routingKey === 'leave.requested') {
          // Emit to faculty owner room
          if (eventData.facultyOwnerId) {
            io.to(`user:${eventData.facultyOwnerId}`).emit('leave.newRequest', eventData);
          }
        } else if (routingKey === 'leave.statusChanged') {
          // Emit to requester
          if (eventData.requesterId) {
            io.to(`user:${eventData.requesterId}`).emit('leave.statusChanged', eventData);
          }
        } else if (routingKey === 'assessment.graded') {
          // Emit to student
          if (eventData.studentId) {
            io.to(`user:${eventData.studentId}`).emit('grade.updated', eventData);
          }
        } else if (routingKey === 'submission.received') {
          // Emit to course faculty
          if (eventData.facultyOwnerId) {
            io.to(`user:${eventData.facultyOwnerId}`).emit('submission.received', eventData);
          }
        }
        ch.ack(msg);
      } catch (err) {
        logger.error(`Failed to process relay event`, err);
        ch.nack(msg, false, false);
      }
    });

  } catch (err) {
    logger.error('RabbitMQ consumer failed, retrying in 10s…', err);
    setTimeout(consumeEvents, 10_000);
  }
}

// ── Email Transporter ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    logger.warn('Email transport not configured — skipping email send');
    return;
  }
  await transporter.sendMail({
    from: `"EduSphere" <${process.env.SMTP_FROM || 'noreply@edusphere.edu'}>`,
    to, subject, html,
  });
}

async function connectMongoWithRetry(uri: string, maxRetries = 10, delay = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri);
      logger.info(`MongoDB connected: ${uri}`);
      return;
    } catch (err: any) {
      logger.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function bootstrap() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_notifications';
  await connectMongoWithRetry(MONGO_URI);

  await consumeEvents();

  const PORT = process.env.PORT || 3004;
  http.listen(PORT, () => logger.info(`🔔 Notification Service running on :${PORT}`));
  
  // Weekly digest cron placeholder (Simulated)
  setInterval(() => {
    logger.info('Weekly digest job execution skipped (Stub/CRON configured)');
  }, 7 * 24 * 60 * 60 * 1000);
}

bootstrap().catch(err => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

