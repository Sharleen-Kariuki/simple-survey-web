import React, { useState, useEffect } from 'react';

export default function AdminQuestions({ authInfo, selectedSurveyId, setSelectedSurveyId }) {
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestionId, setCurrentQuestionId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);
  const [position, setPosition] = useState(0);
  const [options, setOptions] = useState([]);

  useEffect(() => { fetchSurveys(); }, []);

  useEffect(() => {
    if (selectedSurveyId) fetchQuestions(selectedSurveyId);
    else setQuestions([]);
  }, [selectedSurveyId]);

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

  const fetchQuestions = async (surveyId) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`http://localhost:8080/api/surveys/${surveyId}/questions`, {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      setQuestions(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoadingQuestions(false); }
  };

  const handleOpenAdd = () => {
    setCurrentQuestionId('');
    setQuestionText('');
    setQuestionType('text');
    setIsRequired(false);
    setPosition(questions.length + 1);
    setOptions(['Option 1']);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setCurrentQuestionId(q.id);
    setQuestionText(q.text);
    setQuestionType(q.type);
    setIsRequired(q.is_required);
    setPosition(q.position || 0);
    setOptions(q.options && q.options.length > 0 ? [...q.options] : ['Option 1']);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question? Any collected answers for it will be permanently removed.')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/questions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete question');
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleAddOption = () => setOptions([...options, `Option ${options.length + 1}`]);
  const handleRemoveOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const handleOptionChange = (i, val) => { const o = [...options]; o[i] = val; setOptions(o); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const filteredOptions = ['single-choice', 'multiple-choice'].includes(questionType)
      ? options.map(o => o.trim()).filter(o => o !== '')
      : [];

    if (['single-choice', 'multiple-choice'].includes(questionType) && filteredOptions.length === 0) {
      alert('Choice questions need at least one option.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        text: questionText.trim(),
        type: questionType,
        is_required: isRequired,
        position: parseInt(position) || 0,
        options: filteredOptions
      };

      let response;
      if (modalMode === 'add') {
        response = await fetch(`http://localhost:8080/api/surveys/${selectedSurveyId}/questions`, {
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authInfo.token}`
          }, 
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`http://localhost:8080/api/questions/${currentQuestionId}`, {
          method: 'PUT', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authInfo.token}`
          }, 
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) throw new Error('Failed to save question');
      fetchQuestions(selectedSurveyId);
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const movePosition = async (q, direction) => {
    const idx = questions.findIndex(item => item.id === q.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const targetQ = questions[targetIdx];

    try {
      await Promise.all([
        fetch(`http://localhost:8080/api/questions/${q.id}`, {
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authInfo.token}` },
          body: JSON.stringify({ text: q.text, type: q.type, is_required: q.is_required, position: targetQ.position || 0, options: q.options })
        }),
        fetch(`http://localhost:8080/api/questions/${targetQ.id}`, {
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authInfo.token}` },
          body: JSON.stringify({ text: targetQ.text, type: targetQ.type, is_required: targetQ.is_required, position: q.position || 0, options: targetQ.options })
        })
      ]);
      fetchQuestions(selectedSurveyId);
    } catch {
      alert('Failed to update ordering.');
    }
  };

  const typeBadgeClass = (type) => {
    if (type === 'single-choice') return 'q-type-badge q-type-single';
    if (type === 'multiple-choice') return 'q-type-badge q-type-multiple';
    if (type === 'certificate-upload') return 'q-type-badge q-type-cert';
    return 'q-type-badge q-type-text';
  };

  const typeLabel = (type) => {
    if (type === 'single-choice') return 'Single Choice';
    if (type === 'multiple-choice') return 'Multiple Choice';
    if (type === 'certificate-upload') return 'File Upload';
    return 'Text';
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Questions</h2>
          <p>Build the form fields that respondents will see. Choose a survey below to manage its questions.</p>
        </div>
        {selectedSurveyId && (
          <button id="add-question-btn" className="btn btn-primary" onClick={handleOpenAdd}>
            + Add Question
          </button>
        )}
      </div>

      {/* Survey selector */}
      <div className="survey-selector-row">
        <label htmlFor="question-survey-select">Survey:</label>
        {loadingSurveys ? (
          <span style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Loading…</span>
        ) : (
          <select
            id="question-survey-select"
            className="form-control"
            value={selectedSurveyId || ''}
            onChange={e => setSelectedSurveyId(e.target.value)}
          >
            <option value="" disabled>— Select a survey —</option>
            {surveys.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Questions list */}
      {!selectedSurveyId ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Select a survey above to view and manage its questions.</p>
        </div>
      ) : loadingQuestions ? (
        <div className="loader" aria-label="Loading questions" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠</div>
          <p>{error}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p>No questions yet. Click "+ Add Question" to start building this form.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: 'var(--border)' }}>
          {questions.map((q, index) => (
            <div
              key={q.id}
              id={`question-row-${q.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '1.5rem',
                borderBottom: index < questions.length - 1 ? 'var(--border-faint)' : 'none',
                background: 'var(--bg)',
                transition: 'background 0.2s var(--ease)',
              }}
            >
              {/* Left: content */}
              <div style={{ flex: 1, marginRight: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="tag-ink" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.18rem 0.6rem', borderRadius: '999px', background: 'rgba(26,26,31,0.07)', color: 'var(--ink-light)', border: '1px solid rgba(26,26,31,0.18)' }}>
                    Step {index + 1}
                  </span>
                  <span className={typeBadgeClass(q.type)}>{typeLabel(q.type)}</span>
                  {q.is_required && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.18rem 0.6rem', borderRadius: '999px', color: 'var(--terra)', background: 'rgba(200,122,83,0.1)', border: '1px solid rgba(200,122,83,0.3)' }}>
                      Required
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  {q.text}
                </div>

                {['single-choice', 'multiple-choice'].includes(q.type) && q.options && q.options.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {q.options.map((opt, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', padding: '0.15rem 0.6rem', border: 'var(--border-faint)', color: 'var(--ink-light)', borderRadius: '2px' }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                {/* Ordering */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '0.3rem' }}>
                  <button
                    className="action-btn-sm"
                    onClick={() => movePosition(q, 'up')}
                    disabled={index === 0}
                    title="Move Up"
                    style={{ padding: '3px 7px', lineHeight: 1 }}
                  >
                    ▲
                  </button>
                  <button
                    className="action-btn-sm"
                    onClick={() => movePosition(q, 'down')}
                    disabled={index === questions.length - 1}
                    title="Move Down"
                    style={{ padding: '3px 7px', lineHeight: 1 }}
                  >
                    ▼
                  </button>
                </div>
                <button
                  id={`edit-q-${q.id}`}
                  className="action-btn-sm"
                  onClick={() => handleOpenEdit(q)}
                >
                  Edit
                </button>
                <button
                  id={`delete-q-${q.id}`}
                  className="action-btn-sm delete"
                  onClick={() => handleDelete(q.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'New Question' : 'Edit Question'}</h3>
              <button id="q-modal-close" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="q-text">
                    Question text <span className="required">*</span>
                  </label>
                  <input
                    id="q-text"
                    type="text"
                    className="form-control"
                    placeholder="e.g. How would you rate your experience?"
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-8">
                    <label className="form-label" htmlFor="q-type">Control type</label>
                    <select
                      id="q-type"
                      className="form-control form-select"
                      value={questionType}
                      onChange={e => setQuestionType(e.target.value)}
                    >
                      <option value="text">Text Input</option>
                      <option value="single-choice">Single Choice (Radio)</option>
                      <option value="multiple-choice">Multiple Choice (Checkbox)</option>
                      <option value="certificate-upload">Certificate File Upload</option>
                    </select>
                  </div>
                  <div className="col-4 d-flex align-items-end pb-1">
                    <div className="form-check">
                      <input
                        id="q-required"
                        type="checkbox"
                        className="form-check-input"
                        checked={isRequired}
                        onChange={e => setIsRequired(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="q-required">Required</label>
                    </div>
                  </div>
                </div>

                {/* Options manager */}
                {['single-choice', 'multiple-choice'].includes(questionType) && (
                  <div style={{ borderTop: 'var(--border-faint)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>Answer choices</label>
                      <button type="button" className="btn btn-secondary btn--sm" onClick={handleAddOption}>
                        + Add option
                      </button>
                    </div>
                    <div className="options-list">
                      {options.map((opt, i) => (
                        <div key={i} className="option-row">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={e => handleOptionChange(i, e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="action-btn-sm delete option-remove"
                            onClick={() => handleRemoveOption(i)}
                            disabled={options.length <= 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  id="q-modal-cancel"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  id="q-modal-save"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
