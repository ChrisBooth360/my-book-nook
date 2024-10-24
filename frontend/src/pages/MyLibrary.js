import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css'; // Custom styles

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [tbrCount, setTbrCount] = useState(0); // Placeholder for TBR count
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0); // Placeholder for currently reading

  useEffect(() => {
    const fetchUserBooks = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      try {
        const response = await getUserBooks(token); // Make API call to fetch books
        if (response && response.data.books) {
          setBooks(response.data.books); 
          setUsername(response.data.username); 
          
          // Placeholder logic for TBR and currently reading counts
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
        <h2>{username}'s Library</h2>
        <p>You have {books.length || 0} book(s) on your bookshelf.</p>
        <p>{tbrCount} book(s) are on your TBR.</p>
        <p>{currentlyReadingCount} book(s) are currently being read.</p>
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
              <img src="https://via.placeholder.com/80x120" alt="Book cover" />
              <div>
                <h3>{userBook.bookId?.title || 'No title available'}</h3>
                <p>by {userBook.bookId?.author || 'No author available'}</p>
                <p>{userBook.bookId?.description || 'No description available'}</p>
              </div>
              <button>Read</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
