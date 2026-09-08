const { errorHandler } = require('@edusphere/shared');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const libraryRoutes = require('./routes/libraryRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
  credentials: true
}));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'library-service' }));
app.use('/', libraryRoutes);

const PORT = process.env.PORT || 3011;
const MONGO_URI = process.env.MONGO_URI_LIBRARY || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_library';

app.use(errorHandler);

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('library-service running on port ' + PORT));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

