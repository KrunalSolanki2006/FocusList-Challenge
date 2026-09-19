import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Margin] Uncaught runtime error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            textAlign: 'center',
            fontFamily: 'var(--font-family)'
          }}
        >
          <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '24px' }}>
            An unexpected error occurred. Your saved tasks in local storage are safe and untouched.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleReload}
          >
            <RefreshCw size={16} />
            Reload FocusList
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
