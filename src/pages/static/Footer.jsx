import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" dir="rtl">
      <div className="footer-content simple">
        <div className="footer-bar">
          <div className="brand">BeatMatch</div>
          <nav className="footer-nav">
            <NavLink to="/about" className="footer-link">אודות</NavLink>
            <span className="dot" aria-hidden>•</span>
            <NavLink to="/contact" className="footer-link">יצירת קשר</NavLink>
          </nav>
          <div className="social-container">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="Facebook" aria-label="Facebook">
              <img src="/facebook.png" alt="Facebook" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram" aria-label="Instagram">
              <img src="/instagram.png" alt="Instagram" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="TikTok" aria-label="TikTok">
              <img src="/tiktok.png" alt="TikTok" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="YouTube" aria-label="YouTube">
              <img src="/youtube.png" alt="YouTube" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="Twitter" aria-label="Twitter">
              <img src="/twitter.png" alt="Twitter" />
            </a>
          </div>
          <div className="copy">© {year}</div>
        </div>
      </div>
    </footer>
  );
}
