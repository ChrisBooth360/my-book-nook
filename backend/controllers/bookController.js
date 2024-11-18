// controllers/bookController.js
const Book = require('../models/Book');
const User = require('../models/User');
const Location = require('../models/Location');
const axios = require('axios');

// Controller functions
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found in the library' });
        }
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ message: 'Error fetching books' });
    }
};

const searchGoogleBooks = async (req, res) => {
    const { query, startIndex = 0, maxResults = 10 } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
                key: process.env.GOOGLE_BOOKS_API_KEY,
                startIndex: Number(startIndex),
                maxResults: Number(maxResults),
            }
        });
        res.json(response.data.items);
    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }
};

const addBookToUserCollection = async (req, res) => {
    const { 
        googleBookId, 
        status = 'unread',
        progress = 0,
        review = "",
        rating = 0,
        location // This should include the onShelf, borrowed, lent info, if any
    } = req.body;

    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required' });
    }

    try {
        // Fetch book data from Google Books API
        const { data: bookData } = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
            params: { key: process.env.GOOGLE_BOOKS_API_KEY }
        });

        const { 
            title, 
            authors = ['Unknown Author'], 
            industryIdentifiers, 
            description = '', 
            categories = [], 
            pageCount = 0, 
            publishedDate = '',
            publisher = '',
            imageLinks,
            language = 'en',
            previewLink = '',
            infoLink = ''
        } = bookData.volumeInfo;

        // Extract ISBN if available
        const isbn = industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || industryIdentifiers?.[0]?.identifier;

        if (!isbn) {
            return res.status(400).json({ message: 'Book does not contain ISBN data' });
        }

        // Check if the book already exists in the database
        let existingBook = await Book.findOne({ isbn });
        if (!existingBook) {
            existingBook = new Book({
                googleBookId,
                title,
                authors,
                isbn,
                description,
                categories,
                pageCount,
                publishedDate,
                publisher,
                thumbnail: imageLinks?.thumbnail || '',
                language,
                previewLink,
                infoLink
            });
            await existingBook.save();
        }

        // Fetch the user's information
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the book is already in the user's collection
        const bookExists = user.books.some(book => book.bookId.toString() === existingBook._id.toString());
        if (bookExists) {
            return res.status(200).json({ message: 'Book already in your collection' });
        }

        // Create a new Location document based on the provided location data
        const newLocation = new Location({
            userId: user._id,
            bookId: existingBook._id,
            onShelf: location?.onShelf ?? true, // Default to true if not provided
            borrowed: location?.borrowed ?? {
                person: null,
                dateBorrowed: null,
                dateReturned: null,
                dateDue: null
            },
            lent: location?.lent ?? {
                person: null,
                dateLent: null,
                dateReturned: null,
                dateDue: null
            },
            history: location?.history ?? []
        });

        // Save the Location document
        await newLocation.save();

        // Add book to the user's collection with the specified status and the new locationId
        user.books.push({ 
            bookId: existingBook._id, 
            status, 
            progress, 
            review, 
            rating, 
            locationId: newLocation._id // Store the reference to the Location document
        });

        await user.save();

        res.status(200).json({ message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book from Google:', error.message);
        res.status(500).json({ message: 'Error adding book from Google' });
    }
};


const deleteBookFromLibrary = async (req, res) => {
    const { bookId } = req.params;

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await Book.findByIdAndDelete(bookId);
        res.status(200).json({ message: 'Book removed from the library successfully' });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        res.status(500).json({ message: 'Error deleting book from the library' });
    }
};

module.exports = {
    getAllBooks,
    searchGoogleBooks,
    addBookToUserCollection,
    deleteBookFromLibrary
};
