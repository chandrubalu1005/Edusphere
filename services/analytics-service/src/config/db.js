const mongoose = require('mongoose');
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('analytics-service DB connected successfully');
  } catch (error) {
    console.error('analytics-service DB connection error:', error.message);
    process.exit(1);
  }
}
module.exports = connectDB;