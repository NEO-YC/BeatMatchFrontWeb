import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MusicianProfile.css';
import api from '../../services/api';

export default function MusicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [musician, setMusician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMusician() {
      try {
        const data = await api.getMusicianById(id);
        setMusician(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    }
    fetchMusician();
  }, [id]);

  if (loading) {
    return (
      <div className="profile-page" dir="rtl">
        <div className="loading-state">טוען פרופיל...</div>
      </div>
    );
  }

  if (error || !musician) {
    return (
      <div className="profile-page" dir="rtl">
        <div className="error-state">
          <p>{error || 'המוזיקאי לא נמצא'}</p>
          <button onClick={() => navigate('/search')} className="btn-back">חזור לחיפוש</button>
        </div>
      </div>
    );
  }

  const user = musician.user || {};
  const { firstname, lastname, email } = user;
  const phone = musician.phone || '';
  const profile = musician.musicianProfile || {};

  const instruments = profile.instrument
    ? (Array.isArray(profile.instrument) ? profile.instrument : String(profile.instrument).split(',').map(i => i.trim()).filter(Boolean))
    : [];

  const genres = profile.musictype
    ? (Array.isArray(profile.musictype) ? profile.musictype : [profile.musictype])
    : [];

  const eventTypes = profile.eventTypes
    ? (Array.isArray(profile.eventTypes) ? profile.eventTypes : [profile.eventTypes])
    : [];

  const location = profile.location
    ? (Array.isArray(profile.location) ? profile.location.join(', ') : profile.location)
    : 'לא צויין';

  const galleryImages = profile.galleryPictures && Array.isArray(profile.galleryPictures)
    ? profile.galleryPictures
    : [];

  const galleryVideos = profile.galleryVideos && Array.isArray(profile.galleryVideos)
    ? profile.galleryVideos
    : [];

  const youtubeLinks = profile.youtubeLinks && Array.isArray(profile.youtubeLinks)
    ? profile.youtubeLinks
    : [];

  // פונקציה לחילוץ מזהה הוידאו מ-URL של YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const whatsappLink = profile.whatsappLink || null;

  return (
    <div className="profile-page" dir="rtl">
      <button onClick={() => navigate(-1)} className="btn-back-top">← חזור</button>
      
      <div className="profile-container">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={`${firstname} ${lastname}`} />
            ) : (
              <div className="avatar-placeholder-large">
                {firstname?.[0]}{lastname?.[0]}
              </div>
            )}
          </div>
          <h1 className="profile-name">
            {firstname} {lastname}
            {profile.isActive && <span className="pro-badge"> PRO</span>}
          </h1>
          <div className="profile-location-main">
            <span className="icon">📍</span>
            <span>{location}</span>
          </div>
          <div style={{display:'flex',gap:12,justifyContent:'center',alignItems:'center',marginTop:8}}>
            {profile.experienceYears && (
              <div className="profile-experience-badge">
                <span>{profile.experienceYears} שנות ניסיון</span>
                <span className="icon">⭐</span>
              </div>
            )}
            {(profile.isSinger || instruments.some(i => i === 'זמר' || i === 'זמר/ת')) && (
              <div className="profile-singer-badge" title="זמר/ת">
                🎤 זמר/ת
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <section className="profile-section bio-section">
            <h2 className="section-title">אודות</h2>
            <p className="bio-text">{profile.bio}</p>
          </section>
        )}

        <div className="profile-grid">
          {instruments.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">כלי נגינה</h2>
              <div className="tags-list">
                {instruments.map((inst, idx) => (
                  <span key={idx} className="tag instrument-tag">{inst}</span>
                ))}
              </div>
            </section>
          )}

          {genres.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">סגנון מוזיקלי</h2>
              <div className="tags-list">
                {genres.map((genre, idx) => (
                  <span key={idx} className="tag genre-tag">{genre}</span>
                ))}
              </div>
            </section>
          )}

          {eventTypes.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">אירועים</h2>
              <div className="tags-list">
                {eventTypes.map((ev, idx) => (
                  <span key={idx} className="tag event-tag">{ev}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {(galleryImages.length > 0 || galleryVideos.length > 0 || youtubeLinks.length > 0) && (
          <section className="profile-section gallery-section">
            <h2 className="section-title">גלריה</h2>
            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <div key={`img-${idx}`} className="gallery-item">
                  <img src={img} alt={`תמונה ${idx + 1}`} />
                </div>
              ))}
              {galleryVideos.map((vid, idx) => (
                <div key={`vid-${idx}`} className="gallery-item video-item">
                  <video controls src={vid} />
                </div>
              ))}
              {youtubeLinks.map((link, idx) => {
                const videoId = getYouTubeVideoId(link);
                if (!videoId) return null;
                return (
                  <div key={`yt-${idx}`} className="gallery-item youtube-item">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={`סרטון YouTube ${idx + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="profile-section contact-section">
          <h2 className="section-title">יצירת קשר</h2>
          <div className="contact-actions">
            {phone && (
              <a href={`tel:${phone}`} className="btn-contact phone-btn">
                📞 {phone}
              </a>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact whatsapp-btn"
              >
                <img src="/whatsapp.png" alt="WhatsApp" className="icon-img" /> שלח הודעה בוואטסאפ
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="btn-contact email-btn">
                <img src="/gmail.png" alt="Email" className="icon-img" /> {email}
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
