import React, { useState } from 'react';

export default function Login({ setAuthInfo, setCurrentView }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setAuthInfo({ token: data.token, user: data.user });
      if (data.user.role === 'superadmin') {
        setCurrentView('superadmin-dashboard');
      } else {
        setCurrentView('survey-mgmt');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="sf-card" style={{ maxWidth: '440px', width: '100%' }}>
        <h2 className="sf-title">Admin Login</h2>
        <p className="sf-subtitle" style={{ marginBottom: '2rem' }}>
          Sign in to manage surveys and platform data.
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="sf-error" role="alert" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--ink-light)' }}>Need an account?</span>{' '}
          <button
            type="button"
            className="btn btn-link"
            style={{ padding: 0, color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => setCurrentView('request-admin')}
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
}
