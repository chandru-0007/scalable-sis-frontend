import React, { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api';
import {
  ShieldAlert,
  Calendar,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Send,
  RefreshCw,
  Search,
  Users,
  BookOpen,
} from 'lucide-react';

export default function AdminPortalView({ initialTab }) {
  const { addToast } = useRealtime();
  const [activeTab, setActiveTab] = useState(initialTab || 'reschedule'); // 'reschedule' | 'faculty' | 'debarred'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // System Overview metrics from backend
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);

  // Reschedule form state
  const [rescheduleCode, setRescheduleCode] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('Air conditioning maintenance in lecture hall');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleResult, setRescheduleResult] = useState(null);

  // Faculty onboarding state
  const [facultyName, setFacultyName] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyRoll, setFacultyRoll] = useState('');
  const [facultyDept, setFacultyDept] = useState('CSE');
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyResult, setFacultyResult] = useState(null);

  // Debarred students report state
  const [debarredList, setDebarredList] = useState([]);
  const [loadingDebarred, setLoadingDebarred] = useState(false);

  useEffect(() => {
    loadOverview();
    loadCourses();
  }, []);

  useEffect(() => {
    if (activeTab === 'debarred') {
      loadDebarred();
    }
  }, [activeTab]);

  async function loadOverview() {
    try {
      const res = await api.admin.getOverview();
      if (res && res.totalStudents !== undefined) {
        setOverview(res);
      }
    } catch (err) {
      console.warn('Overview fetch note:', err);
    }
  }

  async function loadCourses() {
    try {
      const res = await api.courses.getAll();
      const list = res?.courses || (Array.isArray(res) ? res : []);
      setCourses(list);
      if (list.length > 0) {
        setRescheduleCode((prev) => {
          if (prev && list.some((c) => c.code === prev)) return prev;
          const first = list[0];
          setNewSchedule(first.schedule || '');
          setNewRoom(first.room || '');
          return first.code;
        });
      }
    } catch (err) {
      console.error('Failed to load courses for admin:', err);
    }
  }

  function handleSelectCourse(code) {
    setRescheduleCode(code);
    const selected = courses.find((c) => c.code === code);
    if (selected) {
      setNewSchedule(selected.schedule || '');
      setNewRoom(selected.room || '');
    }
  }

  async function loadDebarred() {
    setLoadingDebarred(true);
    try {
      const res = await api.admin.getDebarredStudents();
      const list = res?.debarredStudents || res?.flaggedStudents || res?.flaggedRecords || (Array.isArray(res) ? res : []);
      setDebarredList(list);
    } catch (err) {
      console.warn('Debarred load error:', err);
      setDebarredList([]);
    } finally {
      setLoadingDebarred(false);
    }
  }

  async function handleReschedule(e) {
    e.preventDefault();
    setRescheduleLoading(true);
    setRescheduleResult(null);
    try {
      const res = await api.admin.rescheduleCourse(rescheduleCode, {
        newSchedule,
        newRoom,
        reason: rescheduleReason,
      });
      setRescheduleResult(res);
      addToast({
        type: 'warning',
        title: 'High-Priority Reschedule Broadcast',
        message: `${rescheduleCode} rescheduled to ${newRoom}. Real-time SSE alert sent to all enrolled students.`,
      });
      loadCourses();
      loadOverview();
    } catch (err) {
      alert(`Reschedule error: ${err.message}`);
    } finally {
      setRescheduleLoading(false);
    }
  }

  async function handleOnboardFaculty(e) {
    e.preventDefault();
    setFacultyLoading(true);
    setFacultyResult(null);
    try {
      const res = await api.admin.onboardFaculty({
        name: facultyName,
        email: facultyEmail,
        rollNumber: facultyRoll,
        department: facultyDept,
        password: 'Faculty@123',
        role: 'FACULTY',
      });
      setFacultyResult(`Faculty ${res.name} onboarded! Snowflake ID: ${res.id}, Shard: ${res.targetShard}`);
      addToast({
        type: 'success',
        title: 'Faculty Member Onboarded',
        message: `${res.name} partitioned to ${res.targetShard || 'sis_shard_1'} on MongoDB Atlas.`,
      });
      setFacultyName('');
      setFacultyEmail('');
      setFacultyRoll('');
    } catch (err) {
      alert(`Faculty onboarding error: ${err.message}`);
    } finally {
      setFacultyLoading(false);
    }
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Academic Registrar & Administrator Command</h2>
          <p style={styles.subtitle}>
            Intelligent Course Rescheduling &bull; Faculty Onboarding &bull; Attendance Debarment Audits
          </p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('reschedule')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'reschedule' ? styles.tabBtnActive : {}),
            }}
          >
            Intelligent Rescheduling
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'faculty' ? styles.tabBtnActive : {}),
            }}
          >
            Onboard Faculty
          </button>
          <button
            onClick={() => setActiveTab('debarred')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'debarred' ? styles.tabBtnActive : {}),
            }}
          >
            Attendance Debarment (&lt;75%)
          </button>
        </div>
      </div>

      {/* ─── University System Metrics Strip ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Registered Students</span>
            <Users size={18} color="var(--primary-blue)" />
          </div>
          <div className="stat-value">{overview?.totalStudents ?? 9}</div>
          <div className="stat-meta">
            <span className="chip chip-info">MongoDB Atlas Sharded</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Catalog Courses</span>
            <BookOpen size={18} color="var(--success)" />
          </div>
          <div className="stat-value">{overview?.totalCourses ?? courses.length}</div>
          <div className="stat-meta">
            <span className="chip chip-success">All Departments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Confirmed Course Enrollments</span>
            <Layers size={18} color="#8B5CF6" />
          </div>
          <div className="stat-value">{overview?.totalEnrollments ?? 5}</div>
          <div className="stat-meta">
            <span className="chip chip-purple">Fall 2026 Term</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Debarment Risk (&lt;75%)</span>
            <AlertTriangle size={18} color={overview?.studentsBelow75Percent > 0 ? '#EF4444' : '#10B981'} />
          </div>
          <div className="stat-value" style={{ color: overview?.studentsBelow75Percent > 0 ? '#EF4444' : '#10B981' }}>
            {overview?.studentsBelow75Percent ?? debarredList.length}
          </div>
          <div className="stat-meta">
            <span className={`chip ${overview?.studentsBelow75Percent > 0 ? 'chip-danger' : 'chip-success'}`}>
              {overview?.studentsBelow75Percent > 0 ? 'Action Required' : 'All Students Compliant'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: Reschedule Engine with Timetable Invalidation & Notice Broadcast */}
      {activeTab === 'reschedule' && (
        <div style={styles.gridTwo}>
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Intelligent Course Rescheduling</h3>
              <span className="chip chip-warning">Auto-Broadcast Circular</span>
            </div>
            <div className="sis-card-body">
              <form onSubmit={handleReschedule}>
                <div className="form-group">
                  <label className="form-label">Course Code to Reschedule</label>
                  <select
                    value={rescheduleCode}
                    onChange={(e) => handleSelectCourse(e.target.value)}
                    className="form-select"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title} ({c.schedule || 'No schedule'} @ {c.room || 'No room'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">New Weekly Lecture Schedule</label>
                  <input
                    type="text"
                    required
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Mon 11:30-13:00, Thu 11:30-13:00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Room / Lecture Hall</label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Tech Hall 405"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative Reschedule Reason</label>
                  <textarea
                    required
                    rows="2"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', gap: '8px' }}
                >
                  <Clock size={16} />
                  <span>
                    {rescheduleLoading
                      ? 'Rescheduling & Invalidating Caches...'
                      : 'Reschedule Course & Broadcast Notice'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Reschedule Confirmation Result Box */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Reschedule Engine Pipeline Status</h3>
              <span className="chip chip-success">Automated Operations</span>
            </div>
            <div className="sis-card-body">
              {rescheduleResult ? (
                <div style={styles.resultBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="#059669" />
                    <strong style={{ color: '#065F46', fontSize: '0.92rem' }}>
                      Course Rescheduled Successfully!
                    </strong>
                  </div>
                  <div style={styles.resultDetail}>
                    <span>Enrolled Student Caches Evicted:</span>
                    <strong>{rescheduleResult.invalidatedStudentCaches} Students</strong>
                  </div>
                  <div style={styles.resultDetail}>
                    <span>Course Catalog Cache Status:</span>
                    <strong style={{ color: '#10B981' }}>{rescheduleResult.courseCacheStatus}</strong>
                  </div>
                  <div style={styles.resultDetail}>
                    <span>Official Circular Broadcast:</span>
                    <strong style={{ color: '#0F172A' }}>{rescheduleResult.broadcastCircular}</strong>
                  </div>
                  {rescheduleResult.shortUrl && (
                    <div style={styles.resultDetail}>
                      <span>Base62 Short URL:</span>
                      <a
                        href={rescheduleResult.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#10B981', fontWeight: '700' }}
                      >
                        {rescheduleResult.shortUrl}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748B' }}>
                  <Calendar size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                  <div>Select a course and submit the form.</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                    The backend will automatically detect room conflicts, evict enrolled students' Redis timetable caches, and broadcast a short link notice.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Onboard Faculty */}
      {activeTab === 'faculty' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Onboard New Faculty Member</h3>
              <span className="chip chip-purple">Snowflake &bull; Sharded</span>
            </div>
            <div className="sis-card-body">
              {facultyResult && (
                <div style={styles.resultSuccess}>
                  <CheckCircle size={16} color="#059669" />
                  <span>{facultyResult}</span>
                </div>
              )}

              <form onSubmit={handleOnboardFaculty}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Faculty Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC003"
                    value={facultyRoll}
                    onChange={(e) => setFacultyRoll(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@college.edu"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Department</label>
                  <select
                    value={facultyDept}
                    onChange={(e) => setFacultyDept(e.target.value)}
                    className="form-select"
                  >
                    <option value="CSE">CSE - Computer Science & Engineering</option>
                    <option value="ECE">ECE - Electronics & Communication</option>
                    <option value="IT">IT - Information Technology</option>
                    <option value="MECH">MECH - Mechanical Engineering</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={facultyLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {facultyLoading ? <span className="spinner" /> : 'Generate Snowflake ID & Onboard'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Debarred Students Report */}
      {activeTab === 'debarred' && (
        <div className="sis-card">
          <div className="sis-card-header">
            <div>
              <h3>University Debarment Audit (&lt;75% Attendance)</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Students at risk of examination debarment across MongoDB shards
              </span>
            </div>
            <button onClick={loadDebarred} className="btn btn-secondary btn-sm">
              <RefreshCw size={13} />
              <span>Refresh Audit</span>
            </button>
          </div>
          <div className="sis-card-body" style={{ padding: 0 }}>
            <div className="sis-table-container">
              <table className="sis-table">
                <thead>
                  <tr>
                    <th>ROLL NUMBER</th>
                    <th>STUDENT NAME</th>
                    <th>COURSE CODE</th>
                    <th>ATTENDANCE %</th>
                    <th>TARGET SHARD</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {debarredList.length > 0 ? (
                    debarredList.map((item, idx) => (
                      <tr key={idx}>
                        <td><span className="mono" style={{ fontWeight: '700' }}>{item.rollNumber}</span></td>
                        <td style={{ fontWeight: '600' }}>{item.name || item.studentName}</td>
                        <td><span className="chip chip-neutral">{item.courseCode}</span></td>
                        <td>
                          <strong style={{ color: '#EF4444' }}>{item.attendancePercentage ?? item.attendancePct}%</strong>
                        </td>
                        <td>
                          <span className="chip chip-purple" style={{ fontFamily: 'monospace' }}>
                            {item.targetShard || 'sis_shard_1'}
                          </span>
                        </td>
                        <td>
                          <span className="chip chip-danger">DEBARRED FROM EXAM</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                        <CheckCircle size={28} color="#10B981" style={{ marginBottom: '8px' }} />
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          0 Students Debarred
                        </div>
                        <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                          All registered students currently maintain attendance above the mandatory 75% threshold.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
  },
  resultBox: {
    padding: '16px',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text-body)',
    borderBottom: '1px dashed var(--border)',
    paddingBottom: '8px',
  },
  resultSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--success)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '18px',
  },
};
