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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* ── Left Login Area ── */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '40px 60px', position: 'relative', maxWidth: '600px', width: '100%' }}>
        
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--brand)', borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-1)' }}>CampusSphere</div>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            color: 'var(--text-2)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            padding: '8px 0', alignSelf: 'flex-start', transition: 'color 0.2s', marginBottom: 24
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          <ArrowLeft size={16} /> Back to selection
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                {domain.label} Portal
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-2)', margin: 0 }}>
                Sign in to your institutional workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="login-identifier" style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>
                  {domain.identifierLabel}
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  placeholder={`Enter your ${domain.label.toLowerCase()} identifier`}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                  style={{ 
                    padding: '12px 16px', fontSize: 15, width: '100%', 
                    border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text-1)',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password" style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ 
                      padding: '12px 16px', fontSize: 15, width: '100%', paddingRight: 48,
                      border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text-1)',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
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
                  style={{ color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
                  onClick={() => alert('If an account matches the provided information, recovery instructions will be sent.')}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div style={{ fontSize: 14, padding: '12px 16px', borderRadius: 'var(--r-sm)', display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  <span style={{ marginTop: 2 }}>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !identifier || !password}
                style={{
                  width: '100%', marginTop: 8, padding: '14px 24px', fontSize: 15, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: '#fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                ) : (
                  <>
                    <span>Sign In to {domain.label}</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 32, padding: 20, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-2)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-1)' }}>Demo Credentials:</div>
              {domain.id === 'student' && <div>Username: <b>student_1</b> or <b>student_2</b></div>}
              {domain.id === 'faculty' && <div>Username: <b>faculty_1</b> or <b>faculty_2</b></div>}
              {domain.id === 'admin' && <div>Username: <b>admin_1</b></div>}
              {domain.id === 'management' && <div>Username: <b>management_1</b></div>}
              <div style={{ marginTop: 4 }}>Password for all: <b>demo123</b></div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12, fontWeight: 500 }}>
              <Lock size={12} />
              <span>Secure login via CampusSphere Identity System</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Right Visual Area ── */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg)', borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 100% 0%, var(--brand-soft) 0%, transparent 40%), radial-gradient(circle at 0% 100%, var(--surface-2) 0%, transparent 40%)',
          opacity: 0.8
        }}></div>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px', opacity: 0.4
        }}></div>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <div style={{ maxWidth: 400 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
              Empowering<br/>Academic<br/>Excellence
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 320 }}>
              CampusSphere provides a unified platform to manage learning, administration, and institutional operations with precision.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
