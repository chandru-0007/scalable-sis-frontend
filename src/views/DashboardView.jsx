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
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const studentId = user?.studentId || '371292355980038144';
        const [courseRes, timetableRes, noticeRes] = await Promise.allSettled([
          api.courses.getAll({ status: 'ACTIVE' }),
          api.students.getTimetable(studentId),
          api.notices.getAll(),
        ]);

        if (courseRes.status === 'fulfilled' && courseRes.value) {
          const cList = courseRes.value.courses || (Array.isArray(courseRes.value) ? courseRes.value : []);
          if (cList.length > 0) setCourses(cList);
        }
        if (timetableRes.status === 'fulfilled' && timetableRes.value) {
          const tbList = timetableRes.value.timetable || (Array.isArray(timetableRes.value) ? timetableRes.value : []);
          if (tbList.length > 0) setTimetable(tbList);
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
  }, [user]);

  // Sample attendance cards matching Figma
  const attendanceData = [
    { code: 'CS3501', title: 'Distributed Systems', pct: 92, status: 'safe' },
    { code: 'CS3402', title: 'Database Systems', pct: 81, status: 'safe' },
    { code: 'CS3511', title: 'Operating Systems', pct: 90, status: 'safe' },
    { code: 'EC3405', title: 'Computer Networks', pct: 74, status: 'shortage' },
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* ─── 1. Stats Row ─── */}
      <div style={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Courses Enrolled</span>
            <BookOpen size={18} color="#10B981" />
          </div>
          <div className="stat-value">{courses.length || 6}</div>
          <div className="stat-meta">
            <span className="chip chip-success">2 electives open</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Overall Attendance</span>
            <CalendarCheck size={18} color="#10B981" />
          </div>
          <div className="stat-value">85.4%</div>
          <div className="stat-meta">
            <span className="chip chip-success">+2.1% this month</span>
            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Above 75% threshold</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Current CGPA</span>
            <Award size={18} color="#8B5CF6" />
          </div>
          <div className="stat-value">8.42</div>
          <div className="stat-meta">
            <span className="chip chip-purple">Top 15% of batch</span>
            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Semester {user?.semester || 5}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pending Notices</span>
            <BellRing size={18} color="#F59E0B" />
          </div>
          <div className="stat-value">{notices.length || 4}</div>
          <div className="stat-meta">
            <span className="chip chip-warning">1 needs action</span>
            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Web Crawler Feed</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Main Two-Column Row (Timetable + Attendance & Notices) ─── */}
      <div style={styles.mainGrid}>
        {/* Left Column: Today's Timetable + Course Attendance */}
        <div style={styles.columnLeft}>
          {/* Today's Timetable Card */}
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Today's Timetable</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Wednesday • 4 Sessions</span>
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
                {timetable.length > 0 ? (
                  timetable.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={styles.timetableItem}>
                      <div style={styles.timeBadge}>
                        <Clock size={13} color="#10B981" />
                        <span>{item.time || '09:00 - 10:00'}</span>
                      </div>
                      <div style={styles.sessionDetails}>
                        <div style={styles.courseHeader}>
                          <span style={styles.courseTitle}>{item.courseTitle || item.courseCode}</span>
                          <span className="chip chip-info">{item.courseCode}</span>
                        </div>
                        <div style={styles.courseSub}>
                          <span style={styles.iconText}>
                            <MapPin size={12} color="#64748B" />
                            {item.room || 'LH-204'}
                          </span>
                          <span style={styles.iconText}>
                            <User size={12} color="#64748B" />
                            {item.instructor || 'Dr. Meera R.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={styles.timetableItem}>
                      <div style={styles.timeBadge}>
                        <Clock size={13} color="#10B981" />
                        <span>09:00 - 09:50</span>
                      </div>
                      <div style={styles.sessionDetails}>
                        <div style={styles.courseHeader}>
                          <span style={styles.courseTitle}>Distributed Systems (CS3501)</span>
                          <span className="chip chip-neutral">Lecture</span>
                        </div>
                        <div style={styles.courseSub}>
                          <span style={styles.iconText}><MapPin size={12} /> Tech Hall 405</span>
                          <span style={styles.iconText}><User size={12} /> Dr. Priya Sharma</span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.timetableItem}>
                      <div style={styles.timeBadge}>
                        <Clock size={13} color="#10B981" />
                        <span>10:00 - 11:40</span>
                      </div>
                      <div style={styles.sessionDetails}>
                        <div style={styles.courseHeader}>
                          <span style={styles.courseTitle}>Database Systems Lab (CS201)</span>
                          <span className="chip chip-purple">Lab</span>
                        </div>
                        <div style={styles.courseSub}>
                          <span style={styles.iconText}><MapPin size={12} /> Lab Block 304</span>
                          <span style={styles.iconText}><User size={12} /> Dr. A. Ramanathan</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Attendance by Course Card */}
          <div className="sis-card" style={{ marginTop: '24px' }}>
            <div className="sis-card-header">
              <div>
                <h3>Attendance by Course</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time 75% minimum threshold monitor</span>
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
              {attendanceData.map((item, idx) => {
                const isShortage = item.pct < 75;
                return (
                  <div key={idx} style={styles.attendanceItem}>
                    <div style={styles.attHeader}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.88rem' }}>
                          {item.title}
                        </span>
                        <span style={{ color: '#64748B', fontSize: '0.75rem', marginLeft: '8px' }}>
                          ({item.code})
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
                          {item.pct}%
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
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
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
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Official circulars & Web Crawler alerts</span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('notifications')}
                className="btn btn-outline btn-sm"
              >
                View all
              </button>
            </div>
            <div className="sis-card-body" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Alert: Timetable Clash Warning from Figma */}
              <div style={styles.noticeClashAlert}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.82rem', color: '#92400E' }}>
                      Timetable Clash Alert
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#B45309', marginTop: '2px' }}>
                      DIP (Tue 11:15) overlaps with Database Systems lab session. Rescheduling recommended.
                    </div>
                  </div>
                </div>
              </div>

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
