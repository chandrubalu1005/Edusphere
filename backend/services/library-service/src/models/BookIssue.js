const mongoose = require('mongoose');
const BookIssueSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  bookTitle: String,
  userId: { type: String, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['issued', 'returned'], default: 'issued' }
});
module.exports = mongoose.model('BookIssue', BookIssueSchema);