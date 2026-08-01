const DiscussionThread = require('../models/DiscussionThread');
const DiscussionReply = require('../models/DiscussionReply');
exports.getThreads = async (req, res) => {
  try { res.json(await DiscussionThread.find({ courseId: req.params.courseId })); } catch (error) { res.status(500).json({ error: error.message }); }
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