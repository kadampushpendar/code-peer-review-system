import { useState } from 'react';
import { FileCode, MessageSquare, AlertCircle, AlertTriangle, Lightbulb, Send } from 'lucide-react';

const SEVERITY_INFO = {
  ERROR: {
    color: '#ff7d8a',
    bg: '#2d1419',
    border: '#6b2533',
    icon: AlertCircle,
    label: 'Error',
  },
  WARNING: {
    color: '#f3bd5e',
    bg: '#2b2112',
    border: '#614821',
    icon: AlertTriangle,
    label: 'Warning',
  },
  SUGGESTION: {
    color: '#c6c6c6',
    bg: '#1e1e1e',
    border: '#404040',
    icon: Lightbulb,
    label: 'Suggestion',
  },
};

export default function CodeEditor({ code, comments = [], canComment, onAddComment }) {
  const [openLine, setOpenLine] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [severity, setSeverity] = useState('SUGGESTION');
  const [submitting, setSubmitting] = useState(false);

  const lines = code ? code.split('\n') : [];

  async function handleSaveComment(lineNum) {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const success = await onAddComment({
      lineNumber: lineNum,
      commentText: commentText.trim(),
      severity,
    });
    setSubmitting(false);
    if (success) {
      setCommentText('');
      setOpenLine(null);
    }
  }

  return (
    <div className="panel editor">
      <div className="editor-head">
        <span>
          <FileCode size={15} />
          <b>Java Source Inspector</b>
        </span>
        <span className="branch">syntax: java 17</span>
      </div>

      <div className="code-tabs">
        <button className="active">Editor View</button>
        {canComment ? (
          <small>Click any line number to attach an inline annotation</small>
        ) : (
          <small>Read-only mode</small>
        )}
      </div>

      <div className="code-area">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const lineComments = comments.filter((c) => c.lineNumber === lineNum);
          const hasComments = lineComments.length > 0;
          const isInputOpen = openLine === lineNum;

          return (
            <div key={lineNum}>
              <div
                className={`code-line ${hasComments ? 'added' : ''}`}
                style={{ position: 'relative' }}
              >
                <button
                  type="button"
                  disabled={!canComment}
                  onClick={() => setOpenLine(isInputOpen ? null : lineNum)}
                  title={canComment ? `Click to comment on line ${lineNum}` : `Line ${lineNum}`}
                  className="line-num"
                  style={{
                    background: 'transparent',
                    border: 0,
                    outline: 0,
                    color: hasComments ? 'var(--cyan)' : '#606060',
                    cursor: canComment ? 'pointer' : 'default',
                    fontWeight: hasComments ? 700 : 400,
                  }}
                >
                  {lineNum}
                </button>
                <b>{line || ' '}</b>
                {hasComments && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      paddingRight: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--cyan)',
                      fontSize: '9px',
                    }}
                  >
                    <MessageSquare size={11} /> {lineComments.length}
                  </span>
                )}
              </div>

              {/* Render existing comments for this line */}
              {lineComments.map((c) => {
                const info = SEVERITY_INFO[c.severity] || SEVERITY_INFO.SUGGESTION;
                const IconComponent = info.icon;
                return (
                  <div
                    key={c.id}
                    style={{
                      margin: '6px 14px 8px 48px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: info.bg,
                      border: `1px solid ${info.border}`,
                      color: '#e8e8e8',
                      fontSize: '10px',
                      fontFamily: 'Manrope, sans-serif',
                      whiteSpace: 'normal',
                      boxShadow: '0 4px 15px #00000040',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        color: info.color,
                        fontWeight: 700,
                        font: '9px DM Mono',
                      }}
                    >
                      <IconComponent size={12} />
                      <span>{info.label.toUpperCase()}</span>
                      <span style={{ color: '#7e7e7e', marginLeft: 'auto', fontWeight: 400 }}>
                        Line {lineNum}
                      </span>
                    </div>
                    <div style={{ lineHeight: '1.6', overflowWrap: 'anywhere' }}>{c.commentText}</div>
                  </div>
                );
              })}

              {/* Inline Comment Input Box */}
              {isInputOpen && (
                <div
                  style={{
                    margin: '8px 14px 10px 48px',
                    padding: '10px',
                    borderRadius: '7px',
                    background: '#131313',
                    border: '1px solid #404040',
                    fontFamily: 'Manrope, sans-serif',
                    whiteSpace: 'normal',
                    boxShadow: '0 8px 25px #00000060',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <small className="eyebrow" style={{ color: 'var(--cyan)' }}>
                      ADD INLINE FEEDBACK (LINE {lineNum})
                    </small>
                    <div style={{ marginLeft: 'auto' }}>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        style={{
                          background: '#0a0a0a',
                          border: '1px solid #353535',
                          color: '#cccccc',
                          borderRadius: '5px',
                          padding: '4px 7px',
                          fontSize: '10px',
                        }}
                      >
                        <option value="SUGGESTION">Suggestion</option>
                        <option value="WARNING">Warning</option>
                        <option value="ERROR">Error</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      autoFocus
                      placeholder={`Write constructive comment on line ${lineNum}...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveComment(lineNum);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: '#0b0b0b',
                        border: '1px solid #343434',
                        borderRadius: '6px',
                        color: '#e6e6e6',
                        fontSize: '10px',
                      }}
                    />
                    <button
                      type="button"
                      className="btn"
                      disabled={submitting}
                      onClick={() => handleSaveComment(lineNum)}
                      style={{ minHeight: '32px', padding: '0 10px' }}
                    >
                      <Send size={12} /> Post
                    </button>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => setOpenLine(null)}
                      style={{ minHeight: '32px', padding: '0 8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="editor-foot">
        <span>UTF-8</span>
        <span>Java 17 AST Verified</span>
        <span>{comments.length} Comments Logged</span>
        <span>Ready</span>
      </div>
    </div>
  );
}
