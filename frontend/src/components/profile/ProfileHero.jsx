import React from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

export default function ProfileHero({ profile, accent, onEdit }) {
  const getInitials = (name) => {
    if (!name || name === "N/A") return "NA";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    return "NA";
  };

  return (
    <div className="card" style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      <div 
        style={{ position: 'absolute', right: -50, top: -50, width: 250, height: 250, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15 }}
        className={accent.bg}
      />

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className={accent.ring} style={{ width: 120, height: 120, borderRadius: '50%', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
          {profile.avatar && profile.avatar !== "N/A" ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className={accent.bg} style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 700 }}>
              {getInitials(profile.name)}
            </div>
          )}
        </div>
        <span style={{ position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: '4px solid var(--surface)', background: 'var(--success)' }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
              {profile.name}
            </h1>
            {profile.designation && profile.designation !== profile.name && profile.designation !== "N/A" && (
              <div className={accent.text} style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {profile.designation}
              </div>
            )}
            {profile.department && profile.department !== "N/A" && (
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                {profile.department}
              </div>
            )}
          </div>
          
          <button className="btn btn-outline" onClick={onEdit}>
            <Pencil size={14} style={{ marginRight: 6 }} /> Edit Profile
          </button>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {profile.metadata?.map((meta, i) => {
            const Icon = meta.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
                {Icon && <Icon size={14} className={accent.text} />}
                <span>
                  {meta.label && `${meta.label}: `}
                  <strong style={{ color: 'var(--text-1)', fontWeight: 600 }}>{meta.value}</strong>
                </span>
              </div>
            );
          })}
          
          {profile.status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
              {profile.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
