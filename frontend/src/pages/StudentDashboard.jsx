import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCode2,
  Clock,
  CheckCircle2,
  MessageSquare,
  Plus,
  Calendar,
  Sparkles,
  Shield,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReviewCard from '../components/ReviewCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('assigned'); // 'assigned' | 'submissions'

  useEffect(() => {
    Promise.all([api.submissions(), api.reviews()])
      .then(([s, r]) => {
        setSubs(s || []);
        setReviews(r || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="error-banner" style={{ margin: '20px 0' }}>
        System error: {error}
      </div>
    );
  }

  if (!subs) {
    return (
      <div className="empty">
        <b>Initializing Console...</b>
        <span>Fetching peer review metrics and submissions.</span>
      </div>
    );
  }

  const pending = reviews.filter((r) => r.status === 'IN_PROGRESS').length;
  const completed = reviews.length - pending;
  const received = subs.reduce((n, s) => n + (s.commentCount || 0), 0);
  const totalAssigned = reviews.length;
  const completionPct = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 100;
  const circumference = 264;
  const strokeOffset = circumference - (circumference * completionPct) / 100;
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const activityByDate = new Map();
  const recordActivity = (timestamp, activity) => {
    if (!timestamp) return;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime()) || date < weekStart) return;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const counts = activityByDate.get(dateKey) || { submissions: 0, reviews: 0 };
    counts[activity] += 1;
    activityByDate.set(dateKey, counts);
  };
  subs.forEach((submission) => recordActivity(submission.createdAt, 'submissions'));
  reviews
    .filter((review) => review.status === 'SUBMITTED')
    .forEach((review) => recordActivity(review.completedAt, 'reviews'));
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const counts = activityByDate.get(dateKey) || { submissions: 0, reviews: 0 };
    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      date: date.toLocaleDateString(),
      submissions: counts.submissions,
      reviews: counts.reviews,
    };
  });
  const activityScale = Math.max(
    2,
    Math.ceil(Math.max(...weeklyActivity.map((day) => day.submissions + day.reviews)) / 2) * 2,
  );
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}–${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return (
    <>
      {/* Welcome header */}
      <div className="welcome">
        <div>
          <span className="eyebrow">
            <span className="online" /> PEER REVIEW GRID ONLINE
          </span>
          <h1>
            Welcome back, <span>{user?.name}</span>
          </h1>
          <p>Track your Java submissions, inspect peer feedback, and evaluate assigned code.</p>
        </div>
        <Link to="/submit" className="btn">
          <Plus size={14} /> New Submission
        </Link>
      </div>

      {/* Cyberpunk Hero Feature Section */}
      <div className="hero">
        <div className="hero-grid" />
        <div className="hero-copy">
          <small>
            <span>⚡</span> DISTRIBUTED PEER CODE REVIEW PROTOCOL
          </small>
          <h2>
            Collaborative code review with <em>instant feedback</em>.
          </h2>
          <p>
            Submit Java source code, trigger automated checks, and receive rigorous peer evaluations
            with actionable inline annotations.
          </p>
          <div className="hero-buttons">
            <Link to="/submit" className="btn">
              Submit Code
            </Link>
            <Link to="/notifications" className="btn outline">
              View Alerts
            </Link>
            <span>
              <span style={{ color: 'var(--green)' }}>●</span> Live peer sync active
            </span>
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="cross">+</div>
          <div className="float-label fl1">
            <Sparkles size={12} /> Automated Linter
          </div>
          <div className="float-label fl2">
            <Shield size={12} /> Peer Validated
          </div>

          <div className="floating-code">
            <div className="code-head">
              <i />
              <i />
              <i />
              <span>BankAccount.java</span>
            </div>
            <div className="code-sample">
              <span>01</span>
              <code>
                <b>public class</b> BankAccount &#202020;
              </code>
              <span>02</span>
              <code>
                &nbsp;&nbsp;<em>private double</em> balance;
              </code>
              <span>03</span>
              <code>
                &nbsp;&nbsp;<strong>@Override</strong>
              </code>
              <span>04</span>
              <code>
                &nbsp;&nbsp;<i>public void</i> sync() &#202020; ... &#222;
              </code>
            </div>
            <div className="verified">
              <span>✓</span> Verified Clean
            </div>
          </div>
          <div className="scanline" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-top">
            <span>MY SUBMISSIONS</span>
            <i className="cyan">
              <FileCode2 size={16} />
            </i>
          </div>
          <b>{subs.length}</b>
          <div className="metric-foot">
            <strong>Active</strong> <span>Java modules</span>
          </div>
          <div className="metric-line cyan" />
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>PENDING REVIEWS</span>
            <i className="amber">
              <Clock size={16} />
            </i>
          </div>
          <b>{pending}</b>
          <div className="metric-foot">
            <strong>{pending > 0 ? 'Requires action' : 'All clear'}</strong>
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
          <b>{completed}</b>
          <div className="metric-foot">
            <strong>{completionPct}%</strong> <span>completion rate</span>
          </div>
          <div className="metric-line green" />
        </div>

        <div className="metric">
          <div className="metric-top">
            <span>COMMENTS RECEIVED</span>
            <i className="purple">
              <MessageSquare size={16} />
            </i>
          </div>
          <b>{received}</b>
          <div className="metric-foot">
            <strong>Peer feedback</strong> <span>annotations</span>
          </div>
          <div className="metric-line purple" />
        </div>
      </div>

      {/* Dashboard Grid: Left list + Right progress gauge */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Peer Review Stream</h3>
              <p>Manage code reviews assigned to you and monitor your submitted repositories.</p>
            </div>
          </div>

          <div className="tabs" style={{ marginTop: '14px' }}>
            <button
              className={tab === 'assigned' ? 'selected' : ''}
              onClick={() => setTab('assigned')}
            >
              Assigned to You <span>{reviews.length}</span>
            </button>
            <button
              className={tab === 'submissions' ? 'selected' : ''}
              onClick={() => setTab('submissions')}
            >
              My Submissions <span>{subs.length}</span>
            </button>
          </div>

          <div className="recent-list">
            {tab === 'assigned' ? (
              reviews.length === 0 ? (
                <div className="empty">
                  <b>Nothing assigned yet</b>
                  <span>New peer review requests will appear here when classmates submit code.</span>
                </div>
              ) : (
                reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    title={r.title}
                    subtitle={`Java Code · ${r.comments?.length || 0} comments`}
                    authorName={r.authorName}
                    status={r.status}
                    to={`/reviews/${r.id}`}
                    action={r.status === 'SUBMITTED' ? 'View Feedback' : 'Start Review'}
                  />
                ))
              )
            ) : (
              subs.length === 0 ? (
                <div className="empty">
                  <b>No submissions yet</b>
                  <span>Submit your first Java file to get automated peer feedback.</span>
                </div>
              ) : (
                subs.map((s) => (
                  <ReviewCard
                    key={s.id}
                    title={s.title}
                    subtitle={`${s.description || 'No description'} · ${
                      s.reviewerName ? 'Reviewer: ' + s.reviewerName : 'Awaiting reviewer assignment'
                    }`}
                    status={s.reviewStatus || 'UNASSIGNED'}
                    commentCount={s.commentCount}
                    to={s.reviewId ? `/reviews/${s.reviewId}` : null}
                    action="View Feedback"
                  />
                ))
              )
            )}
          </div>

          <div className="panel-footer">
            <span>Showing latest active records</span>
            <Link to="/submit" className="text-link">
              Submit new code ➔
            </Link>
          </div>
        </div>

        {/* Right side: Progress Ring & Milestones */}
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h3>Review Completion</h3>
              <p>Peer assignment milestones</p>
            </div>
          </div>

          <div className="ring-wrap">
            <svg viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="42" />
              <circle
                className="ring-value"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div>
              <b>
                {completionPct}
                <span>%</span>
              </b>
              <small>COMPLETED</small>
            </div>
          </div>

          <div className="center-caption">
            <b>Evaluation Target</b>
            <span>{completed} of {totalAssigned || 1} peer reviews finished</span>
          </div>

          <div className="skill">
            <div>
              <span>Code Quality Standard</span>
              <b>94%</b>
            </div>
            <div className="bar">
              <i className="cyan" style={{ width: '94%' }} />
            </div>
          </div>

          <div className="skill">
            <div>
              <span>Peer Participation</span>
              <b>{completionPct}%</b>
            </div>
            <div className="bar">
              <i className="purple" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="skill">
            <div>
              <span>Turnaround Speed</span>
              <b>98%</b>
            </div>
            <div className="bar">
              <i className="green" style={{ width: '98%' }} />
            </div>
          </div>

          <Link to="/notifications" className="progress-link">
            <Bell size={13} />
            <span>Check pending alerts</span>
            <span style={{ marginLeft: 'auto' }}>➔</span>
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Activity Chart & Mastery Goal */}
      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Weekly Review Activity</h3>
              <p>Your submissions and completed peer reviews this week</p>
            </div>
            <div className="period">
              <Calendar size={12} />
              <span>{weekLabel}</span>
            </div>
          </div>

          <div className="chart">
            <div className="chart-y">
              <span>{activityScale}</span>
              <span>{activityScale / 2}</span>
              <span>0</span>
            </div>
            <div className="chart-main">
              <div className="chart-grid">
                <i />
                <i />
                <i />
              </div>
              <div className="bars">
                {weeklyActivity.map((item) => (
                  <div key={item.date} className="bar-group">
                    <div className="bar-pair">
                      <i
                        style={{ height: `${(item.submissions / activityScale) * 100}%` }}
                        title={`${item.submissions} submissions on ${item.date}`}
                      />
                      <i
                        style={{ height: `${(item.reviews / activityScale) * 100}%` }}
                        title={`${item.reviews} completed reviews on ${item.date}`}
                      />
                    </div>
                    <span>{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="legend">
            <span>
              <i /> Submissions
            </span>
            <span>
              <i /> Reviews
            </span>
          </div>
        </div>

        {/* Goal Card */}
        <div className="panel goal">
          <div className="goal-top">
            <span>🎯</span>
            <div>
              <small>TARGET OBJECTIVE</small>
            </div>
            <b>85%</b>
          </div>
          <h3>Peer Mastery Milestone</h3>
          <p>
            Complete all assigned peer reviews and submit constructive inline suggestions to earn full
            collaborative review credit.
          </p>
          <div className="goal-bar">
            <i style={{ width: `${Math.min(100, Math.max(15, completionPct))}%` }} />
          </div>
          <div className="goal-foot">
            <span>Target: 100% completed</span>
            <b>Status: {completionPct >= 80 ? 'On Track' : 'In Progress'}</b>
          </div>
          <div className="goal-watermark">01</div>
        </div>
      </div>
    </>
  );
}
