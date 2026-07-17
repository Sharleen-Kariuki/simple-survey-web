import React, { useState, useEffect } from 'react';

export default function AdminResponses({ authInfo, selectedSurveyId, setSelectedSurveyId }) {
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 5 });
  const [emailQuery, setEmailQuery] = useState('');

  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSurveys(); }, []);
  useEffect(() => {
    if (selectedSurveyId) {
      const delayDebounceFn = setTimeout(() => {
        fetchResponses(selectedSurveyId, 1, emailQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setResponses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurveyId, emailQuery]);

  const fetchSurveys = async () => {
    setLoadingSurveys(true);
    try {
      const res = await fetch('http://localhost:8080/api/surveys', {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch surveys');
      const data = await res.json();
      setSurveys(data);
      if (data.length > 0 && !selectedSurveyId) setSelectedSurveyId(data[0].id);
    } catch (err) { setError(err.message); }
    finally { setLoadingSurveys(false); }
  };

  const fetchResponses = async (surveyId, page, searchEmail = '') => {
    if (!surveyId) return;
    setLoadingResponses(true);
    try {
      let url = `http://localhost:8080/api/surveys/${surveyId}/responses?page=${page}&limit=5`;
      if (searchEmail.trim()) {
        url += `&email=${encodeURIComponent(searchEmail.trim())}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch responses');
      const data = await res.json();
      setResponses(data.responses || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1, limit: 5 });
    } catch (err) { setError(err.message); }
    finally { setLoadingResponses(false); }
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.totalPages) fetchResponses(selectedSurveyId, p, emailQuery);
  };

  const getCleanFileName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split('-');
    return parts.length > 2 ? parts.slice(2).join('-') : fullName;
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Responses</h2>
          <p>Browse submitted answers and download uploaded certificates.</p>
        </div>
      </div>

      {/* Survey selector & Filter */}
      <div className="survey-selector-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '250px' }}>
          <label htmlFor="responses-survey-select">Survey:</label>
          {loadingSurveys ? (
            <span style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Loading…</span>
          ) : (
            <select
              id="responses-survey-select"
              className="form-control"
              value={selectedSurveyId || ''}
              onChange={e => setSelectedSurveyId(e.target.value)}
              style={{ flex: '1', maxWidth: '320px' }}
            >
              <option value="" disabled>— Select a survey —</option>
              {surveys.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '250px', justifyContent: 'flex-end' }}>
          <label htmlFor="responses-email-search">Filter by Email:</label>
          <input
            id="responses-email-search"
            type="text"
            className="form-control"
            placeholder="Search email address…"
            value={emailQuery}
            onChange={e => setEmailQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '320px' }}
          />
        </div>
      </div>
      {/* Content */}
      {!selectedSurveyId ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Select a survey above to see its responses.</p>
        </div>
      ) : loadingResponses ? (
        <div className="loader" aria-label="Loading responses" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠</div>
          <p>{error}</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No responses match your criteria yet.</p>
        </div>
      ) : (
        <>
          {/* Stats line */}
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginBottom: '1.25rem', fontWeight: 500 }}>
            Showing {responses.length} of {pagination.total} response{pagination.total !== 1 ? 's' : ''}
          </p>

          {/* Responses table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Respondent</th>
                  <th>Answers</th>
                </tr>
              </thead>
              <tbody>
                {responses.map(resp => (
                  <tr key={resp.id} id={`response-row-${resp.id}`}>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.2rem', wordBreak: 'break-all', fontSize: '0.9rem' }} title={resp.email}>
                        {resp.email.length === 64 && !resp.email.includes('@')
                          ? `Anon ID: ${resp.email.substring(0, 12)}...`
                          : resp.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', fontFamily: 'monospace' }}>
                        #{resp.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
                        {new Date(resp.submitted_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td>
                      <div style={{ padding: '0.25rem 0' }}>
                        {(resp.answers || []).map((ans, idx) => {
                          let displayValue;

                          if (ans.question_type === 'multiple-choice') {
                            displayValue = ans.answer_choices && ans.answer_choices.length > 0
                              ? ans.answer_choices.join(', ')
                              : <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Not answered</span>;
                          } else if (ans.question_type === 'certificate-upload') {
                            displayValue = ans.answer_text
                              ? (
                                <a
                                  href={`http://localhost:8080/api/responses/download/${ans.answer_text}`}
                                  className="download-link"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  📥 {getCleanFileName(ans.answer_text)}
                                </a>
                              )
                              : <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>No file uploaded</span>;
                          } else {
                            displayValue = ans.answer_text
                              ? ans.answer_text
                              : <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Not answered</span>;
                          }

                          return (
                            <div key={idx} className="answer-block">
                              <div className="answer-q">{ans.question_text}</div>
                              <div className="answer-v">{displayValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                id="page-prev"
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-light)' }}>
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
              </span>
              <button
                id="page-next"
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
