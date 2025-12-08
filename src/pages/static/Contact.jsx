import React from "react";
import "./StaticPages.css";

export default function Contact() {
  return (
    <main className="page-wrap" dir="rtl">
      <h1 className="page-title">יצירת קשר</h1>
      <section className="page-card">
        <p className="page-text">נשמח לשמוע מכם לשאלות, הצעות ושיתופי פעולה.</p>

        <ul className="contact-list">
          <li className="contact-card">
            <div className="contact-name">נהוראי</div>
            <div className="contact-actions">
              <a className="btn-link" href="tel:0545256080" aria-label="חייג לנהוראי">
                📞 054-5256080
              </a>
              <a
                className="btn-link"
                href="https://wa.me/0545256080"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="שלח הודעת וואטסאפ לנהוראי"
              >
                <img src="/whatsapp.png" alt="WhatsApp" className="icon-img" /> וואטסאפ
              </a>
            </div>
          </li>
          <li className="contact-card">
            <div className="contact-name">דניאל</div>
            <div className="contact-actions">
              <a className="btn-link" href="tel:0584240899" aria-label="חייג לדניאל">
                📞 058-4240899
              </a>
              <a
                className="btn-link"
                href="https://wa.me/0584240899"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="שלח הודעת וואטסאפ לדניאל"
              >
                <img src="/whatsapp.png" alt="WhatsApp" className="icon-img" /> וואטסאפ
              </a>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
