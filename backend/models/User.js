const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    books: [{
        bookId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Book',
            required: true
        },  // Reference to Book schema
        status: { 
            type: String, 
            enum: ['read', 'unread', 'currently reading', 'dnf'], 
            default: 'unread' 
        },
        addedDate: { 
            type: Date, 
            default: Date.now 
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        review: {
            type: String,
            default: ""
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        location: {
            onShelf: {
                type: Boolean,
                default: true,
            },
            borrowed: {
                type: Object,
                default: {
                    person: null,
                    dateBorrowed: null,
                    dateReturned: null,
                    dateDue: null
                }
            },
            lent: {
                type: Object,
                default: {
                    person: null,
                    dateLent: null,
                    dateReturned: null,
                    dateDue: null
                }
            }
        }
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
