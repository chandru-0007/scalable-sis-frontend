import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured by SIS UI ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.hash = 'dashboard';
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = 'dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.overlay}>
          <div style={styles.card} className="animate-fade-in">
            <div style={styles.iconCircle}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={styles.title}>Something went wrong in the Portal</h2>
            <p style={styles.desc}>
              An unexpected UI error occurred while rendering this view.
              Your saved academic data remains safe and persistent.
            </p>

            {this.state.error && (
              <div style={styles.errorBox}>
                <code style={styles.errorCode}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  overlay: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F1F5F9',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    border: '1px solid #E2E8F0',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#FEE2E2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 10px 0',
  },
  desc: {
    fontSize: '0.88rem',
    color: '#64748B',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  errorBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'left',
    maxHeight: '140px',
    overflowY: 'auto',
    marginBottom: '24px',
  },
  errorCode: {
    fontSize: '0.78rem',
    color: '#DC2626',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
};

export default ErrorBoundary;
