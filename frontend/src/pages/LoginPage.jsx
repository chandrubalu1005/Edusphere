import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-logo">
          <div className="sidebar-logo-mark" style={{ width: 44, height: 44, fontSize: 22 }}>E</div>
          <div>
            <div className="sidebar-brand" style={{ fontSize: 24 }}>EduSphere</div>
            <div className="sidebar-tagline">Enterprise University Platform</div>
          </div>
        </div>

        <div className="login-hero">
          <div className="login-hero-title">
            Empowering<br /><strong>Institutions</strong>,<br />Enabling <strong>Futures</strong>.
          </div>
          <p className="login-hero-desc">
            A complete University ERP &amp; Learning Management System built for 100,000+ users.
            Manage every facet of academic life in one unified platform.
          </p>
        </div>

        <div className="login-stats">
          {[
            { value: '100K+', label: 'Active Users' },
            { value: '4,200+', label: 'Courses' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '28', label: 'Departments' },
          ].map(s => (
            <div className="login-stat" key={s.label}>
              <div className="login-stat-value">{s.value}</div>
              <div className="login-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-form-box">
          <h1 className="login-form-title">Welcome back</h1>
          <p className="login-form-subtitle">Sign in to your institutional account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="you@edusphere.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: 13, padding: '10px 12px' }}>
                ⚠ {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4 }}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Authenticating…
                </span>
              ) : '→ Sign In'}
            </button>
          </form>

          {onSwitchToRegister && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginTop: 16 }}>
              Don't have an account?{' '}
              <button
                className="btn-link"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={onSwitchToRegister}
              >
                Register here
              </button>
            </p>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>
            EduSphere Enterprise v2.0 · © 2026 EduSphere University Systems
          </p>
        </div>
      </div>
    </div>
  );
}
