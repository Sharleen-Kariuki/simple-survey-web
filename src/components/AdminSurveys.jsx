import React, { useState, useEffect } from 'react';

export default function AdminSurveys({ authInfo, setSelectedSurveyId, setCurrentView }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentSurvey, setCurrentSurvey] = useState({ id: '', title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = 'http://localhost:8080/api/surveys';

  useEffect(() => { fetchSurveys(); }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch surveys');
      setSurveys(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCurrentSurvey({ id: '', title: '', description: '' });
    setModalMode('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (survey) => {
    setCurrentSurvey({ id: survey.id, title: survey.title, description: survey.description || '' });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this survey? All questions and responses will be permanently removed.')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!response.ok) throw new Error('Failed to delete survey');
      setSurveys(surveys.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentSurvey.title.trim()) return;
    setSubmitting(true);
    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const url = modalMode === 'create' ? API_URL : `${API_URL}/${currentSurvey.id}`;
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authInfo.token}`
        },
        body: JSON.stringify({ title: currentSurvey.title.trim(), description: currentSurvey.description.trim() })
      });
      if (!response.ok) throw new Error('Failed to save survey');
      const saved = await response.json();
      setSurveys(modalMode === 'create' ? [saved, ...surveys] : surveys.map(s => s.id === saved.id ? saved : s));
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authInfo.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updated = await response.json();
      setSurveys(surveys.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      {/* Personalized Welcome & Quick Stats */}
      <div className="admin-welcome-section" style={{
        background: 'linear-gradient(135deg, rgba(200, 122, 83, 0.08) 0%, rgba(26, 26, 31, 0.02) 100%)',
        border: '1px solid rgba(200, 122, 83, 0.15)',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
            Hello, {authInfo?.user?.username || 'Admin'}! 👋
          </h1>
          <p style={{ margin: '0.4rem 0 0 0', color: 'var(--ink-light)', fontSize: '0.95rem' }}>
            Welcome to your personalized workspace. Here is a quick overview of your surveys.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--terra)' }}>
              {surveys.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Surveys
            </span>
          </div>
          <div style={{ width: '1px', background: 'rgba(26, 26, 31, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--ink)' }}>
              {surveys.filter(s => s.status !== 'closed').length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active
            </span>
          </div>
          <div style={{ width: '1px', background: 'rgba(26, 26, 31, 0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--ink-faint)' }}>
              {surveys.filter(s => s.status === 'closed').length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Archived
            </span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Manage Surveys</h2>
          <p>Create, edit, or archive your surveys. Click a row's actions to manage questions and review responses.</p>
        </div>
        <button id="create-survey-btn" className="btn btn-primary" onClick={handleOpenCreate}>
          + New Survey
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader" aria-label="Loading surveys" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠</div>
          <p>{error}</p>
          <button className="btn btn-secondary mt-3" onClick={fetchSurveys}>Retry</button>
        </div>
      ) : surveys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>Nothing here yet. Create your first survey to get started.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Survey Details</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: '380px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(survey => (
                <tr key={survey.id} id={`survey-row-${survey.id}`}>
                  <td>
                    <span className="admin-table id-cell">#{survey.id}</span>
                  </td>
                  <td>
                    <div className="admin-table title-cell">{survey.title}</div>
                    <div className="admin-table desc-cell">
                      {survey.description ? survey.description : <em style={{ color: 'var(--ink-faint)' }}>No description</em>}
                    </div>
                  </td>
                  <td>
                    <span className="tag-ink" style={{ 
                      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', 
                      padding: '0.18rem 0.6rem', borderRadius: '999px', 
                      background: survey.status === 'closed' ? 'rgba(26,26,31,0.07)' : 'rgba(200,122,83,0.1)', 
                      color: survey.status === 'closed' ? 'var(--ink-light)' : 'var(--terra)',
                      border: survey.status === 'closed' ? '1px solid rgba(26,26,31,0.18)' : '1px solid rgba(200,122,83,0.3)'
                    }}>
                      {survey.status || 'open'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
                    {new Date(survey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        id={`status-survey-${survey.id}`}
                        className="action-btn-sm"
                        style={{ border: 'var(--border-faint)' }}
                        onClick={() => handleToggleStatus(survey.id, survey.status || 'open')}
                      >
                        {survey.status === 'closed' ? 'Re-open' : 'Close'}
                      </button>
                      <button
                        id={`edit-survey-${survey.id}`}
                        className="action-btn-sm"
                        onClick={() => handleOpenEdit(survey)}
                      >
                        Edit
                      </button>
                      <button
                        id={`questions-survey-${survey.id}`}
                        className="action-btn-sm responses"
                        onClick={() => { setSelectedSurveyId(survey.id); setCurrentView('question-mgmt'); }}
                      >
                        Questions
                      </button>
                      <button
                        id={`responses-survey-${survey.id}`}
                        className="action-btn-sm responses"
                        onClick={() => { setSelectedSurveyId(survey.id); setCurrentView('responses-mgmt'); }}
                      >
                        Responses
                      </button>
                      <button
                        id={`delete-survey-${survey.id}`}
                        className="action-btn-sm delete"
                        onClick={() => handleDelete(survey.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'New Survey' : 'Edit Survey'}</h3>
              <button id="modal-close" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="survey-title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="survey-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Q3 Employee Satisfaction"
                    value={currentSurvey.title}
                    onChange={e => setCurrentSurvey({ ...currentSurvey, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="survey-desc">Description</label>
                  <textarea
                    id="survey-desc"
                    className="form-control"
                    rows={4}
                    placeholder="What is this survey trying to learn?"
                    value={currentSurvey.description}
                    onChange={e => setCurrentSurvey({ ...currentSurvey, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  id="modal-cancel"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  id="modal-save"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Save Survey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
