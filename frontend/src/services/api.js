// services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/user/register`, userData);
};

export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/user/login`, credentials);
};

export const getUserBooks = async (token) => {
  return axios.get(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getUserProfile = async (token) => {
  return axios.get(`${API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateUserProfile = async (token, userData) => {
  return axios.put(`${API_URL}/user/profile`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserPassword = async (token, passwordData) => {
  return axios.put(`${API_URL}/user/profile/password`, passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const searchBooks = async (token, query, startIndex = 0) => {
  try {
    const response = await axios.get(`${API_URL}/books/search`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { query, startIndex, maxResults: 10 }
    });
    return response.data;
  } catch (error) {
    console.error("Fetch error: ", error);
    throw error;
  }
};

export const addBookToShelf = async (token, googleBookId, status) => {
  return axios.post(
    `${API_URL}/books/search/add`,
    { googleBookId, status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const checkBookStatus = async (token, isbn) => {
  return axios.get(`${API_URL}/books/check-status/${isbn}`, {
      headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateBookStatus = async (token, googleBookId, status) => {
  return axios.put(
    `${API_URL}/user/${googleBookId}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const removeBookFromShelf = async (token, googleBookId) => {
  return axios.delete(`${API_URL}/user/${googleBookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCurrentlyReadingBooks = async (token) => {
  return axios.get(`${API_URL}/user/currently-reading`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTbrBooks = async (token) => {
  return axios.get(`${API_URL}/user/tbr`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateRating = async (token, googleBookId, rating) => {
  return axios.put(`${API_URL}/user/${googleBookId}/rating`, { rating }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProgress = async (token, googleBookId, progress) => {
  return axios.put(`${API_URL}/user/${googleBookId}/progress`, { progress }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateReview = async (token, googleBookId, review) => {
  return axios.put(`${API_URL}/user/${googleBookId}/review`, { review }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const removeReview = async (token, googleBookId) => {
  return axios.put(`${API_URL}/user/${googleBookId}/review/remove`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
