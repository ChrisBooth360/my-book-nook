const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    onShelf: {
        type: Boolean,
        default: true,
    },
    borrowed: {
        person: {
            type: String,
            default: null,
        },
        dateBorrowed: {
            type: Date,
            default: null,
        },
        dateDue: {
            type: Date,
            default: null,
        },
    },
    lent: {
        person: {
            type: String,
            default: null,
        },
        dateLent: {
            type: Date,
            default: null,
        },
        dateDue: {
            type: Date,
            default: null,
        },
    },
    history: [
        {
            action: {
                type: String,
                enum: ['borrowed', 'lent', 'returned', 'gave back'],
                required: true,
            },
            person: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
