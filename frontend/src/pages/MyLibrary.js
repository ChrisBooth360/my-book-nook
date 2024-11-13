// src/pages/MyLibrary.js
import React, { useEffect, useState, useCallback } from 'react';
import { getUserBooks } from '../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import BookCard from '../components/BookCard';
import Dashboard from '../components/Dashboard';
import SearchBar from '../components/SearchBar';
import SortBar from '../components/SortBar';
import FilterBar from '../components/FilterBar';

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [tbrCount, setTbrCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState({});
  const [filterCategory, setFilterCategory] = useState('wholeLibrary');
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const getSearchQueryFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
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

  const filterBooks = useCallback(() => {
    let filtered;
    switch (filterCategory) {
      case 'tbrShelf':
        filtered = books.filter((book) => book.status === 'unread');
        break;
      case 'readShelf':
        filtered = books.filter((book) => book.status === 'read');
        break;
      case 'wholeLibrary':
      default:
        filtered = books;
        break;
    }
    setFilteredBooks(filtered);
  }, [books, filterCategory]);

  useEffect(() => {
    filterBooks();
  }, [filterBooks, books]);

  const handleFilterChange = (category) => {
    setFilterCategory(category);
    sortBooks("default");  // Automatically sort by default when filter changes
  };

  const sortBooks = useCallback((category) => {
    console.log(books); // Check if books are being populated properly
  
    const sortedBooks = [...books].sort((a, b) => {
      const statusOrder = { 'currently reading': 1, 'unread': 2, 'read': 3 };
  
      if (a.status === 'currently reading' && b.status !== 'currently reading') return -1;
      if (a.status !== 'currently reading' && b.status === 'currently reading') return 1;
  
      switch (category) {
        case 'default':
          return (
            statusOrder[a.status] - statusOrder[b.status] ||
            new Date(b.addedDate) - new Date(a.addedDate)
          );
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'author': {
          const authorA = Array.isArray(a.authors) ? a.authors[0] : a.authors;
          const authorB = Array.isArray(b.authors) ? b.authors[0] : b.authors;
          const lastNameA = authorA?.split(' ').pop() || '';
          const lastNameB = authorB?.split(' ').pop() || '';
          return lastNameA.localeCompare(lastNameB);
        }
        case 'statusAuthor':
          return (
            statusOrder[a.status] - statusOrder[b.status] ||
            (Array.isArray(a.authors) ? a.authors[0] : a.authors)
              .split(' ')
              .pop()
              .localeCompare(
                (Array.isArray(b.authors) ? b.authors[0] : b.authors)
                  .split(' ')
                  .pop()
              )
          );
        case 'statusTitle':
          return (
            statusOrder[a.status] - statusOrder[b.status] ||
            (a.title || '').localeCompare(b.title || '')
          );
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });
  
    setBooks(sortedBooks);
    setFilteredBooks(sortedBooks);
  }, [books]);  // books is a dependency to ensure sorting updates when books change  
  
  const fetchUserBooks = useCallback(async () => {
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
        setFilteredBooks(libraryBooks); // Default view
  
        console.log(libraryBooks);
  
        setUsername(response.data.username);
        setTbrCount(libraryBooks.filter((book) => book.status === 'unread').length);
        setCurrentlyReadingCount(libraryBooks.filter((book) => book.status === 'currently reading').length);
  
        // Now call sortBooks after setting the books state
        sortBooks("default");  // This will use the updated books state
      }
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBooks]); // Keep sortBooks as a dependency

  useEffect(() => {
    fetchUserBooks();
  }, [fetchUserBooks]);

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
          
          <div className='filter-and-sort-container'>
            <div className="library-filter-bar">
              <FilterBar onFilter={handleFilterChange} />
            </div>
            <div className="library-sort-bar">
              <SortBar onSort={sortBooks} />
            </div>
          </div>

          <div className="book-list">
            
            {filteredBooks.length === 0 ? (
              <div className="empty-shelf">
                <p>You have no books in your library. Find some!</p>
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
                  onAddToShelf={() => setStatusMessage({ [book.googleBookId]: 'Book already in your library!' })}
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
