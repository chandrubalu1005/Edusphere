const { errorHandler } = require('@edusphere/shared');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
  credentials: true
}));

const PORT = process.env.PORT || 3015;
const MONGO_URI = process.env.MONGO_URI_ADMIN || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_admin';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'admin-service' }));
app.use('/', adminRoutes);

app.use(errorHandler);

async function startServer() {
  await connectDB(MONGO_URI);
  await connectRabbitMQ(RABBITMQ_URL);
  app.listen(PORT, () => console.log(`Admin Service listening on port ${PORT}`));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

