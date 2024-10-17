// userRoutes.test.js
const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');

// Mock the User model, bcrypt, and jwt
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/Book');
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

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            // Mock bcrypt.hash to return a fixed hashed password
            bcrypt.hash.mockResolvedValue('hashedpassword');

            // Mock the save method for User model
            User.prototype.save.mockResolvedValue({
                _id: 'mockedUserId',
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'hashedpassword',
            });

            const response = await request(app)
                .post('/register')
                .send({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({
                _id: 'mockedUserId',
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'hashedpassword'
            });
        });

        it('should return 400 if the email is already in use', async () => {
            // Mock User.findOne to return an existing user
            User.findOne.mockResolvedValue({
                _id: 'existingUserId',
                email: 'existing@example.com'
            });

            const response = await request(app)
                .post('/register')
                .send({
                    username: 'newuser',
                    email: 'existing@example.com',
                    password: 'password123'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Email already in use.' });
        });

        it('should return 400 if the email already exists', async () => {
            // Mock finding an existing user
            User.findOne.mockResolvedValue({ email: 'existinguser@test.com' });
        
            const response = await request(app)
                .post('/register')
                .send({
                    username: 'newuser',
                    email: 'existinguser@test.com',
                    password: 'password123'
                });
        
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Email already in use.' });
        });
        
    });

    describe('User Routes - POST /login', () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        it('should return 200 and a token when login is successful', async () => {
            const mockUser = {
                _id: 'mockUserId',
                email: 'user@example.com',
                username: 'testuser',
                password: 'hashedpassword',
                books: []
            };
    
            // Mock finding the user by email
            User.findOne.mockResolvedValue(mockUser);
            
            // Mock bcrypt password comparison
            bcrypt.compare.mockResolvedValue(true);
            
            // Mock JWT sign
            jwt.sign.mockReturnValue('mocked-jwt-token');
    
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'user@example.com',
                    password: 'password123'
                });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                message: "Login successful",
                token: 'mocked-jwt-token',
                user: {
                    id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                    books: mockUser.books
                }
            });
        });
    
        it('should return 400 if user is not found', async () => {
            // Mock no user found
            User.findOne.mockResolvedValue(null);
    
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    
        it('should return 400 if password is incorrect', async () => {
            const mockUser = {
                _id: 'mockUserId',
                email: 'user@example.com',
                password: 'hashedpassword'
            };
    
            // Mock finding the user by email
            User.findOne.mockResolvedValue(mockUser);
    
            // Mock bcrypt password comparison to return false (incorrect password)
            bcrypt.compare.mockResolvedValue(false);
    
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'user@example.com',
                    password: 'wrongpassword'
                });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual('Incorrect credentials');
        });
    
        it('should return 500 if there is a server error', async () => {
            // Mock an error during User.findOne
            User.findOne.mockRejectedValue(new Error('Server error'));
    
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'user@example.com',
                    password: 'password123'
                });
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Server error' });
        });
    });

    describe('User Routes - GET / (Get all books for authenticated user)', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        it('should return 200 and all books for an authenticated user', async () => {
            const mockUser = {
                _id: 'mockUserId',
                books: [
                    { bookId: 'mockBookId1', title: 'Book 1' },
                    { bookId: 'mockBookId2', title: 'Book 2' }
                ],
                populate: jest.fn().mockReturnThis() // Mock `populate` method
            };
    
            const mockBooks = [
                { _id: 'mockBookId1', title: 'Book 1' },
                { _id: 'mockBookId2', title: 'Book 2' }
            ];
    
            // Mock auth middleware to simulate a logged-in user
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' }; // Set user ID in request
                next();
            });
    
            // Mock User.findById to return the mockUser
            User.findById = jest.fn().mockResolvedValue(mockUser); // Mock resolved value
            
            // Mock Book.find to return the books based on book IDs
            Book.find = jest.fn().mockResolvedValue(mockBooks);
    
            const response = await request(app)
                .get('/') // Ensure this matches your route
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockUser.books); // Expect the books array
        });
    
        it('should return 404 if user has no books in their collection', async () => {
            const mockUser = {
                _id: 'mockUserId',
                books: [],
                populate: jest.fn().mockReturnThis() // Mock `populate` method
            };
    
            // Mock auth middleware
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' };
                next();
            });
    
            // Mock User.findById to return a user with no books
            User.findById.mockResolvedValue(mockUser);
    
            const response = await request(app)
                .get('/')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'No books found in your collection' });
        });
    
        it('should return 500 if there is a server error', async () => {
            // Mock auth middleware to simulate a logged-in user
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: 'mockUserId' }; // Simulate logged-in user
                next();
            });
    
            // Mock User.findById to throw an error
            User.findById.mockRejectedValue(new Error('Server error'));
    
            const response = await request(app)
                .get('/')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Server error' });
        });
    });
    
});
