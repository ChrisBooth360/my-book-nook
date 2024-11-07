// src/components/Header.js
import React from 'react';
import '../App.css';
import headerLogo from '../assets/book-nook-small-header.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to homepage after logging out
  };

  const isLoggedIn = !!localStorage.getItem('token'); // Check if user is logged in

  const handleSearch = (query) => {
    navigate(`/explore?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src={headerLogo} alt="Book Nook Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-middle">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      <nav className="header-right nav-menu">
        <ul>
          <li><Link to="/my-library">My Library</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          {isLoggedIn && <li><Link to="/profile">Profile</Link></li>}
          {isLoggedIn ? (
            <li><a href="/" onClick={handleLogout}>Logout</a></li>
          ) : (
            <li><Link to="/">Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
