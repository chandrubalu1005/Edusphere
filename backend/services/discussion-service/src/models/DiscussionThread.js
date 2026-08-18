const mongoose = require('mongoose');
const DiscussionThreadSchema = new mongoose.Schema({
  title: String, content: String, courseId: String, authorId: String, authorName: String, 
  votes: { type: Number, default: 0 }, 
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  pinned: { type: Boolean, default: false },
  isSpam: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for course-level thread listing
DiscussionThreadSchema.index({ courseId: 1, createdAt: -1 });
DiscussionThreadSchema.index({ courseId: 1, pinned: -1, votes: -1 }); // Pinned + popular

module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);