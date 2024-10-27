import React, { useState } from 'react';
import { searchBooks } from '../services/api';
import '../App.css'; // Add your custom styles
import placeholderCover from '../assets/book-nook-placeholder.png';
import SearchBar from '../components/SearchBar';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setBooks([]); // Clear previous results

    const token = localStorage.getItem('token'); // Fetch the token for authorization

    try {
      const response = await searchBooks(token, query);
      setBooks(response); // Update with search results
      console.log(response)
    } catch (err) {
      setError('Error fetching books. Please try again.');
    } finally {
      setLoading(false);
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
          <div key={book.id} className="book-card">
            <img src={book.thumbnail || placeholderCover} alt="Book cover" />
            <div className="book-details">
              <h3>{book.volumeInfo.title}</h3>
              <p>by {book.volumeInfo.authors?.join(', ')}</p>
            </div>
            <button className="btn add-to-shelf-btn">Add to shelf</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
