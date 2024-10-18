// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
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
    genre: {
        type:[String],
        default:[]
    },
    numberOfPages: {
        type: Number,
        default: 0
    },
    publicationDate: {
        type: Date
    }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
