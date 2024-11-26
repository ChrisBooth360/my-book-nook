import React, { useState } from 'react';
import '../styles/App.css';
import '../styles/Header.css';
import headerLogo from '../assets/book-nook-small-header.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to homepage after logging out
  };

  const handleSearch = (query) => {
    navigate(`/explore?search=${encodeURIComponent(query)}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src={headerLogo} alt="Book Nook Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-middle">
        <div className="header-search-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      <div className="header-right">
        <nav className="nav-menu">
          <ul>
            <li><Link to="/my-library">My Library</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><a href="/" onClick={handleLogout}>Logout</a></li>
          </ul>
        </nav>
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {isMenuOpen && (
          <ul className="nav-dropdown">
            <li><Link to="/my-library">My Library</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><a href="/" onClick={handleLogout}>Logout</a></li>
          </ul>
        )}

      </div>
    </header>
  );
}

export default Header;
