const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bookLocationController = require('../controllers/bookLocationController');

// Lending routes
router.put('/:googleBookId/lend', authMiddleware, bookLocationController.lendBook);
router.put('/:googleBookId/lend/return', authMiddleware, bookLocationController.returnLentBook);

// Borrowing routes
router.put('/:googleBookId/borrow', authMiddleware, bookLocationController.markBorrowedBook);
router.put('/:googleBookId/borrow/return', authMiddleware, bookLocationController.returnBorrowedBook);

// Update due dates
router.put('/:googleBookId/due-date', authMiddleware, bookLocationController.updateDueDate);

// Selling and buying routes
router.put('/:googleBookId/sell', authMiddleware, bookLocationController.sellBook);
router.put('/:googleBookId/buy', authMiddleware, bookLocationController.buyBook);

// Clear location history
router.delete('/:googleBookId/clear-history', authMiddleware, bookLocationController.clearLocationHistory);

module.exports = router;
