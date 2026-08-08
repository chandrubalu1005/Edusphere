const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const calendarRoutes = require('./routes/calendarRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/', calendarRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'calendar-service' }));

const PORT = process.env.PORT || 3010;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_calendar';

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('calendar-service running on port ' + PORT));
}

startServer();