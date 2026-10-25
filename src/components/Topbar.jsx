import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell,
  Database,
  Radio,
  UserCheck,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';

export default function Topbar() {
  const { user, switchDemoRole } = useAuth();
  const { isConnected, telemetry, unreadNoticeCount, markNoticesRead } = useRealtime();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleRef = useRef(null);

  // Today's formatted date
  const todayStr = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Click outside to close role menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatGreetingName = () => {
    if (!user?.name) return 'Scholar';
    if (user.role === 'ADMIN') return 'Dr. Swaminathan';
    if (user.role === 'FACULTY') return 'Dr. Ramanathan';
    if (user.role === 'PARENT') return 'Guardian';
    return user.name.split(' ')[0];
  };

  return (
    <header style={styles.topbar}>
      {/* Left: Greeting & Date */}
      <div>
        <h2 style={styles.greeting}>
          Good morning, {formatGreetingName()}
        </h2>
        <div style={styles.dateText}>{todayStr}</div>
      </div>

      {/* Right: Telemetry + Cloud Status Pills + Theme Toggle + Role Switcher */}
      <div style={styles.actionsRight}>
        {/* Real-Time Live SSE Stream Badge */}
        <div
          style={{
            ...styles.pillStatus,
            backgroundColor: isConnected ? 'var(--success-bg)' : 'var(--warning-bg)',
            borderColor: isConnected ? 'var(--success-border)' : 'var(--warning-border)',
          }}
          title={isConnected ? 'Server-Sent Events active. Live cluster streaming.' : 'SSE connecting...'}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--success)' : 'var(--warning)',
              boxShadow: isConnected ? '0 0 6px var(--success)' : 'none',
            }}
          />
          <span style={{ color: isConnected ? 'var(--success)' : 'var(--warning)', fontWeight: '600', fontSize: '12px' }}>
            {isConnected ? 'Live SSE' : 'Connecting'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {telemetry.qps} QPS
          </span>
        </div>

        {/* MongoDB Atlas Shard Pill */}
        <div style={styles.pillAtlas} title="Connected to MongoDB Atlas Cloud Cluster with 3 Shards">
          <Database size={13} color="var(--primary-blue)" />
          <span>Atlas Sharded</span>
        </div>

        {/* Upstash Redis Cloud Pill */}
        <div style={styles.pillRedis} title="Connected to Upstash Cloud Redis over TLS">
          <Radio size={13} color="#9333EA" />
          <span>Upstash TLS</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={styles.themeToggleBtn}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="var(--text-body)" />}
        </button>

        {/* Role Quick Switcher */}
        <div style={{ position: 'relative' }} ref={roleRef}>
          <button
            id="role-switch-button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={styles.roleSwitchBtn}
            title="Switch Persona / Role for Testing"
          >
            <UserCheck size={14} color="var(--primary-blue)" />
            <span>Role: <strong>{user?.role || 'STUDENT'}</strong></span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showRoleMenu && (
            <div style={styles.roleDropdown}>
              <div style={styles.roleDropdownHeader}>QUICK SWITCH PERSONA</div>
              <button
                id="switch-student"
                onClick={async () => {
                  setShowRoleMenu(false);
                  window.location.hash = '#dashboard';
                  await switchDemoRole('STUDENT');
                }}
                style={styles.roleOption}
              >
                👨‍🎓 <strong>Student</strong> (Chandru S - Sem {user?.semester || 7})
              </button>
              <button
                id="switch-faculty"
                onClick={async () => {
                  setShowRoleMenu(false);
                  window.location.hash = '#faculty';
                  await switchDemoRole('FACULTY');
                }}
                style={styles.roleOption}
              >
                👨‍🏫 <strong>Faculty</strong> (Dr. A. Ramanathan)
              </button>
              <button
                id="switch-admin"
                onClick={async () => {
                  setShowRoleMenu(false);
                  window.location.hash = '#admin';
                  await switchDemoRole('ADMIN');
                }}
                style={styles.roleOption}
              >
                🏛️ <strong>Admin / Registrar</strong> (Dr. Swaminathan)
              </button>
              <button
                id="switch-parent"
                onClick={async () => {
                  setShowRoleMenu(false);
                  window.location.hash = '#parent';
                  await switchDemoRole('PARENT');
                }}
                style={styles.roleOption}
              >
                👪 <strong>Parent / Guardian</strong> (Ward 22CS014)
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => {
            markNoticesRead();
            window.location.hash = '#notifications';
          }}
          style={styles.bellBtn}
          title={`View ${unreadNoticeCount} unread notices & real-time broadcasts`}
        >
          <Bell size={17} color="var(--text-body)" />
          {unreadNoticeCount > 0 && (
            <span style={styles.bellBadge}>{unreadNoticeCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: '72px',
    flexShrink: 0,
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(28px) saturate(190%)',
    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    boxShadow: '0 4px 20px rgba(100, 116, 139, 0.06)',
    transition: 'background-color var(--transition-base), border-color var(--transition-base)',
  },
  greeting: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  dateText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '2px',
  },
  actionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pillStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '6px 13px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    fontSize: '12px',
    cursor: 'default',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
  },
  pillAtlas: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 13px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    fontSize: '12px',
    fontWeight: '700',
    color: '#15803D',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5)',
  },
  pillRedis: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 13px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: '#FFE4E6',
    border: '1px solid #FECDD3',
    fontSize: '12px',
    fontWeight: '700',
    color: '#BE123C',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5)',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: '0 2px 8px rgba(100, 116, 139, 0.08), inset 0 1px 1.5px #FFFFFF',
    cursor: 'pointer',
    transition: 'all 180ms var(--spring-easing)',
  },
  roleSwitchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    height: '40px',
    padding: '0 16px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: '0 2px 10px rgba(100, 116, 139, 0.08), inset 0 1px 1.5px #FFFFFF',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-main)',
    transition: 'all 180ms var(--spring-easing)',
  },
  roleDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '260px',
    backgroundColor: 'var(--glass-bg-elevated)',
    backdropFilter: 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    border: '1px solid var(--glass-border-light)',
    borderTop: '1.5px solid #FFFFFF',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-dropdown)',
    padding: '10px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  roleDropdownHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    padding: '8px 12px 6px',
    letterSpacing: '0.06em',
  },
  roleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 160ms ease',
    width: '100%',
  },
  bellBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: '0 2px 8px rgba(100, 116, 139, 0.08), inset 0 1px 1.5px #FFFFFF',
    cursor: 'pointer',
    transition: 'all 180ms var(--spring-easing)',
  },
  bellBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#FFB6C1',
    color: '#BE123C',
    border: '1px solid #FECDD3',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '10px',
    lineHeight: '1.2',
    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
  },
};
