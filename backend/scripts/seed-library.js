const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const LibraryBook = require('../services/library-service/src/models/LibraryBook');

const MONGO_URI = process.env.MONGO_URI_LIBRARY || process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere_library';

async function seedLibrary() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  
  console.log('Clearing old books...');
  await LibraryBook.deleteMany({});
  
  const books = [
    { title: 'Data Structures and Algorithms', author: 'Mark Allen Weiss', isbn: '978-0132576277', publisher: 'Pearson', year: 2011, category: 'Computer Science', totalCopies: 10, availableCopies: 10 },
    { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', publisher: 'Wiley', year: 2012, category: 'Computer Science', totalCopies: 5, availableCopies: 3 },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', publisher: 'Prentice Hall', year: 2008, category: 'Software Engineering', totalCopies: 8, availableCopies: 8 },
    { title: 'The C Programming Language', author: 'Brian W. Kernighan', isbn: '978-0131103627', publisher: 'Prentice Hall', year: 1988, category: 'Computer Science', totalCopies: 20, availableCopies: 15 },
    { title: 'Design Patterns', author: 'Erich Gamma', isbn: '978-0201633610', publisher: 'Addison-Wesley', year: 1994, category: 'Software Engineering', totalCopies: 12, availableCopies: 12 },
  ];

  await LibraryBook.insertMany(books);
  console.log('Seeded 5 dummy books into edusphere_library.');
  process.exit(0);
}

seedLibrary().catch(err => {
  console.error(err);
  process.exit(1);
});
