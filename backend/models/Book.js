// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    googleBookId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    authors: {
        type: [String], // Array to accommodate multiple authors
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    categories: {
        type: [String], // Array for multiple categories/genres
        default: []
    },
    pageCount: {
        type: Number,
        default: 0
    },
    publishedDate: {
        type: String // Keeping it as a string for better handling of various date formats
    },
    publisher: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String, // URL of the thumbnail image
        default: ''
    },
    language: {
        type: String,
        default: 'en' // Default to English
    },
    previewLink: {
        type: String, // URL for previewing the book
        default: ''
    },
    infoLink: {
        type: String, // URL for detailed book information
        default: ''
    },
    buyLink: {
        type: String, // URL for buying the book
        default: ''
    }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
