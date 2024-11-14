// src/components/SortBar.js
import React from 'react';
import '../App.css';

const SortBar = ({ onSort }) => {
  const sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Title', value: 'title' },
    { label: 'Author', value: 'author' },
  ];

  return (
    <div className="filter-and-sort-bar">
      <p>Sort by: </p>
      <select onChange={(e) => onSort(e.target.value)} defaultValue="default">
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortBar;
