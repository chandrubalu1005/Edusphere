import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileStat({ icon: Icon, label, value, helper, accent, formatValue = true }) {
  // If the value is "N/A", we don't want to format it as a large number if we passed formatValue=false, but here we always want standard UI.
  return (
    <div className={`card ${accent.soft}`} style={{ padding: '16px 20px', border: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        {Icon && <Icon size={18} className={accent.text} />}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
        {label}
      </div>
      <div className={accent.text} style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginTop: 4 }}>
        {value || "N/A"}
      </div>
      {helper && (
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-3)' }}>
          {helper}
        </div>
      )}
    </div>
  );
}
