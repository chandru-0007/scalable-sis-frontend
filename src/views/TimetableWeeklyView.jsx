import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Download,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Calendar,
} from 'lucide-react';

export default function TimetableWeeklyView() {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day' | 'list'
  const [selectedDay, setSelectedDay] = useState('Monday 19 Oct');

  const days = ['Monday 19 Oct', 'Tuesday 20 Oct', 'Wednesday 21 Oct', 'Thursday 22 Oct', 'Friday 23 Oct'];
  const times = ['09:00 - 10:00', '10:00 - 11:30', '11:30 - 13:00', '14:00 - 15:30', '15:30 - 17:00'];

  // Timetable grid sessions matching Figma
  const scheduleMatrix = {
    'Monday 19 Oct': {
      '09:00 - 10:00': { code: 'CS3501', title: 'Distributed Systems', room: 'LH-204', faculty: 'Dr. Meera R.', type: 'lecture', color: '#ECFDF5', border: '#A7F3D0' },
      '10:00 - 11:30': { code: 'CS3402', title: 'Database Systems', room: 'LH-110', faculty: 'Dr. Kavitha S.', type: 'lecture', color: '#EFF6FF', border: '#BFDBFE' },
      '14:00 - 15:30': { code: 'CS3511', title: 'Machine Learning Lab', room: 'ML Lab-2', faculty: 'Prof. Arun K.', type: 'lab', color: '#F5F3FF', border: '#DDD6FE' },
    },
    'Tuesday 20 Oct': {
      '10:00 - 11:30': { code: 'EC3405', title: 'Digital Image Processing', room: 'LH-103', faculty: 'Dr. Sanjay V.', type: 'lecture', color: '#FFFBEB', border: '#FDE68A', collision: true },
      '11:30 - 13:00': { code: 'CS201', title: 'Database Systems Lab', room: 'Lab Block 304', faculty: 'Dr. Ramanathan', type: 'lab', color: '#EFF6FF', border: '#BFDBFE' },
    },
    'Wednesday 21 Oct': {
      '09:00 - 10:00': { code: 'CS3501', title: 'Distributed Systems', room: 'LH-204', faculty: 'Dr. Meera R.', type: 'lecture', color: '#ECFDF5', border: '#A7F3D0' },
      '11:30 - 13:00': { code: 'MA2201', title: 'Discrete Mathematics', room: 'LH-101', faculty: 'Dr. Latha M.', type: 'lecture', color: '#F8FAFC', border: '#CBD5E1' },
      '14:00 - 15:30': { code: 'CS3512', title: 'Distributed Computing Lab', room: 'CN Lab', faculty: 'Prof. Vikram P.', type: 'lab', color: '#ECFDF5', border: '#A7F3D0' },
    },
    'Thursday 22 Oct': {
      '10:00 - 11:30': { code: 'CS3511', title: 'Operating Systems', room: 'LH-105', faculty: 'Dr. Priya Sharma', type: 'lecture', color: '#F5F3FF', border: '#DDD6FE' },
      '14:00 - 15:30': { code: 'CS3402', title: 'Database Systems', room: 'LH-110', faculty: 'Dr. Kavitha S.', type: 'lecture', color: '#EFF6FF', border: '#BFDBFE' },
    },
    'Friday 23 Oct': {
      '09:00 - 10:00': { code: 'CS3501', title: 'Distributed Systems', room: 'Tech Hall 405', faculty: 'Dr. Priya Sharma', type: 'rescheduled', color: '#ECFDF5', border: '#10B981', note: 'Rescheduled on Oct 21' },
      '11:30 - 13:00': { code: 'EC3405', title: 'Computer Networks', room: 'LH-103', faculty: 'Dr. Sanjay V.', type: 'lecture', color: '#FFFBEB', border: '#FDE68A' },
      '14:00 - 15:30': { code: 'PROJ', title: 'Mini Project Hour', room: 'Lab-4', faculty: 'HOD Review', type: 'lab', color: '#F1F5F9', border: '#CBD5E1' },
    },
  };

  // Flattened sessions for list view
  const allSessions = [];
  days.forEach((day) => {
    times.forEach((time) => {
      const s = scheduleMatrix[day]?.[time];
      if (s) {
        allSessions.push({ ...s, day, time });
      }
    });
  });

  function exportICS() {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SIS University//Timetable//EN\nSUMMARY:Weekly Class Timetable\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly_timetable.ics';
    a.click();
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Weekly Class Timetable</h2>
          <p style={styles.subtitle}>
            Week of 19 &ndash; 23 October 2026 &bull; Automatic Timetable Invalidation on Course Reschedule
          </p>
        </div>

        <div style={styles.actions}>
          <div style={styles.segTabs}>
            {['week', 'day', 'list'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  ...styles.segBtn,
                  ...(viewMode === mode ? styles.segBtnActive : {}),
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <button onClick={exportICS} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Download size={14} />
            <span>Export .ics</span>
          </button>
        </div>
      </div>

      {/* Collision Alert Banner */}
      <div style={styles.alertBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Schedule Collision Detected:</strong> DIP (Tue 10:00-11:30) overlaps with Database Systems Lab. Contact Registrar for rescheduling.
          </span>
        </div>
        <a
          href="#admin"
          style={styles.resolveBtn}
        >
          <span>Resolve in Admin</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ─── Mode 1: Week Grid View ─── */}
      {viewMode === 'week' && (
        <div className="sis-table-container">
          <table style={styles.gridTable}>
            <thead>
              <tr>
                <th style={styles.timeHeader}>TIME</th>
                {days.map((day) => (
                  <th key={day} style={styles.dayHeader}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time) => (
                <tr key={time}>
                  <td style={styles.timeCell}>
                    <Clock size={12} color="#64748B" />
                    <span>{time}</span>
                  </td>
                  {days.map((day) => {
                    const session = scheduleMatrix[day]?.[time];
                    return (
                      <td key={day} style={styles.slotCell}>
                        {session ? (
                          <div
                            style={{
                              ...styles.sessionBox,
                              backgroundColor: session.color,
                              borderColor: session.border,
                            }}
                          >
                            <div style={styles.sessionTop}>
                              <span style={styles.sessionCode}>{session.code}</span>
                              <span
                                className={`chip ${
                                  session.type === 'lab'
                                    ? 'chip-purple'
                                    : session.collision
                                    ? 'chip-warning'
                                    : 'chip-neutral'
                                }`}
                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                              >
                                {session.type}
                              </span>
                            </div>
                            <div style={styles.sessionTitle}>{session.title}</div>
                            <div style={styles.sessionMeta}>
                              <span style={styles.iconMeta}>
                                <MapPin size={11} /> {session.room}
                              </span>
                              <span style={styles.iconMeta}>
                                <User size={11} /> {session.faculty}
                              </span>
                            </div>
                            {session.note && (
                              <div style={styles.sessionNote}>
                                ⚡ {session.note}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={styles.freePeriodBox}>
                            <span style={styles.freePeriodText}>Free Period</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Mode 2: Single Day Timeline View ─── */}
      {viewMode === 'day' && (
        <div style={styles.dayViewContainer} className="animate-fade-in">
          {/* Day Navigation Tabs */}
          <div style={styles.daySelectorBar}>
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                style={{
                  ...styles.dayPill,
                  ...(selectedDay === d ? styles.dayPillActive : {}),
                }}
              >
                <Calendar size={13} />
                <span>{d}</span>
              </button>
            ))}
          </div>

          <div style={styles.dayContentGrid}>
            {/* Timeline Cards */}
            <div style={styles.timelineList}>
              {times.map((t) => {
                const session = scheduleMatrix[selectedDay]?.[t];
                return (
                  <div key={t} style={styles.timelineRow}>
                    <div style={styles.timeBadgeCol}>
                      <span style={styles.timeBadgeText}>{t}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      {session ? (
                        <div
                          style={{
                            ...styles.daySessionCard,
                            backgroundColor: session.color,
                            borderColor: session.border,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="mono" style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>
                                {session.code}
                              </span>
                              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0F172A' }}>
                                {session.title}
                              </span>
                            </div>
                            <span
                              className={`chip ${
                                session.type === 'lab'
                                  ? 'chip-purple'
                                  : session.collision
                                  ? 'chip-warning'
                                  : 'chip-success'
                              }`}
                            >
                              {session.type.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.82rem', color: '#475569' }}>
                            <span style={styles.iconMeta}>
                              <MapPin size={14} color="#0D9488" />
                              <strong>{session.room}</strong>
                            </span>
                            <span style={styles.iconMeta}>
                              <User size={14} color="#6366F1" />
                              <span>{session.faculty}</span>
                            </span>
                          </div>

                          {session.note && (
                            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#047857', fontWeight: '600' }}>
                              ⚡ {session.note}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={styles.dayFreeSlot}>
                          <Clock size={14} color="#94A3B8" />
                          <span>No class scheduled &bull; Study / Break Hour</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Summary Card */}
            <div style={styles.daySummaryCol}>
              <div className="sis-card">
                <div className="sis-card-header">
                  <h3>Day Summary</h3>
                  <span className="chip chip-neutral">{selectedDay}</span>
                </div>
                <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={styles.summaryItem}>
                    <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Total Classes:</span>
                    <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                      {Object.keys(scheduleMatrix[selectedDay] || {}).length} Sessions
                    </strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Lab Practical:</span>
                    <strong style={{ fontSize: '1rem', color: '#7C3AED' }}>
                      {Object.values(scheduleMatrix[selectedDay] || {}).filter((s) => s.type === 'lab').length > 0 ? 'Yes (Lab Block)' : 'None'}
                    </strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Attendance Requirement:</span>
                    <span className="chip chip-success">Mandatory Biometrics</span>
                  </div>
                  <div style={styles.tipBox}>
                    <span style={{ fontSize: '0.76rem', color: '#065F46' }}>
                      💡 Timetable updates synchronize across all nodes via Upstash Redis Pub/Sub invalidation channels.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mode 3: Agenda / List View ─── */}
      {viewMode === 'list' && (
        <div className="sis-table-container animate-fade-in">
          <table className="sis-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>DAY</th>
                <th style={{ width: '130px' }}>TIME</th>
                <th style={{ width: '100px' }}>CODE</th>
                <th>COURSE TITLE</th>
                <th style={{ width: '180px' }}>FACULTY</th>
                <th style={{ width: '120px' }}>VENUE</th>
                <th style={{ width: '100px' }}>TYPE</th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map((s, idx) => (
                <tr key={idx} style={s.collision ? { backgroundColor: '#FFFBEB' } : {}}>
                  <td style={{ fontWeight: '600', color: '#0F172A' }}>{s.day}</td>
                  <td>
                    <span className="mono" style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {s.time}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: '700', color: '#0F172A' }}>
                      {s.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0F172A' }}>{s.title}</div>
                    {s.note && (
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: '600' }}>
                        ⚡ {s.note}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#334155' }}>{s.faculty}</td>
                  <td>
                    <span className="chip chip-neutral">{s.room}</span>
                  </td>
                  <td>
                    <span
                      className={`chip ${
                        s.type === 'lab'
                          ? 'chip-purple'
                          : s.collision
                          ? 'chip-warning'
                          : 'chip-success'
                      }`}
                    >
                      {s.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '28px 32px 60px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748B',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  segTabs: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '8px',
    padding: '3px',
  },
  segBtn: {
    padding: '5px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#64748B',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  segBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  alertBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '10px',
    color: '#92400E',
    fontSize: '0.8rem',
    marginBottom: '20px',
  },
  resolveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #F59E0B',
    color: '#B45309',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    cursor: 'pointer',
  },
  gridTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  timeHeader: {
    width: '130px',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    padding: '12px 14px',
    fontSize: '0.72rem',
    fontWeight: '700',
    borderBottom: '1px solid #E2E8F0',
  },
  dayHeader: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    padding: '12px 14px',
    fontSize: '0.8rem',
    fontWeight: '700',
    borderBottom: '1px solid #E2E8F0',
    borderLeft: '1px solid #E2E8F0',
  },
  timeCell: {
    padding: '14px',
    fontSize: '0.74rem',
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#FAF5FF',
    borderBottom: '1px solid #E2E8F0',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  slotCell: {
    padding: '8px',
    borderBottom: '1px solid #E2E8F0',
    borderLeft: '1px solid #E2E8F0',
    verticalAlign: 'top',
    height: '110px',
    width: '18%',
  },
  sessionBox: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    height: '100%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  sessionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCode: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '0.78rem',
    color: '#0F172A',
  },
  sessionTitle: {
    fontWeight: '600',
    fontSize: '0.8rem',
    color: '#0F172A',
    lineHeight: '1.25',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.68rem',
    color: '#475569',
    marginTop: 'auto',
  },
  iconMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  sessionNote: {
    fontSize: '0.66rem',
    color: '#047857',
    fontWeight: '700',
    marginTop: '2px',
  },
  freePeriodBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px dashed #E2E8F0',
  },
  freePeriodText: {
    fontSize: '0.72rem',
    color: '#94A3B8',
    fontWeight: '500',
  },
  dayViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  daySelectorBar: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  dayPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dayPillActive: {
    backgroundColor: '#0C4A3E',
    color: '#FFFFFF',
    borderColor: '#0C4A3E',
    boxShadow: '0 2px 4px rgba(12,74,62,0.15)',
  },
  dayContentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  timelineRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'stretch',
  },
  timeBadgeCol: {
    width: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    flexShrink: 0,
  },
  timeBadgeText: {
    fontSize: '0.76rem',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#475569',
  },
  daySessionCard: {
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  dayFreeSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px dashed #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#94A3B8',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  daySummaryCol: {},
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  tipBox: {
    padding: '10px 12px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '8px',
    marginTop: '6px',
  },
};
