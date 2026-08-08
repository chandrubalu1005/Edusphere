const mongoose = require('mongoose');
const BookIssueSchema = new mongoose.Schema({
  bookId: String, bookTitle: String, userId: String, issueDate: String, dueDate: String, status: { type: String, default: 'issued' }
});
module.exports = mongoose.model('BookIssue', BookIssueSchema);