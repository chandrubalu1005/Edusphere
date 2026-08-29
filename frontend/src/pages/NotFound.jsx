import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16
    }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', fontSize: 32 }}>404 - Not Found</h1>
      <p style={{ color: 'var(--text-2)', maxWidth: 400, textAlign: 'center' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          Go Back
        </button>
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
