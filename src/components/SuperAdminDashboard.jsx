import React, { useState, useEffect } from 'react';

export default function SuperAdminDashboard({ authInfo }) {
  const [stats, setStats] = useState({ totalSurveys: 0, totalResponses: 0, totalUsers: 0 });
  const [requests, setRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      setStats(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      setRequests(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authInfo.token}` }
      });
      if (!res.ok) throw new Error(`Failed to ${action} request`);
      
      // Remove from list
      setRequests(requests.filter(req => req.id !== id));
      
      if (action === 'approve') {
        // Refresh stats to show new user count
        fetchStats();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <div className="admin-page-header">
        <div>
          <h2>Super Admin Dashboard</h2>
          <p>Platform overview and admin access management.</p>
        </div>
      </div>

      {error && (
        <div className="sf-error" role="alert" style={{ marginBottom: '2rem' }}>⚠ {error}</div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="sf-card" style={{ padding: '1.5rem', margin: 0 }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Total Surveys
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            {loadingStats ? '…' : stats.totalSurveys}
          </div>
        </div>
        <div className="sf-card" style={{ padding: '1.5rem', margin: 0 }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Total Responses
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            {loadingStats ? '…' : stats.totalResponses}
          </div>
        </div>
        <div className="sf-card" style={{ padding: '1.5rem', margin: 0 }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Total Admins
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            {loadingStats ? '…' : stats.totalUsers}
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--ink)' }}>
        Pending Admin Requests
      </h3>

      {loadingRequests ? (
        <div className="loader" aria-label="Loading requests" />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <p>No pending admin requests.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Requested On</th>
                <th style={{ width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.username}</td>
                  <td style={{ color: 'var(--ink-light)' }}>
                    {new Date(req.created_at).toLocaleString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn-sm"
                        style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                        onClick={() => handleAction(req.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="action-btn-sm delete"
                        onClick={() => handleAction(req.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
