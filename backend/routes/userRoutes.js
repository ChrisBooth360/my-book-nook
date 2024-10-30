const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware, userController.logoutUser);
router.get('/', authMiddleware, userController.getUserBooks);
router.put('/:bookId/status', authMiddleware, userController.updateBookStatus);
router.delete('/:bookId', authMiddleware, userController.removeBook);
router.get('/search', authMiddleware, userController.searchUserBooks);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/profile/password', authMiddleware, userController.changePassword);

module.exports = router;
