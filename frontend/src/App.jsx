import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Notifications from './components/Notifications.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/Layout.jsx';
import DomainSelection from './pages/auth/DomainSelection.jsx';
import DomainLogin from './pages/auth/DomainLogin.jsx';
import StudentPortal from './portals/StudentPortal.jsx';
import FacultyPortal from './portals/FacultyPortal.jsx';
import AdminPortal from './portals/AdminPortal.jsx';
import ManagementPortal from './portals/ManagementPortal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [authDomain, setAuthDomain] = useState(null);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16
      }}>
        <div style={{
          width: 52, height: 52,
          background: 'var(--brand)',
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontSize: 26, fontWeight: 800,
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(196,61,61,0.25)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}>C</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>Loading CampusSphere…</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
      } />

      <Route path="/login" element={
        user ? <Navigate to={`/${user.role}/dashboard`} replace /> :
        !authDomain ? <DomainSelection onSelectDomain={setAuthDomain} /> :
        <DomainLogin domainId={authDomain} onBack={() => setAuthDomain(null)} />
      } />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Portal */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout>
            <ErrorBoundary>
              <StudentPortal />
            </ErrorBoundary>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Faculty Portal */}
      <Route path="/faculty/*" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout>
            <ErrorBoundary>
              <FacultyPortal />
            </ErrorBoundary>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Portal */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <ErrorBoundary>
              <AdminPortal />
            </ErrorBoundary>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Management Portal */}
      <Route path="/management/*" element={
        <ProtectedRoute allowedRoles={['management']}>
          <Layout>
            <ErrorBoundary>
              <ManagementPortal />
            </ErrorBoundary>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: false,
      retry: 1,
    },
    mutations: {
      throwOnError: false, // Mutations usually handled manually
    }
  }
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            
            <div style={{ visibility: showSplash ? 'hidden' : 'visible' }} className={!showSplash ? 'app-fade-in' : ''}>
              <Notifications />
              <AppRoutes />
              <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)' } }} />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
