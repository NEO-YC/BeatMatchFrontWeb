import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import api from '../../services/api'
import { eventsApi } from '../../services/api'
import "./Header.css"

function Header() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const loadUser = async () => {
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const displayName = userName || decoded.email?.split('@')[0] || 'משתמש'
        setUser({ 
          email: decoded.email, 
          userId: decoded.userId || decoded.id,
          displayName: displayName
        })
        setIsAdmin(decoded.role === 'admin')
        
        // Load profile picture and PRO status from database
        try {
          const profile = await api.getMyMusicianProfile()
          if (profile && profile.profilePicture) {
            setProfilePicture(profile.profilePicture)
          }
          setHasProfile(!!profile?.musicianProfile)
          if (profile && profile.musicianProfile && profile.musicianProfile.isActive) {
            setIsActive(true)
          } else {
            setIsActive(false)
          }
        } catch (err) {
          setHasProfile(false)
          setIsActive(false)
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        setUser(null)
        setIsAdmin(false)
        setProfilePicture(null)
        setIsActive(false)
      }
    } else {
      setUser(null)
      setIsAdmin(false)
      setProfilePicture(null)
      setHasProfile(false)
      setIsActive(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle mobile drawer body class
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('userName')
    setUser(null)
    setIsMenuOpen(false)
    window.dispatchEvent(new Event('storage'))
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true)
    setDeleteStep(1)
    setIsMenuOpen(false)
  }

  const confirmDelete = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }

    // Step 2 - actually delete
    try {
      await api.deleteAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('userName')
      setUser(null)
      setShowDeleteModal(false)
      setDeleteStep(1)
      window.dispatchEvent(new Event('storage'))
      navigate('/')
    } catch (error) {
      console.error('Delete error:', error)
      alert('שגיאה במחיקת החשבון: ' + (error.message || 'אנא נסה שוב'))
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteStep(1)
  }

  return (
    <div>
      {/* Mobile Menu Backdrop - Closes drawer when clicked */}
      {mobileMenuOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={(e) => {
            if (e.target.classList.contains('mobile-backdrop')) {
              setMobileMenuOpen(false);
              setIsMenuOpen(false);
            }
          }}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <header className={mobileMenuOpen ? 'mobile-menu-open' : ''}>
        <div className="header-content">
          <NavLink to="/" className="logo-section" onClick={() => setMobileMenuOpen(false)}>
            <img src="/BMproject.png" alt="BeatMatch" className="site-logo" />
            <h1>BeatMatch</h1>
          </NavLink>

          <button 
            className="burger-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="פתח תפריט"
          >
            <span />
            <span />
            <span />
          </button>

          {/* Desktop Navigation */}
          <div className="header-links">
            <NavLink 
              to="/events" 
              className={({isActive}) => `header-link${isActive ? ' active' : ''}`}
            >
              לוח אירועים
            </NavLink>
            <NavLink 
              to="/search" 
              className={({isActive}) => `header-link${isActive ? ' active' : ''}`}
            >
              <svg className="icon-svg" width="18" height="13" viewBox="0 0 24 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="search-label"> חיפוש</span>
            </NavLink>
            <NavLink 
              to="/" 
              className={({isActive}) => `header-link${isActive ? ' active' : ''}`}
            >
              דף הבית
            </NavLink>
          </div>

          {/* Desktop User Menu / Login */}
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="user-icon" />
                ) : (
                  <span className="user-icon">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="user-name">
                  {user.displayName}
                  {isActive && <span className="pro-badge-header">PRO</span>}
                </span>
                <span className={`arrow ${isMenuOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isMenuOpen && (
                <div className="dropdown-menu">
                  {hasProfile ? (
                    <NavLink 
                      to="/musician/edit" 
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="menu-icon">⚙</span>
                      ערוך פרופיל
                    </NavLink>
                  ) : (
                    <NavLink 
                      to="/musician/create" 
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="menu-icon">➕</span>
                      צור פרופיל מוזיקאי
                    </NavLink>
                  )}
                  <NavLink 
                    to="/my-events" 
                    className="menu-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="menu-icon">📅</span>
                    האירועים שלי
                  </NavLink>
                  {isAdmin && (
                    <>
                      <div className="menu-divider"></div>
                      <NavLink 
                        to="/admin" 
                        className="menu-item admin"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="menu-icon">👑</span>
                        לוח בקרה
                      </NavLink>
                    </>
                  )}
                  <div className="menu-divider"></div>
                  <button 
                    className="menu-item logout"
                    onClick={handleLogout}
                  >
                    <span className="menu-icon">→</span>
                    התנתק
                  </button>
                  <div className="menu-divider"></div>
                  <button 
                    className="menu-item delete"
                    onClick={handleDeleteAccount}
                  >
                    <span className="menu-icon">⚠</span>
                    מחק חשבון
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink 
              to="/login" 
              className="login-button"
            >
              התחבר / הירשם
            </NavLink>
          )}

          {/* Mobile Drawer */}
          <div className="right-actions">
            {user ? (
              <>
                {/* User Profile Section - Top of Drawer */}
                <div className="drawer-user-profile">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="drawer-user-avatar" />
                  ) : (
                    <div className="drawer-user-avatar">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="drawer-user-info">
                    <h3 className="drawer-user-name">
                      {user.displayName}
                      {isActive && <span className="pro-badge-header">PRO</span>}
                    </h3>
                    <p className="drawer-user-email">{user.email}</p>
                  </div>
                </div>

                {/* All Menu Items Combined */}
                <div className="drawer-menu-items">
                  <NavLink 
                    to="/" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🏠</span>
                    <span>דף הבית</span>
                  </NavLink>

                  <NavLink 
                    to="/search" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🔍</span>
                    <span>חיפוש מוזיקאים</span>
                  </NavLink>

                  <NavLink 
                    to="/events" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🎉</span>
                    <span>לוח אירועים</span>
                  </NavLink>

                  {hasProfile ? (
                    <NavLink 
                      to="/musician/edit" 
                      className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="menu-icon">⚙</span>
                      <span>ערוך פרופיל</span>
                    </NavLink>
                  ) : (
                    <NavLink 
                      to="/musician/create" 
                      className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="menu-icon">➕</span>
                      <span>צור פרופיל מוזיקאי</span>
                    </NavLink>
                  )}

                  <NavLink 
                    to="/my-events" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">📅</span>
                    <span>האירועים שלי</span>
                  </NavLink>

                  {isAdmin && (
                    <NavLink 
                      to="/admin" 
                      className={({isActive}) => `drawer-menu-item admin${isActive ? ' active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="menu-icon">👑</span>
                      <span>לוח בקרה</span>
                    </NavLink>
                  )}

                  <button 
                    className="drawer-menu-item logout"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="menu-icon">🚪</span>
                    <span>התנתק</span>
                  </button>

                  <button 
                    className="drawer-menu-item delete"
                    onClick={() => {
                      handleDeleteAccount();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="menu-icon">⚠</span>
                    <span>מחק חשבון</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Logged In - Show Login Button at Top */}
                <div className="drawer-login-section">
                  <NavLink 
                    to="/login" 
                    className="drawer-login-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="login-icon">🎵</span>
                    <div>
                      <div className="login-title">התחבר / הירשם</div>
                      <div className="login-subtitle">הצטרף לקהילת המוזיקאים</div>
                    </div>
                  </NavLink>
                </div>

                {/* Navigation Links for Non-Logged Users */}
                <div className="drawer-menu-items">
                  <NavLink 
                    to="/" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🏠</span>
                    <span>דף הבית</span>
                  </NavLink>

                  <NavLink 
                    to="/search" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🔍</span>
                    <span>חיפוש מוזיקאים</span>
                  </NavLink>

                  <NavLink 
                    to="/events" 
                    className={({isActive}) => `drawer-menu-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="menu-icon">🎉</span>
                    <span>לוח אירועים</span>
                  </NavLink>
                </div>
              </>
            )}

            <div className="drawer-footer">
              <p className="drawer-footer-text">BeatMatch © 2025</p>
              <p className="drawer-footer-text">הפלטפורמה המובילה למוזיקאים ומארגני אירועים </p>
            </div>
          </div>
        </div>
      </header>
      {/* Removed bottom nav; Home and Search are now in header */}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon-warning">⚠</div>
              <h2>{deleteStep === 1 ? 'מחיקת חשבון' : 'אישור אחרון'}</h2>
            </div>
            
            <div className="delete-modal-body">
              {deleteStep === 1 ? (
                <>
                  <p className="delete-warning-text">
                    האם אתה בטוח שברצונך למחוק את החשבון שלך?
                  </p>
                  <ul className="delete-consequences">
                    <li>כל הנתונים האישיים שלך יימחקו</li>
                    <li>פרופיל המוזיקאי שלך יוסר</li>
                    <li>כל התמונות והסרטונים יימחקו</li>
                    <li className="delete-critical">פעולה זו אינה ניתנת לביטול!</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="delete-final-warning">
                    זה הצעד האחרון. כל הנתונים שלך יימחקו לצמיתות.
                  </p>
                  <p className="delete-confirm-text">
                    לחץ על "מחק את החשבון" כדי לאשר.
                  </p>
                </>
              )}
            </div>
            
            <div className="delete-modal-footer">
              <button className="delete-cancel-btn" onClick={cancelDelete}>
                ביטול
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                {deleteStep === 1 ? 'המשך' : 'מחק את החשבון'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header