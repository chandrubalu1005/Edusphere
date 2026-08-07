require('../../../fix-dns.js');
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const attendanceRoutes = require('./routes/attendanceRoutes');
const attendanceController = require('./controllers/attendanceController');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3008;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_attendance';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

app.use('/', attendanceRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'attendance-service' }));

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
  await connectDB(MONGO_URI);
  await connectRabbitMQ(RABBITMQ_URL);
  
  try {
    const redisClient = redis.createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Connected to Redis');
    attendanceController.setRedisClient(redisClient);
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }

  app.listen(PORT, () => console.log(`Attendance Service listening on port ${PORT}`));
}

startServer();