import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f0f',
          color: '#ff7d8a',
          fontFamily: 'monospace',
          gap: '16px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ color: '#fff', margin: 0 }}>Something went wrong</h2>
          <pre style={{
            background: '#1e1e1e',
            border: '1px solid #ff7d8a33',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '600px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#ff7d8a',
            fontSize: '13px',
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/login'; }}
            style={{
              background: 'linear-gradient(135deg, #727272, #c6c6c6)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 700,
              padding: '10px 24px',
            }}
          >
            Go to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
