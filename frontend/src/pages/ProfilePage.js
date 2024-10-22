// src/pages/ProfilePage.js
import React, { useEffect } from 'react';
import UserBooks from '../components/UserBooks'; // Import the UserBooks component
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <h2>Your Profile</h2>
      {/* Display the user's book collection */}
      <UserBooks />
    </div>
  );
};

export default ProfilePage;
