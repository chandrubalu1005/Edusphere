import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  { role: 'student',    username: 'john_doe',      label: 'Student' },
  { role: 'faculty',    username: 'sarah_j',        label: 'Faculty' },
  { role: 'admin',      username: 'sys_admin',      label: 'Admin' },
  { role: 'management', username: 'dean_academic',  label: 'Management' },
];

const ROLE_ICONS = {
  student: '🎓', faculty: '👩‍🏫', admin: '⚙️', management: '📊'
};

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(un) {
    setError('');
    setLoading(true);
    try {
      await login(un, 'demo123');
    } catch (err) {
      setError(err.message);
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
            A complete University ERP & Learning Management System built for 100,000+ users.
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

          {/* Quick Access Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {DEMO_ACCOUNTS.map(d => (
              <button
                key={d.role}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 8, padding: '8px 12px', fontSize: 13 }}
                onClick={() => quickLogin(d.username)}
                disabled={loading}
              >
                <span style={{ fontSize: 16 }}>{ROLE_ICONS[d.role]}</span>
                Demo {d.label}
              </button>
            ))}
          </div>

          <div className="divider">or sign in manually</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: 13, padding: '10px 12px' }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4 }}
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Authenticating…
                </span>
              ) : '→ Sign In'}
            </button>
          </form>

          <div className="demo-creds" style={{ marginTop: 20 }}>
            <strong>🔑 Demo Credentials</strong>
            {DEMO_ACCOUNTS.map(d => (
              <div className="demo-cred-row" key={d.role}>
                <span className="demo-cred-role">{d.label}</span>
                <span style={{ color: 'var(--text-1)', fontSize: 12 }}>{d.username}</span>
                <span style={{ opacity: 0.6 }}>demo123</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 20 }}>
            EduSphere Enterprise v2.0 · © 2026 EduSphere University Systems
          </p>
        </div>
      </div>
    </div>
  );
}
