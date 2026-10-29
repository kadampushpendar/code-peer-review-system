import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCode2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <div className="glow g1" />
      <div className="glow g2" />

      <div className="auth-wrapper">
        <form onSubmit={handleSubmit} className="auth-card">
          <Link to="/" className="back-link">
            <ArrowLeft size={13} /> Back to landing page
          </Link>

          <div className="brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <div className="brand-icon">
              <FileCode2 size={16} />
            </div>
            <b>
              <span>KAEL</span>·9
            </b>
            <small>PEER REVIEW</small>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1>Sign in to Workspace</h1>
            <p className="subtitle">
              Enter your institutional credentials to submit Java programs and evaluate peer code.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="email">INSTITUTIONAL EMAIL</label>
            <input
              id="email"
              type="email"
              required
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button
            type="submit"
            className="btn"
            disabled={busy}
            style={{ width: '100%', minHeight: '40px', marginTop: '16px' }}
          >
            <LogIn size={14} /> {busy ? 'Authenticating...' : 'Sign in to Workspace'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '11px', color: 'var(--muted)' }}>
            Need an account?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
