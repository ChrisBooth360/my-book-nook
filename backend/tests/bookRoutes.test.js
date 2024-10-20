const request = require('supertest');
const express = require('express');
const router = require('../routes/bookRoutes');
const axios = require('axios');
const Book = require('../models/Book');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Mock axios, User, Book, and authMiddleware
jest.mock('axios');
jest.mock('../models/User');
jest.mock('../models/Book');
jest.mock('../middleware/authMiddleware');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use(router);  // Mount the router

describe('Book Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('GET /', () => {
        it('should return all books from the library', async () => {
            // Mock Book.find to return an array of books
            const mockBooks = [
                { title: 'Book 1', author: 'Author 1', isbn: '1234567890' },
                { title: 'Book 2', author: 'Author 2', isbn: '0987654321' }
            ];
            Book.find.mockResolvedValue(mockBooks);

            const response = await request(app).get('/');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockBooks); // Ensure the response contains the mock books
            expect(Book.find).toHaveBeenCalled(); // Ensure Book.find was called
        });

        it('should return a 404 if no books are found', async () => {
            // Mock Book.find to return an empty array
            Book.find.mockResolvedValue([]);

            const response = await request(app).get('/');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'No books found in the library' });
        });

        it('should return a 500 if there is a server error', async () => {
            // Mock Book.find to throw an error
            Book.find.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching books' });
        });
    });
    describe('GET /search', () => {
      it('should return books from Google Books API when query is valid', async () => {
          // Mock the auth middleware to simulate logged-in user
          authMiddleware.mockImplementation((req, res, next) => {
              req.user = { id: 'mockUserId' }; // Simulate logged-in user
              next();
          });

          // Mock axios to return a successful response from Google Books API
          const mockBooks = [
              { id: '1', volumeInfo: { title: 'Book 1', authors: ['Author 1'] } },
              { id: '2', volumeInfo: { title: 'Book 2', authors: ['Author 2'] } },
          ];
          axios.get.mockResolvedValue({ data: { items: mockBooks } });

          const response = await request(app)
              .get('/search')
              .set('Authorization', 'Bearer mock-token')
              .query({ query: 'javascript' }); // Simulate search query

          expect(response.statusCode).toBe(200);
          expect(response.body).toEqual(mockBooks); // Ensure the response contains the mock books
          expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/books/v1/volumes', {
              params: {
                  q: 'javascript',
                  key: process.env.GOOGLE_BOOKS_API_KEY,
                  maxResults: 10
              }
          }); // Ensure axios.get was called with the correct parameters
      });

      it('should return 400 if query parameter is missing', async () => {
          authMiddleware.mockImplementation((req, res, next) => {
              req.user = { id: 'mockUserId' };
              next();
          });

          const response = await request(app)
              .get('/search')
              .set('Authorization', 'Bearer mock-token');

          expect(response.statusCode).toBe(400);
          expect(response.body).toEqual({ message: 'Please provide a search query' });
      });

      it('should return 500 if an error occurs while searching Google Books', async () => {
          authMiddleware.mockImplementation((req, res, next) => {
              req.user = { id: 'mockUserId' };
              next();
          });

          // Mock axios to throw an error
          axios.get.mockRejectedValue(new Error('API error'));

          const response = await request(app)
              .get('/search')
              .set('Authorization', 'Bearer mock-token')
              .query({ query: 'javascript' });

          expect(response.statusCode).toBe(500);
          expect(response.body).toEqual({ message: 'Error searching for books' });
      });
  });

  describe('POST /search/add', () => {

    it('should add a new book to the user\'s collection successfully', async () => {
      // Mock the auth middleware to simulate logged-in user
      authMiddleware.mockImplementation((req, res, next) => {
          req.user = { id: 'mockUserId' }; // Simulate logged-in user
          next();
      });
  
      // Mock axios response for Google Books API
      const mockBookData = {
          volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              industryIdentifiers: [{ type: 'ISBN_13', identifier: '1234567890123' }],
              description: 'A test book',
              categories: ['Fiction'],
              pageCount: 350,
              publishedDate: '2023-01-01'
          }
      };
      axios.get.mockResolvedValue({ data: mockBookData });
  
      // Mock the database queries
      Book.findOne.mockResolvedValue(null); // No book exists with the given ISBN
  
      // Ensure the book save method returns the full mocked book
      const mockBook = {
          _id: 'mockBookId',
          title: 'Test Book',
          author: 'Test Author',
          isbn: '1234567890123',
          description: 'A test book',
          genre: ['Fiction'],
          numberOfPages: 350,
          publicationDate: '2023-01-01'
      };
      Book.prototype.save.mockResolvedValue(mockBook);
  
      const mockUser = {
          _id: 'mockUserId',
          books: [],
          save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);
  
      const response = await request(app)
          .post('/search/add')
          .set('Authorization', 'Bearer mock-token')
          .send({ googleBookId: 'testGoogleBookId' });
  
      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Book added successfully' });
  
      // Ensure axios call was made
      expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/books/v1/volumes/testGoogleBookId', {
          params: { key: process.env.GOOGLE_BOOKS_API_KEY }
      });
  
      // Ensure the user save function was called
      expect(mockUser.save).toHaveBeenCalled();
  });
  
  

    it('should return 400 if Google Book ID is missing', async () => {
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        const response = await request(app)
            .post('/search/add')
            .set('Authorization', 'Bearer mock-token')
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'Google Book ID is required' });
    });

    it('should return 400 if no valid ISBN is found in the book data', async () => {
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock axios to return a book without industryIdentifiers
        const mockBookDataWithoutISBN = {
            volumeInfo: {
                title: 'Test Book',
                authors: ['Test Author'],
                industryIdentifiers: [], // No ISBN provided
                description: 'A test book',
                categories: ['Fiction'],
                pageCount: 350,
                publishedDate: '2023-01-01'
            }
        };
        axios.get.mockResolvedValue({ data: mockBookDataWithoutISBN });

        const response = await request(app)
            .post('/search/add')
            .set('Authorization', 'Bearer mock-token')
            .send({ googleBookId: 'testGoogleBookId' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'No valid ISBN found for this book' });
    });

    it('should return 500 if an error occurs while fetching the book from Google', async () => {
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock axios to throw an error
        axios.get.mockRejectedValue(new Error('API error'));

        const response = await request(app)
            .post('/search/add')
            .set('Authorization', 'Bearer mock-token')
            .send({ googleBookId: 'testGoogleBookId' });

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: 'Error adding book from Google' });
    });

    it('should return 400 if the book already exists in the user\'s collection', async () => {
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock axios response for Google Books API
        const mockBookData = {
            volumeInfo: {
                title: 'Test Book',
                authors: ['Test Author'],
                industryIdentifiers: [{ type: 'ISBN_13', identifier: '1234567890123' }],
                description: 'A test book',
                categories: ['Fiction'],
                pageCount: 350,
                publishedDate: '2023-01-01'
            }
        };
        axios.get.mockResolvedValue({ data: mockBookData });

        // Mock the database queries
        Book.findOne.mockResolvedValue({
            _id: 'mockBookId',
            title: 'Test Book',
            isbn: '1234567890123'
        }); // Book already exists in the database
        User.findById.mockResolvedValue({
            _id: 'mockUserId',
            books: [{ bookId: 'mockBookId' }], // Book already in user's collection
            save: jest.fn().mockResolvedValue(true)
        });

        const response = await request(app)
            .post('/search/add')
            .set('Authorization', 'Bearer mock-token')
            .send({ googleBookId: 'testGoogleBookId' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'Book already exists in your collection' });
    });
  });

  describe('DELETE /:bookId', () => {
    it('should delete the book from the library successfully', async () => {
        // Mock the auth middleware to simulate logged-in user
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock Book.findById to return a book
        const mockBook = {
            _id: 'mockBookId',
            title: 'Test Book',
            author: 'Test Author',
            isbn: '1234567890123',
            description: 'A test book',
            genre: ['Fiction'],
            numberOfPages: 350,
            publicationDate: '2023-01-01'
        };
        Book.findById.mockResolvedValue(mockBook);

        // Mock Book.findByIdAndDelete to simulate book deletion
        Book.findByIdAndDelete.mockResolvedValue(true);

        const response = await request(app)
            .delete('/mockBookId')
            .set('Authorization', 'Bearer mock-token'); // Simulate logged-in user

        // Assertions
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Book removed from the library successfully' });
        expect(Book.findById).toHaveBeenCalledWith('mockBookId');
        expect(Book.findByIdAndDelete).toHaveBeenCalledWith('mockBookId');
    });

    it('should return 404 if the book is not found', async () => {
        // Mock the auth middleware to simulate logged-in user
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock Book.findById to return null (book not found)
        Book.findById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/nonexistentBookId')
            .set('Authorization', 'Bearer mock-token'); // Simulate logged-in user

        // Assertions
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Book not found' });
        expect(Book.findById).toHaveBeenCalledWith('nonexistentBookId');
    });

    it('should return 500 if an error occurs during deletion', async () => {
        // Mock the auth middleware to simulate logged-in user
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId' };
            next();
        });

        // Mock Book.findById to return a book
        Book.findById.mockResolvedValue({
            _id: 'mockBookId',
            title: 'Test Book',
            author: 'Test Author'
        });

        // Mock Book.findByIdAndDelete to throw an error
        Book.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/mockBookId')
            .set('Authorization', 'Bearer mock-token'); // Simulate logged-in user

        // Assertions
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: 'Error deleting book from the library' });
    });
  });

});
