try { require('../../../../fix-dns.js'); } catch (e) { try { require('../../../fix-dns.js'); } catch (e2) {} }
const mongoose = require('mongoose');

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

async function connectDB(uri) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to MongoDB successfully');
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt === MAX_RETRIES) {
        console.error('Max MongoDB connection retries reached. Running in degraded mode without MongoDB.');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

module.exports = connectDB;