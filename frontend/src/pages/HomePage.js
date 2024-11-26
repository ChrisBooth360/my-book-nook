// src/pages/HomePage.js
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api'; // Import the register function
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import '../styles/App.css';
import '../styles/HomePage.css'
import headerLogo from '../assets/book-nook-sq-logo-slogan.png';

const HomePage = ({ setIsLoggedIn }) => {
  const [formType, setFormType] = useState(null); // State to track form (login/register)
  const [formData, setFormData] = useState({ email: '', password: '', username: '' }); // Track form inputs
  const [error, setError] = useState(null); // State for error messages
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Logging in user:', formData); // Log request data
      const response = await loginUser(formData); // Call the login function
      console.log('Login successful:', response.data); // Log response
      localStorage.setItem('token', response.data.token); // Store token in local storage
      setIsLoggedIn(true); // Update login state
      setError(null);
      setSuccessMessage(null); // Clear success message
      navigate('/my-library'); // Redirect to the library page
    } catch (err) {
      console.error('Login error:', err.response || err.message); // Log error details
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log('Registering user:', formData); // Log request data
      const response = await registerUser(formData); // Call the register function
      console.log('Registration successful:', response.data); // Log response
      setError(null);
      setSuccessMessage("You've successfully registered! Login to make it official."); // Set success message
      setFormType('login'); // Switch to login form
    } catch (err) {
      console.error('Registration error:', err.response || err.message); // Log error details
      setError('Registration failed. Please try again.');
    }
  };

  const renderForm = () => {
    if (formType === 'login') {
      return (
        <div className="auth-form">
          {successMessage && <p style={{ color: '#FA9939' }}>{successMessage}</p>} {/* Show success message */}
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show error message */}
          <form onSubmit={handleLogin}> {/* Add onSubmit handler */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
            <br />
            <br />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
            <div className="form-buttons">
              <button type="submit" className="btn form-btn">Login</button>
              <button className="back-btn" onClick={() => setFormType(null)}>Back</button>
            </div>
          </form>
          <p className="form-switch-text">
            Don't have an account? 
            <span onClick={() => setFormType('register')}> Register here.</span>
          </p>
        </div>
      );
    }
    
    if (formType === 'register') {
      return (
        <div className="auth-form">
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show error message */}
          <form onSubmit={handleRegister}> {/* Add onSubmit handler */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
            />
            <br />
            <br />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
            <br />
            <br />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
            <div className="form-buttons">
              <button type="submit" className="btn form-btn">Register</button>
              <button className="back-btn" onClick={() => setFormType(null)}>Back</button>
            </div>
          </form>
          <p className="form-switch-text">
            Already have an account?
            <span onClick={() => setFormType('login')}> Login here.</span>
          </p>
        </div>
      );
    }
    
    return (
      <div className="auth-buttons">
        <button onClick={() => setFormType('login')} className="btn auth-btn">Login</button>
        <button onClick={() => setFormType('register')} className="btn auth-btn">Register</button>
      </div>
    );
  };

  return (
    <div className="logged-out-homepage">
      <img src={headerLogo} alt="Book Nook Logo" className="center-logo" />
      {renderForm()} {/* Render either the buttons or the form */}
    </div>
  );
};

export default HomePage;
