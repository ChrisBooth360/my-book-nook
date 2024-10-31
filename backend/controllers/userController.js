// userController.js
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json('Incorrect credentials');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                books: user.books
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout user
exports.logoutUser = (req, res) => {
    res.json({ message: 'Logout successful.' });
};

// Get all books for an authenticated user
exports.getUserBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('books.bookId');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.books.length) {
            return res.status(404).json({ message: 'No books found in your collection' });
        }

        const userBooksWithDetails = user.books.map(userBook => ({
            addedDate: userBook.addedDate.toISOString(),
            status: userBook.status,
            bookId: userBook.bookId,
        }));

        res.json({
            username: user.username,
            books: userBooksWithDetails
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user book status
exports.updateBookStatus = async (req, res) => {
    const { status } = req.body;
    const { bookId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = user.books.find(book => book.bookId.toString() === bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        book.status = status;
        await user.save();

        res.json({ message: 'Book status updated successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Remove a book from user's collection
exports.removeBook = async (req, res) => {
    const { bookId } = req.params;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bookIndex = user.books.findIndex(book => book.bookId.equals(bookId));

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        user.books.splice(bookIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Book removed from your collection' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing book from your collection' });
    }
};

// Search user's collection for a book
exports.searchUserBooks = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        const user = await User.findById(req.user.id).populate('books.bookId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const filteredBooks = user.books.filter(book => {
            const populatedBook = book.bookId;
            const titleMatch = populatedBook.title && populatedBook.title.match(new RegExp(query, 'i'));
            const authorMatch = populatedBook.author && populatedBook.author.match(new RegExp(query, 'i'));
            return titleMatch || authorMatch;
        });

        res.json(filteredBooks.length ? filteredBooks : { message: 'No matching books found in your collection' });
    } catch (error) {
        res.status(500).json({ message: 'Error searching for books in your collection' });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { username, email } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.username = username || user.username;
        user.email = email || user.email;

        const updatedUser = await user.save();
        res.json({
            message: 'User profile updated successfully',
            user: {
                username: updatedUser.username,
                email: updatedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
};
