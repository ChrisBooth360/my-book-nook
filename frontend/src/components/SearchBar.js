// src/components/SearchBar.js
import React, { useState } from 'react';
import '../styles/SearchBar.css';
import '../styles/App.css';

const SearchBar = ({ onSearch, placeholder = "Search for books by title, author, or ISBN" }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-bar"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
