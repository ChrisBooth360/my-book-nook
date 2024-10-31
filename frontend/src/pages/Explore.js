// src/pages/Explore.js
import React, { useEffect, useState } from 'react';
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
    setDropdownVisible(prev => ({ ...prev, [bookId]: !prev[bookId] }));
  };

  const handleStatusChange = async (book, status) => {
    const token = localStorage.getItem('token');
    const userBook = userLibraryBooks.find(b => b.googleBookId === book.googleBookId);
    
    if (userBook && userBook.status === status) return;

    try {
      const response = await addBookToShelf(token, book.googleBookId, status);
      setUserLibraryBooks(prev => [
        ...prev.filter(b => b.googleBookId !== book.googleBookId),
        { googleBookId: book.googleBookId, status }
      ]);
      setBooks(prevBooks => prevBooks.map(b => 
        b.googleBookId === book.googleBookId ? { ...b, status, existsInLibrary: true } : b
      ));
      setStatusMessage(prev => ({ ...prev, [book.googleBookId]: response.message }));
    } catch (error) {
      console.error('Error updating book status:', error.message);
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
              <span className="book-status">{book.status || 'Not in library'}</span>
            </div>

            <button
              className="btn add-to-shelf-btn"
              onClick={() => handleStatusChange(book, 'unread')}
              disabled={book.existsInLibrary && book.status === 'unread'}
              style={{
                backgroundColor: book.existsInLibrary ? '#DBC0A4' : '#FA9939',
                cursor: book.existsInLibrary && book.status === 'unread' ? 'not-allowed' : 'pointer'
              }}
            >
              {book.existsInLibrary ? 'Added' : 'Add to Shelf'}
            </button>
            
            <button className="btn dropdown-btn" onClick={() => toggleDropdown(book.googleBookId)}>↓</button>
            {dropdownVisible[book.googleBookId] && (
              <div className="dropdown">
                <button onClick={() => handleStatusChange(book, 'unread')} disabled={book.status === 'unread'}>TBR</button>
                <button onClick={() => handleStatusChange(book, 'read')} disabled={book.status === 'read'}>Read</button>
                <button onClick={() => handleStatusChange(book, 'currently reading')} disabled={book.status === 'currently reading'}>Reading</button>
              </div>
            )}
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
