const mongoose = require('mongoose');
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('library-service DB connected successfully');
  } catch (error) {
    console.error('library-service DB connection error:', error.message);
    process.exit(1);
  }
}
module.exports = connectDB;