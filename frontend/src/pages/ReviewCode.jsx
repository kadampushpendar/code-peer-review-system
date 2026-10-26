import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileCode2,
  Send,
  Award,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import { StatusTag } from '../components/ReviewCard';

const SEVERITY_CONFIG = {
  ERROR: { color: '#ff7d8a', icon: AlertCircle },
  WARNING: { color: '#f3bd5e', icon: AlertTriangle },
  SUGGESTION: { color: '#c6c6c6', icon: Lightbulb },
};

export default function ReviewCode() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.review(id)
      .then((r) => {
        setReview(r);
        setFeedback(r.feedback || '');
        setScore(r.score ?? '');
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (!review) {
    return error ? (
      <div className="error-banner" style={{ margin: '20px 0' }}>
        Error loading review: {error}
      </div>
    ) : (
      <div className="empty">
        <b>Loading Workspace...</b>
        <span>Loading Java source and peer review annotations.</span>
      </div>
    );
  }

  const canReview = user?.id === review.reviewerId && review.status === 'IN_PROGRESS';

  async function addComment(body) {
    setError('');
    try {
      const c = await api.addComment(id, body);
      setReview((r) => ({ ...r, comments: [...r.comments, c] }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function submitReview(e) {
    if (e) e.preventDefault();
    if (score === '' || Number(score) < 0 || Number(score) > 10) {
      setError('Please provide a score between 0 and 10.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.submitReview(id, { feedback, score: Number(score) });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={13} /> Back to dashboard
      </Link>

      <div className="workspace-heading">
        <div>
          <h1>{review.title}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '11px' }}>
            {review.description || 'No description provided by author.'}
          </p>
        </div>
      </div>

      <div className="workspace-meta">
        <div className="author-cell">
          <div className="avatar sm blue">
            {review.authorName ? review.authorName.slice(0, 2).toUpperCase() : 'AU'}
          </div>
          <span>
            Author: <b>{review.authorName}</b>
          </span>
        </div>

        <div className="author-cell" style={{ marginLeft: '12px' }}>
          <div className="avatar sm violet">
            {review.reviewerName ? review.reviewerName.slice(0, 2).toUpperCase() : 'RV'}
          </div>
          <span>
            Reviewer: <b>{review.reviewerName}</b>
          </span>
        </div>

        <span className="lang-pill">☕ JAVA 17</span>
        <span className="branch">git: main</span>
        <StatusTag status={review.status} />
      </div>

      <div className="workspace-grid">
        {/* Left Column: Code viewer & line comments */}
        <div>
          <CodeEditor
            code={review.sourceCode}
            comments={review.comments}
            canComment={canReview}
            onAddComment={addComment}
          />
        </div>

        {/* Right Column: Discussion & Evaluation */}
        <div className="panel discussion">
          <div className="panel-heading" style={{ padding: 0 }}>
            <div>
              <h3>Peer Evaluation</h3>
              <p>Comments stream and final review summary</p>
            </div>
            <span className="comment-count">
              {review.comments?.length || 0} Comments
            </span>
          </div>

          <div className="summary">
            <div>
              <b>{review.status === 'SUBMITTED' ? 'Review Finalized' : 'Review In Progress'}</b>
              <small>
                {canReview
                  ? 'Add line-by-line annotations, write overall feedback, and assign a score.'
                  : review.status === 'SUBMITTED'
                  ? 'The assigned peer reviewer has submitted their evaluation.'
                  : 'Awaiting reviewer feedback.'}
              </small>
            </div>
            {review.score != null && (
              <span
                style={{
                  marginLeft: 'auto',
                  font: '14px DM Mono',
                  fontWeight: 800,
                  color: 'var(--cyan)',
                }}
              >
                {review.score} / 10
              </span>
            )}
          </div>

          {/* List of comments posted so far */}
          <div style={{ marginTop: '16px' }}>
            <small className="eyebrow" style={{ display: 'block', marginBottom: '10px' }}>
              INLINE ANNOTATIONS ({review.comments?.length || 0})
            </small>

            {(!review.comments || review.comments.length === 0) ? (
              <div
                className="empty"
                style={{
                  minHeight: '90px',
                  padding: '14px',
                  background: '#0f0f0f',
                  borderRadius: '7px',
                }}
              >
                <b>No inline comments yet</b>
                <span>
                  {canReview
                    ? 'Click on any line number in the code to add your feedback.'
                    : 'The reviewer has not attached line annotations.'}
                </span>
              </div>
            ) : (
              <div className="comments">
                {review.comments.map((c) => {
                  const conf = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.SUGGESTION;
                  const Icon = conf.icon;
                  return (
                    <div key={c.id} className="comment">
                      <div className="avatar sm violet">
                        {review.reviewerName ? review.reviewerName.slice(0, 2).toUpperCase() : 'RV'}
                      </div>
                      <div>
                        <div className="comment-head">
                          <b>Line {c.lineNumber}</b>
                          <small
                            style={{
                              color: conf.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Icon size={10} /> {c.severity}
                          </small>
                        </div>
                        <p>{c.commentText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overall Review Feedback Section */}
          <div style={{ marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <small className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
              OVERALL EVALUATION
            </small>

            {canReview ? (
              <form onSubmit={submitReview}>
                <div className="form-field">
                  <label htmlFor="fb">SUMMARY & ARCHITECTURAL SUGGESTIONS</label>
                  <textarea
                    id="fb"
                    rows={4}
                    maxLength={5000}
                    placeholder="Summarize code structure, clarity, adherence to Java conventions, and suggested improvements..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="score">FINAL SCORE (0.0 TO 10.0)</label>
                  <input
                    id="score"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    placeholder="e.g. 8.5"
                    style={{ maxWidth: '140px' }}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="decision">
                  <span>Ready to finalize review?</span>
                  <button type="submit" className="btn" disabled={submitting}>
                    <CheckCircle size={13} /> {submitting ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  background: '#0f0f0f',
                  padding: '14px',
                  borderRadius: '7px',
                  border: '1px solid #212121',
                }}
              >
                <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#c7c7c7', lineHeight: 1.7 }}>
                  {review.feedback || 'The reviewer did not leave an overall summary.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} style={{ color: 'var(--cyan)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>
                    Final Score:{' '}
                    <span style={{ color: 'var(--cyan)', font: '12px DM Mono' }}>
                      {review.score != null ? `${review.score} / 10` : '–'}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
