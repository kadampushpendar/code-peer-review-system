import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCode2,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function SubmitCode() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    sourceCode: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.createSubmission(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={13} /> Back to dashboard
      </Link>

      <div className="heading">
        <div>
          <span className="eyebrow">
            <span className="online" /> JAVA COMPILER PIPELINE
          </span>
          <h1>Submit Java Code</h1>
          <p>
            Upload your Java program to receive peer evaluation and automated AST compliance checks.
          </p>
        </div>
      </div>

      <div className="submit-layout">
        {/* Main form */}
        <form onSubmit={handleSubmit} className="panel submit-form">
          <div className="form-field">
            <label htmlFor="title">SUBMISSION TITLE (FILENAME)</label>
            <input
              id="title"
              required
              maxLength={200}
              placeholder="e.g. BankAccount.java"
              value={form.title}
              onChange={setField('title')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="desc">REVIEW INSTRUCTIONS / DESCRIPTION</label>
            <input
              id="desc"
              maxLength={500}
              placeholder="What architectural aspects or methods should the peer reviewer focus on?"
              value={form.description}
              onChange={setField('description')}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '8px' }}>
            <label htmlFor="code">JAVA 17 SOURCE CODE</label>
            <div className="panel editor" style={{ margin: '4px 0 0' }}>
              <div className="editor-head">
                <span>
                  <FileCode2 size={14} />
                  <b>{form.title || 'Source.java'}</b>
                </span>
                <span className="branch">syntax: java 17</span>
              </div>
              <textarea
                id="code"
                required
                minLength={10}
                maxLength={50000}
                spellCheck="false"
                rows={16}
                placeholder="Paste your Java source code here..."
                value={form.sourceCode}
                onChange={setField('sourceCode')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#0f0f0f',
                  border: 0,
                  outline: 0,
                  color: '#e8e8e8',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '11px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div className="editor-foot">
                <span>UTF-8</span>
                <span>Ready for static analysis</span>
                <span>{form.sourceCode ? form.sourceCode.split('\n').length : 0} lines</span>
              </div>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="submit-actions">
            <button type="submit" className="btn" disabled={busy}>
              <UploadCloud size={14} /> {busy ? 'Submitting...' : 'Submit for Peer Review'}
            </button>
            <Link to="/dashboard" className="btn outline">
              Cancel
            </Link>
          </div>
        </form>

        {/* Right Info Column */}
        <div>
          <div className="panel" style={{ padding: '18px', marginBottom: '14px' }}>
            <div className="panel-heading">
              <div>
                <h3>Automated Assignment</h3>
                <p>System matching protocol</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={18} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '10px', color: '#a4a4a4', lineHeight: 1.6 }}>
                  <b style={{ color: '#ececec', display: 'block' }}>Conflict-Free Matching</b>
                  Classmates are automatically assigned as reviewers. You will never be assigned to review your own code.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '10px', color: '#a4a4a4', lineHeight: 1.6 }}>
                  <b style={{ color: '#ececec', display: 'block' }}>Instant Feedback Notifications</b>
                  As soon as your peer logs inline annotations or submits their evaluation, you will receive an alert.
                </div>
              </div>
            </div>
          </div>

          <div className="tip">
            <div>
              <b>Submission Tips</b>
              <span>
                Provide descriptive class names and comments where complex algorithms are implemented. This helps your peer provide higher quality feedback.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
