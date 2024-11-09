import React, { useEffect, useState } from 'react';
import placeholderProfile from '../assets/book-nook-sq-logo.png';
import '../App.css';
import { getCurrentlyReadingBooks } from '../services/api';

const Dashboard = ({ username, totalBooks, tbrCount, currentlyReadingCount }) => {
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentlyReadingBooks = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage or context if using Auth context
        const response = await getCurrentlyReadingBooks(token);
        setCurrentlyReadingBooks(response.data);
      } catch (err) {
        setError('Error fetching currently reading books');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentlyReadingBooks();
  }, []);

  return (
    <div className="dashboard">
      <div className="profile-picture">
        <img src={placeholderProfile} alt="Profile" />
      </div>
      <div className="dashboard-header">
        <h2>{username}'s Library</h2>
        <div className="dashboard-stats">
          <span className="total-books">{totalBooks}</span>
          <span className="books-label"> books on your shelf</span>
        </div>
        <div className="dashboard-info">
          <div>{tbrCount} on your TBR</div>
          <div>{currentlyReadingCount} books read</div>
        </div>
        <div className="currently-reading-section-small">
          <h3>Currently Reading</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : currentlyReadingBooks.length > 0 ? (
            <div className="currently-reading-books-small">
              {currentlyReadingBooks.map((book) => (
                <div className="currently-reading-card-small" key={book.bookId.googleBookId}>
                  <img src={book.bookId.thumbnail} alt={book.bookId.title} className="book-thumbnail-small" />
                  <div className="book-info-small">
                    <p className="book-title-small">{book.bookId.title}</p>
                    <p className="book-author-small">{book.bookId.authors?.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='no-currently-reading'>No books currently being read</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
