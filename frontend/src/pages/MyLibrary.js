// src/pages/MyLibrary.js
import React, { useEffect, useState, useCallback } from 'react';
import { getUserBooks } from '../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import BookCard from '../components/BookCard';
import Dashboard from '../components/Dashboard';
import SearchBar from '../components/SearchBar';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]); // For storing search results
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to get query from URL
  const getSearchQueryFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  }, [location.search]);

  const handleSearch = useCallback((query) => {
    if (query) {
      // Update URL with the search query
      navigate(`/my-library?search=${encodeURIComponent(query)}`);
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
    // Clear URL query and reset books list
    navigate('/my-library');
    setFilteredBooks(books);
  };

  // Fetch books on component mount
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
            const statusComparison = statusOrder[a.status] - statusOrder[b.status];
            if (statusComparison === 0) {
              return (a.author || '').localeCompare(b.author || '');
            }
            return statusComparison;
          });

          setBooks(sortedBooks);
          setUserLibraryBooks(sortedBooks);
          setUsername(response.data.username);

          const tbr = libraryBooks.filter((book) => book.status === 'unread').length;
          const currentlyReading = libraryBooks.filter(
            (book) => book.status === 'currently reading'
          ).length;

          setTbrCount(tbr);
          setCurrentlyReadingCount(currentlyReading);

          // If there's a search query in the URL, filter the books accordingly
          const initialQuery = getSearchQueryFromURL();
          if (initialQuery) {
            handleSearch(initialQuery);
          } else {
            setFilteredBooks(sortedBooks); // Show full library if no search query
          }
        }
      } catch (error) {
        console.error('Error fetching user books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, [location.search, getSearchQueryFromURL, handleSearch]); // Re-run when URL search changes or dependencies change

  if (loading) {
    return <div>Loading your library...</div>;
  }

  return (
    <div className="main-container">  {/* Add main-container class */}
      <div className="top-section">
        <div className="dashboard-container">
          <Dashboard 
            username={username}
            totalBooks={books.length}
            tbrCount={tbrCount}
            currentlyReadingCount={currentlyReadingCount}
          />
        </div>

        <div className="right-section">  {/* Add right-section class */}
          {/* Search Bar container */}
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} placeholder="Search your library" />
            
            {/* Display 'Back to My Library' button if a search query is active */}
            {getSearchQueryFromURL() && (
              <button onClick={handleClearSearch} className="btn back-to-library-button">
                Back
              </button>
            )}
          </div>

          {/* Book List */}
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
      </div>
    </div>
  );
};

export default MyLibrary;
