// src/pages/Explore.js
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { searchBooks, getUserBooks, addBookToShelf } from '../services/api';
import '../App.css';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('search') || '';

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

  const handleSearch = useCallback(
    async (query) => {
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
    },
    [userLibraryBooks]
  );

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query, handleSearch]);

  const onAddToShelf = async (book) => {
    const token = localStorage.getItem('token');
    try {
      await addBookToShelf(token, book.googleBookId, 'unread');
      setUserLibraryBooks((prev) => [
        ...prev,
        { googleBookId: book.googleBookId, status: 'unread' },
      ]);

      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === book.googleBookId
            ? { ...b, existsInLibrary: true, status: 'unread' }
            : b
        )
      );

      setStatusMessage((prev) => ({
        ...prev,
        [book.googleBookId]: 'Book added to shelf!',
      }));
    } catch (error) {
      console.error('Error adding book to shelf:', error.message);
    }
  };

  return (
    <div className="explore-page">
      <h2>Find your next read...</h2>
      <div className="search-container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className='explore-book-list'>
        <div className="book-list">
          {books.map((book) => (
            <BookCard
              key={book.googleBookId}
              book={book}
              onAddToShelf={() => onAddToShelf(book)}
              userLibraryBooks={userLibraryBooks}
              setUserLibraryBooks={setUserLibraryBooks}
              setBooks={setBooks}
              statusMessage={statusMessage}
              setStatusMessage={setStatusMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
