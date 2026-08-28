const BookTitle = require('../models/BookTitle');
const BookCopy = require('../models/BookCopy');
const { searchCatalog, syncBookToSearch } = require('../config/meilisearch');

exports.searchCatalog = async (req, res) => {
  try {
    const { q, format, language, available, digitalAvailable, limit, offset } = req.query;

    const filters = {};
    if (format) filters.format = format;
    if (language) filters.language = language;
    if (available) filters.available = available === 'true';
    if (digitalAvailable) filters.digitalAvailable = digitalAvailable === 'true';
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    // 1. Try Meilisearch
    if (q) {
      const meiliResults = await searchCatalog(q || '', filters);
      if (meiliResults && meiliResults.hits && meiliResults.hits.length > 0) {
        return res.json({ success: true, source: 'meilisearch', data: meiliResults.hits, total: meiliResults.estimatedTotalHits });
      }
    }

    // 2. Fallback to MongoDB if Meili has no hits or Meili is down
    const mongoFilter = { status: 'ACTIVE' };
    if (q) {
      mongoFilter.$or = [
        { title: new RegExp(q, 'i') },
        { isbn13: new RegExp(q, 'i') },
        { isbn10: new RegExp(q, 'i') },
        { keywords: new RegExp(q, 'i') }
      ];
    }
    if (format) mongoFilter.format = format;
    if (language) mongoFilter.language = language;
    if (digitalAvailable !== undefined) mongoFilter.digitalAvailable = digitalAvailable === 'true';

    const limitVal = filters.limit || 25;
    const offsetVal = filters.offset || 0;

    const books = await BookTitle.find(mongoFilter)
      .populate('authors')
      .populate('publisher')
      .populate('categoryId')
      .skip(offsetVal)
      .limit(limitVal)
      .sort({ title: 1 });

    const total = await BookTitle.countDocuments(mongoFilter);

    // Get copies mapping if available is requested
    let finalBooks = [];
    for (const bk of books) {
      const copiesCount = await BookCopy.countDocuments({ bookTitleId: bk._id, status: 'AVAILABLE' });
      if (filters.available !== undefined) {
         if (filters.available === true && copiesCount === 0) continue;
         if (filters.available === false && copiesCount > 0) continue;
      }
      finalBooks.push({
        ...bk.toObject(),
        availableCopies: copiesCount
      });
    }

    res.json({ success: true, source: 'mongodb', data: finalBooks, total: finalBooks.length });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.createTitle = async (req, res) => {
  try {
    const bookTitle = await BookTitle.create(req.body);
    
    // Sync to Meilisearch
    await syncBookToSearch({
      id: bookTitle._id.toString(),
      title: bookTitle.title,
      isbn13: bookTitle.isbn13,
      isbn10: bookTitle.isbn10,
      format: bookTitle.format,
      language: bookTitle.language,
      digitalAvailable: bookTitle.digitalAvailable,
      keywords: bookTitle.keywords,
      subjects: bookTitle.subjects
    });

    res.status(201).json({ success: true, data: bookTitle });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
