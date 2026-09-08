const { errorHandler } = require('@edusphere/shared');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startAcademicEventConsumers } = require('./consumers/academicEvents');
const timetableRoutes = require('./routes/timetableRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
  credentials: true
}));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'timetable-service' }));
app.use('/', timetableRoutes);

const PORT = process.env.PORT || 3009;
const MONGO_URI = process.env.MONGO_URI_TIMETABLE || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_timetable';

app.use(errorHandler);

async function startServer() {
  await connectDB(MONGO_URI);
  try {
    const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    await connectRabbitMQ(amqpUrl);
    await startAcademicEventConsumers();
  } catch (err) {
    console.error('Failed to start Timetable RabbitMQ:', err.message);
  }
  app.listen(PORT, () => console.log('timetable-service running on port ' + PORT));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

