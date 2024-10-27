import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../services/api';
import '../App.css';

const Profile = () => {
    const [userData, setUserData] = useState({ username: '', email: '' });
    const [editData, setEditData] = useState({ username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await getUserProfile(token);
                setUserData(response.data);
                setEditData({ username: response.data.username, email: response.data.email });
            } catch (error) {
                console.error('Error fetching profile data:', error.message);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await updateUserProfile(token, editData);
            setUserData(response.data.user);
            setMessage('Profile updated successfully');
        } catch (error) {
            setMessage('Error updating profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await changeUserPassword(token, passwordData);
            setMessage('Password changed successfully');
        } catch (error) {
            setMessage('Error changing password');
        }
    };

    return (
        <div className="profile-page">
            <h1 style={{ fontFamily: 'Montserrat', color: '#045174' }}>Profile</h1>

            <div className="profile-info">
                <h2>User Information</h2>
                <p><strong>Username:</strong> {userData.username}</p>
                <p><strong>Email:</strong> {userData.email}</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="update-form">
                <h2>Edit Profile</h2>
                <label>
                    Username:
                    <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                </label>
                <button type="submit">Update Profile</button>
            </form>

            <form onSubmit={handlePasswordChange} className="password-form">
                <h2>Change Password</h2>
                <label>
                    Current Password:
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                </label>
                <label>
                    New Password:
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                </label>
                <button type="submit">Change Password</button>
            </form>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default Profile;
