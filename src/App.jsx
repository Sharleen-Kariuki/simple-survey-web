import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserSurveys from './components/UserSurveys';
import SurveyForm from './components/SurveyForm';
import AdminSurveys from './components/AdminSurveys';
import AdminQuestions from './components/AdminQuestions';
import AdminResponses from './components/AdminResponses';
import Login from './components/Login';
import RequestAdmin from './components/RequestAdmin';
import SuperAdminDashboard from './components/SuperAdminDashboard';

function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentView, setCurrentView] = useState('available-surveys');
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [authInfo, setAuthInfo] = useState(() => {
    const saved = localStorage.getItem('authInfo');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (authInfo) {
      localStorage.setItem('authInfo', JSON.stringify(authInfo));
    } else {
      localStorage.removeItem('authInfo');
    }
  }, [authInfo]);

  const renderActiveView = () => {
    if (!isAdminView) {
      switch (currentView) {
        case 'available-surveys':
          return <UserSurveys setSelectedSurveyId={setSelectedSurveyId} setCurrentView={setCurrentView} />;
        case 'survey-form':
          return <SurveyForm surveyId={selectedSurveyId} setCurrentView={setCurrentView} />;
        default:
          return <UserSurveys setSelectedSurveyId={setSelectedSurveyId} setCurrentView={setCurrentView} />;
      }
    } else {
      // If Admin view but not logged in, enforce login/request routes
      if (!authInfo) {
        if (currentView === 'request-admin') {
          return <RequestAdmin setCurrentView={setCurrentView} />;
        }
        return <Login setAuthInfo={setAuthInfo} setCurrentView={setCurrentView} />;
      }

      // If SuperAdmin, they only see dashboard
      if (authInfo.user.role === 'superadmin') {
        return <SuperAdminDashboard authInfo={authInfo} />;
      }

      // If regular Admin, they see survey management
      switch (currentView) {
        case 'survey-mgmt':
          return <AdminSurveys authInfo={authInfo} setSelectedSurveyId={setSelectedSurveyId} setCurrentView={setCurrentView} />;
        case 'question-mgmt':
          return <AdminQuestions authInfo={authInfo} selectedSurveyId={selectedSurveyId} setSelectedSurveyId={setSelectedSurveyId} />;
        case 'responses-mgmt':
          return <AdminResponses authInfo={authInfo} selectedSurveyId={selectedSurveyId} setSelectedSurveyId={setSelectedSurveyId} />;
        default:
          return <AdminSurveys authInfo={authInfo} setSelectedSurveyId={setSelectedSurveyId} setCurrentView={setCurrentView} />;
      }
    }
  };

  return (
    <div className="app-container">
      <Header
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        currentView={currentView}
        setCurrentView={setCurrentView}
        authInfo={authInfo}
        setAuthInfo={setAuthInfo}
      />
      {!isAdminView && currentView === 'available-surveys' ? (
        <>{renderActiveView()}</>
      ) : (
        <main className="app-main">
          {renderActiveView()}
        </main>
      )}
    </div>
  );
}

export default App;
