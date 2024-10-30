// bookController.js
const Book = require('../models/Book');
const User = require('../models/User');
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
    const { googleBookId, status = 'unread' } = req.body;
    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required' });
    }

    try {
        const { data: bookData } = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
            params: { key: process.env.GOOGLE_BOOKS_API_KEY }
        });

        const { title, authors, industryIdentifiers, description, categories, pageCount, publishedDate } = bookData.volumeInfo;
        const isbn = industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || industryIdentifiers[0].identifier;

        let existingBook = await Book.findOne({ isbn });
        if (!existingBook) {
            existingBook = new Book({
                googleBookId,
                title,
                author: authors?.join(', ') || 'Unknown Author',
                isbn,
                description,
                genre: categories || [],
                numberOfPages: pageCount || 0,
                publicationDate: publishedDate
            });
            await existingBook.save();
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const bookExists = user.books.some(book => book.bookId.toString() === existingBook._id.toString());
        if (bookExists) {
            return res.status(200).json({ message: 'Book already in your collection' });
        }

        user.books.push({ bookId: existingBook._id, status });
        await user.save();

        res.status(200).json({ message: 'Book added successfully', bookId: existingBook._id });
    } catch (error) {
        console.error('Error adding book from Google:', error.message);
        res.status(500).json({ message: 'Error adding book from Google' });
    }
};

const checkBookStatus = async (req, res) => {
    const { googleBookId } = req.params;
    try {
        const user = await User.findById(req.user.id).populate('books.bookId');
        const book = user.books.find((b) => b.bookId.googleBookId === googleBookId);
        if (book) {
            return res.status(200).json({ exists: true, status: book.status });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error checking book status:', error.message);
        res.status(500).json({ message: 'Error checking book status' });
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
    checkBookStatus,
    deleteBookFromLibrary
};
