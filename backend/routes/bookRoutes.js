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

// Search Google Books API for books
router.get('/search', authMiddleware, async (req, res) => {
    const { query } = req.query // Get the search query from the request

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        // GET request to the Google Books API
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query, // The user's search query
                key: process.env.GOOGLE_BOOKS_API_KEY, // Google Books API key (stored in .env file)
                maxResults: 10 // Limit the number of results to 10
            }
        })

        // Return the books found from Google Books
        res.json(response.data.items);

    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }

})

// Add a new book (protected route)
router.post('/search/add', authMiddleware, async (req, res) => {
    const { googleBookId } = req.body;

    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required' });
    }

    try {
        // Fetch book details from Google Books API using the Google Book ID
        const { data: bookData } = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
            params: {
                key: process.env.GOOGLE_BOOKS_API_KEY
            }
        });

        const { title, authors, industryIdentifiers, description, categories, pageCount, publishedDate } = bookData.volumeInfo;

        if (!industryIdentifiers || industryIdentifiers.length === 0) {
            return res.status(400).json({ message: 'No valid ISBN found for this book' });
        }

        const isbn = industryIdentifiers[0].identifier;

        // Check if the book already exists in the database (by ISBN)
        let existingBook = await Book.findOne({ isbn });

        // If the book doesn't exist, create and save a new one
        if (!existingBook) {
            existingBook = new Book({
                title,
                author: authors ? authors.join(', ') : 'Unknown Author',
                isbn,
                description,
                genre: categories || [],
                numberOfPages: pageCount || 0,
                publicationDate: publishedDate
            });

            await existingBook.save();
        }

        // Find the authenticated user and check if the book is already in their collection
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bookExists = user.books.some(book => book.bookId.toString() === existingBook._id.toString());
        if (bookExists) {
            return res.status(400).json({ message: 'Book already exists in your collection' });
        }

        // Add the book to the user's collection
        user.books.push({ bookId: existingBook._id, status: 'unread' });
        await user.save();

        res.status(200).json(existingBook); // Respond with the added book details
    } catch (error) {
        console.error('Error adding book from Google:', error.message);
        res.status(500).json({ message: 'Error adding book from Google' });
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
