// src/components/FilterBar.js
import React from 'react';
import '../App.css';

const FilterBar = ({ filterCategory, onFilter }) => {
  const filterOptions = [
    { label: 'Whole Library', value: 'wholeLibrary' },
    { label: 'TBR Shelf', value: 'tbrShelf' },
    { label: 'Read Shelf', value: 'readShelf' },
  ];

  return (
    <div className="filter-and-sort-bar">
      <p>Filter by: </p>
      <select value={filterCategory} onChange={(e) => onFilter(e.target.value)}>
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
