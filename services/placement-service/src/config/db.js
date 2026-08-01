const mongoose = require('mongoose');
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('placement-service DB connected successfully');
  } catch (error) {
    console.error('placement-service DB connection error:', error.message);
    process.exit(1);
  }
}
module.exports = connectDB;