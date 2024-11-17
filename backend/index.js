// index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5001; // Use port from environment variable or default to 5001

app.use(cors());

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const userBooksRoutes = require('./routes/userBooksRoutes');
const bookLocationRoutes = require('./routes/bookLocationRoutes');

app.use('/api/books', bookRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user-books', userBooksRoutes);
app.use('/api/book-location', bookLocationRoutes)

// Start the server only when this file is executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export module for testing
module.exports = app;
