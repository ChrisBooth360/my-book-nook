// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userBooksController = require('../controllers/userBooksController');

// Routes for multiple books
router.get('/', authMiddleware, userBooksController.getUserBooks);
router.get('/search', authMiddleware, userBooksController.searchUserBooks);
router.get('/:status', authMiddleware, userBooksController.getBooksByStatus);

// Routes for single books
router.put('/status/:googleBookId', authMiddleware, userBooksController.updateBookStatus);
router.put('/progress/:googleBookId', authMiddleware, userBooksController.updateProgress);
router.put('/review/:googleBookId', authMiddleware, userBooksController.updateReview);
router.put('/rating/:googleBookId', authMiddleware, userBooksController.updateRating);
router.delete('/remove/:googleBookId', authMiddleware, userBooksController.removeBook);
router.put('/review/remove/:googleBookId', authMiddleware, userBooksController.removeReview);

module.exports = router;
