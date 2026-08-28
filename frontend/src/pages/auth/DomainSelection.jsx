import React from 'react';
import { DOMAIN_CONFIG } from '../../config/domains.js';

export default function DomainSelection({ onSelectDomain }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* ── Left Selection Area ── */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '40px 60px', position: 'relative', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: 60 }}>
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

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 700 }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, letterSpacing: '-0.5px' }}>
                Select your portal
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 400 }}>
                Choose the workspace that matches your role to continue.
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 20,
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
                      borderRadius: 'var(--r-lg)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s var(--ease)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--r-md)',
                      background: 'var(--brand-soft)', color: 'var(--brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16, transition: 'background 0.2s'
                    }}>
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    
                    <h3 style={{ 
                      fontSize: 16, fontWeight: 700, color: 'var(--text-1)', 
                      fontFamily: 'var(--font-body)', marginBottom: 8
                    }}>
                      {domain.label}
                    </h3>
                    
                    <p style={{ 
                      fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
                      marginBottom: 24, flexGrow: 1
                    }}>
                      {domain.description}
                    </p>
                    
                    <div style={{
                      color: 'var(--brand)', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      Enter {domain.label} <span>→</span>
                    </div>
                  </button>
                );
              })}
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
              The Modern<br/>Standard in<br/>Education
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40 }}>
              {[
                { value: '12k+', label: 'Active Students' },
                { value: '680+', label: 'Faculty Members' },
                { value: '28', label: 'Departments' },
                { value: '99.9%', label: 'System Uptime' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
