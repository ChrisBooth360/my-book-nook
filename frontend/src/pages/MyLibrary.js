// src/pages/MyLibrary.js
import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css';
import BookCard from '../components/BookCard';
import Dashboard from '../components/Dashboard';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
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

  if (loading) {
    return <div>Loading your library...</div>;
  }

  return (
    <div className="my-library-page">
      <div className="dashboard-container">
        <Dashboard 
          username={username}
          totalBooks={books.length}
          tbrCount={tbrCount}
          currentlyReadingCount={currentlyReadingCount}
        />
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
