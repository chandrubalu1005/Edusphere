const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const libraryRoutes = require('./routes/libraryRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/', libraryRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'library-service' }));

const PORT = process.env.PORT || 3011;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_library';

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log('library-service running on port ' + PORT));
}

startServer();