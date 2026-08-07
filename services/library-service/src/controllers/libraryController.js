const LibraryBook = require('../models/LibraryBook');
const BookIssue   = require('../models/BookIssue');

exports.getBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { $or: [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }, { isbn: new RegExp(q, 'i') }] } : {};
    const books = await LibraryBook.find(filter).sort({ title: 1 });
    res.json({ books, total: books.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getIssues = async (req, res) => {
  try {
    const issues = await BookIssue.find({ userId: req.params.userId }).sort({ issueDate: -1 });
    res.json({ issues, total: issues.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createBook = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    const bk = new LibraryBook(req.body);
    await bk.save();
    res.status(201).json(bk);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    if (!bookId || !dueDate) return res.status(400).json({ error: 'bookId and dueDate are required' });

    const book = await LibraryBook.findById(bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(409).json({ error: 'No copies available' });

    // Check if user already has this book
    const existing = await BookIssue.findOne({ bookId, userId: req.user.userId, status: 'issued' });
    if (existing) return res.status(409).json({ error: 'You already have this book issued' });

    book.availableCopies -= 1;
    await book.save();

    const issue = await BookIssue.create({
      bookId,
      bookTitle: book.title,
      userId:    req.user.userId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status:    'issued',
    });
    res.status(201).json(issue);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    if (issue.status === 'returned') return res.status(409).json({ error: 'Book already returned' });

    // Students can only return their own books; admins can return any
    if (req.user.role === 'student' && issue.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    issue.status = 'returned';
    await issue.save();

    await LibraryBook.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } });

    res.json({ message: 'Book returned successfully', issue });
  } catch (error) { res.status(500).json({ error: error.message }); }
};