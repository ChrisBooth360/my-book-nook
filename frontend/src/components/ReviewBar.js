// src/components/ReviewBar.js
import React, { useState } from 'react';
import { updateReview, removeReview } from '../services/api';
import '../App.css';

const ReviewBar = ({ initialReview, googleBookId }) => {
  const [review, setReview] = useState(initialReview); // Current review
  const [isExpanded, setIsExpanded] = useState(false); // Controls visibility of textarea
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode
  const [loading, setLoading] = useState(false); // Tracks API loading state

  // Toggle visibility of the review input
  const toggleVisibility = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) setIsEditing(true); // Automatically enter edit mode when expanding
  };

  // Save the updated review
  const handleSave = async () => {
    if (review.trim() === initialReview) {
      setIsEditing(false); // No change; exit edit mode
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await updateReview(token, googleBookId, review);
      console.log(`Review updated for book ${googleBookId}: ${review}`);
    } catch (error) {
      console.error(`Failed to update review for book ${googleBookId}:`, error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  // Delete the review
  const handleDelete = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await removeReview(token, googleBookId);
      setReview(''); // Clear local review
      setIsExpanded(false); // Collapse textarea
      console.log(`Review removed for book ${googleBookId}`);
    } catch (error) {
      console.error(`Failed to remove review for book ${googleBookId}:`, error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  // Cancel editing or collapse textarea
  const handleCancel = () => {
    setIsEditing(false);
    if (review === '') setIsExpanded(false); // Collapse only if no review exists
  };

  return (
    <div className="review-bar-container">
      {/* Add Review Button */}
      {!isExpanded && review === '' && (
        <button className="review-button" onClick={toggleVisibility}>
          Add a review
        </button>
      )}

      {/* Review Input Area */}
      {(isExpanded || review !== '') && (
        <div className="review-bar-visible">
            
            {isEditing ? <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={!isEditing} // Disable input when not in edit mode
            className="review-textarea"
            placeholder="Write your review here..."
            style={{
              opacity: loading ? 0.5 : 1, // Indicate loading with reduced opacity
            }}
            /> :
            <p>{review}</p> }
          
          <div className="review-buttons">
            {!isEditing ? (
              <button className="review-button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <>
                <button
                  className="review-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="review-button back-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Back
                </button>
              </>
            )}
            <button
              className="review-button delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewBar;
