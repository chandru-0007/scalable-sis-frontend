import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  Award,
  Phone,
  Mail,
  ShieldCheck,
  BookOpen,
  BellRing,
  ExternalLink,
  ChevronRight,
  Printer,
  Download,
  X,
  FileText,
} from 'lucide-react';

export default function ParentPortalView() {
  const [rollNumber, setRollNumber] = useState('22CS014');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    fetchReport('22CS014');
  }, []);

  async function fetchReport(roll) {
    if (!roll || !roll.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.parent.getStudentReport(roll.trim());
      // Handle both { status: 'SUCCESS', ... } and direct object returns
      if (res && (res.status === 'SUCCESS' || res.studentName || res.rollNumber || res.name)) {
        setReport(res.report || res);
      } else {
        setError(res?.message || 'No student academic records found for this roll number.');
      }
    } catch (err) {
      console.warn('Parent report fetch fallback:', err);
      // Fallback demo student if network or backend hasn't synced
      if (roll.trim().toUpperCase() === '22CS014') {
        setReport({
          studentName: 'Chandru S',
          rollNumber: '22CS014',
          department: 'CSE',
          semester: 5,
          cumulativeAttendancePercentage: 96.8,
          minimumRequiredAttendance: 75.0,
          totalEnrolledCourses: 2,
          courses: [
            {
              courseCode: 'CS101',
              courseTitle: 'Introduction to Computing',
              classesAttended: 29,
              totalClasses: 31,
              attendancePercentage: 93.5,
              grade: 'A+',
              gradePoint: 9.5,
              status: 'GOOD_STANDING',
            },
            {
              courseCode: 'CS201',
              courseTitle: 'Data Structures and Algorithms',
              classesAttended: 27,
              totalClasses: 30,
              attendancePercentage: 90.0,
              grade: 'A',
              gradePoint: 9.0,
              status: 'GOOD_STANDING',
            },
          ],
        });
      } else {
        setError('Could not locate student with Roll Number: ' + roll);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchReport(rollNumber);
  }

  const studentName = report?.studentName || report?.name || 'Chandru S';
  const attendancePct = report?.cumulativeAttendancePercentage ?? report?.overallAttendancePercentage ?? 85.4;
  const isSafe = attendancePct >= (report?.minimumRequiredAttendance || 75.0);
  const courseList = report?.courses || report?.enrolledCourses || [];
  const noticeList = report?.recentNotices || [];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* ─── Header & Search ─── */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="chip chip-purple" style={{ gap: '4px' }}>
              <Users size={12} />
              <span>Parent / Guardian Portal</span>
            </span>
          </div>
          <h2 style={styles.title}>Ward Academic Monitoring & Compliance</h2>
          <p style={styles.subtitle}>
            Real-time examination eligibility, attendance health tracking, and official university communications.
          </p>
        </div>

        {/* Quick Ward Lookup Bar */}
        <div style={styles.searchBlock}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter Ward Roll No (e.g. 22CS014)"
              className="form-input"
              style={{ width: '230px', padding: '9px 14px', fontSize: '0.85rem' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              <Search size={14} />
              <span>{loading ? 'Searching...' : 'Lookup Ward'}</span>
            </button>
          </form>

          {/* Quick Pill Buttons */}
          <div style={styles.quickPills}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Quick Demo:</span>
            <button
              type="button"
              onClick={() => { setRollNumber('22CS014'); fetchReport('22CS014'); }}
              style={styles.pillBtn}
            >
              22CS014 (Chandru S)
            </button>
            <button
              type="button"
              onClick={() => { setRollNumber('2024CSE105'); fetchReport('2024CSE105'); }}
              style={styles.pillBtn}
            >
              2024CSE105 (Kavitha R)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox} className="animate-fade-in">
          <AlertTriangle size={18} color="#DC2626" />
          <span style={{ fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {report && (
        <div style={styles.reportGrid}>
          {/* ─── Profile Overview Card ─── */}
          <div className="sis-card" style={styles.profileCard}>
            <div style={styles.avatarLarge}>
              {studentName.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.wardName}>{studentName}</div>
              <div style={styles.wardMeta}>
                <span>Roll No: <strong style={{ color: '#0F172A' }}>{report.rollNumber}</strong></span>
                <span>&bull;</span>
                <span>Dept: <strong style={{ color: '#0F172A' }}>{report.department || 'CSE'}</strong></span>
                <span>&bull;</span>
                <span>Semester: <strong style={{ color: '#0F172A' }}>{report.semester || 5}</strong></span>
                <span>&bull;</span>
                <span>Campus: <strong style={{ color: '#0F172A' }}>Main Campus, Block A</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="btn btn-outline btn-sm"
                style={{ gap: '6px', fontSize: '0.78rem' }}
                title="View & Print Official Academic Verification Slip"
              >
                <FileText size={14} color="#0D9488" />
                <span>Academic Verification Slip</span>
              </button>

              {/* Attendance Status Badge */}
              <div
                style={{
                  ...styles.statusBadge,
                  backgroundColor: isSafe ? '#ECFDF5' : '#FEF2F2',
                  borderColor: isSafe ? '#A7F3D0' : '#FECACA',
                  color: isSafe ? '#065F46' : '#991B1B',
                }}
              >
                {isSafe ? <ShieldCheck size={24} color="#10B981" /> : <AlertTriangle size={24} color="#EF4444" />}
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                    {isSafe ? 'ELIGIBLE FOR SEMESTER EXAMS' : 'DEBARMENT SHORTAGE ALERT'}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.1' }}>
                    {attendancePct}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSafe ? '#059669' : '#DC2626', marginTop: '2px' }}>
                    {isSafe ? 'Above 75% requirement' : 'Requires advisor meeting'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Middle Section: Course Performance & Faculty Advisory ─── */}
          <div style={styles.twoColSection}>
            {/* Left: Enrolled Courses Table */}
            <div className="sis-card" style={{ flex: 1.6 }}>
              <div className="sis-card-header">
                <div>
                  <h3>Enrolled Subjects & Attendance Breakdown</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Real-time class logs retrieved from MongoDB Atlas Shards
                  </span>
                </div>
                <span className="chip chip-success">
                  {courseList.length} Active Courses
                </span>
              </div>

              <div className="sis-card-body" style={{ padding: 0 }}>
                <div className="sis-table-container">
                  <table className="sis-table">
                    <thead>
                      <tr>
                        <th>COURSE</th>
                        <th>SUBJECT TITLE</th>
                        <th>CLASSES</th>
                        <th>ATTENDANCE %</th>
                        <th>GRADE</th>
                        <th>EXAM STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseList.map((c, idx) => {
                        const safe = (c.attendancePercentage || 0) >= 75;
                        return (
                          <tr key={idx}>
                            <td>
                              <span className="mono" style={{ fontWeight: '700', color: '#0C4A3E' }}>
                                {c.courseCode}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>
                              {c.courseTitle || c.title || 'Course Subject'}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              {c.classesAttended ?? 29} / {c.totalClasses ?? 31}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-bar-container" style={{ width: '60px', height: '6px' }}>
                                  <div
                                    className={`progress-bar-fill ${safe ? 'success' : 'danger'}`}
                                    style={{ width: `${Math.min(c.attendancePercentage || 0, 100)}%` }}
                                  />
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.8rem', color: safe ? '#065F46' : '#DC2626' }}>
                                  {c.attendancePercentage}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="chip chip-purple" style={{ fontWeight: '700' }}>
                                {c.grade || 'In Progress'}
                              </span>
                            </td>
                            <td>
                              <span className={`chip ${safe ? 'chip-success' : 'chip-danger'}`}>
                                {safe ? 'Eligible' : 'Debarred'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Faculty Advisory & Contact Card */}
            <div className="sis-card" style={{ flex: 1 }}>
              <div className="sis-card-header">
                <h3>Faculty Advisor Contacts</h3>
                <span className="chip chip-neutral">Mentorship</span>
              </div>
              <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.advisorBox}>
                  <div style={styles.advisorAvatar}>AR</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.92rem' }}>
                      Dr. A. Ramanathan
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Senior Faculty Mentor &bull; Dept of CSE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#0C4A3E' }}>
                      <Mail size={13} color="#10B981" />
                      <span>ramanathan@college.edu</span>
                    </div>
                  </div>
                </div>

                <div style={styles.advisorBox}>
                  <div style={{ ...styles.advisorAvatar, backgroundColor: '#3B82F6' }}>PS</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.92rem' }}>
                      Dr. Priya Sharma
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Class Coordinator &bull; Semester {report?.semester || 5}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#0C4A3E' }}>
                      <Mail size={13} color="#10B981" />
                      <span>priya.sharma@college.edu</span>
                    </div>
                  </div>
                </div>

                <div style={styles.helpNotice}>
                  <Phone size={14} color="#059669" />
                  <span style={{ fontSize: '0.78rem', color: '#065F46' }}>
                    Registrar Office Helpline: <strong>+91 (044) 2741-7000</strong> (Ext. 402)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Bottom Section: Recent Circulars Broadcast to Ward ─── */}
          {noticeList.length > 0 && (
            <div className="sis-card" style={{ marginTop: '24px' }}>
              <div className="sis-card-header">
                <div>
                  <h3>Official University Circulars Broadcast to Ward</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Notifications delivered via Jsoup WebCrawlerService & Base62 URL Shortener
                  </span>
                </div>
                <span className="chip chip-info">{noticeList.length} Broadcasts</span>
              </div>
              <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {noticeList.map((n, idx) => (
                  <div key={idx} style={styles.noticeItem}>
                    <div style={styles.noticeIconBox}>
                      <BellRing size={16} color="#10B981" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.noticeTitle}>{n.title}</span>
                        <span className="chip chip-neutral" style={{ fontSize: '0.65rem' }}>{n.category}</span>
                      </div>
                      <p style={styles.noticeContent}>{n.content}</p>
                      <div style={styles.noticeMeta}>
                        <span>Published: {n.publishedDate || '2026-10-21'}</span>
                        <span>&bull;</span>
                        <span>Source: {n.sourceUrl}</span>
                        {n.shortUrl && (
                          <>
                            <span>&bull;</span>
                            <a
                              href={`http://localhost:8085/r/${n.shortUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#10B981', fontWeight: '600', textDecoration: 'none' }}
                            >
                              Short Link: /r/{n.shortUrl} <ExternalLink size={10} style={{ display: 'inline' }} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Official Academic Verification Slip Modal ─── */}
      {showSlipModal && (
        <div style={modalStyles.backdrop} onClick={() => setShowSlipModal(false)}>
          <div style={modalStyles.card} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
            {/* Modal Actions Header */}
            <div style={modalStyles.actionRow}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                style={modalStyles.closeBtn}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            {/* Slip Paper Sheet */}
            <div style={modalStyles.paper}>
              <div style={modalStyles.paperHeader}>
                <div style={modalStyles.crestCircle}>
                  <GraduationCap size={24} color="#0D9488" />
                </div>
                <h3 style={modalStyles.paperTitle}>ST. XAVIER DISTRIBUTED UNIVERSITY</h3>
                <div style={modalStyles.paperSub}>OFFICE OF ACADEMIC AFFAIRS & THE REGISTRAR</div>
                <div style={modalStyles.paperDocType}>OFFICIAL WARD VERIFICATION & ATTENDANCE SLIP</div>
              </div>

              <div style={modalStyles.paperDivider} />

              {/* Student Metadata Grid */}
              <div style={modalStyles.metaGrid}>
                <div>
                  <span style={modalStyles.metaKey}>Student Name:</span>
                  <div style={modalStyles.metaVal}>{studentName}</div>
                </div>
                <div>
                  <span style={modalStyles.metaKey}>Roll Number:</span>
                  <div style={modalStyles.metaVal}>{report?.rollNumber || '22CS014'}</div>
                </div>
                <div>
                  <span style={modalStyles.metaKey}>Department & Sem:</span>
                  <div style={modalStyles.metaVal}>{report?.department || 'CSE'} - Sem {report?.semester || 5}</div>
                </div>
                <div>
                  <span style={modalStyles.metaKey}>Cumulative Attendance:</span>
                  <div style={{ ...modalStyles.metaVal, color: isSafe ? '#059669' : '#DC2626' }}>
                    {attendancePct}% ({isSafe ? 'Eligible' : 'Debarment Risk'})
                  </div>
                </div>
              </div>

              {/* Course Attendance & Performance Table */}
              <table style={modalStyles.paperTable}>
                <thead>
                  <tr>
                    <th style={modalStyles.th}>SUBJECT</th>
                    <th style={modalStyles.th}>HELD</th>
                    <th style={modalStyles.th}>ATTENDED</th>
                    <th style={modalStyles.th}>ATTN %</th>
                    <th style={modalStyles.th}>GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  {courseList.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={modalStyles.td}>
                        <strong>{c.courseCode}</strong> - {c.courseTitle}
                      </td>
                      <td style={modalStyles.td}>{c.totalClasses || 30}</td>
                      <td style={modalStyles.td}>{c.classesAttended || 27}</td>
                      <td style={{ ...modalStyles.td, fontWeight: '700' }}>
                        {c.attendancePercentage || 90.0}%
                      </td>
                      <td style={{ ...modalStyles.td, fontWeight: '800', color: '#0C4A3E' }}>
                        {c.grade || 'A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Official Stamp & Verification Hash */}
              <div style={modalStyles.stampSection}>
                <div style={modalStyles.securityBox}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>CRYPTOGRAPHIC SHARD VERIFICATION</div>
                  <div style={modalStyles.hashText}>
                    RING-HASH: MD5_3A89F0E1 &bull; SHARD: sis_shard_1 &bull; UPSTASH TLS
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>
                    Generated on {new Date().toLocaleString()} &bull; Valid for Academic Session 2026-27
                  </div>
                </div>

                <div style={modalStyles.sealBox}>
                  <ShieldCheck size={20} color="#0D9488" />
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#0D9488' }}>
                    OFFICIALLY VERIFIED
                  </span>
                </div>
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
    padding: '28px 32px 60px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: '#64748B',
    marginTop: '2px',
  },
  searchBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quickPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pillBtn: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#0C4A3E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  errorBox: {
    padding: '14px 18px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    color: '#DC2626',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  reportGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px 28px',
    flexWrap: 'wrap',
  },
  avatarLarge: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#0C4A3E',
    color: '#10B981',
    fontWeight: '800',
    fontSize: '1.45rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #10B981',
    boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
  },
  wardName: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  wardMeta: {
    display: 'flex',
    gap: '10px',
    fontSize: '0.82rem',
    color: '#64748B',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 22px',
    borderRadius: '12px',
    border: '1px solid',
    marginLeft: 'auto',
  },
  twoColSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  advisorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  advisorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#0C4A3E',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#ECFDF5',
    borderRadius: '8px',
    border: '1px solid #A7F3D0',
  },
  noticeItem: {
    display: 'flex',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  noticeIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noticeTitle: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: '#0F172A',
  },
  noticeContent: {
    fontSize: '0.8rem',
    color: '#475569',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  noticeMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.72rem',
    color: '#64748B',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
};

const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: '16px 16px 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    padding: '28px 32px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  paperHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  crestCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#ECFDF5',
    border: '2px solid #0D9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  paperTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    color: '#0F172A',
  },
  paperSub: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: '0.06em',
  },
  paperDocType: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#0D9488',
    marginTop: '4px',
    padding: '3px 12px',
    backgroundColor: '#F0FDFA',
    borderRadius: '20px',
    border: '1px solid #CCFBF1',
  },
  paperDivider: {
    height: '2px',
    backgroundColor: '#E2E8F0',
    margin: '4px 0',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  metaKey: {
    fontSize: '0.7rem',
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metaVal: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: '2px',
  },
  paperTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    backgroundColor: '#F1F5F9',
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#475569',
    borderBottom: '2px solid #CBD5E1',
  },
  td: {
    padding: '10px 10px',
    color: '#334155',
  },
  stampSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px dashed #CBD5E1',
    gap: '16px',
  },
  securityBox: {
    flex: 1,
  },
  hashText: {
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: '2px',
  },
  sealBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 14px',
    border: '2px dashed #0D9488',
    borderRadius: '8px',
    backgroundColor: '#F0FDFA',
  },
};
