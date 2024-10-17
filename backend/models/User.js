// User.js
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
            enum: ['read', 'unread', 'currently reading'], 
            default: 'unread' 
        },
        addedDate: { 
            type: Date, 
            default: Date.now 
        }
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
