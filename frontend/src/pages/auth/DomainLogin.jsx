import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { DOMAIN_CONFIG } from '../../config/domains.js';
import { Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';

export default function DomainLogin({ domainId, onBack }) {
  const domain = DOMAIN_CONFIG[domainId];
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  if (!domain) return null;
  const Icon = domain.icon;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password, domainId);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Left Sidebar (Brand purely visual) ── */}
      <div className="login-left" style={{ flex: '0 0 35%', maxWidth: 450, padding: 40, borderRight: '1px solid var(--border)' }}>
        <div className="login-logo">
          <div className="sidebar-logo-mark" style={{ width: 44, height: 44, fontSize: 22 }}>E</div>
          <div>
            <div className="sidebar-brand" style={{ fontSize: 24 }}>EduSphere</div>
            <div className="sidebar-tagline">Enterprise University Platform</div>
          </div>
        </div>
      </div>

      {/* ── Right Login Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 60px', position: 'relative' }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--text-2)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0',
            alignSelf: 'flex-start',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          <ArrowLeft size={16} /> Back to domain selection
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            
            {/* Domain Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: domain.bg, color: domain.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={32} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)', margin: 0 }}>
                  {domain.label} Login
                </h1>
                <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '4px 0 0 0' }}>
                  Access your {domain.label.toLowerCase()} portal
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="login-identifier" style={{ fontWeight: 600 }}>
                  {domain.identifierLabel}
                </label>
                <input
                  id="login-identifier"
                  className="form-input"
                  type="text"
                  placeholder={`Enter your ${domain.label.toLowerCase()} identifier`}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                  style={{ padding: '12px 16px', fontSize: 15 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password" style={{ fontWeight: 600 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ padding: '12px 16px', fontSize: 15, width: '100%', paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="btn-link"
                  style={{ color: domain.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, padding: 0 }}
                  onClick={() => alert('If an account matches the provided information, recovery instructions will be sent.')}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ fontSize: 14, padding: '12px 16px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ marginTop: 2 }}>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !identifier || !password}
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: domain.accent,
                  border: 'none',
                  padding: '14px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: `0 4px 12px -2px ${domain.accent}60`,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: '#fff', borderTopColor: 'transparent' }}></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span style={{ fontSize: 18 }}>→</span>
                  </>
                )}
              </button>

            </form>

            <div style={{ marginTop: 32, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
              <Lock size={14} />
              <span>Secure login powered by EduSphere Identity System</span>
            </div>
            
            <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-1)' }}>Demo Credentials ({domain.label}):</div>
              {domain.id === 'student' && <div>Username: <b>john_doe</b> or <b>jane_smith</b></div>}
              {domain.id === 'faculty' && <div>Username: <b>sarah_j</b> or <b>prof_kumar</b></div>}
              {domain.id === 'admin' && <div>Username: <b>sys_admin</b></div>}
              {domain.id === 'management' && <div>Username: <b>dean_academic</b></div>}
              <div style={{ marginTop: 4 }}>Password for all: <b>demo123</b></div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              Need help? <a href="#" style={{ color: domain.accent, fontWeight: 600, textDecoration: 'none' }}>Contact IT Support</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
