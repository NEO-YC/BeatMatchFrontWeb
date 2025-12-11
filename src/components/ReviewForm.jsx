import React, { useState } from 'react';
import RatingStar from './RatingStar';
import './ReviewForm.css';

const ReviewForm = ({ musicianId, editingReview = null, onSubmit = null, onClose = null }) => {
  const [rating, setRating] = React.useState(editingReview?.rating || 0);
  const [title, setTitle] = React.useState(editingReview?.title || '');
  const [comment, setComment] = React.useState(editingReview?.comment || '');
  const [eventType, setEventType] = React.useState(editingReview?.eventType || 'אחר');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const eventTypes = [
    'חתונה',
    'מסיבה',
    'קונצרט',
    'כנס',
    'קידום עסק',
    'ערב יום הולדת',
    'אחר'
  ];

  const validateForm = () => {
    setError('');

    if (rating === 0) {
      setError('אנא בחר דירוג');
      return false;
    }

    if (title.length < 5) {
      setError('כותרת חייבת להיות לפחות 5 תווים');
      return false;
    }

    if (title.length > 100) {
      setError('כותרת לא יכולה להיות יותר מ-100 תווים');
      return false;
    }

    if (comment.length < 10) {
      setError('ביקורת חייבת להיות לפחות 10 תווים');
      return false;
    }

    if (comment.length > 1000) {
      setError('ביקורת לא יכולה להיות יותר מ-1000 תווים');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!onSubmit) {
      console.error('onSubmit callback not provided');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        musicianId,
        rating,
        title,
        comment,
        eventType
      });

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setEventType('אחר');
      setError('');
    } catch (err) {
      setError(err.message || 'שגיאה בשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-modal">
        <div className="form-header">
          <h2>{editingReview ? 'ערוך ביקורת' : 'כתוב ביקורת'}</h2>
          <button 
            className="btn-close-modal"
            onClick={onClose}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Rating Selection */}
          <div className="form-group">
            <label className="form-label">דירוג</label>
            <div className="form-rating">
              <RatingStar 
                rating={rating}
                setRating={setRating}
                size="large"
                interactive={true}
                showText={true}
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label className="form-label">כותרת</label>
            <input
              type="text"
              className="form-input"
              placeholder="כותרת קצרה של הביקורת (למשל: מדהים לחתונה!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          {/* Event Type Select */}
          <div className="form-group">
            <label className="form-label">סוג אירוע</label>
            <select
              className="form-select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              disabled={loading}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Comment Textarea */}
          <div className="form-group">
            <label className="form-label">ביקורת</label>
            <textarea
              className="form-textarea"
              placeholder="ספר לנו על החוויה שלך עם המוזיקאי... (לפחות 10 תווים)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              disabled={loading}
            />
            <span className="char-count">{comment.length}/1000</span>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary-form"
              onClick={onClose}
              disabled={loading}
            >
              בטל
            </button>
            <button
              type="submit"
              className="btn btn-primary-form"
              disabled={loading || rating === 0}
            >
              {loading ? 'שולח...' : editingReview ? 'עדכן ביקורת' : 'שלח ביקורת'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
