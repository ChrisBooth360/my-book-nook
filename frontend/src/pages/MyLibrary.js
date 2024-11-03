// src/pages/MyLibrary.js
import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css';
import BookCard from '../components/BookCard';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [statusMessage, setStatusMessage] = useState({});

  useEffect(() => {
    const fetchUserBooks = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getUserBooks(token);
        if (response && response.data.books) {
          const libraryBooks = response.data.books.map((book) => ({
            ...book.bookId,
            status: book.status,
            existsInLibrary: true,
          }));

          setBooks(libraryBooks);
          setUserLibraryBooks(libraryBooks);
          setUsername(response.data.username);

          const tbr = libraryBooks.filter((book) => book.status === 'unread').length;
          const currentlyReading = libraryBooks.filter(
            (book) => book.status === 'currently reading'
          ).length;

          setTbrCount(tbr);
          setCurrentlyReadingCount(currentlyReading);
        }
      } catch (error) {
        console.error('Error fetching user books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  const toggleDropdown = (bookId) => {
    setDropdownVisible((prev) => {
      const newDropdownVisible = { ...prev, [bookId]: !prev[bookId] };
      Object.keys(newDropdownVisible).forEach((key) => {
        if (key !== bookId) newDropdownVisible[key] = false;
      });
      return newDropdownVisible;
    });
  };

  if (loading) {
    return <div>Loading your library...</div>;
  }

  return (
    <div className="my-library-page">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>{username}'s Library</h2>
          <div className="dashboard-stats">
            <span className="total-books">{books.length}</span>
            <span className="books-label">books on your shelf</span>
          </div>
          <div className="dashboard-info">
            <div>{tbrCount} on your TBR</div>
            <div>{currentlyReadingCount} books read</div>
          </div>
        </div>
      </div>

      <div className="book-list">
        {books.length === 0 ? (
          <div className="empty-shelf">
            <p>Looks like your shelf is bare. Find some books to add!</p>
            <Link to="/explore">
              <button className="btn explore-btn">Explore</button>
            </Link>
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.googleBookId}
              book={book}
              onAddToShelf={() =>
                setStatusMessage({ [book.googleBookId]: 'Book already in your library!' })
              }
              userLibraryBooks={userLibraryBooks}
              setUserLibraryBooks={setUserLibraryBooks}
              setBooks={setBooks}
              dropdownVisible={dropdownVisible}
              toggleDropdown={toggleDropdown}
              statusMessage={statusMessage}
              setStatusMessage={setStatusMessage}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
