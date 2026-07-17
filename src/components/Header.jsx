import React from 'react';

export default function Header({ isAdminView, setIsAdminView, currentView, setCurrentView, authInfo, setAuthInfo }) {
  const goHome = () => {
    setIsAdminView(false);
    setCurrentView('available-surveys');
  };

  const handleLogout = () => {
    setAuthInfo(null);
    setCurrentView('login');
  };

  return (
    <header className="app-header">
      {/* Brand */}
      <button className="logo" onClick={goHome} aria-label="Go to homepage">
        <img src="/Survey.jpeg" className="logo-icon" alt="SurveyPulse logo" />
        SurveyPulse
      </button>

      <div className="nav-controls">
        {/* Admin nav links */}
        {isAdminView && authInfo && (
          <nav className="nav-links" aria-label="Admin navigation">
            {authInfo.user.role === 'superadmin' && (
              <span
                id="nav-dashboard"
                className={`nav-link${currentView === 'superadmin-dashboard' ? ' active' : ''}`}
                onClick={() => setCurrentView('superadmin-dashboard')}
                role="button"
                tabIndex={0}
              >
                Dashboard
              </span>
            )}
            
            {/* Both roles can see these if we allow superadmin to view, but user explicitly said superadmin just sees stats, not surveys/questions. Wait. User said: "just the platform stats." So superadmin only sees dashboard. */}
            {authInfo.user.role === 'admin' && (
              <>
                <span
                  id="nav-surveys"
                  className={`nav-link${currentView === 'survey-mgmt' ? ' active' : ''}`}
                  onClick={() => setCurrentView('survey-mgmt')}
                  role="button"
                  tabIndex={0}
                >
                  Surveys
                </span>
                <span
                  id="nav-questions"
                  className={`nav-link${currentView === 'question-mgmt' ? ' active' : ''}`}
                  onClick={() => setCurrentView('question-mgmt')}
                  role="button"
                  tabIndex={0}
                >
                  Questions
                </span>
                <span
                  id="nav-responses"
                  className={`nav-link${currentView === 'responses-mgmt' ? ' active' : ''}`}
                  onClick={() => setCurrentView('responses-mgmt')}
                  role="button"
                  tabIndex={0}
                >
                  Responses
                </span>
              </>
            )}
          </nav>
        )}

        {/* Auth / Mode switcher */}
        <div className="view-switcher" role="group" aria-label="Switch view mode">
          <button
            id="switcher-user"
            className={`switcher-btn${!isAdminView ? ' active' : ''}`}
            onClick={() => { setIsAdminView(false); setCurrentView('available-surveys'); }}
          >
            User View
          </button>
          
          <button
            id="switcher-admin"
            className={`switcher-btn${isAdminView ? ' active' : ''}`}
            onClick={() => { 
              setIsAdminView(true); 
              if (!authInfo) setCurrentView('login');
              else if (authInfo.user.role === 'superadmin') setCurrentView('superadmin-dashboard');
              else setCurrentView('survey-mgmt');
            }}
          >
            Admin Panel
          </button>
        </div>

        {/* Logout Button */}
        {isAdminView && authInfo && (
          <button className="btn btn-secondary btn--sm" style={{ marginLeft: '0.5rem' }} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
