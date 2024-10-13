// bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');

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
    const { title, author, isbn, userId } = req.body;

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

    // Update book status (protected route)
    router.put('/:bookId', authMiddleware, async (req, res) => {
        const { status } = req.body

        try {
            const updatedBook = await Book.findByIdAndUpdate(
                req.params.bookId,
                { status },
                { new: true }
            )
            res.json(updatedBook);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    })
})

module.exports = router;
