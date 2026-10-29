import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCode2, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    classroomCode: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.register(form);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <div className="glow g1" />
      <div className="glow g2" />

      <div className="auth-wrapper">
        <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '480px' }}>
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
            <small>REGISTRATION</small>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1>Create Account</h1>
            <p className="subtitle">
              Join the institutional peer review grid using your university credentials.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="name">FULL NAME</label>
            <input
              id="name"
              required
              placeholder="e.g. Alice Walker"
              value={form.name}
              onChange={setField('name')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">INSTITUTIONAL EMAIL</label>
            <input
              id="email"
              type="email"
              required
              placeholder="alice@university.edu"
              value={form.email}
              onChange={setField('email')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">PASSWORD (MIN 8 CHARACTERS)</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={form.password}
              onChange={setField('password')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">USER ROLE</label>
            <select id="role" value={form.role} onChange={setField('role')}>
              <option value="STUDENT">Student (Submit code & review peers)</option>
              <option value="TEACHER">Instructor (Monitor cohort analytics)</option>
            </select>
          </div>

          {form.role === 'STUDENT' && (
            <div className="form-field">
              <label htmlFor="classroomCode">INSTRUCTOR CLASSROOM CODE</label>
              <input
                id="classroomCode"
                required
                placeholder="Enter the code shared by your instructor"
                value={form.classroomCode}
                onChange={setField('classroomCode')}
              />
              <small>Ask your instructor for their classroom code before signing up.</small>
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          <button
            type="submit"
            className="btn"
            disabled={busy}
            style={{ width: '100%', minHeight: '40px', marginTop: '16px' }}
          >
            <UserPlus size={14} /> {busy ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '11px', color: 'var(--muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
