import React from 'react';

export default function EmptyState({ 
  title = 'No Data Found', 
  message = 'There is currently no data to display.', 
  actionLabel = 'Refresh', 
  onAction = () => window.location.reload() 
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--r-lg)', textAlign: 'center'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-full)',
        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, color: 'var(--text-3)'
      }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 400, marginBottom: 24 }}>
        {message}
      </p>
      {actionLabel && (
        <button className="btn btn-outline btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
