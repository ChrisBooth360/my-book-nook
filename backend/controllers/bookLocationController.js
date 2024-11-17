const User = require('../models/User');
const Book = require('../models/Book');

// Helper function to find a user's book
const findUserBook = async (userId, googleBookId) => {
    const bookData = await Book.findOne({ googleBookId });
    if (!bookData) throw new Error('Book not found in the database');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const book = user.books.find(book => book.bookId.toString() === bookData._id.toString());
    if (!book) throw new Error('Book not found in your collection');

    return { user, book };
};

// Centralized error handling
const handleError = (res, error, defaultMessage = 'An error occurred') => {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || defaultMessage });
};

// Lend a book
exports.lendBook = async (req, res) => {
    const { person } = req.body;
    const { googleBookId } = req.params;

    try {
        const { user, book } = await findUserBook(req.user.id, googleBookId);

        // Update book's location
        book.location.onShelf = false;
        book.location.lent.person = person;
        book.location.lent.dateLent = new Date();

        await user.save();
        res.json({ message: 'Book lent successfully', book });
    } catch (error) {
        handleError(res, error, 'Error lending book');
    }
};

// Update lent due date
exports.updateLentDueDate = async (req, res) => {
    const { googleBookId } = req.params;
    const { dateDue } = req.body;

    try {
        if (!dateDue || isNaN(new Date(dateDue))) throw new Error('Invalid or missing due date');

        const { user, book } = await findUserBook(req.user.id, googleBookId);

        console.log(book)
        console.log(book.location)
        console.log(book.location.lent)
        console.log(book.location.lent.person)

        if (!book.location?.lent?.person) throw new Error('Book is not currently lent out');

        book.location.lent.dateDue = new Date(dateDue);

        await user.save();
        res.json({ message: 'Lent due date updated successfully', book });
    } catch (error) {
        handleError(res, error, 'Error updating lent due date');
    }
};

// Return a lent book
exports.updateLentReturn = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const { user, book } = await findUserBook(req.user.id, googleBookId);

        book.location.onShelf = true;
        book.location.lent.dateReturned = new Date();

        await user.save();
        res.json({ message: 'Book returned successfully', book });
    } catch (error) {
        handleError(res, error, 'Error returning book');
    }
};

// Update lent date
exports.updateLentDate = async (req, res) => {
    const { googleBookId } = req.params;
    const { dateLent } = req.body;

    try {
        if (!dateLent || isNaN(new Date(dateLent))) throw new Error('Invalid or missing lent date');

        const { user, book } = await findUserBook(req.user.id, googleBookId);

        if (!book.location?.lent?.person) throw new Error('Book is not currently lent out');

        book.location.lent.dateLent = new Date(dateLent);

        await user.save();
        res.json({ message: 'Lent date updated successfully', book });
    } catch (error) {
        handleError(res, error, 'Error updating lent date');
    }
};

// Borrow a book
exports.borrowBook = async (req, res) => {
    const { person } = req.body;
    const { googleBookId } = req.params;

    try {
        const { user, book } = await findUserBook(req.user.id, googleBookId);

        book.location.onShelf = true;
        book.location.borrowed.person = person;
        book.location.borrowed.dateBorrowed = new Date();

        await user.save();
        res.json({ message: 'Book borrowed successfully', book });
    } catch (error) {
        handleError(res, error, 'Error borrowing book');
    }
};

// Update borrowed due date
exports.updateBorrowedDueDate = async (req, res) => {
    const { googleBookId } = req.params;
    const { dateDue } = req.body;

    try {
        if (!dateDue || isNaN(new Date(dateDue))) throw new Error('Invalid or missing due date');

        const { user, book } = await findUserBook(req.user.id, googleBookId);

        if (!book.location?.borrowed?.person) throw new Error('Book is not currently borrowed');

        book.location.borrowed.dateDue = new Date(dateDue);

        await user.save();
        res.json({ message: 'Borrowed due date updated successfully', book });
    } catch (error) {
        handleError(res, error, 'Error updating borrowed due date');
    }
};

// Return a borrowed book
exports.updateBorrowedReturn = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const { user, book } = await findUserBook(req.user.id, googleBookId);

        book.location.onShelf = false;
        book.location.borrowed.dateReturned = new Date();

        await user.save();
        res.json({ message: 'Book returned successfully', book });
    } catch (error) {
        handleError(res, error, 'Error returning book');
    }
};

// Update borrowed date
exports.updateBorrowedDate = async (req, res) => {
    const { googleBookId } = req.params;
    const { dateBorrowed } = req.body;

    try {
        if (!dateBorrowed || isNaN(new Date(dateBorrowed))) throw new Error('Invalid or missing lent date');

        const { user, book } = await findUserBook(req.user.id, googleBookId);

        if (!book.location?.borrowed?.person) throw new Error('Book is not currently lent out');

        book.location.borrowed.dateBorrowed = new Date(dateBorrowed);

        await user.save();
        res.json({ message: 'Borrowed date updated successfully', book });
    } catch (error) {
        handleError(res, error, 'Error updating borrowed date');
    }
};

// Update book status (sell or buy)
const updateBookStatus = async (req, res, action) => {
    const { googleBookId } = req.params;

    try {
        const { user, book } = await findUserBook(req.user.id, googleBookId);

        book.location.onShelf = action === 'buy';

        await user.save();
        res.json({ message: `${action.charAt(0).toUpperCase() + action.slice(1)} book successfully`, book });
    } catch (error) {
        handleError(res, error, `Error ${action}ing book`);
    }
};

// Sell a book
exports.sellBook = (req, res) => updateBookStatus(req, res, 'sell');

// Buy a book
exports.buyBook = (req, res) => updateBookStatus(req, res, 'buy');
