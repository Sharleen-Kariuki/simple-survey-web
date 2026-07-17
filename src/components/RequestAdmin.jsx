import React, { useState } from 'react';

export default function RequestAdmin({ setCurrentView }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/request-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="sf-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div className="sf-success-mark" aria-hidden="true" style={{ margin: '0 auto 1.5rem' }}>✓</div>
          <h2 className="sf-title">Request Sent</h2>
          <p className="sf-subtitle" style={{ marginBottom: '2rem' }}>
            Your request for admin access has been submitted to the Super Admin. You will be able to log in once approved.
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentView('login')}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="sf-card" style={{ maxWidth: '440px', width: '100%' }}>
        <h2 className="sf-title">Request Access</h2>
        <p className="sf-subtitle" style={{ marginBottom: '2rem' }}>
          Choose a username and password. The Super Admin must approve your request before you can log in.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="req-username">Desired Username</label>
            <input
              id="req-username"
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="req-password">Password</label>
            <input
              id="req-password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="sf-error" role="alert" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <button
            type="button"
            className="btn btn-link"
            style={{ padding: 0, color: 'var(--ink-light)', textDecoration: 'none' }}
            onClick={() => setCurrentView('login')}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
