import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css'; // Custom styles
import placeholderCover from '../assets/book-nook-placeholder.png';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);

  useEffect(() => {
    const fetchUserBooks = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getUserBooks(token);
        if (response && response.data.books) {
          setBooks(response.data.books);
          setUsername(response.data.username);

          const tbr = response.data.books.filter(book => book.status === 'unread').length;
          const currentlyReading = response.data.books.filter(book => book.status === 'currently reading').length;

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
        <div className="featured-book">
          <img src={placeholderCover} alt="The Lord of the Rings" />
          <div className="featured-info">
            <h3>The Lord of the Rings</h3>
            <p>by J.R.R. Tolkien</p>
            <button className="btn">DNF</button>
            <button className="btn">Finished</button>
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
          books.map((userBook) => (
            <div key={userBook.bookId?._id} className="book-item">
              <img src={placeholderCover} alt="Book cover" />
              <div className="book-details">
                <h3>{userBook.bookId?.title || 'No title available'}</h3>
                <p>by {userBook.bookId?.author || 'No author available'}</p>
              </div>
              <div className="book-actions">
                <button className="btn">Read</button>
                <button className="btn">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
