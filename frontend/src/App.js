// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header'; // Import the Header component
import './App.css';

function App() {
  return (
    <div>
      <Header /> {/* This will always render the Header */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
