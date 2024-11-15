// controllers/userController.js
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

        const userBooksWithDetails = user.books.length > 0
            ? user.books.map(userBook => ({
                bookId: userBook.bookId,
                status: userBook.status,
                progress: userBook.progress,
                review: userBook.review,
                rating: userBook.rating,
                location: userBook.location,
                addedDate: userBook.addedDate.toISOString()
              }))
            : [];  // Return an empty array if no books are found

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
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book status
        book.status = status;
        await user.save();

        res.json({ message: 'Book status updated successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Remove a book from user's collection
exports.removeBook = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const user = await User.findById(req.user.id).populate('books.bookId'); // Populate bookId to access googleBookId

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the index of the book using googleBookId
        const bookIndex = user.books.findIndex(book => book.bookId.googleBookId === googleBookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Remove the book from user's collection
        user.books.splice(bookIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Book removed from your collection' });
    } catch (error) {
        console.error('Error removing book:', error);
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

// Get books by status
exports.getBooksByStatus = async (req, res) => {
    const { status } = req.params;

    try{
        // Normalise 'currently reading' status
        const normalizedStatus = status === 'currently-reading' ? 'currently reading' : status;
        
        const user = await User.findById(req.user.id).populate('books.bookId');

        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter books by status and map details
        const statusBooks = user.books
            .filter(book => book.status === normalizedStatus)
            .map(userBook => ({
                status: userBook.status,
                bookId: userBook.bookId,
                progress: userBook.progress,
                review: userBook.review,
                rating: userBook.rating,
                location: userBook.location,
                addedDate: userBook.addedDate.toISOString()
            }));

        res.json({
            username: user.username,
            books: statusBooks
        });
    } catch (error){
        console.log('Error fetching currently reading books:', error);
        res.status(500).json({ message: 'Error fetching currently reading books' });
    }
};

// Update user book progress
exports.updateProgress = async (req, res) => {
    const { progress } = req.body;
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book status
        book.progress = progress;

        if (progress === 100) {
            book.status = 'read'
        }

        await user.save();

        res.json({ message: 'Book progress updated successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Update book review
exports.updateReview = async (req, res) => {
    const { review } = req.body;
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book review
        book.review = review;
        await user.save();

        res.json({ message: 'Book review updated successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Remove book review
exports.removeReview = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book review
        book.review = "";
        await user.save();

        res.json({ message: 'Book review removed successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Update user book rating
exports.updateRating = async (req, res) => {
    const { rating } = req.body;
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book status
        book.rating = rating;
        await user.save();

        res.json({ message: 'Book rating updated successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};

// Update user book location
exports.updateLocation = async (req, res) => {
    const { location } = req.body;
    const { googleBookId } = req.params;

    try {
        // Find the Book by googleBookId to get its ObjectId
        const bookData = await Book.findOne({ googleBookId });
        if (!bookData) {
            return res.status(404).json({ message: 'Book not found in the database' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's book using the ObjectId
        const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
        if (!book) {
            return res.status(404).json({ message: 'Book not found in your collection' });
        }

        // Update the book location
        book.location = location;
        await user.save();

        res.json({ message: 'Book location updated successfully', book });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating book status' });
    }
};
