import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, MapPin, UserRound, BriefcaseBusiness, TrendingUp, Clock3 } from 'lucide-react';
import ProfileHero from './ProfileHero.jsx';
import ProfileSection from './ProfileSection.jsx';
import ProfileField from './ProfileField.jsx';
import ProfileStat from './ProfileStat.jsx';
import EditProfileModal from './EditProfileModal.jsx';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function ProfilePage({ profile, accent, updateProfileHook, children }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Dashboard / Profile</p>
        </div>
      </div>

      <ProfileHero profile={profile} accent={accent} onEdit={() => setIsEditing(true)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ProfileSection icon={UserRound} title="About Me" accent={accent}>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>
              {profile.bio || "No biography provided."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <ProfileField icon={Mail} label="Email" value={profile.email} accent={accent} />
              <ProfileField icon={Phone} label="Phone" value={profile.phone} accent={accent} />
              <ProfileField icon={Calendar} label="Date of Birth" value={profile.dob} accent={accent} />
              <ProfileField icon={UserRound} label="Gender" value={profile.gender} accent={accent} />
              <ProfileField icon={MapPin} label="Address" value={profile.address} accent={accent} />
            </div>
          </ProfileSection>

          <ProfileSection icon={BriefcaseBusiness} title={profile.professionalTitle || "Professional Information"} accent={accent}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {profile.professional?.map(([label, value], i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === profile.professional.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{value || "N/A"}</span>
                </div>
              ))}
            </div>
          </ProfileSection>

          {children}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ProfileSection icon={TrendingUp} title={profile.statsTitle || "Quick Statistics"} accent={accent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {profile.stats?.map((stat) => (
                <ProfileStat
                  key={stat.label}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  helper={stat.helper}
                  accent={accent}
                />
              ))}
            </div>
          </ProfileSection>

          <ProfileSection icon={Clock3} title="Recent Activity" accent={accent}>
            {profile.activities?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {profile.activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} style={{ display: 'flex', gap: 12 }}>
                      <div className={accent.soft} style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {Icon && <Icon size={16} className={accent.text} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{activity.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{activity.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{activity.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No recent activity</p>
            )}
          </ProfileSection>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        accent={accent}
        updateProfile={updateProfileHook}
      />
    </div>
  );
}
