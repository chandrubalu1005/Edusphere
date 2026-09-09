import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import ProfilePage from '../components/profile/ProfilePage.jsx';
import { EmptyState, StatCard } from '../components/shared/index.jsx';
import { useLiveLibraryAnalytics } from '../api/liveData.js';
import { BookOpen } from 'lucide-react';

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function HODDashboard() {
  const { user } = useAuth();
  return (
    <div className="page-container">
      <PageHeader title="Department Overview" subtitle={`Welcome, ${user.name || user.username}`} />
      <div className="card">
        <h3>HOD Dashboard</h3>
        <p>Department analytics and overview goes here.</p>
      </div>
    </div>
  );
}


function HODLibrary() {
  const { user } = useAuth();
  const { data, isLoading } = useLiveLibraryAnalytics(user.departmentId);

  if (isLoading) return <div style={{ padding: 40 }}>Loading department library analytics...</div>;

  const academic = data?.academic || { coursesWithResources: 0, unitCoverage: [], resourceTypes: [] };

  return (
    <div className="page-container">
      <PageHeader title="Department Library Health" subtitle="Monitor resource completeness and faculty contributions" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Courses w/ Resources" value={academic.coursesWithResources} icon={<BookOpen size={20} />} trend="+2" trendUp={true} />
        <StatCard title="Total Resource Files" value={academic.resourceTypes.reduce((acc, curr) => acc + curr.count, 0)} icon={<BookOpen size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Unit Coverage (1-5)</h3>
          {academic.unitCoverage.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>No course resources uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {academic.unitCoverage.map(u => (
                <div key={u.unit} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'var(--bg-2)', borderRadius: 6 }}>
                  <span>{u.unit}</span>
                  <strong>{u.count} resources</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Resource Types</h3>
           {academic.resourceTypes.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>No course resources uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {academic.resourceTypes.map(r => (
                <div key={r.type} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'var(--bg-2)', borderRadius: 6 }}>
                  <span>{r.type}</span>
                  <strong>{r.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HODPortal() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<HODDashboard />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="library" element={<HODLibrary />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
