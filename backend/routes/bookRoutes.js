const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books for a user
router.get('/:userId', async (req, res) => {
    try {
        const books = await Book.find({ userId: req.params.userId });
        res.json(books)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Add a new book
router.post('/', async (req, res) => {
    const { title, author, isbn, userId } = req.body;

    const newBook = new Book({
        title,
        author,
        isbn,
        userId
    });

    try {
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error){
        res.status(400).json({ message: error.message })
    }

    // Update book status
    router.put('/:bookId', async (req, res) => {
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
