import React, { useEffect, useState, useCallback } from 'react';
import { getUserBooks } from '../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import BookCard from '../components/BookCard';
import Dashboard from '../components/Dashboard';
import SearchBar from '../components/SearchBar';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  const getSearchQueryFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    return query;
  }, [location.search]);

  const handleSearch = useCallback((query) => {
    if (query) {
      navigate(`/my-library?search=${encodeURIComponent(query)}`, { replace: true });
      const filtered = books.filter(
        (book) =>
          book.title?.toLowerCase().includes(query.toLowerCase()) ||
          book.author?.toLowerCase().includes(query.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [books, navigate]);

  const handleClearSearch = () => {
    navigate('/my-library', { replace: true });
    setFilteredBooks(books);
  };

  // Initial data fetch
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

        const sortedBooks = libraryBooks.sort((a, b) => {
          const statusOrder = { 'currently reading': 1, 'unread': 2, 'read': 3 };
          return statusOrder[a.status] - statusOrder[b.status] || (a.author || '').localeCompare(b.author || '');
        });

        setBooks(sortedBooks);
        setFilteredBooks(sortedBooks);
        setUsername(response.data.username);
        setTbrCount(libraryBooks.filter((book) => book.status === 'unread').length);
        setCurrentlyReadingCount(libraryBooks.filter((book) => book.status === 'currently reading').length);
      }
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchUserBooks();
}, []); // Runs only once on mount

// Update filteredBooks based on URL query change
useEffect(() => {
  const query = new URLSearchParams(location.search).get('search') || '';

  const handleSearch = (searchQuery) => {
    if (searchQuery) {
      navigate(`/my-library?search=${encodeURIComponent(searchQuery)}`, { replace: true });
      const filtered = books.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  };

  handleSearch(query);
}, [location.search, books, navigate]); // Only depends on search query and books


  if (loading) return <div>Loading your library...</div>;

  return (
    <div className="main-container">
      <div className="top-section">
        <div className="dashboard-container">
          <Dashboard 
            username={username}
            totalBooks={books.length}
            tbrCount={tbrCount}
            currentlyReadingCount={currentlyReadingCount}
          />
        </div>

        <div className="right-section">
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} placeholder="Search your library" />
            {getSearchQueryFromURL() && (
              <button onClick={handleClearSearch} className="btn back-to-library-button">
                Back
              </button>
            )}
          </div>

          <div className="book-list">
            {filteredBooks.length === 0 ? (
              <div className="empty-shelf">
                <p>No books found matching your search. Try a different query!</p>
                <Link to="/explore">
                  <button className="btn explore-btn">Explore</button>
                </Link>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <BookCard
                  key={book.googleBookId}
                  book={book}
                  status={book.status}
                  onAddToShelf={() =>
                    setStatusMessage({ [book.googleBookId]: 'Book already in your library!' })
                  }
                  userLibraryBooks={books}
                  setBooks={setBooks}
                  statusMessage={statusMessage}
                  setStatusMessage={setStatusMessage}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLibrary;
