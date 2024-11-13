// src/components/FilterBar.js
import React from 'react';
import '../App.css';

const FilterBar = ({ onFilter }) => {
    const filterOptions = [
        { label: 'Whole Library', value: 'wholeLibrary' },
        { label: 'TBR Shelf', value: 'tbrShelf' },
        { label: 'Read Shelf', value: 'readShelf' },
      ];

  return (
    <div className="filter-and-sort-bar">
      <p>Filter by: </p>
      <select onChange={(e) => onFilter(e.target.value)} defaultValue="library">
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
