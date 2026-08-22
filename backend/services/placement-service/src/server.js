const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const placementRoutes = require('./routes/placementRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'placement-service' }));
app.use('/', placementRoutes);

const PORT = process.env.PORT || 3012;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_placement';

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('placement-service running on port ' + PORT));
}

startServer();

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('UNHANDLED REJECTION:', reason); });

