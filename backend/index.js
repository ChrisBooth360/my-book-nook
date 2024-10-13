// index.js
const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5001; // Use port from environment variable or default to 5001

// Connect to MongoDB
connectDB();


// Middleware to parse JSON bodies
app.use(express.json());

// Routes
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
