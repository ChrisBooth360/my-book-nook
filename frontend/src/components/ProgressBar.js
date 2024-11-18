// src/components/ProgressBar.js
import React, { useState } from 'react';
import { updateProgress } from '../services/api';
import '../App.css';

const ProgressBar = ({ progress, googleBookId }) => {
  const [newProgress, setNewProgress] = useState(progress); // Track user input for new progress
  const [displayedProgress, setDisplayedProgress] = useState(progress); // Progress shown in the bar
  const [isEditing, setIsEditing] = useState(false); // Whether the user is editing the progress
  const [loading, setLoading] = useState(false); // Track loading state for API

  // Handle the button click to start editing and to submit new progress
  const handleUpdateClick = async () => {

    if (!isEditing) {
        setIsEditing(true)
    } else {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
        await updateProgress(token, googleBookId, newProgress);
        console.log(`Updated progress for book ${googleBookId} to ${newProgress}`);
        setDisplayedProgress(newProgress); // Only update displayed progress on submit
        } catch (error) {
        console.error(`Failed to update progress for book ${googleBookId}:`, error);
        } finally {
        setLoading(false);
        }
        setIsEditing(false);
    }
    // isEditing === true ? setIsEditing(false) : setIsEditing(true);
  };

  // Handle the input change (updating progress value)
  const handleProgressChange = (e) => {
    const value = Math.min(Math.max(e.target.value, 0), 100); // Ensure progress is between 0 and 100
    setNewProgress(value); // Only update user input
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${displayedProgress}%` }}></div>
      </div>

      {/* Wrap both the input and button together */}
      <div className="progress-buttons">
        {isEditing && (
          <div className="progress-input">
            <input
              type="number"
              value={newProgress}
              onChange={handleProgressChange}
              min="0"
              max="100"
              style={{
                opacity: loading ? 0.5 : 1, // Indicate loading with reduced opacity
              }}
            />
          </div>
        )}
        <button className="update-button" onClick={handleUpdateClick}>{isEditing ? "Submit" : "Update Progress"}</button>
      </div>
    </div>
    );

};

export default ProgressBar;
