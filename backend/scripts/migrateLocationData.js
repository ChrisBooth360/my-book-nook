const mongoose = require('mongoose');
const Location = require('../models/Location'); // Adjust path as necessary
const Book = require('../models/Book'); // Adjust path as necessary
const User = require('../models/User'); // Adjust path as necessary
require('dotenv').config();

// Update this to your database connection string
const DATABASE_URI = process.env.MONGODB_URI;

(async () => {
    try {
        console.log('Connecting to the database...');
        await mongoose.connect(DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected.');

        // Fetch all Location documents
        const locations = await Location.find();
        console.log(`Found ${locations.length} location records.`);

        for (const location of locations) {
            console.log(`Processing location ID: ${location._id}`);

            // Ensure the bookId references an existing Book
            const book = await Book.findById(location.bookId);
            if (!book) {
                console.warn(`No corresponding Book found for bookId: ${location.bookId}. Skipping.`);
                continue;
            }

            // Ensure the userId references an existing User
            const user = await User.findById(location.userId);
            if (!user) {
                console.warn(`No corresponding User found for userId: ${location.userId}. Skipping.`);
                continue;
            }

            // Update the location record if necessary
            const updates = {};
            if (!location.userId) {
                console.log(`Setting userId for location ID: ${location._id}`);
                updates.userId = user._id; // Assuming the user can be determined from context
            }

            if (!location.bookId.equals(book._id)) {
                console.log(`Updating bookId for location ID: ${location._id}`);
                updates.bookId = book._id;
            }

            if (Object.keys(updates).length > 0) {
                await Location.findByIdAndUpdate(location._id, updates, { new: true });
                console.log(`Location ID: ${location._id} updated successfully.`);
            } else {
                console.log(`No updates needed for location ID: ${location._id}`);
            }
        }

        console.log('Migration completed successfully.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error during migration:', error);
        mongoose.connection.close();
    }
})();
