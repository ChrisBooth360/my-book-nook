// bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Get all books from library
router.get('/', async (req, res) => {
    try {
        // Find all books in the Book collection
        const books = await Book.find();

        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found in the library' });
        }

        // Return all books
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get search results from Google Books API with pagination
router.get('/search', authMiddleware, async (req, res) => {
    const { query, startIndex = 0, maxResults = 10 } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
                key: process.env.GOOGLE_BOOKS_API_KEY,
                startIndex: Number(startIndex),
                maxResults: Number(maxResults),
            }
        });

        res.json(response.data.items);
    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }
});


// Add a new book (protected route)
router.post('/search/add', authMiddleware, async (req, res) => {
    const { googleBookId, status = 'unread' } = req.body; // Accept status with default 'unread'

    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required' });
    }

    try {
        // Fetch book details from Google Books API
        const { data: bookData } = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
            params: { key: process.env.GOOGLE_BOOKS_API_KEY }
        });

        const { title, authors, industryIdentifiers, description, categories, pageCount, publishedDate } = bookData.volumeInfo;
        const isbn = industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || industryIdentifiers[0].identifier;

        // Check if the book already exists in the database
        let existingBook = await Book.findOne({ isbn });
        if (!existingBook) {
            existingBook = new Book({
                googleBookId,  // Include googleBookId when creating a new book
                title,
                author: authors?.join(', ') || 'Unknown Author',
                isbn,
                description,
                genre: categories || [],
                numberOfPages: pageCount || 0,
                publicationDate: publishedDate
            });
            await existingBook.save();
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the book is already in the user's library
        const bookExists = user.books.some(book => book.bookId.toString() === existingBook._id.toString());
        if (bookExists) {
            return res.status(400).json({ message: 'Book already exists in your collection' });
        }

        // Add the book to the user's collection if not present
        user.books.push({ bookId: existingBook._id, status });
        await user.save();

        res.status(200).json({ message: `Book added successfully with status ${status}` });
    } catch (error) {
        console.error('Error adding book from Google:', error.message);
        res.status(500).json({ message: 'Error adding book from Google' });
    }
});

// Check if a book is already in the user's library and get its status
router.get('/check-status/:googleBookId', authMiddleware, async (req, res) => {
    const { googleBookId } = req.params;
    try {
        const user = await User.findById(req.user.id).populate('books.bookId');
        const book = user.books.find((b) => b.bookId.googleBookId === googleBookId);
        if (book) {
            return res.status(200).json({ exists: true, status: book.status });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error checking book status:', error.message);
        res.status(500).json({ message: 'Error checking book status' });
    }
});


// Delete a book from the library (requires authentication)
router.delete('/:bookId', authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.params;

        // Check if the book exists in the library
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Delete the book from the database
        await Book.findByIdAndDelete(bookId);

        res.status(200).json({ message: 'Book removed from the library successfully' });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        res.status(500).json({ message: 'Error deleting book from the library' });
    }
});

module.exports = router;
