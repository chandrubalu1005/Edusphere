import React from 'react';
import { DOMAIN_CONFIG } from '../../config/domains.js';

export default function DomainSelection({ onSelectDomain }) {
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
            Welcome to EduSphere<br />
            <span style={{ color: 'var(--accent)' }}>Select Your Domain</span>
          </div>
          <p className="login-hero-desc" style={{ maxWidth: 460 }}>
            Choose your domain to access a tailored experience designed for your role and responsibilities.
          </p>
        </div>

        <div className="login-stats">
          {[
            { value: '100K+', label: 'Active Users', icon: '👥' },
            { value: '4,200+', label: 'Courses', icon: '📖' },
            { value: '99.9%', label: 'Uptime SLA', icon: '📈' },
            { value: '28', label: 'Departments', icon: '🏛' },
          ].map(s => (
            <div className="login-stat" key={s.label}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div className="login-stat-value">{s.value}</div>
              <div className="login-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Domain Cards ── */}
      <div className="login-right" style={{ padding: '40px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 24,
            alignItems: 'stretch'
          }}>
            {Object.values(DOMAIN_CONFIG).map((domain) => {
              const Icon = domain.icon;
              return (
                <button
                  key={domain.id}
                  onClick={() => onSelectDomain(domain.id)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.borderColor = domain.accent;
                    e.currentTarget.style.boxShadow = `0 12px 24px -8px ${domain.accent}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = domain.accent;
                    e.currentTarget.style.outline = `2px solid ${domain.accent}`;
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${domain.accent}, ${domain.accent}dd)`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: `0 8px 16px -4px ${domain.accent}80`
                  }}>
                    <Icon size={32} strokeWidth={2} />
                  </div>
                  
                  <h2 style={{ 
                    fontSize: 22, 
                    fontWeight: 600, 
                    color: domain.accent, 
                    fontFamily: 'var(--font-display)',
                    marginBottom: 12
                  }}>
                    {domain.label}
                  </h2>
                  
                  <p style={{ 
                    fontSize: 14, 
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    marginBottom: 24,
                    flexGrow: 1
                  }}>
                    {domain.description}
                  </p>
                  
                  <div style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: domain.bg,
                    color: domain.accent,
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'background 0.2s'
                  }}>
                    {domain.label} Login →
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
