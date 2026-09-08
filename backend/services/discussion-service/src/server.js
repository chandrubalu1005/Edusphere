const { errorHandler } = require('@edusphere/shared');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const discussionRoutes = require('./routes/discussionRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
  credentials: true
}));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'discussion-service' }));
app.use('/', discussionRoutes);

const PORT = process.env.PORT || 3013;
const MONGO_URI = process.env.MONGO_URI_DISCUSSIONS || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_discussions';

app.use(errorHandler);

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('discussion-service running on port ' + PORT));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

