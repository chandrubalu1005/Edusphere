import React from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function ProfileSection({ icon: Icon, title, accent, children, noPadding = false }) {
  return (
    <div className="card">
      <div className="card-header" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className={accent.soft} style={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon && <Icon size={18} className={accent.text} />}
        </div>
        <h2 className="card-title" style={{ fontSize: 16, margin: 0 }}>
          {title}
        </h2>
      </div>
      <div className={noPadding ? "" : "card-body"}>
        {children}
      </div>
    </div>
  );
}
