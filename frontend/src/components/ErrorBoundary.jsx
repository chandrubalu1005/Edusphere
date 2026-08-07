import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          margin: '40px auto',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>⚠️</span>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', marginBottom: 8, fontSize: 20 }}>
            Portal Error Detected
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={this.handleRetry}>
            🔄 Reload Portal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
