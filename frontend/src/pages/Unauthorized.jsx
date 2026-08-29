import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Unauthorized() {
  const { user } = useAuth();
  
  const dashboardLink = user?.role ? `/${user.role}/dashboard` : '/login';

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16
    }}>
      <div style={{ fontSize: 64 }}>🚫</div>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', fontSize: 32 }}>403 - Unauthorized</h1>
      <p style={{ color: 'var(--text-2)', maxWidth: 400, textAlign: 'center' }}>
        You do not have permission to access this resource. If you believe this is an error, please contact the administrator.
      </p>
      <Link to={dashboardLink} className="btn btn-primary" style={{ marginTop: 16 }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
