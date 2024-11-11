// src/components/SortBar.js
import React, { useState } from 'react';
import '../App.css';

const SortBar = ({ onSort }) => {
    const sortOptions = ['title', 'author', 'status']; // Default options
  
    return (
      <div className="sort-bar">
        <select onChange={(e) => onSort(e.target.value)} defaultValue="title">
          {sortOptions.length > 0 && sortOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  };

export default SortBar;
