const LibraryBook = require('../models/LibraryBook');
const BookIssue   = require('../models/BookIssue');
const fs = require('fs');
const path = require('path');

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
    
    // Server-computed fines (e.g. $1 per day late)
    const now = new Date();
    const processedIssues = issues.map(issue => {
      let fine = 0;
      if (issue.status === 'issued' && issue.dueDate && now > issue.dueDate) {
         const lateDays = Math.ceil((now - issue.dueDate) / (1000 * 60 * 60 * 24));
         fine = lateDays * 1; // 1 unit per day
      }
      return { ...issue.toObject(), computedFine: fine };
    });

    res.json({ issues: processedIssues, total: processedIssues.length });
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

    // Check if user already has this book
    const existing = await BookIssue.findOne({ bookId, userId: req.user.userId, status: 'issued' });
    if (existing) return res.status(409).json({ error: 'You already have this book issued' });

    const updatedBook = await LibraryBook.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!updatedBook) return res.status(409).json({ error: 'No copies available or book not found' });

    const issue = await BookIssue.create({
      bookId,
      bookTitle: updatedBook.title,
      userId:    req.user.userId,
      issueDate: new Date(),
      dueDate:   new Date(dueDate),
      status:    'issued',
    });
    res.status(201).json(issue);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const { publishEvent } = require('../config/rabbitmq');

exports.returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    if (issue.status === 'returned') return res.status(409).json({ error: 'Book already returned' });

    // Students can only return their own books; admins can return any
    if (req.user.role === 'student' && issue.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedIssue = await BookIssue.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: 'returned' } },
      { $set: { status: 'returned' } },
      { new: true }
    );
    if (!updatedIssue) return res.status(409).json({ error: 'Book already returned or issue not found' });

    const updatedBook = await LibraryBook.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } }, { new: true });

    publishEvent('library.book_available', {
      bookId: issue.bookId,
      bookTitle: issue.bookTitle,
      availableCopies: updatedBook.availableCopies
    });

    res.json({ message: 'Book returned successfully', issue });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.streamBook = async (req, res) => {
  try {
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (!book.isEbook || !book.fileUrl) return res.status(400).json({ error: 'This book is not available as an E-book' });

    // Validate that the user actually has it issued if it's required, or maybe all students can stream?
    // Let's assume you must issue it to stream it if availableCopies logic applies, or e-books are free for all.
    // For now, allow streaming for authenticated users.
    
    const filePath = path.resolve(process.cwd(), book.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'E-book file not found on server' });
    }

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': `inline; filename="${book.title}.pdf"`
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};