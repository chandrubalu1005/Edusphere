const DiscussionThread = require('../models/DiscussionThread');
const DiscussionReply  = require('../models/DiscussionReply');

exports.getThreads = async (req, res) => {
  try {
    const threads = await DiscussionThread.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
    res.json({ threads, total: threads.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getThread = async (req, res) => {
  try {
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const replies = await DiscussionReply.find({ threadId: req.params.id }).sort({ createdAt: 1 });
    res.json({ thread, replies, replyCount: replies.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createThread = async (req, res) => {
  try {
    const th = new DiscussionThread({
      ...req.body, authorId: req.user.userId, authorName: req.user.username
    });
    await th.save();
    res.status(201).json(th);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.replyToThread = async (req, res) => {
  try {
    const rep = new DiscussionReply({
      ...req.body, threadId: req.params.id, authorId: req.user.userId, authorName: req.user.username
    });
    await rep.save();
    res.status(201).json(rep);
  } catch (error) { res.status(500).json({ error: error.message }); }
};