import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  Search,
  AlertTriangle,
  Lock,
  Mail,
  User,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function AuthView() {
  const { login, switchDemoRole } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login state
  const [loginId, setLoginId] = useState('chandru@college.edu');
  const [loginPassword, setLoginPassword] = useState('Chandru@123');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState(null);

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

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered student/faculty email or ID.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await api.auth.sendForgotPasswordOtp(forgotEmail.trim());
      setOtpSent(true);
      setSuccessMsg(`Verification code sent to ${res.email || forgotEmail}. Check your inbox!`);
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await api.auth.resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPass);
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
      setMode('login');
      setLoginId(forgotEmail.trim());
      setLoginPassword(forgotNewPass);
      setOtpSent(false);
      setForgotOtp('');
      setForgotNewPass('');
      setForgotConfirmPass('');
      setDemoOtpHint(null);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-container" style={styles.container}>
      {/* ─── Left Brand Panel ─── */}
      <div className="auth-brand-panel" style={styles.brandPanel}>
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
            provisioned securely by university administration.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
                <ShieldCheck size={18} color="#15803D" />
              </div>
              <div>
                <div style={styles.featureTitle}>Admin-Provisioned Accounts</div>
                <div style={styles.featureDesc}>
                  Credentials issued by Registrar with automatic Resend email notifications.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#EFF6FF', border: '1px solid #BAE6FD' }}>
                <Search size={18} color="#0284C7" />
              </div>
              <div>
                <div style={styles.featureTitle}>Instant course &amp; student search</div>
                <div style={styles.featureDesc}>
                  In-memory Prefix Trie autocomplete delivers suggestions in under 6 milliseconds.
                </div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <KeyRound size={18} color="#D97706" />
              </div>
              <div>
                <div style={styles.featureTitle}>Redis Key-Value OTP Recovery</div>
                <div style={styles.featureDesc}>
                  High-speed 10-minute TTL OTP verification for instant self-service password reset.
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
      <div className="auth-form-panel" style={styles.formPanel}>
        <div className="auth-form-card" style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Reset Password'}
            </h2>
            <p style={styles.formSubtitle}>
              {mode === 'login'
                ? 'Sign in with your academic ID or registered email.'
                : 'Enter your registered email to receive a secure 6-digit OTP.'}
            </p>
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
              <CheckCircle2 size={16} color="#15803D" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ─── Login Form ─── */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Student ID, Staff ID, or College Email</label>
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
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                    setForgotEmail(loginId.includes('@') ? loginId : '');
                  }}
                  style={styles.forgotLinkBtn}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', fontSize: '15px' }}
              >
                {loading ? <span className="spinner" /> : 'Sign in to Portal'}
              </button>

              {/* Informational Provisioning Pill */}
              <div style={styles.adminProvisionNotice}>
                <ShieldCheck size={14} color="#0369A1" />
                <span>Accounts are provisioned by Administration. Check your email for initial credentials.</span>
              </div>

              {/* Rate limit warning box */}
              <div style={styles.rateLimitNotice}>
                <Zap size={14} color="#D97706" />
                <span>Protected by Redis Token Bucket Rate Limiting: 5 attempts/min.</span>
              </div>

              {/* Quick Viva Demo Credentials */}
              <div style={styles.demoBox}>
                <div style={styles.demoTitle}>QUICK VIVA DEMO CREDENTIALS:</div>
                <div style={styles.demoGrid}>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('STUDENT')}
                    style={styles.demoBtn}
                  >
                    👨‍🎓 Student: Chandru S (22CS014)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('FACULTY')}
                    style={styles.demoBtn}
                  >
                    👨‍🏫 Faculty: Dr. Ramanathan (FAC001)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('ADMIN')}
                    style={styles.demoBtn}
                  >
                    🏛️ Registrar Admin (ADM001)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ─── Forgot Password / OTP Form ─── */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="form-group">
                    <label className="form-label">Registered Email or Roll Number</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={16} color="#94A3B8" style={styles.inputIcon} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. chandru@college.edu or 22CS014"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    We will send a one-time 6-digit verification code to your registered email via Resend.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '46px', fontSize: '15px', marginBottom: '14px' }}
                  >
                    {loading ? <span className="spinner" /> : (
                      <>
                        <Send size={15} style={{ marginRight: '8px', display: 'inline' }} />
                        Send Verification Code
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '12px 16px', borderRadius: '12px', marginBottom: '18px' }}>
                    <div style={{ fontSize: '12px', color: '#0369A1', fontWeight: '600' }}>RECIPIENT</div>
                    <div style={{ fontSize: '14px', color: '#0C4A6E', fontWeight: '700' }}>{forgotEmail}</div>
                    {demoOtpHint && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0284C7' }}>
                        Demo OTP Hint: <strong style={{ letterSpacing: '2px' }}>{demoOtpHint}</strong>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">6-Digit Verification Code (OTP)</label>
                    <div style={styles.inputWrapper}>
                      <KeyRound size={16} color="#94A3B8" style={styles.inputIcon} />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 584920"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '38px', letterSpacing: '4px', fontSize: '18px', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div style={styles.inputWrapper}>
                      <Lock size={16} color="#94A3B8" style={styles.inputIcon} />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div style={styles.inputWrapper}>
                      <Lock size={16} color="#94A3B8" style={styles.inputIcon} />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '46px', fontSize: '15px', marginBottom: '12px' }}
                  >
                    {loading ? <span className="spinner" /> : 'Confirm Password Reset'}
                  </button>

                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Resend Verification Code
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Sign In button */}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                  setOtpSent(false);
                }}
                style={styles.backBtn}
              >
                <ArrowLeft size={15} style={{ marginRight: '6px' }} />
                Back to Sign in
              </button>
            </div>
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
  forgotLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-blue)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
  },
  adminProvisionNotice: {
    marginTop: '14px',
    padding: '11px 16px',
    borderRadius: '14px',
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: '#0369A1',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  rateLimitNotice: {
    marginTop: '10px',
    padding: '11px 16px',
    borderRadius: '14px',
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
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '13.5px',
    cursor: 'pointer',
    transition: 'all 180ms ease',
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
