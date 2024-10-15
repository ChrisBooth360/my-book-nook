// bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Review = require('../models/Review')
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Get all books for an authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const books = await Book.find({ userId: req.user.id });
        res.json(books)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Add a new book (protected route)
router.post('/search/add', authMiddleware, async (req, res) => {
    const { googleBookId } = req.body; // Expecting the Google Book ID from the request body

    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required' });
    }

    try {
        // Fetch book details from Google Books API using the Google Book ID
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
            params: {
                key: process.env.GOOGLE_BOOKS_API_KEY // Your Google Books API key
            }
        });

        const bookData = response.data;

        // Extract relevant book information
        const newBook = new Book({
            title: bookData.volumeInfo.title,
            author: bookData.volumeInfo.authors.join(', '), // Join authors if there's more than one
            isbn: bookData.volumeInfo.industryIdentifiers ? bookData.volumeInfo.industryIdentifiers[0].identifier : '', // Fallback if no ISBN is available
            description: bookData.volumeInfo.description,
            genre: bookData.volumeInfo.categories,
            numberOfPages: bookData.volumeInfo.pageCount,
            publicationDate: bookData.volumeInfo.publishedDate,
            firstPublishedDate: bookData.volumeInfo.publishedDate, // This can be refined based on your needs
            userId: req.user.id  // Attach the user's ID to the book
        });

        // Save the new book to the user's collection
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);

    } catch (error) {
        console.error('Error adding book from Google:', error.message);
        res.status(500).json({ message: 'Error adding book from Google' });
    }
})

// Update book status (protected route)
router.put('/:bookId', authMiddleware, async (req, res) => {
    const { status } = req.body

    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        } 

        // Ensure the book belongs to the authenticated user
        if (book.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        book.status = status;
        await book.save();

        res.json(book);
    } catch (error) {
        console.error('Error updating book status:', error.message);
        res.status(400).json({ message: error.message })
    }
})

// Delete a book (protected route)
router.delete('/:bookId', authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        } 

        // Ensure the book belongs to the authenticated user
        if (book.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Book.findByIdAndDelete(req.params.bookId);
        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Error updating book status:', error.message);
        res.status(400).json({ message: error.message })
    }
})

// Search Google Books API for books outside of the user's collection
router.get('/search', authMiddleware, async (req, res) => {
    const { query } = req.query // Get the search query from the request

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        // GET request to the Google Books API
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query, // The user's search query
                key: process.env.GOOGLE_BOOKS_API_KEY, // Google Books API key (stored in .env file)
                maxResults: 10 // Limit the number of results to 10
            }
        })

        // Return the books found from Google Books
        res.json(response.data.items);

    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }

})

// Search user's collection for a book by title or author
router.get('/search/mybooks', authMiddleware, async (req, res) => {
    const { query } = req.query // Get the search query from the request

    if (!query) {
        return res.status(400).json({ message: 'Please provide a search query' });
    }

    try {
        // Find books in the user's collection where the title or author matches the search query
        const books = await Book.find({
            userId: req.user.id, 
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive search on title
                { author: { $regex: query, $options: 'i' } } // Case-insensitive search on author
            ]
        });

        if (books.length === 0) {
            res.json('This book is not in the collection');
        } else {
            res.json(books);
        }

        

    } catch (error) {
        console.error('Error searching Google Books:', error.message);
        res.status(500).json({ message: 'Error searching for books' });
    }

})

// Route to create a review
router.post('/reviews', authMiddleware, async (req, res) => {
    const { bookId, rating, reviewText } = req.body;

    if (!bookId || !rating) {
        return res.status(400).json({ message: 'Book ID and rating are required' });
    }

    // Check if the user has already submitted a review for this book
    const existingReview = await Review.findOne({ bookId, userId: req.user.id });

    if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    // If not, create a new review
    try {
        const newReview = new Review({
            bookId,
            userId: req.user.id,
            rating,
            reviewText
        })

        const savedReview = await newReview.save();

        res.status(201).json(savedReview)
    } catch (error) {
        console.error('Error creating review:', error.message);
        res.status(500).json({ message: 'Error creating review' });
    }

})

// Route to get all reviews for a specific book
router.get('/:bookId/reviews', authMiddleware, async (req, res) => {
    const { bookId } = req.params;

    try {
        // Find all reviews for the specific book ID
        const reviews = await Review.find({ bookId });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this book' });
        }

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// Route to update a review
router.put('/reviews/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Ensure the review belongs to the authenticated user
        if (review.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        review.rating = rating !== undefined ? rating : review.rating; // Update if provided
        review.reviewText = reviewText !== undefined ? reviewText : review.reviewText; // Update if provided
        await review.save();

        res.json(review);

    } catch (error) {
        console.error('Error updating review:', error.message);
        res.status(500).json({ message: 'Error updating review' });
    }
});

// Route to delete a review
router.delete('/reviews/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Ensure the review belongs to the authenticated user
        if (review.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error('Error deleting review:', error.message);
        res.status(500).json({ message: 'Error deleting review' });
    }
});

module.exports = router;
