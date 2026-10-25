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
} from 'lucide-react';

export default function AdminPortalView() {
  const { addToast } = useRealtime();
  const [activeTab, setActiveTab] = useState('reschedule'); // 'reschedule' | 'faculty' | 'debarred'

  // Reschedule form state
  const [rescheduleCode, setRescheduleCode] = useState('CS101');
  const [newSchedule, setNewSchedule] = useState('Mon 11:30-13:00, Thu 11:30-13:00');
  const [newRoom, setNewRoom] = useState('Tech Hall 405');
  const [rescheduleReason, setRescheduleReason] = useState('Air conditioning maintenance in Hall 101');
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
    if (activeTab === 'debarred') {
      loadDebarred();
    }
  }, [activeTab]);

  async function loadDebarred() {
    setLoadingDebarred(true);
    try {
      const res = await api.admin.getDebarredStudents();
      if (res.status === 'SUCCESS' && Array.isArray(res.debarredStudents)) {
        setDebarredList(res.debarredStudents);
      }
    } catch (err) {
      console.warn('Debarred load fallback:', err);
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
                    onChange={(e) => setRescheduleCode(e.target.value)}
                    className="form-select"
                  >
                    <option value="CS101">CS101 - Introduction to Computing</option>
                    <option value="CS201">CS201 - Data Structures & Algorithms</option>
                    <option value="CS301">CS301 - Operating Systems</option>
                    <option value="CS302">CS302 - Database Management Systems</option>
                    <option value="CS501">CS501 - Distributed Systems</option>
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
                  {(debarredList.length > 0 ? debarredList : [
                    { rollNumber: '2024CSE105', name: 'Kavitha R', courseCode: 'EC3405', attendancePercentage: 74.0, targetShard: 'sis_shard_2' },
                    { rollNumber: '22CS025', name: 'Harish M.', courseCode: 'CS101', attendancePercentage: 68.5, targetShard: 'sis_shard_1' },
                    { rollNumber: '22CS052', name: 'Lakshmi P.', courseCode: 'CS201', attendancePercentage: 71.0, targetShard: 'sis_shard_0' },
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td><span className="mono" style={{ fontWeight: '700' }}>{item.rollNumber}</span></td>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td><span className="chip chip-neutral">{item.courseCode}</span></td>
                      <td>
                        <strong style={{ color: '#EF4444' }}>{item.attendancePercentage}%</strong>
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
                  ))}
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
    padding: '28px 32px 60px',
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
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748B',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    padding: '4px',
  },
  tabBtn: {
    padding: '7px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#64748B',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
  },
  resultBox: {
    padding: '16px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.82rem',
    color: '#475569',
    borderBottom: '1px dashed #A7F3D0',
    paddingBottom: '8px',
  },
  resultSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '8px',
    color: '#047857',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '18px',
  },
};
