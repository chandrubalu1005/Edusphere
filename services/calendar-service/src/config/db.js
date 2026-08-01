const mongoose = require('mongoose');
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('calendar-service DB connected successfully');
  } catch (error) {
    console.error('calendar-service DB connection error:', error.message);
    process.exit(1);
  }
}
module.exports = connectDB;