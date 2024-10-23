// src/components/Header.js
import React from 'react';
import '../App.css'; // Custom CSS for header
import headerLogo from '../assets/book-nook-slim-header.png';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation

function Header() {
  const navigate = useNavigate(); // Use navigate for redirection

  const handleLogout = () => {
    // Clear the token from localStorage or cookies
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={headerLogo} alt="Book Nook Logo" className="header-logo" />
      </div>
      <nav className="nav-menu">
        <ul>
          <li><a href="/">Explore</a></li>
          <li><a href="/profile">Profile</a></li>
          <li>
            {/* Conditionally show Logout or Login based on whether token exists */}
            {localStorage.getItem('token') ? (
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            ) : (
              <a href="/login">Login</a>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
