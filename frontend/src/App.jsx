import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Notifications from './components/Notifications.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import StudentPortal from './portals/StudentPortal.jsx';
import FacultyPortal from './portals/FacultyPortal.jsx';
import AdminPortal from './portals/AdminPortal.jsx';
import ManagementPortal from './portals/ManagementPortal.jsx';

// Default page per role
const ROLE_DEFAULTS = {
  student:    'dashboard',
  faculty:    'dashboard',
  admin:      'dashboard',
  management: 'dashboard',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage]   = useState('dashboard');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16
      }}>
        <div style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, var(--accent), #A0722A)',
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: 'var(--primary)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}>E</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>Loading EduSphere…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  function handleNavigate(newPage) {
    setPage(newPage);
    setSearch('');
  }

  const portals = {
    student:    <StudentPortal    page={page} onNavigate={handleNavigate} />,
    faculty:    <FacultyPortal    page={page} onNavigate={handleNavigate} />,
    admin:      <AdminPortal      page={page} onNavigate={handleNavigate} />,
    management: <ManagementPortal page={page} onNavigate={handleNavigate} />,
  };

  const portal = portals[user.role];

  return (
    <Layout
      currentPage={page}
      onNavigate={handleNavigate}
      searchQuery={search}
      onSearchChange={setSearch}
    >
      {portal || (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
            Unknown role: {user.role}
          </h2>
        </div>
      )}
    </Layout>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Notifications />
          <AppContent />
          <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)' } }} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
