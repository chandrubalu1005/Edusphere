const express = require('express');
const cors = require('cors');
const redis = require('redis');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startAttendanceConsumers } = require('./consumers/academicEvents');
const { seedDefaultPolicy } = require('./config/initDb');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const otpAttendanceRoutes = require('./routes/otpAttendanceRoutes');
const attendanceController = require('./controllers/attendanceController');
const liveController = require('./controllers/liveController');
const sessionController = require('./controllers/sessionController');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3008;
const MONGO_URI = process.env.MONGO_URI_ATTENDANCE || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_attendance';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'attendance-service' }));
app.use('/', attendanceRoutes);
app.use('/leave', leaveRoutes);
app.use('/otp-attendance', otpAttendanceRoutes);

// Socket.io for live OTP sessions
io.on('connection', (socket) => {
  socket.on('join_otp_session', (sessionId) => {
    socket.join(`otp_session_${sessionId}`);
  });
});

// Swagger Docs
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'Attendance Service API', version: '1.0.0', description: 'Enterprise Attendance Tracking API' },
  paths: {
    '/mark': {
      post: {
        summary: 'Mark student attendance',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Success' } }
      }
    },
    '/mark-all': {
      post: {
        summary: 'Mark all student attendance',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Success' } }
      }
    }
  },
  components: { securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } }
};

app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Attendance Service API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerDocument)},
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

async function startServer() {
  const dbConnected = await connectDB(MONGO_URI);
  if (dbConnected) {
    try { await seedDefaultPolicy(); } catch(e) { console.error('Seed error:', e.message); }
  }
  
  try { 
    await connectRabbitMQ(RABBITMQ_URL); 
    await startAttendanceConsumers();
  } catch (e) { console.error('RabbitMQ error:', e.message); }
  try {
    const redisClient = redis.createClient({ url: REDIS_URL, socket: { reconnectStrategy: false } });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Connected to Redis');
    attendanceController.setRedisClient(redisClient);
    liveController.setRedisClient(redisClient);
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }

  liveController.setIoInstance(io);
  sessionController.setIoInstance(io);

  // Cleanup Cron for expired sessions is now handled by scheduledEndAt checking or a robust job queue.
  // In a real system, we would check for AttendanceSession records stuck in LIVE or CHECK_IN_OPEN past scheduledEndAt.

  server.listen(PORT, () => console.log(`Attendance Service listening on port ${PORT}`));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

