require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const financeRoutes = require('./routes/financeRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/finance', financeRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'finance-service', status: 'OK' });
});

const PORT = process.env.PORT || 3016;

app.listen(PORT, () => {
  console.log(`Finance service running on port ${PORT}`);
});
