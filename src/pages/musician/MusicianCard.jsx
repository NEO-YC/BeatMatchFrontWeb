import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsApi } from '../../services/api';
import RatingStar from '../../components/RatingStar';
import './MusicianCard.css';

export default function MusicianCard({ musician }) {
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const {
    _id,
    firstname,
    lastname,
    musicianProfile
  } = musician;

  // טעינת דירוג ממוצע
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await reviewsApi.getAverageRating(_id);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (err) {
        console.error('Error fetching rating:', err);
      }
    };
    
    if (_id) {
      fetchRating();
    }
  }, [_id]);

  // קבלת כלי נגינה
  const instruments = musicianProfile?.instrument 
    ? (Array.isArray(musicianProfile.instrument) 
        ? musicianProfile.instrument 
        : [musicianProfile.instrument])
    : [];

  // קבלת אירועים
  const eventTypes = musicianProfile?.eventTypes 
    ? (Array.isArray(musicianProfile.eventTypes) 
        ? musicianProfile.eventTypes 
        : [musicianProfile.eventTypes])
    : [];

  // קבלת מיקום
  const location = musicianProfile?.location 
    ? (Array.isArray(musicianProfile.location) 
        ? musicianProfile.location.join(', ') 
        : musicianProfile.location)
    : 'לא צויין';

  const handleClick = () => {
    navigate(`/musician/${_id}`);
  };








  return (
    <div className="musician-card" onClick={handleClick}>
      <div className="musician-card-header">
        <div className="musician-avatar">
          {musicianProfile?.profilePicture ? (
            <img src={musicianProfile.profilePicture} alt={`${firstname} ${lastname}`} />
          ) : (
            <div className="avatar-placeholder">
              {firstname?.[0]}{lastname?.[0]}
            </div>
          )}
        </div>
        <div className="musician-info">
          <h3 className="musician-name">{firstname} {lastname}</h3>
          {totalReviews > 0 && (
            <div className="musician-rating">
              <RatingStar 
                rating={Math.round(averageRating * 10) / 10}
                size="small"
                interactive={false}
                showText={false}
              />
              <span className="rating-text">{averageRating.toFixed(1)} ({totalReviews})</span>
            </div>
          )}
        </div>
      </div>

      <div className="musician-card-body">
        {instruments.length > 0 && (
          <div className="musician-section">
            <div className="section-label">כלי נגינה</div>
            <div className="tags">
              {instruments.map((inst, idx) => (
                <span key={idx} className="tag instrument-tag">{inst}</span>
              ))}
            </div>
          </div>
        )}

        {eventTypes.length > 0 && (
          <div className="musician-section">
            <div className="section-label">אירועים</div>
            <div className="tags">
              {eventTypes.map((ev, idx) => (
                <span key={idx} className="tag event-tag">{ev}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="musician-card-footer">
        <div className="card-location">
          <span className="location-icon">📍</span>
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
