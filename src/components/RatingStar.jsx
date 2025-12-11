import React from 'react';
import './RatingStar.css';

const RatingStar = ({ 
  rating = 0, 
  setRating = null, 
  size = 'medium', 
  interactive = true,
  showText = true,
  count = 0 
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleStarClick = (star) => {
    if (interactive && setRating) {
      setRating(star);
    }
  };

  const handleStarHover = (star) => {
    if (interactive) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // הגדר גודל בסיס
  const sizeMap = {
    small: '18px',
    medium: '24px',
    large: '32px',
    xl: '40px'
  };

  const currentSize = sizeMap[size] || sizeMap.medium;
  const displayRating = hoverRating || rating;

  return (
    <div className={`rating-star-container ${size} ${interactive ? 'interactive' : 'static'}`}>
      <div 
        className="stars-wrapper"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= displayRating ? 'filled' : 'empty'}`}
            style={{ fontSize: currentSize }}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            role="button"
            tabIndex={interactive ? 0 : -1}
            aria-label={`דירוג ${star} כוכבים`}
          >
            ★
          </span>
        ))}
      </div>

      {showText && (
        <div className="rating-text">
          {displayRating > 0 ? (
            <>
            <span className="rating-label">5 / </span>
              <span className="rating-number">{displayRating}</span>
              {count > 0 && <span className="rating-count">({count} ביקורות)</span>}
            </>
          ) : (
            <span className="rating-placeholder">בחר דירוג</span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingStar;
