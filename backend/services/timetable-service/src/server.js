const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const timetableRoutes = require('./routes/timetableRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'timetable-service' }));
app.use('/', timetableRoutes);

const PORT = process.env.PORT || 3009;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_timetable';

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('timetable-service running on port ' + PORT));
}

startServer();
