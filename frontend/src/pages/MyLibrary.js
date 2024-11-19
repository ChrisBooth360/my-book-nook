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
  const [filterCategory, setFilterCategory] = useState('wholeLibrary');  // Track filter category
  const [sortCategory, setSortCategory] = useState('default');  // Track sort category
  const [userLibraryBooks, setUserLibraryBooks] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Sort books logic
  const sortBooks = useCallback((category, booksToSort) => {
    const booksToUse = booksToSort || books;
    const sortedBooks = [...booksToUse].sort((a, b) => {
      const statusOrder = { 'currently reading': 1, 'unread': 2, 'read': 3, 'dnf': 4 };

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
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    setFilteredBooks(sortedBooks);  // Directly update filteredBooks after sorting
  }, [books]);

  const getSearchQueryFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  }, [location.search]);

  const fetchUserBooks = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await getUserBooks(token);
      if (response && response.data.books) {
        const libraryBooks = response.data.books.map((book) => ({
          ...book.bookId,
          status: book.status,
          existsInLibrary: true,
          rating: book.rating,
          review: book.review,
          progress: book.progress,
          locationId: book.locationId
        }));

        setBooks(libraryBooks);
        setFilteredBooks(libraryBooks); // Default view
        setUsername(response.data.username);
        setTbrCount(libraryBooks.filter((book) => book.status === 'unread').length);
        setCurrentlyReadingCount(libraryBooks.filter((book) => book.status === 'currently reading').length);
      }
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  }, []);  // Only need to run once, no need to add sortBooks as a dependency here

  const handleSearch = useCallback((query) => {
    setFilterCategory("wholeLibrary");  // Reset filter to Whole Library on search
    if (query) {
      navigate(`/my-library?search=${encodeURIComponent(query)}`, { replace: true });
      const filtered = books.filter((book) => {
        const titleMatch = book.title?.toLowerCase().includes(query.toLowerCase());
        const authorMatch = Array.isArray(book.authors)
          ? book.authors.some((author) => author.toLowerCase().includes(query.toLowerCase()))
          : book.author?.toLowerCase().includes(query.toLowerCase());
        const isbnMatch = book.isbn?.toLowerCase().includes(query.toLowerCase());
  
        return titleMatch || authorMatch || isbnMatch;
      });
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
      sortBooks("default", books);  // Ensure library is sorted when search is cleared
    }
  }, [books, navigate, sortBooks]);
  

  const handleClearSearch = () => {
    navigate('/my-library', { replace: true });
    setFilteredBooks(books);
    sortBooks("default", books);  // Reapply sorting when clearing search
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
      case 'dnfShelf':
        filtered = books.filter((book) => book.status === 'dnf');
        break;
      case 'wholeLibrary':
      default:
        filtered = books;
        break;
    }
    sortBooks(sortCategory, filtered); // Apply sorting after filtering
  }, [books, filterCategory, sortCategory, sortBooks]);

  useEffect(() => {
    fetchUserBooks();
  }, [fetchUserBooks]);

  useEffect(() => {
    filterBooks();  // Apply filter and sort after fetch
  }, [filterCategory, sortCategory, filterBooks]);  // Run whenever filter or sort changes

  // Define the handleFilterChange function
  const handleFilterChange = (category) => {
    setFilterCategory(category);  // Set the selected filter category
  };

  // Define the handleSortChange function
  const handleSortChange = (category) => {
    setSortCategory(category);  // Set the selected sort category
  };

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
              <FilterBar filterCategory={filterCategory} onFilter={handleFilterChange} />
            </div>
            <div className="library-sort-bar">
              <SortBar onSort={handleSortChange} />
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
