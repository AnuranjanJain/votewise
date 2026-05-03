'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[VoteWise] Error caught:', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
  }

  private handleRetry = (): void => { this.setState({ hasError: false, error: null }); };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert" aria-live="assertive" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-primary, #fff)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-muted, #999)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            Don&apos;t worry — your democracy learning journey is still here. Try refreshing!
          </p>
          <button onClick={this.handleRetry} aria-label="Retry loading" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600, border: 'none', borderRadius: '12px', background: 'var(--gradient-primary, #2E5EAA)', color: '#fff', cursor: 'pointer' }}>
            🔄 Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ marginTop: '2rem', padding: '1rem', borderRadius: '8px', background: 'rgba(198,58,58,0.1)', color: '#C63A3A', fontSize: '0.75rem', maxWidth: '90vw', overflow: 'auto', textAlign: 'left' }}>
              {this.state.error.message}{'\n'}{this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
