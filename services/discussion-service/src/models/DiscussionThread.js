const mongoose = require('mongoose');
const DiscussionThreadSchema = new mongoose.Schema({
  title: String, content: String, courseId: String, authorId: String, authorName: String, votes: { type: Number, default: 0 }, pinned: { type: Boolean, default: false }
});
module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema);