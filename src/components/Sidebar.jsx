import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  BookOpenCheck,
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
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  // Base navigation matching Figma Desktop 1440
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'registration', label: 'Course Registration', icon: BookOpenCheck },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'system', label: 'System Monitor', icon: Activity, highlight: true },
  ];

  // Role-specific extensions
  if (role === 'FACULTY' || role === 'ADMIN') {
    navItems.push({ id: 'faculty', label: 'Faculty Portal', icon: Briefcase });
  }
  if (role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Registrar Admin', icon: ShieldAlert });
  }
  if (role === 'PARENT' || role === 'STUDENT' || role === 'ADMIN') {
    navItems.push({ id: 'parent', label: 'Parent Portal', icon: Users });
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SIS';

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoMark}>
          <GraduationCap size={22} color="#FFFFFF" />
        </div>
        <div>
          <div style={styles.brandTitle}>SIS Portal</div>
          <div style={styles.brandSubtitle}>Distributed University</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        <div style={styles.sectionHeading}>ACADEMIC SERVICES</div>
        {navItems.map((item) => {
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
                size={18}
                color={isActive ? '#10B981' : item.highlight ? '#34D399' : '#94A3B8'}
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
            <Layers size={13} color="#10B981" />
            <span style={styles.shardLabel}>Cluster Routing</span>
          </div>
          <div style={styles.shardValue}>{user?.targetShard || 'sis_shard_0–2'}</div>
          <div style={styles.shardSub}>Consistent Hash Ring (Virtual Nodes: 300)</div>
        </div>

        {/* User Profile Card */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName} title={user?.name}>
              {user?.name || 'Chandru S'}
            </div>
            <div style={styles.userRole}>
              {user?.role === 'STUDENT'
                ? `${user.department || 'CSE'} • Sem ${user.semester || 5}`
                : user?.role || 'STUDENT'}
            </div>
          </div>
          <button
            onClick={logout}
            style={styles.logoutBtn}
            title="Sign Out"
          >
            <LogOut size={16} color="#94A3B8" />
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    flexShrink: 0,
    backgroundColor: '#0B1320',
    color: '#94A3B8',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxHeight: '100vh',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '14px 12px',
    zIndex: 40,
    userSelect: 'none',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '8px',
    flexShrink: 0,
  },
  logoMark: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#0C4A3E',
    border: '1px solid #10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
    flexShrink: 0,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '0.94rem',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '2px',
  },
  sectionHeading: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.08em',
    padding: '4px 10px 4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '7px',
    backgroundColor: 'transparent',
    color: '#94A3B8',
    border: 'none',
    fontSize: '0.82rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
    flexShrink: 0,
  },
  navItemActive: {
    backgroundColor: '#16243C',
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: 'inset 3px 0 0 #10B981',
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 6px #10B981',
  },
  sidebarFooter: {
    marginTop: 'auto',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  shardInfoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '8px',
    padding: '8px 10px',
  },
  shardInfoTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.68rem',
    fontWeight: '600',
    color: '#34D399',
    textTransform: 'uppercase',
  },
  shardLabel: {
    letterSpacing: '0.05em',
  },
  shardValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    marginTop: '2px',
  },
  shardSub: {
    color: '#64748B',
    fontSize: '0.65rem',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: '#111C2E',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0C4A3E',
    color: '#10B981',
    fontWeight: '700',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(16, 185, 129, 0.4)',
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    color: '#64748B',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
