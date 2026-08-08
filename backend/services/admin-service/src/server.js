const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3015;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_admin';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

app.use('/', adminRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'admin-service' }));

async function startServer() {
  await connectDB(MONGO_URI);
  await connectRabbitMQ(RABBITMQ_URL);
  app.listen(PORT, () => console.log(`Admin Service listening on port ${PORT}`));
}

startServer();