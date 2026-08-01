const LibraryBook = require('../models/LibraryBook');
const BookIssue = require('../models/BookIssue');
exports.getBooks = async (req, res) => {
  try { res.json(await LibraryBook.find()); } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.getIssues = async (req, res) => {
  try { res.json(await BookIssue.find({ userId: req.params.userId })); } catch (error) { res.status(500).json({ error: error.message }); }
};
exports.createBook = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    const bk = new LibraryBook(req.body);
    await bk.save();
    res.status(201).json(bk);
  } catch (error) { res.status(500).json({ error: error.message }); }
};