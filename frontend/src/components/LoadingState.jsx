import React from 'react';

export default function LoadingState({ message = 'Loading dashboard...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: '300px', width: '100%', gap: 24, padding: 40
    }}>
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '60%',
            background: 'var(--accent)', borderRadius: 'var(--r-full)',
            animation: 'shimmer 1.5s infinite linear'
          }}></div>
        </div>
        <div style={{ height: 12, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', width: '80%' }}></div>
        <div style={{ height: 12, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', width: '60%' }}></div>
      </div>
      <div style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500 }}>
        {message}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
