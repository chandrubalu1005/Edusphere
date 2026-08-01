const mongoose = require('mongoose');
const DiscussionReplySchema = new mongoose.Schema({
  threadId: String, content: String, authorId: String, authorName: String, createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('DiscussionReply', DiscussionReplySchema);