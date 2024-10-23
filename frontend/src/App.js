// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header'; // Keep the Header for authenticated pages
import './App.css';

function App() {
  const isLoggedIn = !!localStorage.getItem('token'); // Replace this logic with your own authentication check

  return (
    <div>
      {isLoggedIn && <Header />} {/* Render Header only when logged in */}
      <Routes>
        <Route path="/" element={isLoggedIn ? <ProfilePage /> : <HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
