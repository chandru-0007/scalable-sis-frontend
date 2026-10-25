import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  BookOpenCheck,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  BellRing,
  Activity,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Users,
  LogOut,
  Layers,
  Award,
  Camera,
  Upload,
  X,
  Check,
  Trash2,
  FileCheck,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'scholar', label: 'Scholar', bg: 'linear-gradient(135deg, #0284C7, #0369A1)', emoji: '🎓' },
  { id: 'coder', label: 'Engineer', bg: 'linear-gradient(135deg, #10B981, #059669)', emoji: '💻' },
  { id: 'scientist', label: 'Scientist', bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', emoji: '🔬' },
  { id: 'analyst', label: 'Analyst', bg: 'linear-gradient(135deg, #F59E0B, #D97706)', emoji: '📊' },
  { id: 'cyber', label: 'Cyber', bg: 'linear-gradient(135deg, #EC4899, #BE185D)', emoji: '⚡' },
  { id: 'creative', label: 'Innovator', bg: 'linear-gradient(135deg, #6366F1, #4338CA)', emoji: '🚀' },
];

function generateSvgAvatar(bg, emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="36" fill="${bg.includes('#') ? bg.match(/#[0-9a-fA-F]{6}/)[0] : '#0284C7'}" />
    <text x="50%" y="54%" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const ROLE_NAV = {
  STUDENT: {
    heading: 'ACADEMIC SERVICES',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'assignments', label: 'Course Assignments', icon: FileCheck },
      { id: 'results', label: 'Academic Results', icon: Award },
      { id: 'search', label: 'Course Catalog', icon: Search },
      { id: 'registration', label: 'Registration', icon: BookOpenCheck },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'timetable', label: 'Timetable', icon: CalendarDays },
      { id: 'notifications', label: 'Notifications', icon: BellRing },
    ],
  },
  FACULTY: {
    heading: 'FACULTY WORKSPACE',
    items: [
      { id: 'faculty', label: 'Teaching Courses', icon: BookOpen },
      { id: 'faculty-assignments', label: 'Assignment Manager', icon: FileCheck },
      { id: 'faculty-attendance', label: 'Attendance Register', icon: CalendarCheck },
      { id: 'faculty-grades', label: 'Gradebook & Results', icon: Award },
      { id: 'timetable', label: 'Faculty Timetable', icon: CalendarDays },
      { id: 'notifications', label: 'Announcements', icon: BellRing },
    ],
  },
  ADMIN: {
    heading: 'REGISTRAR & ADMINISTRATION',
    items: [
      { id: 'admin', label: 'Admin Command', icon: ShieldAlert },
      { id: 'admin-reschedule', label: 'Course Rescheduling', icon: CalendarDays },
      { id: 'admin-faculty', label: 'Faculty Onboarding', icon: Briefcase },
      { id: 'admin-debarment', label: 'Debarment Audits', icon: Users },
      { id: 'system', label: 'System Monitor', icon: Activity, highlight: true },
      { id: 'notifications', label: 'Notices & Circulars', icon: BellRing },
    ],
  },
  PARENT: {
    heading: 'PARENT PORTAL',
    items: [
      { id: 'parent', label: 'Ward Academic Progress', icon: Users },
      { id: 'notifications', label: 'University Notices', icon: BellRing },
    ],
  },
};

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, logout, updateProfilePicture } = useAuth();
  const role = (user?.role || 'STUDENT').toUpperCase();
  const currentNav = ROLE_NAV[role] || ROLE_NAV.STUDENT;

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [previewPic, setPreviewPic] = useState(user?.profilePicture || null);
  const [savingPic, setSavingPic] = useState(false);
  const fileInputRef = useRef(null);

  const initials = user?.name
    ? user.name
        .replace(/^Dr\.\s*/i, '')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SI';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Compress & resize to 160x160 using offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 160, 160);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewPic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setSavingPic(true);
    try {
      if (updateProfilePicture) {
        await updateProfilePicture(previewPic);
      }
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Failed to save profile picture:', err);
    } finally {
      setSavingPic(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSavingPic(true);
    try {
      if (updateProfilePicture) {
        await updateProfilePicture('');
      }
      setPreviewPic(null);
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
    } finally {
      setSavingPic(false);
    }
  };

  return (
    <>
      <aside style={styles.sidebar}>
        {/* Brand Header */}
        <div style={styles.brand}>
          <div style={styles.logoMark}>
            <GraduationCap size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={styles.brandTitle}>SIS Portal</div>
            <div style={styles.brandSubtitle}>Academic Workspace</div>
          </div>
        </div>

        {/* Navigation List — Strictly filtered by user role */}
        <nav style={styles.nav}>
          <div style={styles.sectionHeading}>{currentNav.heading}</div>
          {currentNav.items.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <a
                key={item.id}
                id={`nav-${item.id}`}
                data-testid={`nav-${item.id}`}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.id);
                }}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  textDecoration: 'none',
                }}
              >
                <Icon
                  size={17}
                  color={isActive ? 'var(--primary-blue)' : item.highlight ? 'var(--primary-blue)' : 'var(--text-muted)'}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(2, 132, 199, 0.45))' } : {}}
                />
                <span style={{ flex: 1, textAlign: 'left', pointerEvents: 'none' }}>{item.label}</span>
                {item.highlight && (
                  <span style={styles.pulseDot} title="Live Real-time Cluster Monitor" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom Pinned Footer: Shard Indicator + User Profile */}
        <div style={styles.sidebarFooter}>
          {/* Shard Indicator Pill */}
          <div style={styles.shardInfoCard}>
            <div style={styles.shardInfoTop}>
              <Layers size={13} color="var(--primary-blue)" />
              <span style={styles.shardLabel}>
                {role === 'ADMIN' ? 'Infrastructure Routing' : 'Cluster Routing'}
              </span>
            </div>
            <div style={styles.shardValue}>
              {user?.targetShard || (role === 'ADMIN' ? 'sis_shard_0 (Master)' : 'sis_shard_1')}
            </div>
            <div style={styles.shardSub}>
              {role === 'ADMIN' ? 'Primary Management Node' : 'Consistent Hash Ring (300 VNs)'}
            </div>
          </div>

          {/* User Profile Card */}
          <div style={styles.userCard}>
            {/* Clickable Avatar with Camera Indicator */}
            <div
              style={{ ...styles.avatar, cursor: 'pointer', position: 'relative' }}
              onClick={() => {
                setPreviewPic(user?.profilePicture || null);
                setShowAvatarModal(true);
              }}
              title="Click to change profile picture"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name || 'Profile'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                />
              ) : (
                <span>{initials}</span>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <Camera size={8} color="#FFFFFF" />
              </div>
            </div>

            <div style={styles.userInfo}>
              <div style={styles.userName} title={user?.name}>
                {user?.name || (role === 'ADMIN' ? 'Dr. K. Swaminathan' : role === 'FACULTY' ? 'Dr. A. Ramanathan' : role === 'PARENT' ? 'Parent / Guardian' : 'Chandru S')}
              </div>
              <div style={styles.userRole}>
                {role === 'STUDENT' && `${user?.department || 'CSE'} • Sem ${user?.semester || 5}`}
                {role === 'FACULTY' && `${user?.department || 'CSE'} • Faculty Mentor`}
                {role === 'ADMIN' && 'University Registrar'}
                {role === 'PARENT' && `Ward: ${user?.wardRollNumber || '22CS014'}`}
              </div>
            </div>
            <button
              onClick={logout}
              style={styles.logoutBtn}
              title="Sign Out"
            >
              <LogOut size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Picture Change Modal */}
      {showAvatarModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg, #FFFFFF)',
              borderRadius: '20px',
              padding: '26px 28px',
              width: '100%',
              maxWidth: '440px',
              border: '1px solid var(--border-color, #E2E8F0)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              color: 'var(--text-main, #0F172A)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Update Profile Picture</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>
                  Personalize your student identity across the SIS portal
                </p>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Banner */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px', background: 'var(--bg-subtle, #F8FAFC)', borderRadius: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(2, 132, 199, 0.4) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '28px',
                  color: 'var(--primary-blue, #0284C7)',
                  border: '2px solid rgba(2, 132, 199, 0.4)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.2)',
                }}
              >
                {previewPic ? (
                  <img src={previewPic} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
                {user?.name}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user?.department || 'CSE'} &bull; Sem {user?.semester || 5} &bull; {user?.rollNumber}
              </span>
            </div>

            {/* Option 1: Upload from device */}
            <div style={{ marginBottom: '18px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                }}
              >
                <Upload size={16} />
                <span>Upload Image from Device</span>
              </button>
            </div>

            {/* Option 2: Academic Avatar Presets */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Or select an Academic Avatar preset:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {PRESET_AVATARS.map((preset) => {
                  const dataUrl = generateSvgAvatar(preset.bg, preset.emoji);
                  const isSelected = previewPic === dataUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPreviewPic(dataUrl)}
                      title={preset.label}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: preset.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        border: isSelected ? '2.5px solid var(--primary-blue, #0284C7)' : '1px solid rgba(255,255,255,0.4)',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none',
                      }}
                    >
                      {preset.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              {previewPic ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={savingPic}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#EF4444',
                    borderColor: '#FECACA',
                    fontSize: '0.82rem',
                    padding: '8px 12px',
                  }}
                  title="Remove picture and revert to initials"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={savingPic}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {savingPic ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : <Check size={14} />}
                  <span>Save Picture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    flexShrink: 0,
    backgroundColor: 'var(--sidebar-bg)',
    backdropFilter: 'blur(28px) saturate(190%)',
    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
    color: 'var(--sidebar-text)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxHeight: '100vh',
    borderRight: '1px solid var(--sidebar-border)',
    padding: '18px 14px',
    zIndex: 40,
    userSelect: 'none',
    overflow: 'hidden',
    transition: 'background-color var(--transition-base), border-color var(--transition-base)',
    boxShadow: '4px 0 24px rgba(100, 116, 139, 0.05)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
    marginBottom: '14px',
    flexShrink: 0,
  },
  logoMark: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.65)',
    boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  brandTitle: {
    color: 'var(--text-main)',
    fontWeight: '800',
    fontSize: '16px',
    letterSpacing: '-0.025em',
  },
  brandSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '2px',
  },
  sectionHeading: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.07em',
    padding: '8px 12px 4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'transparent',
    color: 'var(--sidebar-text)',
    border: '1px solid transparent',
    fontSize: '13.5px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 180ms var(--spring-easing)',
    width: '100%',
    flexShrink: 0,
  },
  navItemActive: {
    backgroundColor: 'var(--sidebar-item-active)',
    color: 'var(--sidebar-text-active)',
    fontWeight: '700',
    border: '1px solid var(--glass-border-light)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: '0 6px 18px rgba(100, 116, 139, 0.12), inset 0 1px 2px #FFFFFF',
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-blue)',
    boxShadow: '0 0 8px var(--primary-blue)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingTop: '14px',
    borderTop: '1px solid var(--glass-border)',
  },
  shardInfoCard: {
    backgroundColor: 'rgba(135, 206, 235, 0.15)',
    border: '1px solid rgba(135, 206, 235, 0.35)',
    borderRadius: '18px',
    padding: '11px 14px',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    boxShadow: 'inset 0 1px 1.5px #FFFFFF',
  },
  shardInfoTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary-blue)',
    textTransform: 'uppercase',
  },
  shardLabel: {
    letterSpacing: '0.05em',
  },
  shardValue: {
    color: 'var(--text-main)',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    marginTop: '4px',
  },
  shardSub: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    marginTop: '2px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    borderRadius: '18px',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: '0 4px 14px rgba(100, 116, 139, 0.08)',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.25) 100%)',
    color: 'var(--primary-blue)',
    fontWeight: '800',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid rgba(2, 132, 199, 0.35)',
    boxShadow: 'inset 0 1px 1px #FFFFFF',
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    color: 'var(--text-main)',
    fontWeight: '700',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    padding: '7px',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background var(--transition-fast), transform var(--transition-fast)',
  },
};
