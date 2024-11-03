// Explore.js
import React, { useEffect, useState, useRef } from 'react';
import { searchBooks, getUserBooks } from '../services/api';
import '../App.css';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState({});
  const dropdownRef = useRef({});

  useEffect(() => {
    const fetchUserLibrary = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getUserBooks(token);
        const libraryBooks = response.data.books.map((book) => ({
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
        const userBook = userLibraryBooks.find((b) => b.googleBookId === googleBookId);
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
    setDropdownVisible((prev) => {
      const newDropdownVisible = { ...prev, [bookId]: !prev[bookId] };
      Object.keys(newDropdownVisible).forEach((key) => {
        if (key !== bookId) newDropdownVisible[key] = false;
      });
      return newDropdownVisible;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownKeys = Object.keys(dropdownVisible);
      dropdownKeys.forEach((key) => {
        if (
          dropdownVisible[key] &&
          dropdownRef.current[key] &&
          !dropdownRef.current[key].contains(event.target)
        ) {
          setDropdownVisible((prev) => ({ ...prev, [key]: false }));
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
          <BookCard
            key={book.googleBookId}
            book={book}
            onAddToShelf={() => setStatusMessage({ [book.googleBookId]: 'Book added to shelf!' })}
            userLibraryBooks={userLibraryBooks}
            setUserLibraryBooks={setUserLibraryBooks}
            setBooks={setBooks}
            dropdownVisible={dropdownVisible}
            toggleDropdown={toggleDropdown}
            statusMessage={statusMessage}
            setStatusMessage={setStatusMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default Explore;
