const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
