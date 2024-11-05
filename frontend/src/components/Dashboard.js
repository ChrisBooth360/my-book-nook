// src/components/Dashboard.js
import React from 'react';
import placeholderProfile from '../assets/book-nook-sq-logo.png';
import '../App.css';

const Dashboard = ({ username, totalBooks, tbrCount, currentlyReadingCount }) => {
  return (
    <div className="dashboard">
      <div className="profile-picture">
        <img src={placeholderProfile} alt="Profile" />
      </div>
      <div className="dashboard-header">
        <h2>{username}'s Library</h2>
        <div className="dashboard-stats">
          <span className="total-books">{totalBooks}</span>
          <span className="books-label"> books on your shelf</span>
        </div>
        <div className="dashboard-info">
          <div>{tbrCount} on your TBR</div>
          <div>{currentlyReadingCount} books read</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
