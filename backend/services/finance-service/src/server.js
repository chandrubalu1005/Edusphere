require('dotenv').config();
const { errorHandler } = require('@edusphere/shared');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const financeRoutes = require('./routes/financeRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/finance', financeRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'finance-service', status: 'ok' });
});

const PORT = process.env.PORT || 3016;

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Finance service running on port ${PORT}`);
});
