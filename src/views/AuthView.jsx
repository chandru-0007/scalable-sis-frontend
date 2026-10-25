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
      {/* ─── Left Brand Panel (Emerald Green from Figma) ─── */}
      <div style={styles.brandPanel}>
        <div style={styles.brandTop}>
          <div style={styles.brandLogoBox}>
            <GraduationCap size={28} color="#FFFFFF" />
          </div>
          <span style={styles.brandLogoText}>SIS Portal</span>
        </div>

        <div style={styles.brandContent}>
          <h1 style={styles.brandHeadline}>
            One portal for every academic service.
          </h1>
          <p style={styles.brandSubhead}>
            Register for courses, track attendance, view grades and timetables —
            built to stay fast as the university grows.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <ShieldCheck size={18} color="#A7F3D0" />
              </div>
              <div>
                <div style={styles.featureTitle}>Sharded student & course records</div>
                <div style={styles.featureDesc}>
                  Partitioned dynamically via Consistent Hashing across multiple MongoDB shard clusters.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Zap size={18} color="#FDE68A" />
              </div>
              <div>
                <div style={styles.featureTitle}>Rate-limited, secure authentication</div>
                <div style={styles.featureDesc}>
                  Token Bucket rate limiting on Redis prevents brute-force attempts and seat sniping.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Search size={18} color="#BFDBFE" />
              </div>
              <div>
                <div style={styles.featureTitle}>Instant course & student search</div>
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
          <div style={styles.tabContainer}>
            <button
              onClick={() => { setTab('login'); setError(null); }}
              style={{
                ...styles.tabBtn,
                ...(tab === 'login' ? styles.tabBtnActive : {}),
              }}
            >
              Sign in
            </button>
            <button
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
              <AlertTriangle size={16} color="#DC2626" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div style={styles.successAlert}>
              <ShieldCheck size={16} color="#059669" />
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
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                {loading ? <span className="spinner" /> : 'Sign in to Portal'}
              </button>

              {/* Rate limit warning box matching Figma */}
              <div style={styles.rateLimitNotice}>
                <Zap size={14} color="#D97706" />
                <span>Login attempts are rate-limited: 5 per minute per IP.</span>
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
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
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
    backgroundColor: '#F8FAFC',
  },
  brandPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(135deg, #062b24 0%, #0C4A3E 60%, #0F5132 100%)',
    color: '#FFFFFF',
    padding: '60px 54px',
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
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  brandLogoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  brandContent: {
    maxWidth: '520px',
    margin: '40px 0',
  },
  brandHeadline: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    marginBottom: '18px',
  },
  brandSubhead: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: '#D1FAE5',
    marginBottom: '36px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#FFFFFF',
    marginBottom: '3px',
  },
  featureDesc: {
    fontSize: '0.82rem',
    color: '#A7F3D0',
    lineHeight: '1.4',
  },
  brandFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.75rem',
    color: '#6EE7B7',
    fontWeight: '500',
  },
  formPanel: {
    flex: '1 1 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 30px',
  },
  formCard: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    padding: '36px 38px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  formHeader: {
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  formSubtitle: {
    fontSize: '0.85rem',
    color: '#64748B',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '22px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#64748B',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    fontSize: '0.82rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    cursor: 'pointer',
  },
  forgotLink: {
    color: '#10B981',
    fontWeight: '600',
    textDecoration: 'none',
  },
  rateLimitNotice: {
    marginTop: '16px',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.78rem',
    color: '#92400E',
    fontWeight: '500',
  },
  demoBox: {
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px dashed #CBD5E1',
  },
  demoTitle: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  demoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  demoBtn: {
    padding: '7px 12px',
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    color: '#334155',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  errorAlert: {
    padding: '10px 14px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    color: '#B91C1C',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  successAlert: {
    padding: '10px 14px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '8px',
    color: '#047857',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
};
