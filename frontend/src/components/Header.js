import React from 'react';
import '../App.css'; // Custom CSS for header
import headerLogo from '../assets/book-nook-small-header.png';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { Link } from 'react-router-dom'; // Use Link for client-side routing

function Header() {
  const navigate = useNavigate(); // Use navigate for redirection

  const handleLogout = () => {
    // Clear the token from localStorage or cookies
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/');
  };

  const isLoggedIn = !!localStorage.getItem('token'); // Check if token exists

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src={headerLogo} alt="Book Nook Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-middle">
        <input type="text" placeholder="Search books..." className="search-bar" />
      </div>
      <nav className="header-right nav-menu">
      <ul>
          <li><a href="/my-library">My Library</a></li>
          <li><a href="/explore">Explore</a></li>
          {isLoggedIn && <li><a href="/profile">Profile</a></li>}
          {isLoggedIn ? (
            <li><a href="/" onClick={handleLogout}>Logout</a></li>
          ) : (
            <li><a href="/">Login</a></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
