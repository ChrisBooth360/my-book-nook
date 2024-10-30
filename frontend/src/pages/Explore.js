import React, { useEffect, useState } from 'react';
import { searchBooks, addBookToShelf, getUserBooks } from '../services/api';
import '../App.css'; 
import placeholderCover from '../assets/book-nook-placeholder.png';
import SearchBar from '../components/SearchBar';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]); // User library state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({}); // Status message state

  // Fetch user library on component mount
  useEffect(() => {
    // Updated fetchUserLibrary with population
    const fetchUserLibrary = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getUserBooks(token); // Fetches books in user's library
        const libraryBooks = response.data.books.map(book => book.bookId.googleBookId); // Populating googleBookId
        setUserLibraryBooks(libraryBooks);
        console.log("User Library Books (with googleBookId):", libraryBooks);
      } catch (error) {
        console.error("Error fetching user library:", error);
      }
    };
    fetchUserLibrary();
  }, []);

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setBooks([]);
    setStatusMessage({});
    const token = localStorage.getItem('token');

    try {
      const response = await searchBooks(token, query);
      console.log("Search Results:", response.map((book) => book.id));

      const booksWithStatus = response.map((book) => {
        const isbn = book.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
        const googleBookId = book.id;

        // Check if book is already in user's library
        const existsInLibrary = userLibraryBooks.includes(googleBookId);
        console.log("Exists in Library Check:", existsInLibrary, googleBookId);

        return {
          ...book,
          googleBookId,
          existsInLibrary,
          status: existsInLibrary ? 'Already added' : null,
          isbn: isbn,
        };
      });

      setBooks(booksWithStatus);
    } catch (err) {
      setError('Error fetching books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShelf = async (book) => {
    const token = localStorage.getItem('token');

    if (book.existsInLibrary) {
      setStatusMessage(prev => ({ ...prev, [book.googleBookId]: 'Book already in your library' }));
      return;
    }

    try {
      const response = await addBookToShelf(token, book.googleBookId, 'unread');
      setBooks(prevBooks => prevBooks.map(b => 
        b.googleBookId === book.googleBookId ? { ...b, existsInLibrary: true, status: 'unread' } : b
      ));
      setStatusMessage(prev => ({ ...prev, [book.googleBookId]: response.message }));
    } catch (error) {
      console.error('Error adding book:', error.message);
    }
  };

  return (
    <div className="explore-page">
      <h1>Explore Books</h1>
      <div className="search-container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="book-list">
        {books.map((book) => (
          <div key={book.googleBookId} className="book-card">
            <img src={book.thumbnail || placeholderCover} alt="Book cover" />
            <div className="book-details">
              <h3>{book.volumeInfo.title}</h3>
              <p>by {book.volumeInfo.authors?.join(', ')}</p>
              {book.existsInLibrary && <span className="book-status">Already added</span>}
            </div>
            
            {/* Button and Status Message */}
            <button
              className="btn add-to-shelf-btn"
              onClick={() => handleAddToShelf(book)}
              disabled={book.existsInLibrary}
              style={{
                  backgroundColor: book.existsInLibrary ? '#DBC0A4' : '#FA9939',
                  cursor: book.existsInLibrary ? 'not-allowed' : 'pointer'
              }}
            >
              {book.existsInLibrary ? 'Added' : 'Add to Shelf'}
            </button>
            {statusMessage[book.googleBookId] && (
              <p className="status-message">{statusMessage[book.googleBookId]}</p>
            )}
            {console.log("Rendering Button:", book.googleBookId, book.existsInLibrary)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
