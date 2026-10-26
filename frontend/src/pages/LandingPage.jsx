import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,60,60,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={styles.root}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Background layers */}
      <div style={styles.bgGradient} />
      <div style={styles.bgGlow} />

      {/* Eclipse orb */}
      <div style={styles.eclipseWrap}>
        <div style={styles.eclipseOuter}>
          <div style={styles.eclipseInner} />
          <div style={styles.eclipseRing} />
          <div style={styles.eclipseFlare} />
        </div>
      </div>

      {/* Mountain silhouette SVG */}
      <div style={styles.mountainWrap}>
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="footGlow" cx="65%" cy="100%" r="40%">
              <stop offset="0%" stopColor="#cc1a1a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Ground glow */}
          <ellipse cx="780" cy="380" rx="320" ry="60" fill="url(#footGlow)" />
          {/* Mountain range */}
          <polygon
            points="500,400 620,180 700,300 780,100 870,280 950,200 1050,350 1200,320 1200,400"
            fill="#0a0a0a"
          />
          <polygon
            points="0,400 100,300 200,350 320,250 420,320 500,400"
            fill="#0d0d0d"
          />
          {/* Peak glow (red light from eclipse hitting mountain) */}
          <polygon
            points="750,108 780,100 810,108 790,160 770,160"
            fill="#cc2222"
            opacity="0.25"
          />
          {/* Figure silhouette on peak */}
          <g transform="translate(768, 82)">
            {/* Body */}
            <rect x="9" y="14" width="6" height="18" rx="2" fill="#111" />
            {/* Head */}
            <circle cx="12" cy="10" r="6" fill="#111" />
            {/* Cape flowing right */}
            <path d="M15,16 Q30,28 28,42 Q20,36 15,32 Z" fill="#0d0d0d" />
            {/* Left arm */}
            <line x1="9" y1="20" x2="4" y2="28" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Red ground line */}
      <div style={styles.groundLine} />

      {/* Scan-line texture */}
      <div style={styles.scanLines} />

      {/* Corner tech decorations */}
      <div style={styles.cornerTL}>
        <span style={styles.cornerDot} />
        <span style={styles.cornerHLine} />
        <span style={styles.cornerVLine} />
      </div>
      <div style={styles.cornerBR}>
        <span style={{ ...styles.cornerDot, background: '#cc2222' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1,2,3,4].map(i => <span key={i} style={styles.dotGrid} />)}
        </div>
      </div>

      {/* ─── NAVBAR ─── */}
      <nav style={styles.nav} className="lp-navbar">
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>⬡</span>
          <span style={styles.navTitle}>PeerReview</span>
        </div>
        <div className="lp-navbar-actions">
          <div style={styles.navLinks} className="lp-navbar-links">
            <a href="#home" style={styles.navLink} className="lp-nav-link">Home</a>
            <a href="#process" style={styles.navLink} className="lp-nav-link">Process</a>
          </div>
          <Link to="/login" style={styles.navLoginBtn} className="lp-login-btn">
            Login &nbsp;→
          </Link>
        </div>
      </nav>

      {/* ─── HERO CONTENT ─── */}
      <main style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.tagline}>
            <span style={styles.taglineBar} />
            <span style={styles.taglineText}>Reviewed. Refined. Ready.</span>
          </div>

          <h1 style={styles.h1}>
            We Build Systems That<br />
            <span style={styles.h1Red}>Save Time</span>{' '}
            And{' '}
            <span style={styles.h1Red}>Scale</span>
          </h1>

          <p style={styles.description}>
            Transform the way students write, review, and improve code. Collaborate
            with peers, exchange meaningful feedback, and build cleaner,
            more reliable software — one review at a time.
          </p>

          <div style={styles.ctas}>
            <Link to="/login" style={styles.ctaLogin} className="lp-cta-login">
              Login &nbsp;→
            </Link>
            <button style={styles.ctaHow} className="lp-cta-how" onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}>
              <span style={styles.playBtn}>▶</span>
              See How It Works
            </button>
          </div>
        </div>
      </main>

      {/* ─── PROCESS SECTION ─── */}
      <section id="process" style={styles.processSec}>
        <div style={styles.processInner}>
          <p style={styles.processEye}>HOW IT WORKS</p>
          <h2 style={styles.processH2}>From Submission to <span style={{ color: '#e63030' }}>Mastery</span></h2>
          <div style={styles.processGrid}>
            {[
              { num: '01', title: 'Submit Code', desc: 'Upload your Java source file with a title and description. Our system queues it instantly.' },
              { num: '02', title: 'Peer Assigned', desc: 'A classmate is auto-assigned as reviewer — balanced workload, never yourself.' },
              { num: '03', title: 'Inline Review', desc: 'Reviewers annotate each line with Error, Warning, or Suggestion severity tags.' },
              { num: '04', title: 'Score & Feedback', desc: 'A final score (0–10) and summary feedback are submitted and you get an instant notification.' },
            ].map((step) => (
              <div key={step.num} style={styles.processCard} className="lp-process-card">
                <span style={styles.processNum}>{step.num}</span>
                <h3 style={styles.processTitle}>{step.title}</h3>
                <p style={styles.processDesc}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/register" style={styles.ctaLogin} className="lp-cta-login">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* CSS for hover states & animations injected via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Manrope:wght@400;500;600;700;800&display=swap');

        .lp-nav-link {
          transition: color 0.2s;
          position: relative;
        }
        .lp-nav-link:hover { color: #e63030 !important; }
        .lp-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: #e63030;
          transition: width 0.2s;
        }
        .lp-nav-link:hover::after { width: 100%; }

        .lp-navbar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 28px;
          margin-left: auto;
        }

        .lp-login-btn {
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }
        .lp-login-btn:hover {
          background: #c0141f !important;
          box-shadow: 0 0 24px #e6303088 !important;
          transform: translateY(-1px);
        }

        .lp-cta-login {
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }
        .lp-cta-login:hover {
          background: #c0141f !important;
          box-shadow: 0 0 32px #e6303099 !important;
          transform: translateY(-2px);
        }

        .lp-cta-how {
          transition: background 0.2s, border-color 0.2s, transform 0.1s;
        }
        .lp-cta-how:hover {
          background: rgba(230,48,48,0.08) !important;
          border-color: #e63030 !important;
          transform: translateY(-2px);
        }

        .lp-process-card {
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .lp-process-card:hover {
          transform: translateY(-6px);
          border-color: #e63030 !important;
          box-shadow: 0 8px 32px #e6303030 !important;
        }

        @media (max-width: 520px) {
          .lp-navbar { padding: 16px !important; }
          .lp-navbar-actions { gap: 12px; }
          .lp-navbar-links { gap: 14px !important; }
          .lp-login-btn { padding: 7px 12px !important; }
        }

        @keyframes eclipsePulse {
          0%,100% { box-shadow: 0 0 60px 20px #cc1a1a44, 0 0 120px 40px #cc1a1a22; }
          50%      { box-shadow: 0 0 80px 30px #cc1a1a66, 0 0 160px 60px #cc1a1a33; }
        }
        @keyframes flareRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-anim-1 { animation: fadeSlideUp 0.7s ease both; }
        .lp-anim-2 { animation: fadeSlideUp 0.7s ease 0.15s both; }
        .lp-anim-3 { animation: fadeSlideUp 0.7s ease 0.3s both; }
        .lp-anim-4 { animation: fadeSlideUp 0.7s ease 0.45s both; }
      `}</style>
    </div>
  );
}

/* ─── STYLES ─── */
const styles = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#f0f0f0',
    fontFamily: "'Manrope', sans-serif",
    overflow: 'hidden',
  },
  canvas: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 70% 60% at 70% 30%, #2a0808 0%, #120404 40%, #000 100%)',
    zIndex: 0,
  },
  bgGlow: {
    position: 'absolute',
    top: '-10%',
    right: '5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #5c000044 0%, transparent 70%)',
    zIndex: 0,
    filter: 'blur(40px)',
  },
  eclipseWrap: {
    position: 'absolute',
    top: '-20px',
    right: '8%',
    width: '260px',
    height: '260px',
    zIndex: 2,
  },
  eclipseOuter: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #1a0000, #000)',
    boxShadow: '0 0 60px 20px #cc1a1a44, 0 0 120px 40px #cc1a1a22',
    animation: 'eclipsePulse 4s ease-in-out infinite',
  },
  eclipseInner: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #0d0000, #000)',
  },
  eclipseRing: {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    border: '3px solid transparent',
    background: 'linear-gradient(135deg, #e63030cc, transparent 60%, #e6303066) border-box',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'destination-out',
    maskComposite: 'exclude',
  },
  eclipseFlare: {
    position: 'absolute',
    top: '-15px',
    right: '-10px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #e6303088 0%, transparent 70%)',
    filter: 'blur(12px)',
    animation: 'flareRotate 8s linear infinite',
    transformOrigin: '-50px 60px',
  },
  mountainWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    zIndex: 2,
    pointerEvents: 'none',
  },
  groundLine: {
    position: 'absolute',
    bottom: '0',
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #e63030cc 40%, #e6303033 100%)',
    zIndex: 3,
  },
  scanLines: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
    zIndex: 4,
    pointerEvents: 'none',
  },
  cornerTL: {
    position: 'absolute',
    top: '80px',
    left: '24px',
    zIndex: 5,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '4px',
  },
  cornerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#e63030',
    display: 'block',
    marginTop: '2px',
  },
  cornerHLine: {
    display: 'block',
    width: '40px',
    height: '1px',
    background: 'linear-gradient(90deg, #e63030, transparent)',
    marginTop: '5px',
  },
  cornerVLine: {
    display: 'none',
  },
  cornerBR: {
    position: 'absolute',
    bottom: '32px',
    right: '32px',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  dotGrid: {
    display: 'inline-block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#e63030aa',
  },
  /* NAV */
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    padding: '18px clamp(16px, 4vw, 48px)',
    background: 'transparent',
    backdropFilter: 'none',
    gap: '32px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginRight: 'auto',
  },
  navLogo: {
    fontSize: '22px',
    color: '#e63030',
    lineHeight: 1,
  },
  navTitle: {
    fontWeight: 800,
    fontSize: '15px',
    letterSpacing: '0.5px',
    color: '#fff',
  },
  navLinks: {
    display: 'flex',
    gap: '28px',
  },
  navLink: {
    fontSize: '13px',
    color: '#ccc',
    textDecoration: 'none',
    letterSpacing: '0.3px',
    fontWeight: 500,
  },
  navLoginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 22px',
    background: '#e63030',
    color: '#fff',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '13px',
    textDecoration: 'none',
    letterSpacing: '0.3px',
    boxShadow: '0 0 16px #e6303066',
    border: '1px solid #ff4444',
  },
  /* HERO */
  hero: {
    position: 'relative',
    zIndex: 10,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginLeft: 0,
    boxSizing: 'border-box',
    padding: '0 48px',
  },
  heroInner: {
    maxWidth: '580px',
    paddingTop: '80px',
  },
  tagline: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 11,
    animation: 'fadeSlideUp 0.7s ease both',
  },
  taglineBar: {
    display: 'block',
    width: '3px',
    height: '20px',
    background: '#e63030',
    borderRadius: '2px',
    flexShrink: 0,
  },
  taglineText: {
    fontStyle: 'italic',
    color: '#f3f6f9',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    fontFamily: "'Playfair Display', Georgia, serif",
    textShadow: '0 0 16px rgba(230, 48, 48, 0.45)',
  },
  h1: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(32px, 5vw, 58px)',
    fontWeight: 700,
    lineHeight: 1.15,
    margin: '0 0 20px',
    color: '#fff',
    animation: 'fadeSlideUp 0.7s ease 0.1s both',
  },
  h1Red: {
    color: '#e63030',
    fontStyle: 'italic',
  },
  description: {
    fontSize: '13px',
    color: '#aaa',
    lineHeight: 1.8,
    margin: '0 0 36px',
    maxWidth: '440px',
    animation: 'fadeSlideUp 0.7s ease 0.25s both',
  },
  ctas: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    animation: 'fadeSlideUp 0.7s ease 0.4s both',
  },
  ctaLogin: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: '#e63030',
    color: '#fff',
    borderRadius: '7px',
    fontWeight: 700,
    fontSize: '14px',
    textDecoration: 'none',
    letterSpacing: '0.3px',
    boxShadow: '0 0 24px #e6303066',
    border: '1px solid #ff5555',
  },
  ctaHow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 24px',
    background: 'transparent',
    color: '#ddd',
    borderRadius: '7px',
    fontWeight: 600,
    fontSize: '14px',
    border: '1px solid #444',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  },
  playBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid #666',
    fontSize: '9px',
    color: '#ccc',
    flexShrink: 0,
  },
  /* PROCESS SECTION */
  processSec: {
    position: 'relative',
    zIndex: 10,
    background: 'linear-gradient(to bottom, #0a0a0a, #0f0202)',
    padding: '100px 48px',
    borderTop: '1px solid #2a0808',
  },
  processInner: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  processEye: {
    fontSize: '11px',
    letterSpacing: '3px',
    color: '#e63030',
    fontWeight: 700,
    marginBottom: '12px',
  },
  processH2: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 48px',
    lineHeight: 1.2,
  },
  processGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  processCard: {
    padding: '28px 24px',
    background: '#0d0d0d',
    border: '1px solid #2a0808',
    borderRadius: '10px',
    cursor: 'default',
  },
  processNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: '#e63030',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  processTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    margin: '12px 0 10px',
  },
  processDesc: {
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.7,
    margin: 0,
  },
};
