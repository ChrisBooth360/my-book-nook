// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware, userController.logoutUser);
router.get('/', authMiddleware, userController.getUserBooks);
router.put('/:googleBookId/status', authMiddleware, userController.updateBookStatus);
router.delete('/:googleBookId', authMiddleware, userController.removeBook);
router.get('/search', authMiddleware, userController.searchUserBooks);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/profile/password', authMiddleware, userController.changePassword);
router.get('/:status', authMiddleware, userController.getBooksByStatus);
router.put('/:googleBookId/progress', authMiddleware, userController.updateProgress);
router.put('/:googleBookId/review', authMiddleware, userController.updateReview);
// TODO - Implement controllers
router.put('/:googleBookId/rating', authMiddleware, userController.updateRating);
router.put('/:googleBookId/location', authMiddleware, userController.updateLocation);
router.delete('/:googleBookId/review', authMiddleware, userController.removeReview)

module.exports = router;
