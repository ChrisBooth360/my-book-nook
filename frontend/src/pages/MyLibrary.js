import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css'; // Custom styles
import BookCard from '../components/BookCard'; // Import the BookCard component

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true)
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);;
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
          books.map((userBook) => (
            <BookCard
              key={userBook.bookId.googleBookId}
              book={{
                ...userBook.bookId,
                status: userBook.status,
                existsInLibrary: true,
              }}
              onAddToShelf={() => setStatusMessage({ [userBook.googleBookId]: 'Book added to shelf!' })}
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
