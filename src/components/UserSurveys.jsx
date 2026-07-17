import React, { useState, useEffect, useRef } from 'react';

export default function UserSurveys({ setSelectedSurveyId, setCurrentView }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDetailsSurvey, setActiveDetailsSurvey] = useState(null);
  const surveysRef = useRef(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/surveys');
      if (!response.ok) throw new Error('Failed to fetch surveys');
      const data = await response.json();

      const surveysWithCount = [];
      for (const survey of data) {
        try {
          const qRes = await fetch(`http://localhost:8080/api/surveys/${survey.id}/questions`);
          const qData = await qRes.json();
          surveysWithCount.push({ ...survey, questionCount: qData.length });
        } catch {
          surveysWithCount.push({ ...survey, questionCount: 0 });
        }
      }
      setSurveys(surveysWithCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = (id) => {
    setSelectedSurveyId(id);
    setActiveDetailsSurvey(null);
    setCurrentView('survey-form');
  };

  const scrollToSurveys = () => {
    surveysRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="user-landing">

      {/* ── HERO ────────────────────────────────── */}
      <section className="hero-section" id="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow">Where responses are valued</span>

            <h1 className="hero-title">
              Share your opinion.<br />
              <em>Shape</em> what comes next.
            </h1>

            <p className="hero-subtitle">
              Quick, anonymous surveys — no tracking, no noise.
              Just your honest take, handled with care.
            </p>

            <div className="hero-actions">
              <button
                id="hero-browse-btn"
                className="btn btn-primary btn--lg"
                onClick={scrollToSurveys}
              >
                Browse Surveys ↓
              </button>
              <a href="#about" className="btn btn-secondary btn--lg btn-pill">
                Why participate?
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat__value">{loading ? '—' : surveys.length}</span>
                <span className="hero-stat__label">Open Surveys</span>
              </div>
              <div className="hero-stats__divider" />
              <div className="hero-stat">
                <span className="hero-stat__value">100%</span>
                <span className="hero-stat__label">Anonymous</span>
              </div>
              <div className="hero-stats__divider" />
              <div className="hero-stat">
                <span className="hero-stat__value">~2 min</span>
                <span className="hero-stat__label">Avg. Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SURVEYS ─────────────────────────────── */}
      <section className="surveys-section" id="surveys" ref={surveysRef}>
        <div className="container">
          <div className="section-header">
            <h4>Available Now</h4>
            <h2>Open Surveys</h2>
            <p className="section-desc">
              Pick one below. Your answers go in, anonymous and unchanged.
            </p>
          </div>

          {loading ? (
            <div className="loader" aria-label="Loading surveys" />
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠</div>
              <p>{error}</p>
              <button className="btn btn-secondary mt-3" onClick={fetchSurveys}>Try again</button>
            </div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No surveys are open right now. Come back soon.</p>
            </div>
          ) : (
            <div className="survey-grid">
              {surveys.map((survey) => (
                <article
                  key={survey.id}
                  id={`survey-card-${survey.id}`}
                  className="survey-card"
                  onClick={() => setActiveDetailsSurvey(survey)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setActiveDetailsSurvey(survey)}
                  aria-label={`Open details for ${survey.title}`}
                >
                  <div className="card-tag">
                    <span className="tag">
                      {survey.questionCount} {survey.questionCount === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  <h3 className="card-title">{survey.title}</h3>
                  <p className="card-desc">
                    {survey.description || 'No description provided.'}
                  </p>
                  <div className="card-footer">
                    <span className="card-date">
                      {new Date(survey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="card-arrow">→</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────── */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-header">
            <h4>Why bother?</h4>
            <h2>This is what we promise.</h2>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-card__num">01</div>
              <h3 className="about-card__title">Anonymous & Private</h3>
              <p className="about-card__text">
                Your identity stays out of it. We collect only what you choose to share — no tracking, no profiles built quietly in the background.
              </p>
            </div>
            <div className="about-card">
              <div className="about-card__num">02</div>
              <h3 className="about-card__title">Quick & Purposeful</h3>
              <p className="about-card__text">
                Most surveys land under two minutes. Each question has a reason for being there — nothing filler, nothing repetitive.
              </p>
            </div>
            <div className="about-card">
              <div className="about-card__num">03</div>
              <h3 className="about-card__title">Securely Handled</h3>
              <p className="about-card__text">
                All data travels over an encrypted connection and sits behind responsible access controls. Your feedback doesn't become someone else's product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/Survey.jpeg" className="logo-icon" alt="" />
                SurveyPulse
              </div>
              <p className="footer-tagline">
                Honest feedback, handled with respect.
              </p>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-links__title">Navigate</h4>
              <button className="footer-link" onClick={scrollToSurveys}>Open Surveys</button>
              <a className="footer-link" href="#about">Our Promise</a>
              <a className="footer-link" href="#hero">Back to top ↑</a>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-links__title">Legal</h4>
              <span className="footer-link">Privacy Policy</span>
              <span className="footer-link">Terms of Use</span>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} SurveyPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ── SURVEY DETAILS MODAL ─────────────────── */}
      {activeDetailsSurvey && (
        <div
          className="modal-overlay"
          onClick={() => setActiveDetailsSurvey(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Survey details"
        >
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeDetailsSurvey.title}</h3>
              <button
                id="modal-close-btn"
                className="modal-close"
                onClick={() => setActiveDetailsSurvey(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', whiteSpace: 'pre-wrap', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                {activeDetailsSurvey.description || 'No description provided.'}
              </p>

              <div className="d-flex gap-4" style={{ borderTop: 'var(--border-faint)', paddingTop: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--ink-light)', marginBottom: '0.2rem' }}>
                    Questions
                  </div>
                  <strong style={{ fontSize: '1.1rem' }}>
                    {activeDetailsSurvey.questionCount}
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--ink-light)', marginBottom: '0.2rem' }}>
                    Created
                  </div>
                  <strong style={{ fontSize: '1.1rem' }}>
                    {new Date(activeDetailsSurvey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                id="modal-cancel-btn"
                className="btn btn-secondary"
                onClick={() => setActiveDetailsSurvey(null)}
              >
                Cancel
              </button>
              <button
                id="modal-start-btn"
                className="btn btn-primary"
                onClick={() => handleStartSurvey(activeDetailsSurvey.id)}
                disabled={activeDetailsSurvey.questionCount === 0}
              >
                {activeDetailsSurvey.questionCount === 0 ? 'No questions yet' : 'Start Survey →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
