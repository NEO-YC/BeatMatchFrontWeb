import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './MusicianProfile.css';
import api from '../../services/api';
import { reviewsApi } from '../../services/api';
import RatingStar from '../../components/RatingStar';
import ReviewCard from '../../components/ReviewCard';
import ReviewForm from '../../components/ReviewForm';

export default function MusicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [musician, setMusician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

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

  // טעינת ביקורות ודירוג ממוצע
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoadingReviews(true);
        const reviewsData = await reviewsApi.getReviewsForMusician(id, 10, 1, 'newest');

        setAverageRating(reviewsData.statistics?.averageRating || 0);
        setTotalReviews(reviewsData.statistics?.totalReviews || 0);
        setReviews(reviewsData.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    }

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // טעינת המשתמש הנוכחי
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        // ודא שיש userId (בתור id או userId)
        const userWithUserId = {
          ...decoded,
          userId: decoded.id || decoded.userId
        };
        console.log('Decoded token:', userWithUserId);
        setCurrentUser(userWithUserId);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  }, []);

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

  // טיפול בשליחת ביקורת חדשה
  const handleSubmitReview = async (reviewData) => {
    try {
      if (editingReview) {
        // עדכון ביקורת קיימת
        await reviewsApi.updateReview(editingReview._id, reviewData);
        alert('הביקורת עודכנה בהצלחה!');
      } else {
        // יצירת ביקורת חדשה
        await reviewsApi.createReview(reviewData);
        alert('ביקורת נשלחה בהצלחה!');
      }
      
      setShowReviewForm(false);
      setEditingReview(null);
      
      // טען את הביקורות שוב
      const reviewsData = await reviewsApi.getReviewsForMusician(id, 10, 1, 'newest');

      setAverageRating(reviewsData.statistics?.averageRating || 0);
      setTotalReviews(reviewsData.statistics?.totalReviews || 0);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.message || 'שגיאה בשליחת הביקורת');
    }
  };

  // טיפול בעריכת ביקורת
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // טיפול במחיקת ביקורת
  const handleDeleteReview = async (reviewId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הביקורת?')) {
      try {
        await reviewsApi.deleteReview(reviewId);
        
        // הסר מהרשימה
        setReviews(reviews.filter(r => r._id !== reviewId));
        setTotalReviews(totalReviews - 1);
        
        alert('ביקורת הוסרה');
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('שגיאה במחיקת הביקורת');
      }
    }
  };

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

        {/* Reviews Section */}
        <section className="profile-section reviews-section">
          <div className="reviews-header">
            <div>
              <h2 className="section-title">ביקורות וחוות דעת</h2>
              {totalReviews > 0 && (
                <div className="reviews-stats">
                  <div className="rating-display">
                    <RatingStar 
                      rating={Math.round(averageRating * 10) / 10}
                      size="medium"
                      interactive={false}
                      showText={true}
                      count={totalReviews}
                    />
                  </div>
                </div>
              )}
            </div>
            {currentUser && currentUser.userId !== musician.user._id && (
              <button 
                className="btn btn-primary-review"
                onClick={() => setShowReviewForm(true)}
              >
                כתוב ביקורת
              </button>
            )}
          </div>

          {totalReviews === 0 ? (
            <div className="no-reviews">
              <p>אין ביקורות עדיין. היה הראשון לכתוב!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {loadingReviews ? (
                <div className="loading-reviews">טוען ביקורות...</div>
              ) : (
                reviews.map(review => {
                  const isOwner = currentUser && currentUser.userId === (review.reviewerId?._id || review.reviewerId);
                  console.log('Review comparison:', {
                    currentUserId: currentUser?.userId,
                    reviewerId: review.reviewerId?._id || review.reviewerId,
                    isOwner,
                    currentUser
                  });
                  return (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      onDelete={handleDeleteReview}
                      onEdit={handleEditReview}
                      isOwner={isOwner}
                      isMusician={currentUser && currentUser.userId === musician.user._id}
                      isAdmin={currentUser && currentUser.role === 'admin'}
                    />
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          musicianId={id}
          editingReview={editingReview}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
}
