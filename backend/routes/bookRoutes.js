const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllBooks,
    searchGoogleBooks,
    addBookToUserCollection,
    checkBookStatus,
    deleteBookFromLibrary
} = require('../controllers/bookController');

// Routes
router.get('/', getAllBooks);
router.get('/search', authMiddleware, searchGoogleBooks);
router.post('/search/add', authMiddleware, addBookToUserCollection);
router.get('/check-status/:googleBookId', authMiddleware, checkBookStatus);
router.delete('/:bookId', authMiddleware, deleteBookFromLibrary);

module.exports = router;
