// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Register a new user
export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/users/register`, userData);
};

// User login
export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/users/login`, credentials);
};

// Fetch user's books
export const getUserBooks = async (token) => {
  return axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
