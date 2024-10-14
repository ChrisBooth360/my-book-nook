// bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Get all books for an authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const books = await Book.find({ userId: req.user.id });
        res.json(books)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Add a new book (protected route)
router.post('/', authMiddleware, async (req, res) => {
    const { title, author, isbn } = req.body;

    const newBook = new Book({
        title,
        author,
        isbn,
        userId: req.user.id  // Attach the user's ID to the book
    });

    try {
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error){
        res.status(400).json({ message: error.message })
    }  
})

// Update book status (protected route)
router.put('/:bookId', authMiddleware, async (req, res) => {
    const { status } = req.body

    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        } 

        // Ensure the book belongs to the authenticated user
        if (book.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        book.status = status;
        await book.save();

        res.json(book);
    } catch (error) {
        console.error('Error updating book status:', error.message);
        res.status(400).json({ message: error.message })
    }
})

// Delete a book (protected route)
router.delete('/:bookId', authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        } 

        // Ensure the book belongs to the authenticated user
        if (book.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Book.findByIdAndDelete(req.params.bookId);
        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Error updating book status:', error.message);
        res.status(400).json({ message: error.message })
    }
})

// Search Google Books API for books outside of the user's collection
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

// Search user's collection for a book by title or author
router.get('/mybooks/search', authMiddleware, async (req, res) => {
    const { query } = req.query // Get the search query from the request

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        // Find books in the user's collection where the title or author matches the search query
        const books = await Book.find({
            userId: req.user.id, 
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive search on title
                { author: { $regex: query, $options: 'i' } } // Case-insensitive search on author
            ]
        });

        if (books.length === 0) {
            res.json('This book is not in the collection');
        } else {
            res.json(books);
        }

        

    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }

})

module.exports = router;
