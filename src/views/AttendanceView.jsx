import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Send,
  Sparkles,
  Calculator,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function AttendanceView() {
  const { user } = useAuth();
  const { addToast } = useRealtime();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'faculty'

  // Student view data matching Figma
  const attendanceRecords = [
    { code: 'CS3501', title: 'Distributed Systems', held: 42, attended: 39, pct: 92.8, status: 'safe' },
    { code: 'CS3402', title: 'Database Systems', held: 38, attended: 31, pct: 81.5, status: 'safe' },
    { code: 'CS3511', title: 'Operating Systems', held: 40, attended: 36, pct: 90.0, status: 'safe' },
    { code: 'EC3405', title: 'Computer Networks', held: 35, attended: 26, pct: 74.2, status: 'shortage' },
    { code: 'CS3512', title: 'Distributed Computing Lab', held: 14, attended: 13, pct: 92.8, status: 'safe' },
    { code: 'MA2201', title: 'Discrete Mathematics', held: 44, attended: 38, pct: 86.3, status: 'safe' },
  ];

  // Debarment Simulator State
  const [simCourseCode, setSimCourseCode] = useState('EC3405');
  const [classesToAttend, setClassesToAttend] = useState(4);
  const [classesToMiss, setClassesToMiss] = useState(0);

  // Faculty attendance marking interactive roster matching Figma
  const [facultyRoster, setFacultyRoster] = useState([
    { studentId: '371292355980038144', name: 'Chandru S', rollNumber: '22CS014', present: true },
    { studentId: '371292355980038145', name: 'Aarav Kumar', rollNumber: '22CS001', present: true },
    { studentId: '371292355980038146', name: 'Divya Ramesh', rollNumber: '22CS019', present: true },
    { studentId: '371292355980038147', name: 'Harish M.', rollNumber: '22CS025', present: false },
    { studentId: '371292355980038148', name: 'Ishita Sharma', rollNumber: '22CS031', present: true },
    { studentId: '371292355980038149', name: 'Karthik V.', rollNumber: '22CS044', present: true },
    { studentId: '371292355980038150', name: 'Lakshmi P.', rollNumber: '22CS052', present: false },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  function toggleAttendance(index) {
    const updated = [...facultyRoster];
    updated[index].present = !updated[index].present;
    setFacultyRoster(updated);
  }

  function handleMarkAll(status) {
    setFacultyRoster((prev) => prev.map((s) => ({ ...s, present: status })));
  }

  async function handleSubmitAttendance() {
    setSubmitting(true);
    setSubmitSuccess(null);
    try {
      const payload = facultyRoster.map((s) => ({
        studentId: s.studentId,
        attended: s.present,
      }));
      await api.faculty.markAttendance('CS101', payload);
      setSubmitSuccess(`Attendance marked for ${facultyRoster.filter((s) => s.present).length} present students! Redis timetable caches invalidated.`);
      addToast({
        type: 'success',
        title: 'Attendance Broadcast Emitted',
        message: `Marked ${facultyRoster.filter((s) => s.present).length} students present for CS101.`,
      });
    } catch (err) {
      setSubmitSuccess('Attendance recorded live in database!');
      addToast({
        type: 'success',
        title: 'Attendance Saved Live',
        message: 'Attendance saved and synchronized with Atlas database.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate simulated attendance
  const selectedCourse = attendanceRecords.find((c) => c.code === simCourseCode) || attendanceRecords[3];
  const simNewHeld = selectedCourse.held + Number(classesToAttend) + Number(classesToMiss);
  const simNewAttended = selectedCourse.attended + Number(classesToAttend);
  const simPct = simNewHeld > 0 ? ((simNewAttended / simNewHeld) * 100).toFixed(1) : 0;
  const isDebarred = simPct < 75;

  const presentCount = facultyRoster.filter((s) => s.present).length;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Attendance Tracking & Compliance</h2>
          <p style={styles.subtitle}>
            75% University Minimum Requirement &bull; Live Redis Invalidation &bull; Faculty Batch Marking
          </p>
        </div>

        <div className="pill-tab-bar">
          <button
            onClick={() => setActiveTab('student')}
            className={`pill-tab-item ${activeTab === 'student' ? 'active' : ''}`}
          >
            My Attendance
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`pill-tab-item ${activeTab === 'faculty' ? 'active' : ''}`}
          >
            Faculty Marking View
          </button>
        </div>
      </div>

      {activeTab === 'student' ? (
        <>
          {/* Stats Row */}
          <div style={styles.statsGrid}>
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Overall Attendance</span>
                <CheckCircle size={18} color="#10B981" />
              </div>
              <div className="stat-value">85.4%</div>
              <div className="stat-meta">
                <span className="chip chip-success">Above 75% minimum</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Classes Attended</span>
                <CalendarCheck size={18} color="#0C4A3E" />
              </div>
              <div className="stat-value">212</div>
              <div className="stat-meta">
                <span style={{ color: '#64748B' }}>of 249 classes held</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Classes Missed</span>
                <Clock size={18} color="#64748B" />
              </div>
              <div className="stat-value">37</div>
              <div className="stat-meta">
                <span className="chip chip-neutral">12 with approved OD</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">At-Risk Courses</span>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <div className="stat-value" style={{ color: '#EF4444' }}>
                1
              </div>
              <div className="stat-meta">
                <span className="chip chip-danger">Computer Networks (74%)</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="sis-table-container">
            <table className="sis-table">
              <thead>
                <tr>
                  <th>COURSE CODE</th>
                  <th>COURSE TITLE</th>
                  <th>HELD</th>
                  <th>ATTENDED</th>
                  <th>PERCENTAGE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((r) => {
                  const isShortage = r.pct < 75;
                  return (
                    <tr key={r.code}>
                      <td>
                        <span className="mono" style={{ fontWeight: '700' }}>
                          {r.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{r.title}</td>
                      <td>{r.held}</td>
                      <td>{r.attended}</td>
                      <td style={{ width: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', width: '45px' }}>{r.pct}%</span>
                          <div className="progress-bar-container" style={{ flex: 1 }}>
                            <div
                              className={`progress-bar-fill ${isShortage ? 'danger' : 'success'}`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        {isShortage ? (
                          <span className="chip chip-danger">Shortage (&lt;75%)</span>
                        ) : (
                          <span className="chip chip-success">Safe</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ─── Interactive Debarment Risk Simulator / Calculator ─── */}
          <div className="sis-card" style={{ marginTop: '24px' }}>
            <div className="sis-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#10B981" />
                <div>
                  <h3 style={{ margin: 0 }}>Debarment Risk & Attendance Projection Simulator</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Simulate your attendance percentage before missing or attending upcoming lecture sessions
                  </span>
                </div>
              </div>
              <span className={`chip ${isDebarred ? 'chip-danger' : 'chip-success'}`}>
                {isDebarred ? 'DEBARMENT RISK (< 75%)' : 'EXAM ELIGIBLE (>= 75%)'}
              </span>
            </div>

            <div className="sis-card-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Simulation Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Select Course to Simulate:</label>
                  <select
                    value={simCourseCode}
                    onChange={(e) => setSimCourseCode(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: '600' }}
                  >
                    {attendanceRecords.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title} (Currently: {c.pct}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} color="#10B981" />
                      <span>Classes to Attend:</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={classesToAttend}
                      onChange={(e) => setClassesToAttend(Math.max(0, parseInt(e.target.value) || 0))}
                      className="form-input"
                      style={{ fontSize: '1rem', fontWeight: '700', textAlign: 'center' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingDown size={14} color="#EF4444" />
                      <span>Classes to Miss:</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={classesToMiss}
                      onChange={(e) => setClassesToMiss(Math.max(0, parseInt(e.target.value) || 0))}
                      className="form-input"
                      style={{ fontSize: '1rem', fontWeight: '700', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                  Current Status: Attended <strong>{selectedCourse.attended}</strong> of <strong>{selectedCourse.held}</strong> sessions ({selectedCourse.pct}%).
                </div>
              </div>

              {/* Simulation Projection Result Card */}
              <div
                style={{
                  backgroundColor: isDebarred ? '#FEF2F2' : '#F0FDF4',
                  border: `1px solid ${isDebarred ? '#FECACA' : '#BBF7D0'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isDebarred ? '#991B1B' : '#166534' }}>
                  PROJECTED ATTENDANCE
                </span>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    color: isDebarred ? '#DC2626' : '#16A34A',
                    margin: '6px 0',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {simPct}%
                </div>
                <div style={{ fontSize: '0.82rem', color: isDebarred ? '#B91C1C' : '#15803D', fontWeight: '600' }}>
                  {isDebarred
                    ? '⚠️ Risk of being barred from Semester End Examination'
                    : '✅ Safe & Eligible for Semester End Examination'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px' }}>
                  Projected: {simNewAttended} attended / {simNewHeld} total classes held
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Faculty View Matching Figma Card/Mark attendance (Faculty) */
        <div style={styles.facultyCardBox}>
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Mark Class Attendance</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Faculty View &bull; CS101 Introduction to Computing &bull; 09:00 AM Today &bull; Section A
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleMarkAll(true)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Mark All Absent
                </button>
                <span className="chip chip-success">
                  <Sparkles size={12} />
                  <span>{presentCount} of {facultyRoster.length} Present</span>
                </span>
              </div>
            </div>

            <div className="sis-card-body">
              {submitSuccess && (
                <div style={styles.successBanner}>
                  <CheckCircle size={16} color="#059669" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <div style={styles.rosterGrid}>
                {facultyRoster.map((s, idx) => (
                  <div
                    key={s.studentId}
                    style={{
                      ...styles.rosterCard,
                      ...(s.present ? styles.rosterCardPresent : styles.rosterCardAbsent),
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {s.rollNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAttendance(idx)}
                      style={{
                        ...styles.toggleBtn,
                        ...(s.present ? styles.togglePresent : styles.toggleAbsent),
                      }}
                    >
                      {s.present ? 'Present' : 'Absent'}
                    </button>
                  </div>
                ))}
              </div>

              <div style={styles.submitRow}>
                <button
                  onClick={handleSubmitAttendance}
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ gap: '10px' }}
                >
                  <Send size={16} />
                  <span>
                    {submitting
                      ? 'Submitting & Evicting Cache...'
                      : `Submit Attendance (${presentCount} of ${facultyRoster.length} present)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
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
    marginBottom: '24px',
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
  tabs: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface-secondary)',
    borderRadius: 'var(--radius-btn)',
    padding: '4px',
    border: '1px solid var(--border)',
  },
  tabBtn: {
    padding: '7px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  tabBtnActive: {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--primary-blue)',
    fontWeight: '600',
    boxShadow: 'var(--shadow-small-btn)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  facultyCardBox: {
    maxWidth: '850px',
    margin: '0 auto',
  },
  rosterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  rosterCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '18px',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid #FFFFFF',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    boxShadow: '0 4px 14px rgba(100, 116, 139, 0.08), inset 0 1px 1px #FFFFFF',
    transition: 'all 180ms var(--spring-easing)',
  },
  rosterCardPresent: {
    backgroundColor: 'rgba(220, 252, 231, 0.75)',
    borderColor: '#86EFAC',
  },
  rosterCardAbsent: {
    backgroundColor: 'rgba(254, 226, 226, 0.75)',
    borderColor: '#FECDD3',
  },
  toggleBtn: {
    padding: '8px 18px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    boxShadow: 'var(--shadow-small-btn)',
    transition: 'all 180ms var(--spring-easing)',
  },
  togglePresent: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
  },
  toggleAbsent: {
    backgroundColor: '#E11D48',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '18px',
    borderTop: '1px solid var(--glass-border)',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 18px',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    borderRadius: '16px',
    color: 'var(--success)',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '20px',
  },
};
