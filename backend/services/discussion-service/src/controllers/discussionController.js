const DiscussionThread = require('../models/DiscussionThread');
const DiscussionReply  = require('../models/DiscussionReply');

exports.getThreads = async (req, res) => {
  try {
    const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
    const courseResp = await fetch(`${COURSE_URL}/courses/${req.params.courseId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!courseResp.ok) return res.status(403).json({ error: 'Access denied to this course' });
    
    const course = await courseResp.json();
    if (req.user.role === 'student' && (!course.enrolledStudents || !course.enrolledStudents.includes(req.user.userId))) {
      return res.status(403).json({ error: 'Access denied: Not enrolled' });
    }
    if (req.user.role === 'faculty' && course.facultyOwnerId !== req.user.userId && (!course.coInstructors || !course.coInstructors.includes(req.user.userId))) {
       return res.status(403).json({ error: 'Access denied: Not course owner' });
    }

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

const SPAM_WORDS = /viagra|casino|lottery|free\s+money|crypto/i;

const { publishEvent } = require('../config/rabbitmq');

exports.createThread = async (req, res) => {
  try {
    const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
    const courseResp = await fetch(`${COURSE_URL}/courses/${req.body.courseId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!courseResp.ok) return res.status(403).json({ error: 'Access denied to this course' });
    
    const course = await courseResp.json();
    if (req.user.role === 'student' && (!course.enrolledStudents || !course.enrolledStudents.includes(req.user.userId))) {
      return res.status(403).json({ error: 'Access denied: Not enrolled' });
    }
    
    const isSpam = SPAM_WORDS.test(req.body.title) || SPAM_WORDS.test(req.body.content);
    if (isSpam) {
      return res.status(400).json({ error: 'Content flagged as spam' });
    }

    const th = new DiscussionThread({
      ...req.body, authorId: req.user.userId, authorName: req.user.username, isSpam
    });
    await th.save();

    publishEvent('discussion.thread_created', {
      threadId: th._id,
      courseId: th.courseId,
      authorName: th.authorName,
      title: th.title
    });

    res.status(201).json(th);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.replyToThread = async (req, res) => {
  try {
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    
    const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
    const courseResp = await fetch(`${COURSE_URL}/courses/${thread.courseId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!courseResp.ok) return res.status(403).json({ error: 'Access denied to this course' });
    const course = await courseResp.json();
    if (req.user.role === 'student' && (!course.enrolledStudents || !course.enrolledStudents.includes(req.user.userId))) {
      return res.status(403).json({ error: 'Access denied: Not enrolled' });
    }

    const isSpam = SPAM_WORDS.test(req.body.content);
    if (isSpam) {
      return res.status(400).json({ error: 'Content flagged as spam' });
    }
    const rep = new DiscussionReply({
      ...req.body, threadId: req.params.id, authorId: req.user.userId, authorName: req.user.username, isSpam,
      isAiSuggested: req.body.isAiSuggested || false
    });
    await rep.save();
    
    // Atomic count increment
    await DiscussionThread.findByIdAndUpdate(req.params.id, { $inc: { replyCount: 1 } });
    
    publishEvent('discussion.reply_added', {
      threadId: thread._id,
      courseId: thread.courseId,
      authorName: rep.authorName,
      replyId: rep._id
    });

    res.status(201).json(rep);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.voteThread = async (req, res) => {
  try {
    const { action } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.userId;

    // Remove user from both arrays first (atomic)
    await DiscussionThread.findByIdAndUpdate(req.params.id, {
      $pull: { upvotedBy: userId, downvotedBy: userId }
    });

    let update = {};
    if (action === 'upvote') {
      update = { $addToSet: { upvotedBy: userId } };
    } else if (action === 'downvote') {
      update = { $addToSet: { downvotedBy: userId } };
    }

    let thread = await DiscussionThread.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    // Recalculate votes count atomically if possible, but calculating here on the returned doc is safer 
    // since we can't easily do it in the same query. Wait, we can use an aggregation pipeline in update, 
    // but the easiest is just let the client compute it or do a subsequent update.
    // Actually, setting votes = upvotedBy.length - downvotedBy.length
    thread.votes = thread.upvotedBy.length - thread.downvotedBy.length;
    await thread.save();
    
    res.json(thread);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.voteReply = async (req, res) => {
  try {
    const { action } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.userId;

    // Remove user from both arrays first (atomic)
    await DiscussionReply.findByIdAndUpdate(req.params.replyId, {
      $pull: { upvotedBy: userId, downvotedBy: userId }
    });

    let update = {};
    if (action === 'upvote') {
      update = { $addToSet: { upvotedBy: userId } };
    } else if (action === 'downvote') {
      update = { $addToSet: { downvotedBy: userId } };
    }

    let reply = await DiscussionReply.findByIdAndUpdate(req.params.replyId, update, { new: true });
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    reply.votes = reply.upvotedBy.length - reply.downvotedBy.length;
    await reply.save();

    res.json(reply);
  } catch (error) { res.status(500).json({ error: error.message }); }
};