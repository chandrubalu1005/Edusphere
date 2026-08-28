const mongoose = require('mongoose');

const PublisherSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String },
  website: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Publisher', PublisherSchema);
