import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  BookOpen,
  CalendarCheck,
  Award,
  BellRing,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFaculty = user?.role === 'FACULTY' || user?.role === 'ADMIN';
  const studentId = user?.studentId || user?.id || user?.rollNumber;

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const facultyId = user?.rollNumber || user?.facultyId || user?.id || 'FAC001';
        const timetablePromise = isFaculty
          ? api.faculty.getTimetable({ facultyId, facultyName: user?.name, department: user?.department }).catch(() => api.students.getTimetable(facultyId))
          : (studentId ? api.students.getTimetable(studentId) : Promise.resolve({ timetable: [] }));

        const [enrollRes, timetableRes, noticeRes] = await Promise.allSettled([
          studentId ? api.students.getEnrollments(studentId) : Promise.resolve({ enrollments: [] }),
          timetablePromise,
          api.notices.getAll(),
        ]);

        if (enrollRes.status === 'fulfilled' && enrollRes.value) {
          const eList = enrollRes.value.enrollments || (Array.isArray(enrollRes.value) ? enrollRes.value : []);
          setEnrollments(eList);
        }
        if (timetableRes.status === 'fulfilled' && timetableRes.value) {
          const tbList = timetableRes.value.timetable || (Array.isArray(timetableRes.value) ? timetableRes.value : []);
          setTimetable(tbList);
        }
        if (noticeRes.status === 'fulfilled' && noticeRes.value) {
          const ntList = noticeRes.value.notices || (Array.isArray(noticeRes.value) ? noticeRes.value : []);
          if (ntList.length > 0) setNotices(ntList);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [studentId]);

  // Compute live attendance metrics from real database enrollments
  let overallAttendanceStr = 'N/A';
  let totalAttendedCount = 0;
  let totalHeldCount = 0;
  let gradedCount = 0;
  let totalGradePoints = 0;

  if (enrollments.length > 0) {
    enrollments.forEach((e) => {
      totalAttendedCount += (e.classesAttended || 0);
      totalHeldCount += (e.totalClasses || 0);
      if (e.gradePoint && e.gradePoint > 0) {
        gradedCount++;
        totalGradePoints += e.gradePoint;
      }
    });
    if (totalHeldCount > 0) {
      overallAttendanceStr = `${((totalAttendedCount / totalHeldCount) * 100).toFixed(1)}%`;
    } else {
      const avg = enrollments.reduce((acc, e) => acc + (e.attendancePercentage || 0), 0) / enrollments.length;
      overallAttendanceStr = `${avg.toFixed(1)}%`;
    }
  }

  const cgpaStr = gradedCount > 0 ? (totalGradePoints / gradedCount).toFixed(2) : (enrollments.length > 0 ? 'In Progress' : 'N/A');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = new Date().getDay();
  const currentDayShort = dayNames[currentDayIndex];
  const currentDayFull = fullDayNames[currentDayIndex];

  // Filter slots for today
  const todaySessions = timetable.filter((slot) => {
    const d = (slot.dayOfWeek || slot.day || '').trim().toLowerCase();
    return d.startsWith(currentDayShort.toLowerCase());
  });

  // Dynamic collision detection across enrolled courses
  const dynamicClashes = [];
  const slotConflictMap = {};
  timetable.forEach((slot) => {
    const d = (slot.dayOfWeek || slot.day || '').trim();
    const t = (slot.timeSlot || slot.time || '').trim();
    if (!d || !t) return;
    const key = `${d}_${t}`;
    if (slotConflictMap[key]) {
      dynamicClashes.push({
        day: d,
        time: t,
        course1: slotConflictMap[key].courseCode || slotConflictMap[key].courseTitle,
        course2: slot.courseCode || slot.courseTitle,
      });
    } else {
      slotConflictMap[key] = slot;
    }
  });

  return (
    <div className="sis-view-container animate-fade-in" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── 1. Stats Row ─── */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Courses Enrolled</span>
            <BookOpen size={18} color="#10B981" />
          </div>
          <div className="stat-value">{enrollments.length}</div>
          <div className="stat-meta">
            {enrollments.length === 0 ? (
              <span className="chip chip-neutral">0 courses registered</span>
            ) : (
              <span className="chip chip-success">{enrollments.length} active courses</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Overall Attendance</span>
            <CalendarCheck size={18} color="#10B981" />
          </div>
          <div className="stat-value">{overallAttendanceStr}</div>
          <div className="stat-meta">
            {enrollments.length === 0 ? (
              <span style={{ color: '#64748B', fontSize: '0.75rem' }}>No courses enrolled</span>
            ) : (
              <span className="chip chip-success">Above 75% threshold</span>
            )}
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => onNavigate && onNavigate('results')}
          style={{ cursor: 'pointer' }}
          title="Click to view full Published Results & Grade Card"
        >
          <div className="stat-card-top">
            <span className="stat-label">Published Results &amp; CGPA</span>
            <Award size={18} color="#8B5CF6" />
          </div>
          <div className="stat-value">{cgpaStr}</div>
          <div className="stat-meta">
            <span className="chip chip-purple">Semester {user?.semester || 7}</span>
            <span style={{ color: '#0284C7', fontSize: '0.75rem', fontWeight: '600' }}>
              View Grade Card &rarr;
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pending Notices</span>
            <BellRing size={18} color="#F59E0B" />
          </div>
          <div className="stat-value">{notices.length || 0}</div>
          <div className="stat-meta">
            <span className="chip chip-warning">Official Notices</span>
          </div>
        </div>
      </div>

      {/* ─── 3D Scroll Animation Spotlight Banner ─── */}
      <div
        className="sis-card animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-squircle)',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
        onClick={() => onNavigate && onNavigate('scroll-demo')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            flexShrink: 0,
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              3D Container Scroll Animation Showcase
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Interactive 3D perspective scroll effect powered by Framer Motion &amp; Aceternity UI.
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Launch Showcase</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── 2. Main Two-Column Row (Timetable + Attendance & Notices) ─── */}
      <div className="dashboard-main-grid">
        {/* Left Column: Today's Timetable + Course Attendance */}
        <div style={styles.columnLeft}>
          {/* Today's Timetable Card */}
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Today's Timetable</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {todaySessions.length > 0
                    ? `${todaySessions.length} Active Sessions (${currentDayFull})`
                    : timetable.length > 0
                    ? `0 Sessions Today &bull; ${timetable.length} Weekly Sessions Enrolled`
                    : '0 Active Sessions'}
                </span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('timetable')}
                className="btn btn-secondary btn-sm"
              >
                <span>View full timetable</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="sis-card-body" style={{ padding: '16px 20px' }}>
              <div style={styles.timetableList}>
                {todaySessions.length > 0 ? (
                  todaySessions.map((item, idx) => (
                    <div key={idx} style={styles.timetableItem}>
                      <div style={styles.timeBadge}>
                        <Clock size={13} color="#10B981" />
                        <span>{item.timeSlot || item.time || '09:00 - 10:30'}</span>
                      </div>
                      <div style={styles.sessionDetails}>
                        <div style={styles.courseHeader}>
                          <span style={styles.courseTitle}>{item.courseTitle || item.courseCode}</span>
                          <span className="chip chip-info">{item.courseCode}</span>
                        </div>
                        <div style={styles.courseSub}>
                          <span style={styles.iconText}>
                            <MapPin size={12} color="#64748B" />
                            {item.room || 'Room TBA'}
                          </span>
                          <span style={styles.iconText}>
                            <User size={12} color="#64748B" />
                            {item.instructor || 'Faculty Mentor'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : timetable.length > 0 ? (
                  <div>
                    <div style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '14px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.84rem' }}>
                        No Classes Scheduled on {currentDayFull}
                      </span>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                        Upcoming sessions from your confirmed weekly schedule:
                      </div>
                    </div>
                    {timetable.slice(0, 3).map((item, idx) => (
                      <div key={idx} style={{ ...styles.timetableItem, marginBottom: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                          <span className="chip chip-purple" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {item.dayOfWeek || item.day || 'Mon'}
                          </span>
                          <div style={{ ...styles.timeBadge, padding: '2px 6px' }}>
                            <Clock size={11} color="#10B981" />
                            <span style={{ fontSize: '0.72rem' }}>{item.timeSlot || item.time || '09:00 - 10:30'}</span>
                          </div>
                        </div>
                        <div style={styles.sessionDetails}>
                          <div style={styles.courseHeader}>
                            <span style={styles.courseTitle}>{item.courseTitle || item.courseCode}</span>
                            <span className="chip chip-info">{item.courseCode}</span>
                          </div>
                          <div style={styles.courseSub}>
                            <span style={styles.iconText}>
                              <MapPin size={12} color="#64748B" />
                              {item.room || 'Room TBA'}
                            </span>
                            <span style={styles.iconText}>
                              <User size={12} color="#64748B" />
                              {item.instructor || 'Faculty Mentor'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                    <Clock size={28} style={{ opacity: 0.35, marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      No Classes Scheduled Today
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                      You are not enrolled in any courses yet. Select courses to build your timetable.
                    </div>
                    <button
                      onClick={() => onNavigate && onNavigate('registration')}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '12px' }}
                    >
                      Select Courses to Enroll
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attendance by Course Card */}
          <div className="sis-card" style={{ marginTop: '24px' }}>
            <div className="sis-card-header">
              <div>
                <h3>Attendance by Course</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {enrollments.length} enrolled course{enrollments.length === 1 ? '' : 's'} tracked
                </span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('attendance')}
                className="btn btn-secondary btn-sm"
              >
                <span>Full report</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {enrollments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '26px 16px', color: '#64748B' }}>
                  <CalendarCheck size={28} style={{ opacity: 0.35, marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    0 Courses Enrolled
                  </div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    No enrolled courses found for your profile. Please select courses from the catalog.
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('registration')}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    Browse &amp; Enroll Courses
                  </button>
                </div>
              ) : (
                enrollments.map((item, idx) => {
                  const pct = item.attendancePercentage || 0;
                  const isShortage = pct < 75;
                  return (
                    <div key={idx} style={styles.attendanceItem}>
                      <div style={styles.attHeader}>
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {item.courseTitle || item.courseCode}
                          </span>
                          <span style={{ color: '#64748B', fontSize: '0.75rem', marginLeft: '8px' }}>
                            ({item.courseCode})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: '700',
                              fontSize: '0.95rem',
                              color: isShortage ? '#DC2626' : '#059669',
                            }}
                          >
                            {pct}%
                          </span>
                          {isShortage ? (
                            <span className="chip chip-danger">Shortage (&lt;75%)</span>
                          ) : (
                            <span className="chip chip-success">Safe</span>
                          )}
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${isShortage ? 'danger' : 'success'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Notifications + Deadlines */}
        <div style={styles.columnRight}>
          {/* Notifications Card with Base62 Short Links */}
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Recent Notifications</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Official circulars &amp; campus updates</span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('notifications')}
                className="btn btn-outline btn-sm"
              >
                View all
              </button>
            </div>
            <div className="sis-card-body" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Dynamic Alert: Timetable Clash Warning — Only shown when real schedule collisions exist */}
              {dynamicClashes.length > 0 && (
                <div style={styles.noticeClashAlert}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.82rem', color: '#92400E' }}>
                        Timetable Clash Alert ({dynamicClashes.length} collision{dynamicClashes.length > 1 ? 's' : ''})
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#B45309', marginTop: '2px' }}>
                        {dynamicClashes.map((c, i) => (
                          <div key={i}>
                            &bull; <strong>{c.course1}</strong> overlaps with <strong>{c.course2}</strong> ({c.day} {c.time}).
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic notices & internships from backend */}
              {notices.slice(0, 3).map((notice, idx) => (
                <div key={idx} style={styles.noticeCard}>
                  <div style={styles.noticeTop}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className="chip chip-info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {notice.category || 'ACADEMIC'}
                      </span>
                      {notice.department && notice.department !== 'ALL' && (
                        <span className="chip chip-purple" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {notice.department}
                        </span>
                      )}
                    </div>
                    {notice.deadline ? (
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>
                        Closes {notice.deadline}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Active</span>
                    )}
                  </div>
                  <div style={styles.noticeTitle}>{notice.title}</div>
                  <div style={styles.noticeBody}>{notice.content}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {notice.sourceUrl && (
                      <a
                        href={notice.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...styles.noticeShortLink, color: '#10B981', fontWeight: '700' }}
                        title="Go directly to original opportunity page"
                      >
                        <span>Apply on Official Site</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {notice.shortUrl && (
                      <a
                        href={`http://localhost:8085/r/${notice.shortUrl.replace('/r/', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...styles.noticeShortLink, color: '#64748B', fontSize: '0.72rem' }}
                      >
                        <span>Short link</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines Card */}
          <div className="sis-card" style={{ marginTop: '24px' }}>
            <div className="sis-card-header">
              <h3>Upcoming Deadlines</h3>
              <span className="chip chip-warning">Due this week</span>
            </div>
            <div className="sis-card-body" style={{ padding: '12px 18px' }}>
              <div style={styles.deadlineItem}>
                <div style={styles.deadlineDateBox}>
                  <div style={styles.deadlineDay}>23</div>
                  <div style={styles.deadlineMonth}>OCT</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.deadlineTitle}>Elective II Course Registration</div>
                  <div style={styles.deadlineSub}>Closes at 6:00 PM • Fast filling seats</div>
                </div>
                <span className="chip chip-warning">Closes soon</span>
              </div>

              <div style={styles.deadlineItem}>
                <div style={styles.deadlineDateBox}>
                  <div style={styles.deadlineDay}>25</div>
                  <div style={styles.deadlineMonth}>OCT</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.deadlineTitle}>Distributed Systems Project Review</div>
                  <div style={styles.deadlineSub}>Submission on GitHub repo with report</div>
                </div>
                <span className="chip chip-neutral">Pending</span>
              </div>

              <div style={styles.deadlineItem}>
                <div style={styles.deadlineDateBox}>
                  <div style={styles.deadlineDay}>03</div>
                  <div style={styles.deadlineMonth}>NOV</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.deadlineTitle}>Internal Assessment 2 (IA-2)</div>
                  <div style={styles.deadlineSub}>Halls & seating slots published</div>
                </div>
                <span className="chip chip-purple">Exam</span>
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
    padding: '24px 32px 48px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.45fr 1fr',
    gap: '24px',
  },
  columnLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  columnRight: {
    display: 'flex',
    flexDirection: 'column',
  },
  timetableList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timetableItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 18px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    borderRadius: '18px',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid #FFFFFF',
    boxShadow: '0 4px 14px rgba(100, 116, 139, 0.06), inset 0 1px 1px #FFFFFF',
    transition: 'all 180ms var(--spring-easing)',
  },
  timeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary-blue)',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    border: '1px solid rgba(2, 132, 199, 0.28)',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
    boxShadow: 'inset 0 1px 1px #FFFFFF',
  },
  sessionDetails: {
    flex: 1,
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  courseTitle: {
    fontWeight: '700',
    fontSize: '14.5px',
    color: 'var(--text-main)',
  },
  courseSub: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  attendanceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  attHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeClashAlert: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '18px',
    padding: '14px 18px',
    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.12)',
  },
  noticeCard: {
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur-subtle)',
    WebkitBackdropFilter: 'var(--glass-blur-subtle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid #FFFFFF',
    borderRadius: '18px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    boxShadow: '0 4px 14px rgba(100, 116, 139, 0.06), inset 0 1px 1px #FFFFFF',
  },
  noticeTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitle: {
    fontWeight: '700',
    fontSize: '14px',
    color: 'var(--text-main)',
  },
  noticeBody: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  noticeShortLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--primary-blue)',
    fontWeight: '700',
    fontSize: '12.5px',
    textDecoration: 'none',
    marginTop: '4px',
  },
  deadlineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 0',
    borderBottom: '1px solid var(--glass-border)',
  },
  deadlineDateBox: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    border: '1px solid rgba(2, 132, 199, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 1.5px #FFFFFF',
  },
  deadlineDay: {
    fontSize: '17px',
    fontWeight: '800',
    color: 'var(--primary-blue)',
    lineHeight: '1',
  },
  deadlineMonth: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--primary-blue)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  deadlineTitle: {
    fontWeight: '700',
    fontSize: '13.5px',
    color: 'var(--text-main)',
  },
  deadlineSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};
