import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

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
        <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>Checking Authorization…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
