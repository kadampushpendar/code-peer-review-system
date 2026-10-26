import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  FileCode2,
  CheckCircle2,
  Award,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusTag } from '../components/ReviewCard';

export default function TeacherDashboard() {
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.report()
      .then(setReport)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (report && location.hash === '#class-stats') {
      document.getElementById('class-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, report]);

  if (error) {
    return (
      <div className="error-banner" style={{ margin: '20px 0' }}>
        System error: {error}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="empty">
        <b>Loading Instructor Analytics...</b>
        <span>Querying cohort participation and peer review metrics.</span>
      </div>
    );
  }

  const pct = report.reviewsTotal
    ? Math.round((report.reviewsCompleted / report.reviewsTotal) * 100)
    : 0;

  const filteredRows = report.rows.filter((x) => {
    const matchesQuery =
      x.title?.toLowerCase().includes(query.toLowerCase()) ||
      x.author?.toLowerCase().includes(query.toLowerCase()) ||
      x.reviewer?.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUBMITTED' && x.status === 'SUBMITTED') ||
      (statusFilter === 'IN_PROGRESS' && x.status === 'IN_PROGRESS') ||
      (statusFilter === 'UNASSIGNED' && (!x.status || x.status === 'UNASSIGNED'));
    return matchesQuery && matchesStatus;
  });

  return (
    <>
      {/* Header */}
      <div className="heading">
        <div>
          <span className="eyebrow">
            <span className="online" /> INSTRUCTOR CONSOLE
          </span>
          <h1>Review Progress & Analytics</h1>
          <p>Real-time cohort participation and feedback quality across all Java submissions.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-top">
            <span>TOTAL STUDENTS</span>
            <i className="cyan">
              <Users size={16} />
            </i>
          </div>
          <b>{report.students}</b>
          <div className="metric-foot">
            <strong>Active</strong> <span>participants</span>
          </div>
          <div className="metric-line cyan" />
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>SUBMISSIONS</span>
            <i className="amber">
              <FileCode2 size={16} />
            </i>
          </div>
          <b>{report.submissions}</b>
          <div className="metric-foot">
            <strong>Repositories</strong> <span>uploaded</span>
          </div>
          <div className="metric-line amber" />
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>REVIEWS COMPLETED</span>
            <i className="green">
              <CheckCircle2 size={16} />
            </i>
          </div>
          <b>{pct}%</b>
          <div className="metric-foot">
            <strong>{report.reviewsCompleted}</strong> <span>of {report.reviewsTotal} done</span>
          </div>
          <div className="metric-line green" />
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>AVERAGE SCORE</span>
            <i className="purple">
              <Award size={16} />
            </i>
          </div>
          <b>{report.averageScore == null ? '–' : report.averageScore.toFixed(1)}</b>
          <div className="metric-foot">
            <strong>Out of 10.0</strong> <span>scale</span>
          </div>
          <div className="metric-line purple" />
        </div>
      </div>

      {/* All Submissions Table with search and filter tools */}
      <div className="panel" style={{ marginBottom: '22px' }}>
        <div className="panel-heading" style={{ padding: '4px 0 12px' }}>
          <div>
            <h3>All Student Submissions</h3>
            <p>Live status of every Java submission, assigned peer, and review score.</p>
          </div>
        </div>

        <div className="table-tools">
          <div className="input-search">
            <Search size={14} />
            <input
              placeholder="Filter by title, author, or reviewer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter">
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Review</option>
              <option value="SUBMITTED">Completed</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SUBMISSION</th>
                <th>AUTHOR</th>
                <th>PEER REVIEWER</th>
                <th>STATUS</th>
                <th>COMMENTS</th>
                <th>SCORE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty" style={{ minHeight: '120px' }}>
                      <b>No matching submissions found</b>
                      <span>Try adjusting your search criteria or status filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((x) => (
                  <tr key={x.submissionId}>
                    <td>
                      <div className="table-file">
                        <div className="file-icon java">
                          <FileCode2 size={16} />
                        </div>
                        <div>
                          <b>{x.title}</b>
                          <small>Java 17 Source</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="author-cell">
                        <div className="avatar sm blue">
                          {x.author.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{x.author}</span>
                      </div>
                    </td>
                    <td>
                      {x.reviewer ? (
                        <div className="author-cell">
                          <div className="avatar sm violet">
                            {x.reviewer.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{x.reviewer}</span>
                        </div>
                      ) : (
                        <span className="muted">Pending assignment</span>
                      )}
                    </td>
                    <td>
                      <StatusTag status={x.status} />
                    </td>
                    <td>
                      <span className="lang-pill">💬 {x.commentCount}</span>
                    </td>
                    <td>
                      <b style={{ color: x.score != null ? 'var(--cyan)' : 'var(--muted)', font: '11px DM Mono' }}>
                        {x.score != null ? `${x.score} / 10` : '–'}
                      </b>
                    </td>
                    <td>
                      {x.reviewId ? (
                        <Link className="open-btn" to={`/reviews/${x.reviewId}`}>
                          Inspect <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <span className="muted" style={{ fontSize: '9px' }}>–</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Participation Section */}
      <div id="class-stats" className="team-hero panel">
        <div className="team-symbol">
          <Users size={24} />
        </div>
        <div>
          <h2>Cohort Participation Stream</h2>
          <p>
            Track each student's progress to ensure accountability across both code submissions and
            mandatory peer evaluations.
          </p>
        </div>
        <div className="team-count">
          <b>{report.students}</b>
          <span>ENROLLED STUDENTS</span>
          <div>
            {report.participation.slice(0, 4).map((p, i) => (
              <div key={p.email} className={`avatar sm ${['blue', 'green', 'violet', 'pink'][i % 4]}`}>
                {p.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="team-grid">
        {report.participation.map((p, i) => {
          const allDone = p.reviewsAssigned > 0 && p.reviewsDone >= p.reviewsAssigned;
          return (
            <div key={p.email} className="panel member-card">
              <div className="member-top">
                <div className={`avatar ${['blue', 'green', 'violet', 'pink'][i % 4]}`}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className={`status ${allDone ? 'approved' : 'pending'}`}>
                  <i /> {allDone ? 'Reviews Complete' : 'In Progress'}
                </span>
              </div>
              <h3>{p.name}</h3>
              <p className="member-email">{p.email}</p>
              <div className="member-foot">
                <span className="lang-pill">📁 {p.submitted} submitted</span>
                <span className="lang-pill">
                  ✓ {p.reviewsDone}/{p.reviewsAssigned} reviews
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
