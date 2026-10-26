import { Link } from 'react-router-dom';
import { FileCode } from 'lucide-react';

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'In Review', className: 'status in-review' },
  SUBMITTED: { label: 'Reviewed', className: 'status approved' },
  UNASSIGNED: { label: 'Awaiting Peer', className: 'status pending' },
  PENDING: { label: 'Pending', className: 'status pending' },
  APPROVED: { label: 'Approved', className: 'status approved' },
  CHANGES_REQUESTED: { label: 'Changes Req.', className: 'status changes-requested' },
};

export function StatusTag({ status }) {
  const conf = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: status === 'SUBMITTED' ? 'status approved' : 'status pending',
  };

  return (
    <span className={conf.className}>
      <i /> {conf.label}
    </span>
  );
}

/** One row in a list of submissions or assigned reviews matching the KAEL-9 theme. */
export default function ReviewCard({ title, subtitle, status, commentCount, to, action, authorName }) {
  return (
    <div className="recent-row">
      <div className="file-icon java" title="Java Source">
        <FileCode size={18} />
      </div>
      <div className="review-info">
        <b>{title}</b>
        <small>{subtitle}</small>
      </div>
      {authorName && (
        <div className="review-author">
          <div className="avatar sm blue">
            {authorName.slice(0, 2).toUpperCase()}
          </div>
          <span>{authorName}</span>
        </div>
      )}
      {status && <StatusTag status={status} />}
      {commentCount != null && (
        <span className="lang-pill" title="Comments count">
          💬 {commentCount}
        </span>
      )}
      {to && (
        <Link to={to} className="open-btn">
          {action || 'Open'} ➔
        </Link>
      )}
    </div>
  );
}
