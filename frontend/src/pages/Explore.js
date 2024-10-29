// src/pages/Explore.js
import React, { useState } from 'react';
import { searchBooks, addBookToShelf, checkBookStatus } from '../services/api';
import '../App.css'; 
import placeholderCover from '../assets/book-nook-placeholder.png';
import SearchBar from '../components/SearchBar';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({}); // Status message state

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setBooks([]);
    setStatusMessage({});
    const token = localStorage.getItem('token');

    try {
      const response = await searchBooks(token, query);

      const booksWithStatus = await Promise.all(response.map(async (book) => {
        const isbn = book.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
        const googleBookId = book.id; // Capture Google Book ID for adding to shelf

        const statusResponse = isbn ? await checkBookStatus(token, isbn) : { exists: false };
        
        return {
          ...book,
          googleBookId,
          existsInLibrary: statusResponse.exists,
          status: statusResponse.status || null,
          isbn: isbn,
        };
      }));

      setBooks(booksWithStatus);
    } catch (err) {
      setError('Error fetching books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShelf = async (book) => {
    const token = localStorage.getItem('token');
    
    // Check if the book is already in the library
    try {
        const statusResponse = await checkBookStatus(token, book.isbn);
        if (statusResponse.data.exists) {
            setStatusMessage(prev => ({
                ...prev,
                [book.googleBookId]: 'The book is already in your collection'
            }));
            return;
        }
    } catch (error) {
        console.error('Error checking book status:', error.message);
        setStatusMessage(prev => ({
            ...prev,
            [book.googleBookId]: 'Error checking book status. Please try again.'
        }));
        return;
    }
  
    try {
        await addBookToShelf(token, book.googleBookId, 'unread');  // Use `googleBookId` for the add request
        setBooks(prevBooks => prevBooks.map(b => 
            b.googleBookId === book.googleBookId ? { ...b, existsInLibrary: true, status: 'unread' } : b
        ));
        setStatusMessage(prev => ({
            ...prev,
            [book.googleBookId]: 'Book added to your library successfully!'
        }));
    } catch (error) {
        console.error('Error adding book:', error.message);
        setStatusMessage(prev => ({
            ...prev,
            [book.googleBookId]: 'Error adding book. Please try again.'
        }));
    }
};

  

  return (
    <div className="explore-page">
      <h1>Explore Books</h1>
      <div className="search-container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="book-list">
  {books.map((book) => (
    <div key={book.googleBookId} className="book-card">
      <img src={book.thumbnail || placeholderCover} alt="Book cover" />
      <div className="book-details">
        <h3>{book.volumeInfo.title}</h3>
        <p>by {book.volumeInfo.authors?.join(', ')}</p>
        {/* "Already added" display */}
        {book.existsInLibrary && <span className="book-status">Already added</span>}
        {statusMessage[book.googleBookId] && <p className="status-message">{statusMessage[book.googleBookId]}</p>}
      </div>
      
      {/* TBR Button and Status Message */}
      <button
        className="btn add-to-shelf-btn"
        onClick={() => handleAddToShelf(book)}
        style={{
          backgroundColor: book.existsInLibrary ? '#DBC0A4' : '#FA9939',
          cursor: book.existsInLibrary ? 'not-allowed' : 'pointer',
        }}
        disabled={book.existsInLibrary}
      >
        Add to Shelf
      </button>
    </div>
  ))}
</div>

    </div>
  );
};

export default Explore;
