// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyLibrary from './pages/MyLibrary';
import Explore from './pages/Explore'; 
import Header from './components/Header'; // Keep the Header for authenticated pages
import './App.css';

function App() {
  const isLoggedIn = !!localStorage.getItem('token'); // Replace this logic with your own authentication check

  return (
    <div>
      {isLoggedIn && <Header />}
      <Routes>
        <Route path="/" element={isLoggedIn ? <ProfilePage /> : <HomePage />} />
        <Route path="/explore" element={<Explore />} /> {/* Add this line */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/my-library" element={<MyLibrary />} />
      </Routes>
    </div>
  );
}

export default App;
