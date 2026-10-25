import React from 'react';
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
} from 'lucide-react';

const ROLE_NAV = {
  STUDENT: {
    heading: 'ACADEMIC SERVICES',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
      { id: 'faculty-attendance', label: 'Attendance Register', icon: CalendarCheck },
      { id: 'faculty-grades', label: 'Gradebook Evaluation', icon: Award },
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
  const { user, logout } = useAuth();
  const role = (user?.role || 'STUDENT').toUpperCase();
  const currentNav = ROLE_NAV[role] || ROLE_NAV.STUDENT;

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

  return (
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
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName} title={user?.name}>
              {user?.name || (role === 'ADMIN' ? 'Dr. K. Swaminathan' : role === 'FACULTY' ? 'Dr. A. Ramanathan' : role === 'PARENT' ? 'Parent / Guardian' : 'Chandru S')}
            </div>
            <div style={styles.userRole}>
              {role === 'STUDENT' && `${user?.department || 'CSE'} • Sem ${user?.semester || 7}`}
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
