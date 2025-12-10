import React, { useState, useEffect, useMemo } from "react";
import "./Search.css";
import MusicianCard from "./musician/MusicianCard";
import { API_BASE_URL } from "../services/api";

const SUGGESTED_INSTRUMENTS = [
  "זמר",
  "גיטרה אקוסטית",
  "גיטרה חשמלית",
  "גיטרה בס",
  "פסנתר",
  "קלידים / אורגן",
  "כינור",
  "תופים",
  "דרבוקה",
  "קחון",
  "טמבורין",
  "בונגו",
  "קונגה",
  "תופי מרים",
  "סקסופון",
  "קלרינט",
  "חצוצרה",
  "טרומבון",
  "חליל צד",
  "חליל ערבי (ניי)",
  "עוד",
  "בוזוקי",
  "קאנון",
  "די.ג'יי"
];
// סדר סגנונות לפי נפוצות כדי שהממשק יציג תחילה את הפופולריים
const SUGGESTED_GENRES = [
  "פופ",
  "רוק",
  "ישראלי",
  "ים תיכוני",
  "אלקטרוני",
  "אינדי",
  "ג" + "'" + "אז",
  "עממי",
  "מזרחי",
  "פיוטים",
  "חסידי",
  "דתי לאומי"
];
const SUGGESTED_EVENTS = [
  "חתונה",
  "בר מצווה",
  "שבת חתן",
  "ברית",
  "אירוע אירוסין",
  "יום הולדת",
  "חינה",
  "אירוע משפחתי",
  "אירוע חברה",
  "טקס / כנס",
  "מופע קהילתי",
  "קבלת פנים",
  "חפלה",
  "שירה בציבור",
  "הופעה חיה"
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [instrumentInput, setInstrumentInput] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [region, setRegion] = useState("");

  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [events, setEvents] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const instrumentSuggestions = useMemo(
    () =>
      SUGGESTED_INSTRUMENTS.filter(
        (i) =>
          i.toLowerCase().includes(instrumentInput.toLowerCase()) &&
          !instruments.includes(i)
      ),
    [instrumentInput, instruments]
  );

  const genreSuggestions = useMemo(
    () =>
      SUGGESTED_GENRES.filter(
        (g) =>
          g.toLowerCase().includes(genreInput.toLowerCase()) &&
          !genres.includes(g)
      ),
    [genreInput, genres]
  );

  const eventSuggestions = useMemo(
    () =>
      SUGGESTED_EVENTS.filter(
        (e) =>
          e.toLowerCase().includes(eventInput.toLowerCase()) &&
          !events.includes(e)
      ),
    [eventInput, events]
  );

  function addTag(setter, value) {
    if (!value) return;
    setter((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }

  function removeTag(setter, value) {
    setter((prev) => prev.filter((v) => v !== value));
  }

  async function doSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (instruments.length)
        instruments.forEach((i) => params.append("instrument", i));
      if (genres.length) genres.forEach((g) => params.append("musictype", g));
      if (events.length)
        events.forEach((ev) => params.append("eventTypes", ev));
      if (region) params.append("region", region);
      else if (locationInput) params.append("location", locationInput);
      if (query) params.append("q", query);

      const url = `${API_BASE_URL}/user/musicians/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.musicians || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    doSearch();
  }, []);

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="search-page">
      {/* Hero Section */}
      <section className="search-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-icon"> 🎵 </span>
            <span> </span>
            מצא את המוזיקאי המושלם לאירוע שלך
          </h1>
          <p className="hero-subtitle">חפש בין אלפי מוזיקאים מקצועיים בישראל</p>
        </div>
      </section>

      <section className="search-panel">
        <form className="search-form" onSubmit={doSearch}>
          {/* Main Search Bar */}
          <div className="main-search-row">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="input-large"
                placeholder="חפש לפי שם, כלי נגינה או סגנון מוזיקלי..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="region-select-wrapper">
              <span className="region-icon">📍</span>
              <select
                className="input-medium"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">כל הארץ</option>
                <option value="north">צפון</option>
                <option value="center">מרכז</option>
                <option value="south">דרום</option>
              </select>
            </div>

            <button className="btn-primary" type="submit">
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <>
                  <span>חפש</span>
                  <span className="btn-arrow">←</span>
                </>
              )}
            </button>
          </div>

          {/* Active Filters Summary */}
          {(instruments.length > 0 ||
            genres.length > 0 ||
            events.length > 0 ||
            region) && (
            <div className="active-filters">
              <div className="active-filters-content">
                <span className="active-label">פילטרים פעילים:</span>
                {instruments.length > 0 && (
                  <div className="filter-group">
                    <span className="filter-icon">🎸</span>
                    {instruments.map((i) => (
                      <span className="active-chip" key={i}>
                        {i}
                        <button
                          type="button"
                          onClick={() => removeTag(setInstruments, i)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {genres.length > 0 && (
                  <div className="filter-group">
                    <span className="filter-icon">🎼</span>
                    {genres.map((g) => (
                      <span className="active-chip" key={g}>
                        {g}
                        <button
                          type="button"
                          onClick={() => removeTag(setGenres, g)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {events.length > 0 && (
                  <div className="filter-group">
                    <span className="filter-icon">🎉</span>
                    {events.map((ev) => (
                      <span className="active-chip" key={ev}>
                        {ev}
                        <button
                          type="button"
                          onClick={() => removeTag(setEvents, ev)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {region && (
                  <div className="filter-group">
                    <span className="active-chip">
                      {region === "north"
                        ? "צפון"
                        : region === "center"
                        ? "מרכז"
                        : "דרום"}
                      <button type="button" onClick={() => setRegion("")}>
                        ×
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters Toggle */}
          <div className="filters-toggle">
            <button
              type="button"
              className={`btn-filters ${filtersOpen ? "active" : ""}`}
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              <span className="filter-toggle-icon">
                {filtersOpen ? "▼" : "▶"}
              </span>
              <span>פילטרים מתקדמים</span>
              <span className="filters-badge">
                {instruments.length + genres.length + events.length}
              </span>
            </button>
          </div>

          {/* Advanced Filters */}
          <div className={`filters ${filtersOpen ? "open" : "closed"}`}>
            <div className="filters-grid">
              {/* כלי נגינה - שמאל */}
              <div className="filter-block">
                <label className="filter-label">
                  <span className="label-icon">🎸</span>
                  <span>כלי נגינה</span>
                </label>
                <div className="chips">
                  {instruments.map((i) => (
                    <span className="chip chip-selected" key={i}>
                      <button
                        type="button"
                        onClick={() => removeTag(setInstruments, i)}
                      >
                        ×
                      </button>
                      {i}
                    </span>
                  ))}
                </div>
                <div className="quick-filters">
                  {SUGGESTED_INSTRUMENTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`quick-filter-btn ${
                        instruments.includes(s) ? "active" : ""
                      }`}
                      onClick={() => {
                        if (instruments.includes(s)) {
                          removeTag(setInstruments, s);
                        } else {
                          addTag(setInstruments, s);
                        }
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* סוגי אירועים - ימין */}
              <div className="filter-block">
                <label className="filter-label">
                  <span className="label-icon">🎉</span>
                  <span>סוגי אירועים</span>
                </label>
                <div className="chips">
                  {events.map((ev) => (
                    <span className="chip chip-selected" key={ev}>
                      <button
                        type="button"
                        onClick={() => removeTag(setEvents, ev)}
                      >
                        ×
                      </button>
                      {ev}
                    </span>
                  ))}
                </div>
                <div className="quick-filters">
                  {SUGGESTED_EVENTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`quick-filter-btn ${
                        events.includes(s) ? "active" : ""
                      }`}
                      onClick={() => {
                        if (events.includes(s)) {
                          removeTag(setEvents, s);
                        } else {
                          addTag(setEvents, s);
                        }
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* סגנון מוזיקלי - מרכז למטה */}
              <div className="filter-block">
                <label className="filter-label">
                  <span className="label-icon">🎼</span>
                  <span>סגנון מוזיקלי</span>
                </label>
                <div className="chips">
                  {genres.map((g) => (
                    <span className="chip chip-selected" key={g}>
                      <button
                        type="button"
                        onClick={() => removeTag(setGenres, g)}
                      >
                        ×
                      </button>
                      {g}
                    </span>
                  ))}
                </div>
                <div className="quick-filters">
                  {SUGGESTED_GENRES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`quick-filter-btn ${
                        genres.includes(s) ? "active" : ""
                      }`}
                      onClick={() => {
                        if (genres.includes(s)) {
                          removeTag(setGenres, s);
                        } else {
                          addTag(setGenres, s);
                        }
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Results Section */}
      <section className="results">
        <div className="results-header">
          <h3>
            <span className="results-icon">🎭</span>
            תוצאות החיפוש
          </h3>
          <div className="results-meta">
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                טוען...
              </span>
            ) : (
              <span className="results-count">
                נמצאו <strong>{results.length}</strong> מוזיקאים
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            <div>
              <h4>אירעה שגיאה בחיפוש</h4>
              <p>נסה שוב מאוחר יותר או שנה את קריטריוני החיפוש</p>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>לא נמצאו תוצאות</h3>
            <p>לא נמצאו מוזיקאים התואמים לקריטריונים שלך</p>
            <p className="empty-hint">
              נסה להרחיב את החיפוש או להסיר חלק מהפילטרים
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="cards">
            {results.map((r) => (
              <MusicianCard key={r._id} musician={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
