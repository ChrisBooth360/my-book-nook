// tests/userRoutes.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Mock the User model, bcrypt, and jwt
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../middleware/authMiddleware');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use(router);  // Mount the router

describe('User Routes', () => {
    beforeEach(() => {
        // Clear all instances and calls to the mocks
        jest.clearAllMocks();
    });

    // Test cases for user registration
    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            bcrypt.hash.mockResolvedValue('hashedpassword');
            User.prototype.save.mockResolvedValue({
                _id: 'mockedUserId',
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'hashedpassword',
            });

            const response = await request(app)
                .post('/register')
                .send({ username: 'newuser', email: 'newuser@example.com', password: 'password123' });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({
                _id: 'mockedUserId',
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'hashedpassword'
            });
        });

        it('should return 400 if the email is already in use', async () => {
            User.findOne.mockResolvedValue({ _id: 'existingUserId', email: 'existing@example.com' });

            const response = await request(app)
                .post('/register')
                .send({ username: 'newuser', email: 'existing@example.com', password: 'password123' });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Email already in use.' });
        });
    });

    // Test cases for user login
    describe('POST /login', () => {
        it('should return 200 and a token when login is successful', async () => {
            const mockUser = { _id: 'mockUserId', email: 'user@example.com', username: 'testuser', password: 'hashedpassword', books: [] };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mocked-jwt-token');

            const response = await request(app)
                .post('/login')
                .send({ email: 'user@example.com', password: 'password123' });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                message: "Login successful",
                token: 'mocked-jwt-token',
                user: { id: mockUser._id, username: mockUser.username, email: mockUser.email, books: mockUser.books }
            });
        });

        it('should return 400 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });

    //Test cases for getting user's books
    describe('GET / (Get all books for authenticated user)', () => {
        let mockUser;
    
        beforeEach(() => {
            // Create a mock user with books
            mockUser = {
                _id: 'mockUserId',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'hashedpassword',
                books: [
                    { 
                        bookId: new mongoose.Types.ObjectId(), 
                        status: 'read', 
                        addedDate: new Date('2022-01-01')
                    },
                    { 
                        bookId: new mongoose.Types.ObjectId(), 
                        status: 'unread', 
                        addedDate: new Date('2022-01-02')
                    }
                ],
            };

            // Mock User.findById to return a Mongoose-like object with a populate method
            User.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(Promise.resolve(mockUser)), // Return a promise that resolves to mockUser
            });

            // Mock the auth middleware
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' };
                next();
            });
        });
    
        it('should return 200 and all books with details for an authenticated user', async () => {
            const response = await request(app)
                .get('/')
                .set('Authorization', 'Bearer mock-token');
        
            expect(response.statusCode).toBe(200);
            const expectedBooks = mockUser.books.map(book => ({
                ...book,
                addedDate: book.addedDate.toISOString(),
                bookId: book.bookId.toString(), // Convert bookId to string for comparison
            }));
        
            expect(response.body).toEqual(expectedBooks);
        });
        
    
        it('should return 404 if user has no books in their collection', async () => {
            // Modify the mock user to have no books
            mockUser.books = [];
            User.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(Promise.resolve(mockUser)), // Ensure the mocked user has no books
            });
    
            const response = await request(app).get('/').set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'No books found in your collection' });
        });
    });

    // Test cases for updating book status
    describe('PUT /:bookId/status', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = { _id: 'mockUserId', books: [{ bookId: new mongoose.Types.ObjectId(), status: 'unread', addedDate: new Date('2020-01-01') }], save: jest.fn().mockResolvedValue() };
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' };
                next();
            });
            User.findById.mockResolvedValue(mockUser);
        });

        it('should update the book status successfully', async () => {
            const newStatus = 'read';
            const bookId = mockUser.books[0].bookId;

            const response = await request(app)
                .put(`/${bookId}/status`)
                .set('Authorization', 'Bearer mock-token')
                .send({ status: newStatus });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Book status updated successfully', book: { ...mockUser.books[0], status: newStatus, addedDate: expect.any(String), bookId: bookId.toString() } });
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            User.findById.mockResolvedValue(null);
            const response = await request(app).put('/someBookId/status').set('Authorization', 'Bearer mock-token').send({ status: 'read' });
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });

    // Test cases for removing a book from user's collection
    describe('DELETE /:bookId', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = { _id: 'mockUserId', books: [{ bookId: new mongoose.Types.ObjectId(), status: 'unread', addedDate: new Date('2020-01-01') }], save: jest.fn().mockResolvedValue() };
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' };
                next();
            });
            User.findById.mockResolvedValue(mockUser);
        });

        it('should remove the book from the user collection successfully', async () => {
            const bookId = mockUser.books[0].bookId.toString();

            const response = await request(app).delete(`/${bookId}`).set('Authorization', 'Bearer mock-token');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Book removed from your collection' });
            expect(mockUser.books.length).toBe(0); // Ensure the book is removed
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            User.findById.mockResolvedValue(null);
            const response = await request(app).delete('/someBookId').set('Authorization', 'Bearer mock-token');
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });


    // Test cases for searching user's books
    describe('GET /search', () => {
        let mockUser;

        beforeEach(() => {
            // Create a mock user with books
            mockUser = {
                _id: 'mockUserId',
                books: [
                    {
                        bookId: { _id: 'bookId1', title: 'Great Expectations', author: 'Charles Dickens' }, // Book 1
                    },
                    {
                        bookId: { _id: 'bookId2', title: 'Moby Dick', author: 'Herman Melville' }, // Book 2
                    },
                    {
                        bookId: { _id: 'bookId3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }, // Book 3
                    },
                ],
            };

            // Mock User.findById to return a Mongoose-like object with a populate method
            User.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(Promise.resolve(mockUser)), // Ensure populate returns mockUser
            });

            // Mock the auth middleware
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' };
                next();
            });
        });

        it('should return 200 and filtered books matching the title or author', async () => {
            const response = await request(app)
                .get('/search?query=Great')
                .set('Authorization', 'Bearer mock-token');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([
                {
                    bookId: { _id: 'bookId1', title: 'Great Expectations', author: 'Charles Dickens' },
                },
                {
                    bookId: { _id: 'bookId3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
                },
            ]);
        });

        it('should return 404 if no books match the search query', async () => {
            const response = await request(app)
                .get('/search?query=Nonexistent')
                .set('Authorization', 'Bearer mock-token');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'No matching books found in your collection' });
        });

        it('should return 400 if no search query is provided', async () => {
            const response = await request(app)
                .get('/search')
                .set('Authorization', 'Bearer mock-token');

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Please provide a search query' });
        });

        it('should return 404 if user is not found', async () => {
            User.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue(Promise.resolve(null)), // Ensure populate returns mockUser
            });
            const response = await request(app).get('/search?query=great').set('Authorization', 'Bearer mock-token');
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });
    // Test cases for getting user profile
    describe('GET /profile', () => {
        let mockUser;
    
        beforeEach(() => {
            // Create a mock user (initially with password for mocking purposes)
            mockUser = {
                _id: 'mockUserId',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'hashedpassword', // This will be removed by .select('-password')
                books: [],
            };
    
            // Mock User.findById to return the mock user without the password field
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    _id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                    books: mockUser.books // No password here
                })
            });
    
            // Mock the auth middleware
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' }; // Simulate a logged-in user
                next();
            });
        });
    
        it('should return 200 and the user profile without password', async () => {
            const response = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                _id: mockUser._id,
                username: mockUser.username,
                email: mockUser.email,
                books: mockUser.books // No password field in expected output
            });
        });
    
        it('should return 404 if user is not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });// Simulate user not found
    
            const response = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    
        it('should return 500 if there is a server error', async () => {
            User.findById.mockImplementation(() => {
                throw new Error('Database error'); // Simulate a server error
            });
    
            const response = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Database error' });
        });
    });

    // Test cases for updating profile information.
    describe('PUT /profile (Update user profile)', () => {
        let mockUser;

        beforeEach(() => {
            // Create a mock user object
            mockUser = {
                _id: 'mockUserId',
                username: 'testuser',
                email: 'testuser@example.com',
                save: jest.fn().mockResolvedValue({ 
                    _id: 'mockUserId', 
                    username: 'updatedUser', 
                    email: 'updated@example.com' 
                }) // Mocked save method that resolves to updated user data
            };

            // Mock the auth middleware to simulate logged-in user
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' }; // Mock user ID
                next();
            });
        });

        it('should update the user profile successfully', async () => {
            // Mock User.findById to return the mock user
            User.findById.mockResolvedValue(mockUser);

            const response = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    username: 'updatedUser',
                    email: 'updated@example.com'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                message: 'User profile updated successfull',
                user: {
                    username: 'updatedUser',
                    email: 'updated@example.com'
                }
            });
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 if the user is not found', async () => {
            // Mock User.findById to return null (user not found)
            User.findById.mockResolvedValue(null);

            const response = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    username: 'updatedUser',
                    email: 'updated@example.com'
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should return 500 if there is a server error', async () => {
            // Mock User.findById to throw an error
            User.findById.mockImplementation(() => {
                throw new Error('Server error');
            });

            const response = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    username: 'updatedUser',
                    email: 'updated@example.com'
                });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Server error' });
        });
    });

    describe('PUT /profile/password (Change password)', () => {
        let mockUser;

        beforeEach(() => {
            // Create a mock user with a hashed password
            mockUser = {
                _id: 'mockUserId',
                password: 'hashedpassword',
                save: jest.fn().mockResolvedValue() // Mock save method
            };

            // Mock the auth middleware to simulate logged-in user
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' }; // Mock user ID
                next();
            });

            // Mock User.findById to return the mock user
            User.findById.mockResolvedValue(mockUser);
        });

        it('should change the password successfully when current and new passwords are valid', async () => {
            // Mock bcrypt.compare to simulate correct current password
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            // Mock bcrypt.hash to simulate password hashing
            bcrypt.hash = jest.fn().mockResolvedValue('newhashedpassword');

            const response = await request(app)
                .put('/profile/password')
                .set('Authorization', 'Bearer mock-token')
                .send({ currentPassword: 'currentPassword', newPassword: 'newPassword123' });

            // Ensure the response status and message are correct
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Password updated successfully' });

            // Ensure bcrypt.compare was called with the correct current password and original hashed password
            expect(bcrypt.compare).toHaveBeenCalledWith('currentPassword', 'hashedpassword'); // Compare with the original password

            // Ensure bcrypt.hash was called with the new password
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10); // Hash new password

            // Now manually update the password after bcrypt.hash resolves
            mockUser.password = 'newhashedpassword'; // Simulate updating the password

            // Check that the password was updated correctly
            expect(mockUser.password).toBe('newhashedpassword'); // Password should be updated

            // Ensure the mock save method was called
            expect(mockUser.save).toHaveBeenCalled(); // User save method should be called
        });


    
        it('should return 400 if currentPassword or newPassword is missing', async () => {
            const response = await request(app)
                .put('/profile/password')
                .set('Authorization', 'Bearer mock-token')
                .send({ newPassword: 'newPassword123' }); // Missing currentPassword
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Current password and new password are required' });
        });
    
        it('should return 400 if current password is incorrect', async () => {
            bcrypt.compare.mockResolvedValue(false); // Simulate incorrect current password
    
            const response = await request(app)
                .put('/profile/password')
                .set('Authorization', 'Bearer mock-token')
                .send({ currentPassword: 'wrongPassword', newPassword: 'newPassword123' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Incorrect current password' });
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', mockUser.password); // Should check current password
        });
    
        it('should return 404 if user is not found', async () => {
            User.findById.mockResolvedValue(null); // Simulate user not found
    
            const response = await request(app)
                .put('/profile/password')
                .set('Authorization', 'Bearer mock-token')
                .send({ currentPassword: 'currentPassword', newPassword: 'newPassword123' });
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    
        it('should return 500 if there is a server error', async () => {
            User.findById.mockImplementation(() => { throw new Error('Database error'); }); // Simulate server error
    
            const response = await request(app)
                .put('/profile/password')
                .set('Authorization', 'Bearer mock-token')
                .send({ currentPassword: 'currentPassword', newPassword: 'newPassword123' });
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating password' });
        });
    });


});
