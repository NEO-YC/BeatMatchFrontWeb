import React from 'react';
import RatingStar from './RatingStar';
import './ReviewCard.css';

const ReviewCard = ({ review, onDelete = null, onEdit = null, onReply = null, isOwner = false, isMusician = false, isAdmin = false }) => {
  const [showReply, setShowReply] = React.useState(false);

  // חישוב כמה ימים עברו
  const getDaysAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const days = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'היום';
    if (days === 1) return 'אתמול';
    if (days < 7) return `${days} ימים`;
    if (days < 30) return `${Math.floor(days / 7)} שבועות`;
    if (days < 365) return `${Math.floor(days / 30)} חודשים`;
    return `${Math.floor(days / 365)} שנים`;
  };

  const eventTypeEmoji = {
    'חתונה': '💍',
    'מסיבה': '🎉',
    'קונצרט': '🎸',
    'כנס': '🎤',
    'קידום עסק': '💼',
    'ערב יום הולדת': '🎂',
    'אחר': '🎵'
  };

  const reviewer = review.reviewerId || {};
  const fullName = `${reviewer.firstname || ''} ${reviewer.lastname || ''}`.trim() || 'משתמש אנונימי';

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {reviewer.profileImage ? (
            <img src={reviewer.profileImage} alt={fullName} className="reviewer-avatar" />
          ) : (
            <div className="reviewer-avatar-placeholder">
              {fullName.charAt(0)}
            </div>
          )}
          
          <div className="reviewer-details">
            <h4 className="reviewer-name">{fullName}</h4>
            <div className="review-meta">
              <span className="event-type">
                {eventTypeEmoji[review.eventType]} {review.eventType}
              </span>
              <span className="review-date">{getDaysAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="review-actions">
          {(isOwner || isAdmin) && (
            <>
              {onEdit && (
                <button 
                  className="btn-edit-review" 
                  onClick={() => onEdit(review)}
                  title={isAdmin ? "ערוך ביקורת (אדמין)" : "ערוך ביקורת"}
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button 
                  className="btn-delete-review" 
                  onClick={() => onDelete(review._id)}
                  title={isAdmin ? "מחק ביקורת (אדמין)" : "מחק ביקורת"}
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="review-rating">
        <RatingStar 
          rating={review.rating} 
          setRating={null}
          size="medium"
          interactive={false}
          showText={false}
        />
      </div>

      <h3 className="review-title">{review.title}</h3>
      <p className="review-comment">{review.comment}</p>

      {review.musicianReply && (
        <div className="musician-reply">
          <div className="reply-header">
            <span className="reply-badge">תגובה מהמוזיקאי</span>
          </div>
          <p className="reply-text">{review.musicianReply}</p>
        </div>
      )}

      {isMusician && !review.musicianReply && (
        <button 
          className="btn-reply"
          onClick={() => setShowReply(!showReply)}
        >
          {showReply ? 'בטל' : 'הוסף תגובה'}
        </button>
      )}

      {isMusician && showReply && (
        <div className="reply-form">
          <textarea 
            placeholder="כתוב תגובה..."
            className="reply-textarea"
            id={`reply-${review._id}`}
          />
          <button 
            className="btn-submit-reply"
            onClick={() => {
              const textarea = document.getElementById(`reply-${review._id}`);
              if (onReply && textarea.value.trim()) {
                onReply(review._id, textarea.value);
                setShowReply(false);
              }
            }}
          >
            שלח תגובה
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
