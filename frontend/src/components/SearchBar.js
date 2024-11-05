import React, { useState } from 'react';
import '../App.css'; // Make sure to import the CSS file

const SearchBar = ({ onSearch }) => {
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
        placeholder="Search for books by title, author, or ISBN"
        required
        className="search-bar"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
