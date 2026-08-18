const mongoose = require('mongoose');
const DiscussionReplySchema = new mongoose.Schema({
  threadId: String, content: String, authorId: String, authorName: String, 
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  isSpam: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('DiscussionReply', DiscussionReplySchema);