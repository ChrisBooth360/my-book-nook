import React, { useState, useEffect } from 'react';
import filledStar from '../assets/filled-star.png';
import blankStar from '../assets/blank-star.png';
import filledStarBright from '../assets/filled-star-bright.png';
import { updateRating } from '../services/api';
import '../App.css';

const RatingBar = ({ initialRating, googleBookId }) => {
  const [rating, setRating] = useState(initialRating); // Current rating
  const [hoveredStar, setHoveredStar] = useState(0); // Current hovered star index
  const [loading, setLoading] = useState(false); // Track loading state for API

  // Sync `rating` state with `initialRating` prop when it changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  // Handle star click (set rating and update backend)
  const handleStarClick = async (index) => {
    setRating(index);
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await updateRating(token, googleBookId, index); // Update backend
      console.log(`Updated rating for book ${googleBookId} to ${index}`);
    } catch (error) {
      console.error(`Failed to update rating for book ${googleBookId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse enter (hover)
  const handleMouseEnter = (index) => {
    setHoveredStar(index);
  };

  // Handle mouse leave (reset hover state)
  const handleMouseLeave = () => {
    setHoveredStar(0);
  };

  // Render stars
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starIndex = i + 1; // Stars are 1-indexed
    let starSrc = blankStar; // Default is blank star

    if (hoveredStar > 0) {
      // If hovering, show "bright" stars up to hovered index
      starSrc = starIndex <= hoveredStar ? filledStarBright : blankStar;
    } else {
      // If not hovering, fill stars up to the current rating
      starSrc = starIndex <= rating ? filledStar : blankStar;
    }

    return (
      <img
        key={starIndex}
        src={starSrc}
        alt={`Star ${starIndex}`}
        className="rating-star"
        onClick={() => handleStarClick(starIndex)}
        onMouseEnter={() => handleMouseEnter(starIndex)}
        onMouseLeave={handleMouseLeave}
        style={{
          opacity: loading ? 0.5 : 1, // Indicate loading with reduced opacity
        }}
      />
    );
  });

  return <div className="rating-bar">{stars}</div>;
};

export default RatingBar;
