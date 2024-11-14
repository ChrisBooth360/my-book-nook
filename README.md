# My Book Nook

## Project Goals and Scope

**My Book Nook** is a library catalog application that allows users to manage their book collections, track reading statuses, and leave reviews. Users can log in, search for books via the Google Books API, and customize their profiles, making it an engaging platform for book lovers.

## User Stories and Use Cases

- **User Registration**: Users can create an account by providing a username, email, and password.
- **User Login**: Users can log in to access their personal book collections.
- **Add Books**: Users can search for books using the Google Books API and add them to their collection.
- **Update Reading Status**: Users can update the status of books in their collection (e.g., read, currently reading, unread).
- **Delete Books**: Users can remove books from their collection.
- **Search Functionality**: Users can search their collection for books by title or author.
- **Profile Management**: Users can update their profile information and change their passwords.

## Technology Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Library**: Mongoose for MongoDB object modeling

## Database Schema Design

### User Model

- `username`: String
- `email`: String (unique)
- `password`: String (hashed)
- `books`: Array of objects containing:
  - `bookId`: Reference to the Book schema
  - `status`: String (read, unread, currently reading)
  - `addedDate`: Date

### Book Model

- `title`: String
- `author`: String
- `isbn`: String (unique)
- `description`: String
- `genre`: Array of Strings
- `numberOfPages`: Number
- `publicationDate`: Date

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v14 or later)
- **MongoDB** (local or cloud instance)
- **npm** (Node Package Manager)

### Installation

1. **Clone the Repository**:
   ```
   bash
   git clone https://github.com/yourusername/my-book-nook.git
   cd my-book-nook
   ```
2. **Install Backend Dependencies**: Navigate to the backend directory and install the necessary packages:
    ```
    cd backend
    npm install
    ```
3. **Environment Variables**: Create a `.env` file in the `backend` directory with the following content:
    ```
    PORT=5001
    JWT_SECRET=your_jwt_secret
    MONGODB_URI=your_mongodb_connection_string
    ```
4. **Run MongoDB**: Ensure your MongoDB instance is running. If you’re using a cloud instance (like MongoDB Atlas), ensure your connection string is correctly set in the `.env` file.
5. **Start the Backend Server**: Start the server using the following command:
```
npm run start
```

### Running Tests
1. **Install Testing Dependencies**: If you haven't already, navigate to the `backend` directory and install Jest, Supertest, and any other testing libraries you may need:
```
npm install --save-dev jest supertest
```
2. **Run Tests**: To run the tests, execute:
```
npm test
```

### API Endpoints
* POST `/api/users/register`: Register a new user.
* POST `/api/users/login`: Log in an existing user.
* GET `/api/users/`: Get all books for an authenticated user.
* PUT `/api/users/:bookId/status`: Update the reading status of a book.
* DELETE `/api/users/:bookId`: Remove a book from the user's collection.
* GET `/api/users/search`: Search for books in the user's collection.
* GET `/api/users/profile`: Get the authenticated user's profile.
* PUT `/api/users/profile`: Update user profile.
* PUT `/api/users/profile/password`: Change user password.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request to contribute to the project.

## License
This project is licensed under the MIT License.

My Book Nook/
├── backend/
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── config/
│        └── db.js
│   ├── controllers/
│        ├── bookController.js
│        └── userController.js
│   ├── middleware/
│        └── authMiddleware.js
│   ├── models/
│        ├── Book.js
│        └── User.js
│   ├── routes/
│        ├── bookRoutes.js
│        └── userRoutes.js
│   └── tests/
│        ├── bookRoutes.test.js
│        └── userRoutes.test.js
├── frontend/
├── .env
├── .gitignore
├── .package-lock.json
├── .package.json
└── README.md

frontend/
├── public/
│   ├── index.html
├── src/
│   ├── assets/
│        └── (a bunch of pngs)
│   ├── components/
│        ├── BookCard.js
│        ├── BookCardButtons.js
│        ├── Dashboard.js
│        ├── FilterBar.js
│        ├── Header.js
│        ├── SearchBar.js
│        └── SortBar.js
│   ├── pages/
│        ├── Explore.js
│        ├── HomePage.js
│        ├── MyLibrary.js
│        └── ProfilePage.js
│   ├── services/
│        └── api.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   └── index.js
├── .gitignore
├── .package-lock.json
├── .package.json
└── README.md
