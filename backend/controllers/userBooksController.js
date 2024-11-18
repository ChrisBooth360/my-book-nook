const User = require('../models/User');
const Book = require('../models/Book');

// Helper to fetch user and check existence
const getUserById = async (userId) => {
    const user = await User.findById(userId)
        .populate('books.bookId')
        .populate('books.locationId')
    if (!user) throw new Error('User not found');
    return user;
};

// Helper to find a book in the database
const getBookByGoogleId = async (googleBookId) => {
    const book = await Book.findOne({ googleBookId });
    if (!book) throw new Error('Book not found in the database');
    return book;
};

// Helper to find a user's book by bookId
const findUserBook = (user, googleBookId) => {
    const book = user.books.find(userBook => userBook.bookId?.googleBookId === googleBookId);
    if (!book) throw new Error('Book not found in your collection');
    return book;
};

// Common response wrapper
const sendResponse = (res, statusCode, data) => {
    res.status(statusCode).json(data);
};

// 1. Get all books for a user
exports.getUserBooks = async (req, res) => {
    try {
        const user = await getUserById(req.user.id);

        const userBooksWithDetails = user.books.map(userBook => ({
            bookId: userBook.bookId,
            locationId: userBook.locationId,
            status: userBook.status,
            progress: userBook.progress,
            review: userBook.review,
            rating: userBook.rating,
            addedDate: userBook.addedDate.toISOString()
        }));

        sendResponse(res, 200, {
            username: user.username,
            books: userBooksWithDetails
        });
    } catch (error) {
        sendResponse(res, 500, { message: error.message });
    }
};

// 2. Search user's collection for a book
exports.searchUserBooks = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return sendResponse(res, 400, { message: 'Please provide a search query' });
    }

    try {
        const user = await getUserById(req.user.id);

        const filteredBooks = user.books.filter(book => {
            const populatedBook = book.bookId;
            return (
                populatedBook.title?.match(new RegExp(query, 'i')) ||
                populatedBook.author?.match(new RegExp(query, 'i'))
            );
        });

        sendResponse(res, 200, filteredBooks.length ? filteredBooks : { message: 'No matching books found' });
    } catch (error) {
        sendResponse(res, 500, { message: error.message });
    }
};

// 3. Get books by status
exports.getBooksByStatus = async (req, res) => {
    const { status } = req.params;
    const normalizedStatus = status === 'currently-reading' ? 'currently reading' : status;

    try {
        const user = await getUserById(req.user.id);

        const statusBooks = user.books
            .filter(book => book.status === normalizedStatus)
            .map(userBook => ({
                bookId: userBook.bookId,
                locationId: userBook.locationId,
                status: userBook.status,
                progress: userBook.progress,
                review: userBook.review,
                rating: userBook.rating,
                addedDate: userBook.addedDate.toISOString()
            }));

        sendResponse(res, 200, {
            username: user.username,
            books: statusBooks
        });
    } catch (error) {
        sendResponse(res, 500, { message: error.message });
    }
};

// 4. Update book attributes (Generic Helper)
const updateUserBookAttribute = async (req, res, attribute, valueCallback) => {
    const { googleBookId } = req.params;

    try {
        const bookData = await getBookByGoogleId(googleBookId);
        const user = await getUserById(req.user.id);
        const book = findUserBook(user, bookData.googleBookId);

        // Update the attribute dynamically
        book[attribute] = valueCallback ? valueCallback(req.body) : req.body[attribute];
        await user.save();

        sendResponse(res, 200, { message: `Book ${attribute} updated successfully`, book });
    } catch (error) {
        sendResponse(res, 500, { message: error.message });
    }
};

// Specific attribute updates
exports.updateBookStatus = (req, res) => updateUserBookAttribute(req, res, 'status');
exports.updateProgress = (req, res) => 
    updateUserBookAttribute(req, res, 'progress', (book, { progress }) => {
        if (typeof progress !== 'number') {
            throw new Error('Progress must be a number.');
        }
        book.progress = progress;
        if (progress === 100) book.status = 'read';
    });
exports.updateReview = (req, res) => updateUserBookAttribute(req, res, 'review');
exports.updateRating = (req, res) => updateUserBookAttribute(req, res, 'rating');

// 5. Remove book from user's collection
exports.removeBook = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const user = await getUserById(req.user.id);
        const bookIndex = user.books.findIndex(book => book.bookId.googleBookId === googleBookId);

        if (bookIndex === -1) throw new Error('Book not found in your collection');

        user.books.splice(bookIndex, 1);
        await user.save();

        sendResponse(res, 200, { message: 'Book removed successfully' });
    } catch (error) {
        sendResponse(res, 500, { message: error.message });
    }
};

// 6. Remove book review
exports.removeReview = async (req, res) => {
    req.body.review = ""; // Reset review to empty
    this.updateReview(req, res);
};
