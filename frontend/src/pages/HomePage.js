// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Welcome to My Book Nook</h1>
      <p>Discover new books, manage your collection, and decide your next read!</p>
      <Link to="/register" className="btn">Register</Link> {/* Link to register */}
      <br />
      <Link to="/login" className="btn">Login</Link> {/* Link to login */}
    </div>
  );
}

export default HomePage;
