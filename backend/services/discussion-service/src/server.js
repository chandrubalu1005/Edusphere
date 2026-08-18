const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const discussionRoutes = require('./routes/discussionRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'discussion-service' }));
app.use('/', discussionRoutes);

const PORT = process.env.PORT || 3013;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_discussions';

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('discussion-service running on port ' + PORT));
}

startServer();
