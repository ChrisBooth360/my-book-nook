// src/components/SearchBar.js
import React, { useState } from 'react';
import '../App.css'; // Make sure to import the CSS file

const SearchBar = ({ onSearch, placeholder = "Search for books by title, author, or ISBN"  }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        required
        className="search-bar"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
