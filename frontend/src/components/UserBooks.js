// src/components/UserBooks.js

import React, { useEffect, useState } from 'react';
import { getUserBooks } from '../services/api';

const UserBooks = () => {
  const [books, setBooks] = useState([]); // Initialize with an empty array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch user books when the component is mounted
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User is not logged in');
          setLoading(false);
          return;
        }
        const response = await getUserBooks(token);
        setBooks(response.data.books || []); // Ensure it's an array
      } catch (err) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display loading state
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h2>User Books</h2>
      {books.length > 0 ? (
        <ul className="book-list">
          {books.map((book) => (
            <li key={book._id} className="book-item">
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Pages:</strong> {book.numberOfPages}</p>
              <p><strong>Genre:</strong> {book.genre.join(', ')}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found in your collection.</p>
      )}
    </div>
  );
};

export default UserBooks;
