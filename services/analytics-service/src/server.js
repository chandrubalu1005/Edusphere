const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const analyticsRoutes = require('./routes/analyticsRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3014;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_analytics';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

app.use('/', analyticsRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'analytics-service' }));

async function startServer() {
  await connectDB(MONGO_URI);
  await connectRabbitMQ(RABBITMQ_URL);
  app.listen(PORT, () => console.log(`Analytics Service listening on port ${PORT}`));
}

startServer();