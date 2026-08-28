import React from 'react';

export default function ProfileField({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div className={accent.soft} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
        {Icon && <Icon size={16} className={accent.text} style={{ margin: 'auto' }} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-3)' }}>
          {label}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: 'var(--text-1)', wordBreak: 'break-word' }}>
          {value || "N/A"}
        </div>
      </div>
    </div>
  );
}
