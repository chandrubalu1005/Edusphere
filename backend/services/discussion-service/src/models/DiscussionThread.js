const mongoose = require('mongoose');
const DiscussionThreadSchema = new mongoose.Schema({
  title: String, content: String, courseId: String, authorId: String, authorName: String, 
  votes: { type: Number, default: 0 }, 
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  pinned: { type: Boolean, default: false },
  isSpam: { type: Boolean, default: false },
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);