import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  Search,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
} from 'lucide-react';

export default function AuthView() {
  const { login, register, switchDemoRole } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login state
  const [loginId, setLoginId] = useState('chandru@college.edu');
  const [loginPassword, setLoginPassword] = useState('Chandru@123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [regName, setRegName] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('CSE');
  const [regSemester, setRegSemester] = useState(5);
  const [regRole, setRegRole] = useState('STUDENT');

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginId, loginPassword);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await register({
        name: regName,
        rollNumber: regRollNumber,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        semester: Number(regSemester),
        role: regRole,
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* ─── Left Brand Panel (Soft UI Evolution Frosted Liquid Glass) ─── */}
      <div style={styles.brandPanel}>
        <div style={styles.brandTop}>
          <div style={styles.brandLogoBox}>
            <GraduationCap size={26} color="#FFFFFF" />
          </div>
          <span style={styles.brandLogoText}>SIS Portal</span>
        </div>

        <div style={styles.brandContent}>
          <h1 style={styles.brandHeadline}>
            One portal for every academic service.
          </h1>
          <p style={styles.brandSubhead}>
            Register for courses, track attendance, view grades and timetables —
            built with distributed scale to stay fast as the university grows.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
                <ShieldCheck size={18} color="#15803D" />
              </div>
              <div>
                <div style={styles.featureTitle}>Sharded student &amp; course records</div>
                <div style={styles.featureDesc}>
                  Partitioned dynamically via Consistent Hashing across multiple MongoDB shard clusters.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <Zap size={18} color="#D97706" />
              </div>
              <div>
                <div style={styles.featureTitle}>Rate-limited, secure authentication</div>
                <div style={styles.featureDesc}>
                  Token Bucket rate limiting on Redis prevents brute-force attempts and seat sniping.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#E0F2FE', border: '1px solid #BAE6FD' }}>
                <Search size={18} color="#0284C7" />
              </div>
              <div>
                <div style={styles.featureTitle}>Instant course &amp; student search</div>
                <div style={styles.featureDesc}>
                  In-memory Prefix Trie autocomplete delivers suggestions in under 6 milliseconds.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.brandFooter}>
          <span>Scalable System Design Mini Project</span>
          <span>•</span>
          <span>Java 24 + Redis + MongoDB Atlas</span>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={styles.formSubtitle}>
              {tab === 'login'
                ? 'Sign in with your student ID or email to continue.'
                : 'A unique 64-bit Snowflake ID will be allocated automatically.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={styles.tabContainer} className="pill-tab-bar">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              style={{
                ...styles.tabBtn,
                ...(tab === 'login' ? styles.tabBtnActive : {}),
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              style={{
                ...styles.tabBtn,
                ...(tab === 'register' ? styles.tabBtnActive : {}),
              }}
            >
              Register
            </button>
          </div>

          {/* Error / Success message */}
          {error && (
            <div style={styles.errorAlert}>
              <AlertTriangle size={16} color="#BE123C" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div style={styles.successAlert}>
              <ShieldCheck size={16} color="#15803D" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Student ID or Email</label>
                <div style={styles.inputWrapper}>
                  <User size={16} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22CS014 or chandru@college.edu"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} style={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', fontSize: '15px' }}
              >
                {loading ? <span className="spinner" /> : 'Sign in to Portal'}
              </button>

              {/* Rate limit warning box matching Soft UI tokens */}
              <div style={styles.rateLimitNotice}>
                <Zap size={14} color="#D97706" />
                <span>Login attempts are rate-limited: 5 per minute per IP via Redis.</span>
              </div>

              {/* Viva Quick Demo Fillers */}
              <div style={styles.demoBox}>
                <div style={styles.demoTitle}>QUICK VIVA DEMO CREDENTIALS:</div>
                <div style={styles.demoGrid}>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('STUDENT')}
                    style={styles.demoBtn}
                  >
                    👨‍🎓 Student: Chandru S
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('FACULTY')}
                    style={styles.demoBtn}
                  >
                    👨‍🏫 Faculty: Dr. Ramanathan
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('ADMIN')}
                    style={styles.demoBtn}
                  >
                    🏛️ Registrar Admin
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24CS109"
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@college.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Dept</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="form-select"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(e.target.value)}
                    className="form-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="form-select"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', fontSize: '15px' }}
              >
                {loading ? <span className="spinner" /> : 'Register & Assign Shard'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'transparent',
    padding: '32px',
    gap: '32px',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  brandPanel: {
    flex: '1 1 45%',
    maxWidth: '560px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(32px) saturate(190%)',
    WebkitBackdropFilter: 'blur(32px) saturate(190%)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    borderRadius: '28px',
    boxShadow: 'var(--glass-shadow-elevated)',
    color: 'var(--text-main)',
    padding: '52px 46px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  brandTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  brandLogoBox: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
  },
  brandLogoText: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.025em',
  },
  brandContent: {
    margin: '36px 0',
  },
  brandHeadline: {
    fontSize: '2.4rem',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
    color: 'var(--text-main)',
    marginBottom: '16px',
  },
  brandSubhead: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 1px #FFFFFF',
  },
  featureTitle: {
    fontWeight: '700',
    fontSize: '0.96rem',
    color: 'var(--text-main)',
    marginBottom: '2px',
  },
  featureDesc: {
    fontSize: '0.84rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
  },
  brandFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '18px',
  },
  formPanel: {
    flex: '1 1 50%',
    maxWidth: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    borderRadius: '28px',
    border: '1px solid var(--glass-border-light)',
    borderTop: '1.5px solid #FFFFFF',
    padding: '40px 42px',
    boxShadow: 'var(--glass-shadow-elevated)',
  },
  formHeader: {
    marginBottom: '22px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.025em',
    marginBottom: '6px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(240, 244, 248, 0.75)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    borderRadius: 'var(--radius-full)',
    padding: '5px',
    marginBottom: '24px',
    border: '1px solid var(--glass-border)',
  },
  tabBtn: {
    flex: 1,
    padding: '9px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    fontWeight: '500',
    fontSize: '13.5px',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    transition: 'all 180ms var(--spring-easing)',
    textAlign: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: 'var(--primary-blue)',
    boxShadow: '0 4px 14px rgba(100, 116, 139, 0.12), inset 0 1px 1.5px #FFFFFF',
    fontWeight: '700',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
    color: 'var(--text-muted)',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    fontSize: '13px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  forgotLink: {
    color: 'var(--primary-blue)',
    fontWeight: '600',
    textDecoration: 'none',
  },
  rateLimitNotice: {
    marginTop: '16px',
    padding: '11px 16px',
    borderRadius: '16px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: '#B45309',
    fontWeight: '600',
  },
  demoBox: {
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px solid var(--glass-border)',
  },
  demoTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.07em',
    marginBottom: '10px',
  },
  demoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  demoBtn: {
    padding: '9px 16px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    color: 'var(--text-main)',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 180ms var(--spring-easing)',
    boxShadow: '0 2px 8px rgba(100, 116, 139, 0.08), inset 0 1px 1px #FFFFFF',
  },
  errorAlert: {
    padding: '11px 16px',
    backgroundColor: '#FFE4E6',
    border: '1px solid #FECDD3',
    borderRadius: '16px',
    color: '#BE123C',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  successAlert: {
    padding: '11px 16px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    borderRadius: '16px',
    color: '#15803D',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
};
