import React, { useState, useEffect } from 'react';

export default function SurveyForm({ surveyId, setCurrentView }) {
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(-1);
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState({});
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (surveyId) fetchSurveyMetadata();
  }, [surveyId]);

  const fetchSurveyMetadata = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/surveys/${surveyId}`);
      if (!response.ok) throw new Error('Failed to fetch survey questions');
      const data = await response.json();
      setSurvey(data);
      setQuestions(data.questions || []);

      const initialAnswers = {};
      (data.questions || []).forEach(q => {
        if (q.type === 'multiple-choice') initialAnswers[q.id] = [];
        else if (q.type === 'certificate-upload') initialAnswers[q.id] = null;
        else initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div className="loader" aria-label="Loading survey" />
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: '4rem', maxWidth: '560px' }}>
      <div className="empty-state">
        <div className="empty-state-icon">⚠</div>
        <p style={{ marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => setCurrentView('available-surveys')}>
          ← Back to Surveys
        </button>
      </div>
    </div>
  );

  const totalSteps = questions.length + 1;
  const isEmailStep = currentStep === -1;
  const isReviewStep = currentStep === questions.length;
  const isSuccessStep = currentStep === questions.length + 1;
  const activeQuestion = !isEmailStep && !isReviewStep && !isSuccessStep ? questions[currentStep] : null;

  // ── Validation & navigation ──────────────────────────────────
  const handleNext = () => {
    setValidationError('');

    if (isEmailStep) {
      if (!email.trim()) { setValidationError('Email address is required.'); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) { setValidationError('Please enter a valid email address.'); return; }
      setCurrentStep(0);
      return;
    }

    if (activeQuestion) {
      const value = answers[activeQuestion.id];
      if (activeQuestion.is_required) {
        if (activeQuestion.type === 'multiple-choice') {
          if (!value || value.length === 0) { setValidationError('Please select at least one option.'); return; }
        } else if (activeQuestion.type === 'certificate-upload') {
          if (!value) { setValidationError('Please upload the required certificate.'); return; }
        } else {
          if (!value || String(value).trim() === '') { setValidationError('This question is required.'); return; }
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (currentStep > -1) setCurrentStep(currentStep - 1);
  };

  // ── Answer handlers ──────────────────────────────────────────
  const handleTextChange = (qId, val) => setAnswers({ ...answers, [qId]: val });
  const handleSingleChoiceChange = (qId, val) => setAnswers({ ...answers, [qId]: val });
  const handleMultipleChoiceChange = (qId, option, checked) => {
    const current = answers[qId] || [];
    setAnswers({ ...answers, [qId]: checked ? [...current, option] : current.filter(c => c !== option) });
  };
  const handleFileChange = (qId, file) => {
    if (!file) return;
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) { setValidationError('Only PDF, JPG, JPEG, and PNG files are allowed.'); return; }
    setValidationError('');
    setAnswers({ ...answers, [qId]: file });
  };
  const handleRemoveFile = (qId) => setAnswers({ ...answers, [qId]: null });

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmitSurvey = async () => {
    setSubmitting(true);
    setValidationError('');
    try {
      const formData = new FormData();
      formData.append('email', email.trim());

      const answersPayload = [];
      questions.forEach(q => {
        const val = answers[q.id];
        if (q.type === 'certificate-upload') {
          answersPayload.push({ questionId: q.id, type: q.type, value: val ? `file_${q.id}` : null });
          if (val) formData.append(`file_${q.id}`, val);
        } else {
          answersPayload.push({ questionId: q.id, type: q.type, value: val });
        }
      });

      formData.append('answers', JSON.stringify(answersPayload));
      const response = await fetch(`http://localhost:8080/api/surveys/${surveyId}/responses`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to submit. Please try again.');
      setCurrentStep(questions.length + 1);
    } catch (err) {
      setValidationError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Question controls ────────────────────────────────────────
  const renderQuestionControl = (q) => {
    const value = answers[q.id];

    switch (q.type) {
      case 'text':
        return (
          <div className="form-group mb-0">
            <textarea
              id={`q-text-${q.id}`}
              className="form-control"
              rows={4}
              placeholder="Type your answer here…"
              value={value || ''}
              onChange={e => handleTextChange(q.id, e.target.value)}
              required={q.is_required}
            />
          </div>
        );

      case 'single-choice':
        return (
          <div className="sf-choice-list">
            {(q.options || []).map((option, i) => (
              <div
                key={i}
                id={`choice-${q.id}-${i}`}
                className={`sf-choice-item${value === option ? ' selected' : ''}`}
                onClick={() => handleSingleChoiceChange(q.id, option)}
              >
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  checked={value === option}
                  onChange={() => handleSingleChoiceChange(q.id, option)}
                  readOnly
                />
                <label style={{ cursor: 'pointer', margin: 0 }}>{option}</label>
              </div>
            ))}
          </div>
        );

      case 'multiple-choice': {
        const selectedChoices = value || [];
        return (
          <div className="sf-choice-list">
            {(q.options || []).map((option, i) => {
              const isChecked = selectedChoices.includes(option);
              return (
                <div
                  key={i}
                  id={`check-${q.id}-${i}`}
                  className={`sf-choice-item${isChecked ? ' selected' : ''}`}
                  onClick={() => handleMultipleChoiceChange(q.id, option, !isChecked)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => handleMultipleChoiceChange(q.id, option, e.target.checked)}
                    readOnly
                  />
                  <label style={{ cursor: 'pointer', margin: 0 }}>{option}</label>
                </div>
              );
            })}
          </div>
        );
      }

      case 'certificate-upload':
        return (
          <div>
            {!value ? (
              <label
                id={`upload-zone-${q.id}`}
                className={`sf-dropzone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFileChange(q.id, e.dataTransfer.files[0]); }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(q.id, e.target.files[0])}
                />
                <p style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>↑</p>
                <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.3rem' }}>
                  Drop file here, or click to upload
                </p>
                <p style={{ fontSize: '0.8rem' }}>PDF, JPG, PNG — max 5 MB</p>
              </label>
            ) : (
              <div className="d-flex justify-content-between align-items-center p-3" style={{ border: 'var(--border-faint)', background: 'rgba(26,26,31,0.02)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                  📄 {value.name}
                  <span style={{ fontWeight: 400, color: 'var(--ink-light)', marginLeft: '0.5rem' }}>
                    ({(value.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn--sm"
                  onClick={() => handleRemoveFile(q.id)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        );

      default:
        return <p style={{ color: 'var(--ink-light)' }}>Unsupported question type: {q.type}</p>;
    }
  };

  // ── SHARED WRAPPER ───────────────────────────────────────────
  const progressPercent = isEmailStep ? 0
    : isReviewStep || isSuccessStep ? 100
    : Math.round((currentStep / questions.length) * 100);

  // ── SUCCESS ──────────────────────────────────────────────────
  if (isSuccessStep) {
    return (
      <div className="container">
        <div className="survey-form-wrap">
          <div className="sf-success">
            <div className="sf-success-mark" aria-hidden="true">✓</div>
            <h2>Response recorded.</h2>
            <p>Your answers for <strong>{survey.title}</strong> have been submitted.
              We appreciate you taking the time — it means something.</p>
            <button
              id="back-to-surveys-btn"
              className="btn btn-primary btn-pill btn--lg"
              onClick={() => setCurrentView('available-surveys')}
            >
              ← Back to Surveys
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="survey-form-wrap">
        {/* Progress track */}
        {!isEmailStep && (
          <>
            <div className="sf-step-label">
              {isReviewStep
                ? 'Review — Final Step'
                : `Question ${currentStep + 1} of ${questions.length} · ${progressPercent}% complete`}
            </div>
            <div className="sf-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="sf-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </>
        )}

        {/* ── EMAIL STEP ── */}
        {isEmailStep && (
          <div className="sf-card">
            <h2 className="sf-title">{survey.title}</h2>
            <p className="sf-subtitle">
              {survey.description || 'Before we begin, we need one thing from you.'}
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email address <span className="required">*</span>
              </label>
              <input
                id="email-input"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                required
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '0.5rem' }}>
                Used only to verify your submission. Not stored publicly.
              </p>
            </div>

            {validationError && (
              <div className="sf-error" role="alert">⚠ {validationError}</div>
            )}

            <div className="sf-nav">
              <button
                id="cancel-btn"
                className="btn btn-secondary"
                onClick={() => setCurrentView('available-surveys')}
              >
                Cancel
              </button>
              <button id="email-next-btn" className="btn btn-primary" onClick={handleNext}>
                Begin Survey →
              </button>
            </div>
          </div>
        )}

        {/* ── QUESTION STEP ── */}
        {activeQuestion && (
          <div className="sf-card">
            {activeQuestion.is_required && (
              <span className="sf-required-badge">Required</span>
            )}
            <h2 className="sf-title">{activeQuestion.text}</h2>
            <p className="sf-subtitle" style={{ marginBottom: '1.5rem' }}>
              {activeQuestion.type === 'single-choice' && 'Select one option below.'}
              {activeQuestion.type === 'multiple-choice' && 'Select all that apply.'}
              {activeQuestion.type === 'certificate-upload' && 'Upload your certificate file.'}
              {activeQuestion.type === 'text' && 'Write your answer in the field below.'}
            </p>

            {renderQuestionControl(activeQuestion)}

            {validationError && (
              <div className="sf-error" role="alert" style={{ marginTop: '1rem' }}>⚠ {validationError}</div>
            )}

            <div className="sf-nav" style={{ marginTop: '2rem' }}>
              <button
                id="prev-btn"
                className="btn btn-secondary"
                onClick={handlePrev}
                style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>
              <button id="next-btn" className="btn btn-primary" onClick={handleNext}>
                {currentStep === questions.length - 1 ? 'Review Answers →' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── REVIEW STEP ── */}
        {isReviewStep && (
          <div className="sf-card">
            <h2 className="sf-title">Review your answers.</h2>
            <p className="sf-subtitle">
              Everything look right? Hit submit when you're ready — you can't edit after this.
            </p>

            <div className="review-list">
              <div className="review-item">
                <div className="review-q">Email</div>
                <div className="review-a">{email}</div>
              </div>

              {questions.map((q, idx) => {
                const val = answers[q.id];
                let display = <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Not answered</span>;
                if (q.type === 'multiple-choice' && val && val.length > 0) display = val.join(', ');
                else if (q.type === 'certificate-upload' && val) display = `📄 ${val.name}`;
                else if (val && String(val).trim() !== '') display = String(val);

                return (
                  <div key={q.id} className="review-item">
                    <div className="review-q">{idx + 1}. {q.text}</div>
                    <div className="review-a">{display}</div>
                  </div>
                );
              })}
            </div>

            {validationError && (
              <div className="sf-error" role="alert" style={{ marginTop: '1rem' }}>⚠ {validationError}</div>
            )}

            <div className="sf-nav" style={{ marginTop: '2rem' }}>
              <button id="review-prev-btn" className="btn btn-secondary" onClick={handlePrev}>
                ← Edit Answers
              </button>
              <button
                id="submit-btn"
                className="btn btn-primary"
                onClick={handleSubmitSurvey}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
