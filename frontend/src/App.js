// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MyLibrary from './pages/MyLibrary';
import Explore from './pages/Explore';
import Header from './components/Header';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // State for login check

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // Set login state if token is found
    }
  }, []); // Only run once when the component is mounted

  return (
    <div>
      {isLoggedIn && <Header />} {/* Show Header only if logged in */}
      <Routes>
        <Route path="/" element={isLoggedIn ? <MyLibrary /> : <HomePage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/explore" element={isLoggedIn ? <Explore /> : <HomePage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <HomePage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/my-library" element={isLoggedIn ? <MyLibrary /> : <HomePage setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </div>
  );
}

export default App;
