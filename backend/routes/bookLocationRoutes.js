// routes/bookLocationRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bookLocationController = require('../controllers/bookLocationController');

// Lending routes
router.put('/:googleBookId/lend', authMiddleware, bookLocationController.lendBook);
router.put('/:googleBookId/lend/due-date', authMiddleware, bookLocationController.updateLentDueDate);
router.put('/:googleBookId/lend/returned', authMiddleware, bookLocationController.updateLentReturn);
router.put('/:googleBookId/lend/date-lent', authMiddleware, bookLocationController.updateLentDate);

// Borrowing routes
router.put('/:googleBookId/borrow', authMiddleware, bookLocationController.borrowBook);
router.put('/:googleBookId/borrow/due-date', authMiddleware, bookLocationController.updateBorrowedDueDate);
router.put('/:googleBookId/borrow/returned', authMiddleware, bookLocationController.updateBorrowedReturn);
router.put('/:googleBookId/borrow/date-borrowed', authMiddleware, bookLocationController.updateBorrowedDate);

// Selling and buying routes
router.put('/:googleBookId/sell', authMiddleware, bookLocationController.sellBook);
router.put('/:googleBookId/buy', authMiddleware, bookLocationController.buyBook)

module.exports = router;
