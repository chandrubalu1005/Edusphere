const mongoose = require('mongoose');

const BookTitleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  subtitle: { type: String },
  isbn10: { type: String, unique: true, sparse: true },
  isbn13: { type: String, unique: true, sparse: true },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }],
  editors: [{ type: String }],
  contributors: [{ type: String }],
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
  publicationYear: { type: Number },
  edition: { type: String },
  language: { type: String, default: 'English' },
  pages: { type: Number },
  description: { type: String },
  subjects: [{ type: String, index: true }],
  keywords: [{ type: String, index: true }],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  classificationSystem: { type: String, enum: ['DDC', 'LCC', 'UDC', 'OTHER'], default: 'DDC' },
  classificationCode: { type: String },
  callNumber: { type: String },
  coverImage: { type: String }, // URL or MinIO path
  format: { type: String, enum: ['PRINT', 'EBOOK', 'AUDIOBOOK', 'JOURNAL', 'REFERENCE', 'THESIS', 'REPORT', 'OTHER'], default: 'PRINT' },
  series: { type: String },
  volume: { type: String },
  digitalAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('BookTitle', BookTitleSchema);
