import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import {
  Bell,
  CheckCircle2,
  Database,
  Radio,
  UserCheck,
  ChevronDown,
  Zap,
  Activity,
} from 'lucide-react';

export default function Topbar() {
  const { user, switchDemoRole } = useAuth();
  const { isConnected, telemetry, unreadNoticeCount, markNoticesRead } = useRealtime();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleRef = useRef(null);

  // Today's formatted date
  const todayStr = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Click outside to close role menu independently
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.topbar}>
      {/* Left: Greeting & Date */}
      <div>
        <h2 style={styles.greeting}>
          Good morning, {user?.name ? user.name.split(' ')[0] : 'Chandru'}
        </h2>
        <div style={styles.dateText}>{todayStr}</div>
      </div>

      {/* Right: Real-time Telemetry & Cloud Status Pills & Role Switcher */}
      <div style={styles.actionsRight}>
        {/* Real-Time Live SSE Stream Badge */}
        <div
          style={{
            ...styles.pillRealtime,
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            borderColor: isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.3)',
          }}
          title={isConnected ? 'Server-Sent Events active. Live cluster streaming.' : 'SSE connecting...'}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#F59E0B',
              boxShadow: isConnected ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none',
              animation: isConnected ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ color: isConnected ? '#065F46' : '#92400E', fontWeight: '600', fontSize: '0.72rem' }}>
            {isConnected ? 'Live SSE Stream' : 'Connecting'}
          </span>
          <span style={{ color: '#94A3B8', fontSize: '0.68rem', fontFamily: 'monospace' }}>
            {telemetry.qps} QPS
          </span>
        </div>

        {/* MongoDB Atlas Shard Pill */}
        <div style={styles.pillCloud} title="Connected to MongoDB Atlas Cloud Cluster with 3 Shards">
          <Database size={13} color="#10B981" />
          <span>Atlas Sharded</span>
        </div>

        {/* Upstash Redis Cloud Pill */}
        <div style={styles.pillRedis} title="Connected to Upstash Cloud Redis over TLS">
          <Radio size={13} color="#EC4899" />
          <span>Upstash TLS</span>
        </div>

        {/* Role Quick Switcher for Evaluation */}
        <div style={{ position: 'relative' }} ref={roleRef}>
          <button
            id="role-switch-button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={styles.roleSwitchBtn}
            title="Switch Persona / Role for Testing"
          >
            <UserCheck size={14} color="#0C4A3E" />
            <span>Role: <strong>{user?.role || 'STUDENT'}</strong></span>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {showRoleMenu && (
            <div style={styles.roleDropdown}>
              <div style={styles.roleDropdownHeader}>QUICK SWITCH PERSONA</div>
              <button
                onClick={() => {
                  switchDemoRole('STUDENT');
                  setShowRoleMenu(false);
                }}
                style={styles.roleOption}
              >
                👨‍🎓 <strong>Student</strong> (Chandru S - Sem {user?.semester || 7})
              </button>
              <button
                onClick={() => {
                  switchDemoRole('FACULTY');
                  setShowRoleMenu(false);
                }}
                style={styles.roleOption}
              >
                👨‍🏫 <strong>Faculty</strong> (Dr. A. Ramanathan)
              </button>
              <button
                onClick={() => {
                  switchDemoRole('ADMIN');
                  setShowRoleMenu(false);
                }}
                style={styles.roleOption}
              >
                🏛️ <strong>Admin / Registrar</strong> (Dr. Swaminathan)
              </button>
              <button
                onClick={() => {
                  switchDemoRole('PARENT');
                  setShowRoleMenu(false);
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
          <Bell size={18} color="#475569" />
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
    height: '74px',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  greeting: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  dateText: {
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: '500',
  },
  actionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pillRealtime: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.74rem',
    cursor: 'default',
    transition: 'all 0.3s ease',
  },
  pillCloud: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '20px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#065F46',
  },
  pillRedis: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '20px',
    backgroundColor: '#FDF2F8',
    border: '1px solid #FBCFE8',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#9D174D',
  },
  roleSwitchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    cursor: 'pointer',
    fontSize: '0.78rem',
    color: '#334155',
  },
  roleDropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    width: '230px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    zIndex: 60,
    overflow: 'hidden',
  },
  roleDropdownHeader: {
    padding: '8px 12px',
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  roleOption: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#0F172A',
    borderBottom: '1px solid #F1F5F9',
  },
  bellBtn: {
    position: 'relative',
    padding: '8px',
    borderRadius: '10px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },
};
