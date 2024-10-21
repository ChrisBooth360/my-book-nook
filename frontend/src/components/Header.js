// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li> {/* Link to HomePage */}
          <li><Link to="/profile">Profile</Link></li> {/* Link to ProfilePage */}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
