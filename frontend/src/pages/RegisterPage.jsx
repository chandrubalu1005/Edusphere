import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,     setRole]     = useState('student');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password, role);
      toast.success('Registration successful! Welcome to EduSphere.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
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
            Join the<br /><strong>Future</strong> of<br /><strong>Learning</strong>.
          </div>
          <p className="login-hero-desc">
            Create an institutional account to access your courses, attendance, grades, certifications, and academic resources.
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-form-box">
          <h1 className="login-form-title">Create an Account</h1>
          <p className="login-form-subtitle">Register for your institutional portal</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name / Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="john_doe"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="john@edusphere.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
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
              disabled={loading || !username || !email || !password}
            >
              {loading ? 'Creating Account…' : '→ Complete Registration'}
            </button>
          </form>

          {onSwitchToLogin && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginTop: 16 }}>
              Already have an account?{' '}
              <button
                className="btn-link"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={onSwitchToLogin}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
