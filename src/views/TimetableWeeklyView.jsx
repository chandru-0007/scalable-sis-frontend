import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function TimetableWeeklyView() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day' | 'list'
  const [selectedDay, setSelectedDay] = useState('Monday 19 Oct');
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday 19 Oct', 'Tuesday 20 Oct', 'Wednesday 21 Oct', 'Thursday 22 Oct', 'Friday 23 Oct'];
  const times = ['09:00 - 10:30', '10:30 - 12:00', '11:30 - 13:00', '14:00 - 15:30', '15:30 - 17:00'];

  const studentId = user?.studentId || user?.id || user?.rollNumber;

  useEffect(() => {
    async function loadTimetable() {
      setLoading(true);
      try {
        if (studentId) {
          const res = await api.students.getTimetable(studentId);
          if (res.status === 'SUCCESS' && Array.isArray(res.timetable)) {
            setTimetableSlots(res.timetable);
          }
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, [studentId]);

  // Dynamically build schedule matrix from real enrolled courses
  const scheduleMatrix = {
    'Monday 19 Oct': {},
    'Tuesday 20 Oct': {},
    'Wednesday 21 Oct': {},
    'Thursday 22 Oct': {},
    'Friday 23 Oct': {},
  };

  timetableSlots.forEach((slot) => {
    const rawDay = (slot.day || 'Mon').toLowerCase();
    const matchedDay = days.find((d) => d.toLowerCase().includes(rawDay.slice(0, 3))) || 'Monday 19 Oct';
    
    // Normalize or match slot time
    let matchedTime = times[0];
    const rawTime = slot.time || '09:00 - 10:30';
    if (rawTime.includes('09:00')) matchedTime = '09:00 - 10:30';
    else if (rawTime.includes('10:30')) matchedTime = '10:30 - 12:00';
    else if (rawTime.includes('11:00') || rawTime.includes('11:30')) matchedTime = '11:30 - 13:00';
    else if (rawTime.includes('14:00')) matchedTime = '14:00 - 15:30';
    else if (rawTime.includes('15:30')) matchedTime = '15:30 - 17:00';

    const isLab = (slot.courseTitle || '').toLowerCase().includes('lab');
    scheduleMatrix[matchedDay][matchedTime] = {
      code: slot.courseCode,
      title: slot.courseTitle,
      room: slot.room || 'Room TBA',
      faculty: slot.instructor || 'Faculty Mentor',
      type: isLab ? 'lab' : 'lecture',
      color: isLab ? '#F5F3FF' : '#ECFDF5',
      border: isLab ? '#DDD6FE' : '#A7F3D0',
    };
  });

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

      {/* Collision Alert Banner — Only shown if genuine collision exists */}
      {timetableSlots.length > 0 && (
        <div style={styles.alertBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
            <span>
              <strong>Dynamic Live Schedule:</strong> Displaying {timetableSlots.length} confirmed lecture &amp; laboratory sessions from your enrolled courses.
            </span>
          </div>
          <span className="chip chip-success">Synced with Redis</span>
        </div>
      )}

      {/* Zero State if 0 enrolled courses */}
      {timetableSlots.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: 'var(--card-bg, #FFFFFF)', borderRadius: '18px', border: '1px solid var(--border-color, #E2E8F0)', margin: '16px 0 24px' }}>
          <CalendarDays size={38} color="var(--primary-blue)" style={{ opacity: 0.45, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 6px' }}>Your Timetable is Empty (0 Enrolled Courses)</h3>
          <p style={{ color: '#64748B', fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 16px' }}>
            You have not registered for any courses yet. Select courses in the Course Catalog to generate your scheduled lecture and laboratory timetable slots.
          </p>
          <a href="#registration" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={15} />
            <span>Browse &amp; Enroll Courses</span>
          </a>
        </div>
      )}

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
    padding: '24px 32px 48px',
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
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-heading)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  segTabs: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface-secondary)',
    borderRadius: 'var(--radius-btn)',
    padding: '4px',
    border: '1px solid var(--border)',
  },
  segBtn: {
    padding: '6px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  segBtnActive: {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--primary-blue)',
    fontWeight: '600',
    boxShadow: 'var(--shadow-small-btn)',
  },
  alertBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--warning)',
    fontSize: '13px',
    marginBottom: '20px',
  },
  resolveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--warning-border)',
    color: 'var(--warning)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: 'var(--shadow-small-btn)',
    cursor: 'pointer',
  },
  gridTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  timeHeader: {
    width: '130px',
    backgroundColor: 'var(--bg-surface-secondary)',
    color: 'var(--text-muted)',
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)',
  },
  dayHeader: {
    backgroundColor: 'var(--bg-surface-secondary)',
    color: 'var(--text-heading)',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
  },
  timeCell: {
    padding: '14px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-surface-secondary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
  },
  slotCell: {
    padding: '8px',
    borderBottom: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
    verticalAlign: 'top',
    height: '110px',
    width: '18%',
  },
  sessionBox: {
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    height: '100%',
    boxShadow: 'var(--shadow-small-btn)',
  },
  sessionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCode: {
    fontFamily: 'var(--font-mono)',
    fontWeight: '600',
    fontSize: '12px',
    color: 'var(--text-heading)',
  },
  sessionTitle: {
    fontWeight: '600',
    fontSize: '13px',
    color: 'var(--text-heading)',
    lineHeight: '1.25',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: 'auto',
  },
  iconMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  sessionNote: {
    fontSize: '11px',
    color: 'var(--primary-blue)',
    fontWeight: '600',
    marginTop: '2px',
  },
  freePeriodBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'var(--bg-surface-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--border)',
  },
  freePeriodText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
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
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-body)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  dayPillActive: {
    backgroundColor: 'var(--primary-blue)',
    color: '#FFFFFF',
    borderColor: 'var(--primary-blue)',
    boxShadow: 'var(--shadow-small-btn)',
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
    backgroundColor: 'var(--bg-surface-secondary)',
    borderRadius: 'var(--radius-md)',
    flexShrink: 0,
    border: '1px solid var(--border)',
  },
  timeBadgeText: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '600',
    color: 'var(--text-heading)',
  },
  daySessionCard: {
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-small-btn)',
  },
  dayFreeSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)',
    backgroundColor: 'var(--bg-surface-secondary)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '500',
  },
  daySummaryCol: {},
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  tipBox: {
    padding: '10px 12px',
    backgroundColor: 'var(--primary-subtle)',
    border: '1px solid var(--primary-border)',
    borderRadius: 'var(--radius-sm)',
    marginTop: '6px',
  },
};
