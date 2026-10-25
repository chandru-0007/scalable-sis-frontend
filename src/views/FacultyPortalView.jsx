import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api';
import {
  Briefcase,
  Users,
  CalendarCheck,
  Award,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  GraduationCap,
} from 'lucide-react';

export default function FacultyPortalView() {
  const { user } = useAuth();
  const { addToast } = useRealtime();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('CS101');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeInputs, setGradeInputs] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    loadFacultyData();
  }, [user]);

  async function loadFacultyData() {
    setLoading(true);
    try {
      const facultyName = user?.name || 'Dr. A. Ramanathan';
      const res = await api.faculty.getCourses({ facultyName });
      if (Array.isArray(res) && res.length > 0) {
        setCourses(res);
        loadRoster(res[0].code);
      } else {
        // Fallback default
        loadRoster('CS101');
      }
    } catch (err) {
      console.error('Failed to load faculty courses:', err);
      loadRoster('CS101');
    } finally {
      setLoading(false);
    }
  }

  async function loadRoster(code) {
    setSelectedCourse(code);
    try {
      const res = await api.faculty.getRoster(code);
      if (res.status === 'SUCCESS' && Array.isArray(res.roster)) {
        setRoster(res.roster);
      }
    } catch (err) {
      console.warn('Failed to load roster:', err);
    }
  }

  async function handleGradeSubmit(enrollmentId) {
    const input = gradeInputs[enrollmentId];
    if (!input || !input.grade) return;
    try {
      await api.faculty.submitGrade(selectedCourse, enrollmentId, input.grade, input.gp || 9.0);
      setStatusMsg(`Grade [${input.grade}] submitted! Student timetable cache evicted.`);
      addToast({
        type: 'purple',
        title: 'Gradebook Submission Emitted',
        message: `Grade ${input.grade} submitted for enrollment #${enrollmentId}. Student records updated across Atlas shards.`,
      });
      loadRoster(selectedCourse);
    } catch (err) {
      setStatusMsg(`Grade update error: ${err.message}`);
    }
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Faculty Instructor Portal</h2>
          <p style={styles.subtitle}>
            Class Rosters &bull; Batch Daily Attendance Marking &bull; Gradebook Submission
          </p>
        </div>
        <div style={styles.facultyBadge}>
          <Briefcase size={16} color="#10B981" />
          <span>{user?.name || 'Dr. A. Ramanathan'} &bull; Department of CSE</span>
        </div>
      </div>

      {statusMsg && (
        <div style={styles.statusBox}>
          <CheckCircle size={16} color="#059669" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Layout: Courses List + Roster / Gradebook */}
      <div style={styles.layoutGrid}>
        {/* Left: Assigned Courses */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>My Teaching Courses</h3>
              <span className="chip chip-success">{courses.length || 2} Assigned</span>
            </div>
            <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(courses.length > 0 ? courses : [
                { code: 'CS101', title: 'Introduction to Computing', schedule: 'MWF 09:00 - 10:00 AM', room: 'Hall 101', enrolled: 43 },
                { code: 'CS201', title: 'Data Structures & Algorithms', schedule: 'Tue/Thu 11:30 - 13:00', room: 'LH-110', enrolled: 58 },
              ]).map((c) => (
                <div
                  key={c.code}
                  onClick={() => loadRoster(c.code)}
                  style={{
                    ...styles.courseCard,
                    ...(selectedCourse === c.code ? styles.courseCardActive : {}),
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0F172A' }}>
                      {c.code}
                    </span>
                    <span className="chip chip-neutral" style={{ fontSize: '0.7rem' }}>
                      {c.enrolled || 43} Students
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1E293B', marginTop: '4px' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                    {c.room} &bull; {c.schedule}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cross-Shard Class Roster & Grades */}
        <div style={{ flex: '1 1 650px' }}>
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Course Class Roster &bull; {selectedCourse}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Cross-shard student lookups via Scatter-Gather across MongoDB shards
                </span>
              </div>
              <span className="chip chip-info">{roster.length || 3} Enrolled</span>
            </div>

            <div className="sis-card-body" style={{ padding: 0 }}>
              <div className="sis-table-container">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>ROLL NO</th>
                      <th>STUDENT NAME</th>
                      <th>ATTENDANCE</th>
                      <th>GRADE</th>
                      <th style={{ textAlign: 'right' }}>SUBMIT GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(roster.length > 0 ? roster : [
                      { enrollmentId: '371292720527970304', rollNumber: '22CS014', name: 'Chandru S', attendancePercentage: 93.5, grade: 'A+' },
                      { enrollmentId: '371292720527970305', rollNumber: '22CS088', name: 'Arun Kumar', attendancePercentage: 88.0, grade: 'A' },
                      { enrollmentId: '371292720527970306', rollNumber: '2024CSE105', name: 'Kavitha R', attendancePercentage: 74.0, grade: 'B' },
                    ]).map((s) => (
                      <tr key={s.enrollmentId}>
                        <td>
                          <span className="mono" style={{ fontWeight: '600' }}>
                            {s.rollNumber}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{s.name}</td>
                        <td>
                          <span
                            className={`chip ${
                              (s.attendancePercentage || 90) >= 75
                                ? 'chip-success'
                                : 'chip-danger'
                            }`}
                          >
                            {s.attendancePercentage || 90}%
                          </span>
                        </td>
                        <td>
                          <span className="chip chip-purple" style={{ fontWeight: '700' }}>
                            {s.grade || 'In Progress'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <select
                              defaultValue={s.grade || 'A'}
                              onChange={(e) =>
                                setGradeInputs({
                                  ...gradeInputs,
                                  [s.enrollmentId]: { grade: e.target.value, gp: 9.0 },
                                })
                              }
                              className="form-select"
                              style={{ width: '75px', padding: '4px 8px', fontSize: '0.78rem' }}
                            >
                              <option value="O">O (10)</option>
                              <option value="A+">A+ (9.5)</option>
                              <option value="A">A (9.0)</option>
                              <option value="B+">B+ (8.0)</option>
                              <option value="B">B (7.0)</option>
                            </select>
                            <button
                              onClick={() => handleGradeSubmit(s.enrollmentId)}
                              className="btn btn-primary btn-sm"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  facultyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#065F46',
  },
  layoutGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  courseCard: {
    padding: '14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  courseCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '8px',
    color: '#047857',
    fontSize: '0.82rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
};
