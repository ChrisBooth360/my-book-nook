import React, { useEffect, useState, useRef } from 'react';
import { searchBooks, addBookToShelf, getUserBooks } from '../services/api';
import '../App.css';
import placeholderCover from '../assets/book-nook-placeholder.png';
import SearchBar from '../components/SearchBar';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState({});
  const dropdownRef = useRef({}); // Create a ref to hold dropdown references

  useEffect(() => {
    const fetchUserLibrary = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getUserBooks(token);
        const libraryBooks = response.data.books.map(book => ({
          googleBookId: book.bookId.googleBookId,
          status: book.status,
        }));
        setUserLibraryBooks(libraryBooks);
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
      const booksWithStatus = response.map((book) => {
        const googleBookId = book.id;
        const userBook = userLibraryBooks.find(b => b.googleBookId === googleBookId);
        return {
          ...book,
          googleBookId,
          existsInLibrary: !!userBook,
          status: userBook?.status || null,
        };
      });
      setBooks(booksWithStatus);
    } catch (err) {
      setError('Error fetching books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (bookId) => {
    setDropdownVisible(prev => {
      const newDropdownVisible = { ...prev, [bookId]: !prev[bookId] };
      // Close other dropdowns if any are open
      Object.keys(newDropdownVisible).forEach(key => {
        if (key !== bookId) newDropdownVisible[key] = false;
      });
      return newDropdownVisible;
    });
  };

  const handleStatusChange = async (book, status) => {
    const token = localStorage.getItem('token');

    try {
      const response = await addBookToShelf(token, book.googleBookId, status);

      setUserLibraryBooks(prev => [
        ...prev.filter(b => b.googleBookId !== book.googleBookId),
        { googleBookId: book.googleBookId, status }
      ]);

      setBooks(prevBooks =>
        prevBooks.map(b =>
          b.googleBookId === book.googleBookId ? { ...b, status, existsInLibrary: true } : b
        )
      );
      setStatusMessage(prev => ({ ...prev, [book.googleBookId]: response.message }));
    } catch (error) {
      console.error('Error updating book status:', error.message);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownKeys = Object.keys(dropdownVisible);
      dropdownKeys.forEach(key => {
        if (
          dropdownVisible[key] && 
          dropdownRef.current[key] && 
          !dropdownRef.current[key].contains(event.target)
        ) {
          setDropdownVisible(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <div className="explore-page">
      <h2>Find your next read...</h2>
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
              <span className="book-status">
                {book.status === 'unread' && 'This book is currently on your TBR'}
                {book.status === 'read' && 'You have read this book'}
                {book.status === 'currently reading' && 'You are reading this book'}
              </span>
              <h3>{book.volumeInfo.title}</h3>
              <p>by {book.volumeInfo.authors?.join(', ')}</p>
            </div>

            <div className="button-group">
              <button
                className="btn add-to-shelf-btn"
                onClick={() => handleStatusChange(book, 'unread')}
                disabled={book.existsInLibrary}
                style={{
                  backgroundColor: book.existsInLibrary ? '#DBC0A4' : '#FA9939',
                  cursor: book.existsInLibrary ? 'not-allowed' : 'pointer',
                }}
              >
                {book.existsInLibrary ? 'On Shelf' : 'Add to Shelf'}
              </button>

              <button
                className="btn dropdown-btn"
                onClick={() => toggleDropdown(book.googleBookId)}
              >
                ▼
              </button>

              {dropdownVisible[book.googleBookId] && (
                <div ref={el => dropdownRef.current[book.googleBookId] = el} className="dropdown">
                  <button
                    onClick={() => handleStatusChange(book, 'unread')}
                    disabled={book.status === 'unread'}
                    style={{
                      backgroundColor: book.status === 'unread' ? '#DBC0A4' : '#FA9939',
                      cursor: book.status === 'unread' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    TBR
                  </button>
                  <button
                    onClick={() => handleStatusChange(book, 'read')}
                    disabled={book.status === 'read'}
                    style={{
                      backgroundColor: book.status === 'read' ? '#DBC0A4' : '#FA9939',
                      cursor: book.status === 'read' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => handleStatusChange(book, 'currently reading')}
                    disabled={book.status === 'currently reading'}
                    style={{
                      backgroundColor: book.status === 'currently reading' ? '#DBC0A4' : '#FA9939',
                      cursor: book.status === 'currently reading' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Reading
                  </button>
                </div>
              )}
            </div>

            {statusMessage[book.googleBookId] && (
              <p className="status-message">{statusMessage[book.googleBookId]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
