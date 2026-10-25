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

        if (courseRes.status === 'fulfilled' && courseRes.value.courses) {
          setCourses(courseRes.value.courses);
        }
        if (timetableRes.status === 'fulfilled' && Array.isArray(timetableRes.value)) {
          setTimetable(timetableRes.value);
        }
        if (noticeRes.status === 'fulfilled' && Array.isArray(noticeRes.value)) {
          setNotices(noticeRes.value);
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
    padding: '28px 32px 60px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '28px',
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
    padding: '12px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  timeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#0C4A3E',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '6px 10px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
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
    fontWeight: '600',
    fontSize: '0.88rem',
    color: '#0F172A',
  },
  courseSub: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.75rem',
    color: '#64748B',
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
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  noticeCard: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  noticeTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitle: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#0F172A',
  },
  noticeBody: {
    fontSize: '0.78rem',
    color: '#475569',
    lineHeight: '1.4',
  },
  noticeShortLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#10B981',
    fontWeight: '600',
    fontSize: '0.75rem',
    textDecoration: 'none',
    marginTop: '4px',
  },
  deadlineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  deadlineDateBox: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deadlineDay: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: '1',
  },
  deadlineMonth: {
    fontSize: '0.62rem',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  deadlineTitle: {
    fontWeight: '600',
    fontSize: '0.84rem',
    color: '#0F172A',
  },
  deadlineSub: {
    fontSize: '0.73rem',
    color: '#64748B',
  },
};
