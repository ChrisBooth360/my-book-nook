// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found'});

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json('Incorrect credentials');

        // Create JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ 
            message: "Login successful", 
            token, // Return the JWT to the user
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                books: user.books
            } 
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all books for an authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Find the user by their ID and populate the bookId field with full book details
        const user = await User.findById(req.user.id).populate('books.bookId');
        
        if (!user || !user.books.length) {
            return res.status(404).json({ message: 'No books found in your collection' });
        }

        // Combine user-specific fields and book details
        const userBooksWithDetails = user.books.map(userBook => ({
            addedDate: userBook.addedDate.toISOString(),
            status: userBook.status,
            bookId: userBook.bookId, // Populated book details
        }));

        res.json(userBooksWithDetails); // Return books with both user-specific and full book details
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user book status (protected route)
router.put('/:bookId/status', authMiddleware, async (req, res) => {
    const { status } = req.body; // Status should be 'read', 'unread', or 'currently reading'
    const { bookId } = req.params;

    try {
        // Find the authenticated user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the book in the user's collection by bookId
        const book = user.books.find(book => book.bookId.toString() === bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the status of the book in the user's collection
        book.status = status;

        // Save the updated user document
        await user.save();

        res.json({ message: 'Book status updated successfully', book });
    } catch (error) {
        console.error('Error updating book status:', error.message);
        res.status(500).json({ message: 'Error updating book status' });
    }
});


// Remove a book from the user's collection (protected route)
router.delete('/:bookId', authMiddleware, async (req, res) => {
    const { bookId } = req.params;

    try {
        // Find the authenticated user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the book exists in the user's collection
        const bookIndex = user.books.findIndex(book => book.bookId.toString() === bookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Remove the book from the user's collection
        user.books.splice(bookIndex, 1);

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Book removed from your collection' });
    } catch (error) {
        console.error('Error removing book:', error.message);
        res.status(500).json({ message: 'Error removing book from your collection' });
    }
});


// Search user's collection for a book by title or author
router.get('/search', authMiddleware, async (req, res) => {
    const { query } = req.query; // Get the search query from the request

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        // Find the authenticated user and populate their books with full book details
        const user = await User.findById(req.user.id).populate('books.bookId'); // Populate book details from the Book model

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Perform case-insensitive search on populated book details (title and author)
        const filteredBooks = user.books.filter(book => {
            const populatedBook = book.bookId; // Access the populated book data
            const titleMatch = populatedBook.title && populatedBook.title.match(new RegExp(query, 'i'));
            const authorMatch = populatedBook.author && populatedBook.author.match(new RegExp(query, 'i'));
            return titleMatch || authorMatch;
        });

        if (filteredBooks.length === 0) {
            return res.json({ message: 'No matching books found in your collection' });
        }

        // Return the matching books
        res.json(filteredBooks);
    } catch (error) {
        console.error('Error searching user\'s books:', error.message);
        res.status(500).json({ message: 'Error searching for books in your collection' });
    }
});


// GET user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude the password from the result
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: error.message });
    }
})

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    const { username, email } = req.body;

    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update user information
        user.username = username || user.username
        user.email = email || user.email

        const updatedUser = await user.save()
        res.json({
            message: 'User profile updated successfull',
            user: {
                username: updatedUser.username,
                email: updatedUser.email
            }
        })
        
    } catch (error) {
        console.error('Error updating profile:', error.message );
        res.status(500).json({ message: error.message })
    }
});

// Change password
router.put('/profile/password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Update the password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error.message);
        res.status(500).json({ message: 'Error updating password' });
    }
});


module.exports = router;
