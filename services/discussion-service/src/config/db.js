const mongoose = require('mongoose');
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('discussion-service DB connected successfully');
  } catch (error) {
    console.error('discussion-service DB connection error:', error.message);
    process.exit(1);
  }
}
module.exports = connectDB;