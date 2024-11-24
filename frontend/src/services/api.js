// services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// userRoutes
export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/user/register`, userData);
};

export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/user/login`, credentials);
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

// bookRoutes
export const getAllBooks = async (token) => {
  return axios.get(`${API_URL}/books`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const searchGoogleBooks = async (token, query, startIndex = 0) => {
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
    `${API_URL}/books/add`,
    { googleBookId, status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const deleteBookFromLibrary = async (token, bookId) => {
  return axios.delete(`${API_URL}/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// userBookRoutes
export const getUserBooks = async (token) => {
  return axios.get(`${API_URL}/user-books`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const searchUserBooks = async (token, query, startIndex = 0) => {
  try {
    const response = await axios.get(`${API_URL}/user-books/search`, {
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

export const getBooksByStatus = async (token, status) => {
  return axios.get(`${API_URL}/user-books/${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateBookStatus = async (token, googleBookId, status) => {
  return axios.put(
    `${API_URL}/user-books/status/${googleBookId}`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const updateProgress = async (token, googleBookId, progress) => {
  return axios.put(`${API_URL}/user-books/progress/${googleBookId}`, { progress }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateReview = async (token, googleBookId, review) => {
  return axios.put(`${API_URL}/user-books/review/${googleBookId}`, { review }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateRating = async (token, googleBookId, rating) => {
  return axios.put(`${API_URL}/user-books/rating/${googleBookId}`, { rating }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const removeBookFromShelf = async (token, googleBookId) => {
  return axios.delete(`${API_URL}/user-books/remove/${googleBookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeReview = async (token, googleBookId) => {
  return axios.delete(`${API_URL}/user-books/review/remove/${googleBookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// bookLocationRoutes
export const lendBook = async (token, googleBookId, person, dateLent, dateDue) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/lend`,
    { person, dateLent, dateDue }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const returnLentBook = async (token, googleBookId) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/lend/return`, {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const markBorrowedBook = async (token, googleBookId, person, dateBorrowed, dateDue) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/borrow`,
    { person, dateBorrowed, dateDue }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const returnBorrowedBook = async (token, googleBookId) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/borrow/return`, {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const updateDueDate = async (token, googleBookId, dateDue, type) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/due-date`,
    { dateDue, type }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const sellBook = async (token, googleBookId) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/sell`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const buyBook = async (token, googleBookId) => {
  return axios.put(`${API_URL}/book-location/${googleBookId}/buy`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}

export const clearLocationHistory = async (token, googleBookId) => {
  return axios.delete(`${API_URL}/user-books/${googleBookId}/clear-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
