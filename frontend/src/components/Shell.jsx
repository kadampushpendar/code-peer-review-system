import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Bell,
  LogOut,
  Search,
  Menu,
  X,
  Layers,
  ChevronDown,
  Cpu,
  FileCode2,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickItems, setQuickItems] = useState({ subs: [], reviews: [] });

  useEffect(() => {
    api.notifications()
      .then((items) => setUnread(items.filter((x) => !x.read).length))
      .catch(() => {});
  }, [location.pathname]);

  // Load quick search data on demand
  useEffect(() => {
    if (searchOpen) {
      Promise.all([api.submissions(), api.reviews()])
        .then(([subs, reviews]) => setQuickItems({ subs: subs || [], reviews: reviews || [] }))
        .catch(() => {});
    }
  }, [searchOpen]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute breadcrumb text
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return user?.role === 'TEACHER' ? 'INSTRUCTOR REPORTS' : 'DASHBOARD';
    if (path === '/submit') return 'NEW SUBMISSION';
    if (path === '/notifications') return 'NOTIFICATIONS';
    if (path.startsWith('/reviews/')) return 'CODE REVIEW WORKSPACE';
    return 'SYSTEM';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredSubs = quickItems.subs.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredReviews = quickItems.reviews.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      {/* Background ambient glows */}
      <div className="glow g1" />
      <div className="glow g2" />

      {/* Mobile scrim overlay */}
      {mobileOpen && (
        <div
          className="scrim"
          style={{ display: 'block' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`sidebar ${mobileOpen ? 'mobile' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <FileCode2 size={16} />
          </div>
          <b>
            <span>KAEL</span>·9
          </b>
          <small>v2.4</small>
          {mobileOpen && (
            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace">
          <span>
            <Layers size={16} />
          </span>
          <div>
            <b>CORE ENGINE</b>
            <small>peer-review / live</small>
          </div>
          <ChevronDown size={14} />
        </div>

        <nav>
          <div className="nav-group">
            <small>WORKSPACE</small>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <LayoutDashboard size={16} />
              <span>{user?.role === 'TEACHER' ? 'Instructor Reports' : 'Dashboard'}</span>
            </NavLink>

            {user?.role === 'STUDENT' && (
              <NavLink
                to="/submit"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <UploadCloud size={16} />
                <span>Submit Code</span>
              </NavLink>
            )}

            <NavLink
              to="/notifications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Bell size={16} />
              <span>Notifications</span>
              {unread > 0 && <span className="nav-badge">{unread}</span>}
            </NavLink>
          </div>

          <div className="nav-group">
            <small>MODULE SPECS</small>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <ShieldCheck size={16} style={{ color: 'var(--green)' }} />
              <span>Java 17 AST Engine</span>
            </div>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--cyan)' }} />
              <span>Auto-Assignment Active</span>
            </div>
          </div>
        </nav>

        <div className="side-bottom">
          <div className="upgrade">
            <Cpu size={16} />
            <b>Peer Review System</b>
            <p>Rigorous, anonymous peer evaluation with inline line-by-line feedback.</p>
              <button onClick={() => navigate(user?.role === 'STUDENT' ? '/submit' : '/dashboard')}>
              {user?.role === 'STUDENT' ? 'New Submission ➔' : 'View Class Stats ➔'}
            </button>
          </div>

          <div className="profile">
            <div className="avatar blue">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <div>
              <b>{user?.name}</b>
              <small>{user?.role} · {user?.email}</small>
            </div>
            <button
              onClick={handleLogout}
              className="icon-button"
              title="Log out"
              style={{ width: '28px', height: '28px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main layout area */}
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="crumb">
              <span>KAEL-9</span> / <b>{getBreadcrumb()}</b>
            </div>
          </div>

          <div className="top-actions">
            <button
              className="search-button"
              onClick={() => setSearchOpen(true)}
              title="Open search (Cmd+K)"
            >
              <Search size={13} />
              <span>Quick search or jump...</span>
              <kbd>⌘K</kbd>
            </button>

            <Link
              to="/notifications"
              className="icon-button"
              title="Notifications"
            >
              <Bell size={16} />
              {unread > 0 && <i />}
            </Link>

            <button
              className="icon-button"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="content">
          <Outlet />
        </main>

        <footer>
          <span>
            <i /> ALL PEER-REVIEW NODES OPERATIONAL
          </span>
          <span>
            KAEL-9 ENGINE <i>v2.4.0-STABLE</i>
          </span>
        </footer>
      </div>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="modal-bg" onClick={() => setSearchOpen(false)}>
          <div
            className="modal"
            style={{ width: 'min(100%, 540px)', padding: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="input-search" style={{ width: '100%', marginBottom: '12px' }}>
              <Search size={14} />
              <input
                autoFocus
                placeholder="Search reviews, submissions, files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd style={{ font: '9px DM Mono', color: 'var(--muted)' }}>ESC</kbd>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {filteredReviews.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <small className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
                    REVIEWS ASSIGNED
                  </small>
                  {filteredReviews.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="recent-row"
                      style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: '6px' }}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/reviews/${r.id}`);
                      }}
                    >
                      <div className="file-icon java" style={{ width: '26px', height: '26px' }}>
                        <FileCode2 size={14} />
                      </div>
                      <div className="review-info">
                        <b>{r.title}</b>
                        <small>Author: {r.authorName}</small>
                      </div>
                      <span className="open-btn">Open ➔</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredSubs.length > 0 && (
                <div>
                  <small className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
                    YOUR SUBMISSIONS
                  </small>
                  {filteredSubs.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="recent-row"
                      style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: '6px' }}
                      onClick={() => {
                        setSearchOpen(false);
                        if (s.reviewId) navigate(`/reviews/${s.reviewId}`);
                      }}
                    >
                      <div className="file-icon java" style={{ width: '26px', height: '26px' }}>
                        <FileCode2 size={14} />
                      </div>
                      <div className="review-info">
                        <b>{s.title}</b>
                        <small>{s.description || 'No description'}</small>
                      </div>
                      {s.reviewId ? (
                        <span className="open-btn">View ➔</span>
                      ) : (
                        <span className="status pending"><i></i> Waiting</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {filteredSubs.length === 0 && filteredReviews.length === 0 && (
                <div className="empty" style={{ minHeight: '120px' }}>
                  <b>No matching records</b>
                  <span>Try searching by title or author name.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
