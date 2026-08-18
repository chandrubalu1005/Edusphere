const mongoose = require('mongoose');
const LibraryBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  isEbook: { type: Boolean, default: false },
  fileUrl: String // Local file path or S3 URL
});
module.exports = mongoose.model('LibraryBook', LibraryBookSchema);