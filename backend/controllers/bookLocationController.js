const Location = require('../models/Location');
const Book = require('../models/Book');

// Helper to find Location document
const findLocation = async (userId, googleBookId) => {
    
    const book = await Book.findOne({ googleBookId });
    if (!book) throw new Error('Book not found in the database');

    // Look for the location directly using userId and bookId.
    const location = await Location.findOne({ userId, bookId: book._id });
    
    if (!location) {
        throw new Error('Location record not found for this book');
    }
    
    return location;
};

// Helper for error handling
const handleError = (res, error, defaultMessage = 'An error occurred') => {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || defaultMessage });
};

// Lend a book
exports.lendBook = async (req, res) => {
    const { person, dateLent, dateDue } = req.body;
    const { googleBookId } = req.params;

    try {
        // Fetch the location of the book for the current user
        const location = await findLocation(req.user.id, googleBookId);

        if (!location) {
            return res.status(404).json({ message: 'Book location not found.' });
        }

        // Ensure the book hasn't already been lent out.
        if (location.lent?.person) {
            return res.status(400).json({ message: 'Book already lent out.' });
        }

        // Prepare lending details
        const lentDetails = {
            person,
            dateLent: dateLent ? new Date(dateLent) : new Date(),
            dateDue: dateDue ? new Date(dateDue) : null
        };

        // Update the location to reflect the lending details
        location.lent = lentDetails;
        location.history.push({ action: 'lent', person, date: lentDetails.dateLent });

        // Save the updated location
        await location.save();

        // Return the success response
        res.status(200).json({
            message: 'Book lent successfully',
            location,
        });
    } catch (error) {
        // Handle any errors that occurred during the lending process
        handleError(res, error, 'Error lending book');
    }
};


// Return a lent book
exports.returnLentBook = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const location = await findLocation(req.user.id, googleBookId);

        // Ensure the book is currently lent out
        if (!location.lent?.person) {
            return res.status(400).json({ message: 'Book is not lent out.' });
        }

        // Push the 'returned' action to the history
        location.history.push({
            action: 'returned',
            person: location.lent?.person || 'Unknown',  // If person exists, use it; else, use 'Unknown'
            date: new Date(),
        });

        // Mark the book as returned
        location.lent = { person: null, dateDue: null, dateLent: null };  // Reset the lent info (clears lent data)

        // Save the updated location document
        await location.save();

        // Send the success response
        res.json({ message: 'Book returned successfully', location });
    } catch (error) {
        handleError(res, error, 'Error returning book');
    }
};

// Borrow a book
exports.markBorrowedBook = async (req, res) => {
    const { person, dateBorrowed, dateDue } = req.body;
    const { googleBookId } = req.params;

    try {
        // Fetch the location of the book for the current user
        const location = await findLocation(req.user.id, googleBookId);

        if (!location) {
            return res.status(404).json({ message: 'Book location not found.' });
        }

        // Ensure the book is on the shelf before lending it
        if (location.borrowed?.person) {
            return res.status(400).json({ message: 'Book is already borrowed.' });
        }

        // Prepare lending details
        const borrowedDetails = {
            person,
            dateBorrowed: dateBorrowed ? new Date(dateBorrowed) : new Date(),
            dateDue: dateDue ? new Date(dateDue) : null
        };

        // Update the location to reflect the borrowed details
        location.borrowed = borrowedDetails;
        location.history.push({ action: 'borrowed', person, date: borrowedDetails.dateBorrowed });

        // Save the updated location
        await location.save();

        // Return the success response
        res.status(200).json({
            message: 'Book borrowed successfully',
            location,
        });
    } catch (error) {
        // Handle any errors that occurred during the lending process
        handleError(res, error, 'Error borrowing book');
    }
};

// Return a borrowed book
exports.returnBorrowedBook = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        const location = await findLocation(req.user.id, googleBookId);

        if (!location.borrowed.person) throw new Error('Book is not currently borrowed');

        // Push the 'returned' action to the history
        location.history.push({
            action: 'gave back',
            person: location.borrowed?.person || 'Unknown',  // If person exists, use it; else, use 'Unknown'
            date: new Date(),
        });

        // Mark the book as returned
        location.borrowed = { person: null, dateDue: null, dateBorrowed: null };  // Reset the borrowed info (clears borrowed data)

        await location.save();
        res.json({ message: 'Book returned successfully', location });
    } catch (error) {
        handleError(res, error, 'Error returning borrowed book');
    }
};

// Update due dates
exports.updateDueDate = async (req, res) => {
    const { googleBookId } = req.params;
    const { dateDue, type } = req.body;

    try {
        if (!dateDue || isNaN(new Date(dateDue))) throw new Error('Invalid or missing due date');
        if (!['lent', 'borrowed'].includes(type)) throw new Error('Invalid type');

        const location = await findLocation(req.user.id, googleBookId);

        if (!location[type]?.person) throw new Error(`Book is not currently ${type}`);
        location[type].dateDue = new Date(dateDue);

        await location.save();
        res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} due date updated successfully`, location });
    } catch (error) {
        handleError(res, error, 'Error updating due date');
    }
};

// Sell or buy a book
const updateBookState = async (req, res, action) => {
    const { googleBookId } = req.params;

    try {
        const location = await findLocation(req.user.id, googleBookId);

        action === "sell" ?
            (location.onShelf = false,
            location.lent = null,
            location.borrowed = null,
            location.history = []) : 
            location.onShelf = true

        await location.save();

        res.json({ message: `${action.charAt(0).toUpperCase() + action.slice(1)} book successfully`, location });
    } catch (error) {
        handleError(res, error, `Error ${action}ing book`);
    }
};

exports.sellBook = (req, res) => updateBookState(req, res, 'sell');
exports.buyBook = (req, res) => updateBookState(req, res, 'buy');

// Clear location history
exports.clearLocationHistory = async (req, res) => {
    const { googleBookId } = req.params;

    try {
        // Fetch the location for the current user and book
        const location = await findLocation(req.user.id, googleBookId);

        // Clear the history array
        location.history = [];

        // Save the updated location
        await location.save();

        // Respond with success
        res.json({ message: 'Location history cleared successfully', location });
    } catch (error) {
        // Handle errors
        handleError(res, error, 'Error clearing location history');
    }
};

