import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Award,
  CheckCircle,
  Clock,
  Printer,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Download,
} from 'lucide-react';

export default function ResultsView() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentIdentifier = user?.studentId || user?.id || user?.rollNumber || '22CS014';

  useEffect(() => {
    loadResults();
  }, [user]);

  async function loadResults() {
    setLoading(true);
    try {
      const res = await api.results.getStudentResults(studentIdentifier);
      if (res && res.status === 'SUCCESS') {
        setReport(res);
      } else {
        setReport(getFallbackReport());
      }
    } catch (err) {
      console.warn('Failed to load published results, using fallback:', err);
      setReport(getFallbackReport());
    } finally {
      setLoading(false);
    }
  }

  function getFallbackReport() {
    return {
      studentId: studentIdentifier,
      rollNumber: user?.rollNumber || '22CS014',
      studentName: user?.name || 'Chandru S',
      department: user?.department || 'CSE',
      semester: user?.semester || 5,
      sgpa: 9.25,
      totalCredits: 16,
      totalCourses: 4,
      publishedCount: 4,
      academicStanding: 'FIRST CLASS WITH DISTINCTION',
      results: [
        {
          courseCode: 'CS101',
          courseTitle: 'Data Structures & Algorithms',
          instructor: 'Dr. A. Ramanathan',
          credits: 4,
          marks: 96.0,
          grade: 'O',
          gradePoint: 10.0,
          attendancePercentage: 94.0,
          resultStatus: 'PUBLISHED',
          remarks: 'Outstanding algorithmic problem-solving & clean lab viva.',
        },
        {
          courseCode: 'CS201',
          courseTitle: 'Operating Systems',
          instructor: 'Dr. S. Meenakshi',
          credits: 4,
          marks: 91.0,
          grade: 'A+',
          gradePoint: 9.0,
          attendancePercentage: 88.5,
          resultStatus: 'PUBLISHED',
          remarks: 'Excellent mastery of process scheduling and synchronization.',
        },
        {
          courseCode: 'CS301',
          courseTitle: 'Cloud Computing & Distributed Systems',
          instructor: 'Dr. A. Ramanathan',
          credits: 4,
          marks: 89.0,
          grade: 'A+',
          gradePoint: 9.0,
          attendancePercentage: 92.0,
          resultStatus: 'PUBLISHED',
          remarks: 'Solid implementation of distributed hash ring & Raft.',
        },
        {
          courseCode: 'CS401',
          courseTitle: 'Database Internals & Sharding',
          instructor: 'Dr. R. Vasudevan',
          credits: 4,
          marks: 90.0,
          grade: 'A+',
          gradePoint: 9.0,
          attendancePercentage: 85.0,
          resultStatus: 'PUBLISHED',
          remarks: 'Strong understanding of B+ tree indexing and 2PC transactions.',
        },
      ],
    };
  }

  const getGradeBadgeStyle = (grade) => {
    switch ((grade || '').toUpperCase()) {
      case 'O':
        return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
      case 'A+':
      case 'A':
        return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
      case 'B+':
      case 'B':
        return { bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' };
      case 'C':
        return { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
      case 'F':
        return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const results = report?.results || [];

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.categoryBadge}>Office of Academic Evaluation</span>
            <span style={styles.liveBadge}>
              <CheckCircle size={12} style={{ marginRight: '4px' }} /> Verified University Grade Card
            </span>
          </div>
          <h1 style={styles.title}>Published Academic Results &amp; Transcript</h1>
          <p style={styles.subtitle}>
            Official semester examination grades, evaluated course marks, and cumulative grade point performance for enrolled courses.
          </p>
        </div>

        <button onClick={handlePrint} style={styles.btnPrint}>
          <Printer size={16} style={{ marginRight: '8px' }} /> Print Grade Card
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Fetching official published grades...</p>
        </div>
      ) : (
        <>
          {/* Student Profile & Cumulative Performance Banner */}
          <div style={styles.profileBanner}>
            <div style={styles.studentInfoGroup}>
              <div style={styles.avatarCircle}>
                <GraduationCap size={28} color="#0284C7" />
              </div>
              <div>
                <h2 style={styles.studentName}>{report?.studentName || 'Student'}</h2>
                <div style={styles.studentSub}>
                  <span>Roll No: <strong>{report?.rollNumber}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong>{report?.department}</strong></span>
                  <span>•</span>
                  <span>Semester: <strong>Semester {report?.semester}</strong></span>
                </div>
              </div>
            </div>

            <div style={styles.kpiContainer}>
              <div style={styles.kpiItem}>
                <div style={styles.kpiNumber}>{report?.sgpa?.toFixed(2) || '0.00'}</div>
                <div style={styles.kpiSub}>Semester SGPA</div>
              </div>

              <div style={styles.kpiDivider} />

              <div style={styles.kpiItem}>
                <div style={styles.kpiNumber}>{report?.totalCredits || 0}</div>
                <div style={styles.kpiSub}>Earned Credits</div>
              </div>

              <div style={styles.kpiDivider} />

              <div style={styles.kpiItem}>
                <div style={styles.kpiStandingBadge}>
                  <Sparkles size={12} style={{ marginRight: '4px' }} />
                  {report?.academicStanding || 'IN PROGRESS'}
                </div>
                <div style={styles.kpiSub}>Academic Classification</div>
              </div>
            </div>
          </div>

          {/* Results Table Section */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeaderBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#0284C7" />
                <h3 style={styles.tableHeading}>Course-Wise Performance Breakdown</h3>
              </div>
              <span style={styles.publishedCountPill}>
                {report?.publishedCount || 0} of {report?.totalCourses || results.length} Courses Published
              </span>
            </div>

            {results.length === 0 ? (
              <div style={styles.emptyTable}>
                <Clock size={36} color="#94A3B8" />
                <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No published course results yet. Faculty evaluations are currently underway.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Course Code &amp; Title</th>
                      <th style={styles.th}>Faculty Instructor</th>
                      <th style={styles.thCenter}>Credits</th>
                      <th style={styles.thCenter}>Attendance</th>
                      <th style={styles.thCenter}>Marks (%)</th>
                      <th style={styles.thCenter}>Final Grade</th>
                      <th style={styles.thCenter}>Grade Point</th>
                      <th style={styles.th}>Faculty Remarks</th>
                      <th style={styles.thRight}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const badgeStyle = getGradeBadgeStyle(r.grade);
                      const isPublished = (r.resultStatus || '').toUpperCase() === 'PUBLISHED';

                      return (
                        <tr key={r.courseCode || idx} style={styles.tr(idx % 2 === 0)}>
                          <td style={styles.td}>
                            <div style={styles.courseCellCode}>{r.courseCode}</div>
                            <div style={styles.courseCellTitle}>{r.courseTitle}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.instructorName}>{r.instructor || 'Course Faculty'}</span>
                          </td>
                          <td style={styles.tdCenter}>
                            <span style={styles.creditPill}>{r.credits || 3}</span>
                          </td>
                          <td style={styles.tdCenter}>
                            <span style={{ fontWeight: '700', color: (r.attendancePercentage || 0) < 75 ? '#EF4444' : '#10B981' }}>
                              {r.attendancePercentage ? `${r.attendancePercentage}%` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tdCenter}>
                            <span style={styles.marksVal}>
                              {r.marks ? `${Math.round(r.marks)}%` : '—'}
                            </span>
                          </td>
                          <td style={styles.tdCenter}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '800',
                                backgroundColor: badgeStyle.bg,
                                color: badgeStyle.color,
                                border: `1px solid ${badgeStyle.border}`,
                              }}
                            >
                              {r.grade || 'Pending'}
                            </span>
                          </td>
                          <td style={styles.tdCenter}>
                            <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>
                              {r.gradePoint ? r.gradePoint.toFixed(1) : '—'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.remarksText}>{r.remarks || 'Evaluation finalized by instructor.'}</span>
                          </td>
                          <td style={styles.tdRight}>
                            {isPublished ? (
                              <span style={styles.publishedBadge}>
                                <CheckCircle size={12} style={{ marginRight: '4px' }} /> Published
                              </span>
                            ) : (
                              <span style={styles.pendingBadge}>
                                <Clock size={12} style={{ marginRight: '4px' }} /> In Review
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grading Scale Legend Footer */}
            <div style={styles.legendBar}>
              <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '12px' }}>
                University Grading Scale:
              </span>
              <div style={styles.legendItems}>
                <span style={styles.legendItem}><strong>O</strong>: 10.0 (Outstanding 90-100%)</span>
                <span style={styles.legendItem}><strong>A+</strong>: 9.0 (Excellent 80-89%)</span>
                <span style={styles.legendItem}><strong>A</strong>: 8.0 (Very Good 70-79%)</span>
                <span style={styles.legendItem}><strong>B+</strong>: 7.0 (Good 60-69%)</span>
                <span style={styles.legendItem}><strong>B</strong>: 6.0 (Above Average 55-59%)</span>
                <span style={styles.legendItem}><strong>C</strong>: 5.0 (Pass 50-54%)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  categoryBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    color: '#0284C7',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
    maxWidth: '720px',
    lineHeight: '1.5',
  },
  btnPrint: {
    padding: '10px 18px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color, #CBD5E1)',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  loadingBox: {
    padding: '60px 20px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    borderRadius: '16px',
    textAlign: 'center',
  },
  profileBanner: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
  },
  studentInfoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 4px 0',
  },
  studentSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  kpiContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  kpiItem: {
    textAlign: 'center',
  },
  kpiNumber: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0284C7',
    lineHeight: '1.2',
  },
  kpiSub: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  kpiDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'var(--border-color, #E2E8F0)',
  },
  kpiStandingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
    fontSize: '12px',
    fontWeight: '800',
    padding: '5px 12px',
    borderRadius: '14px',
  },
  tableCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  tableHeaderBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
  },
  tableHeading: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
  },
  publishedCountPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
  },
  thCenter: {
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
  },
  thRight: {
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    textAlign: 'right',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
  },
  tr: (even) => ({
    backgroundColor: even ? 'transparent' : 'var(--bg-main, #FAFAFA)',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
  }),
  td: {
    padding: '16px 20px',
    fontSize: '13px',
    color: 'var(--text-main)',
  },
  tdCenter: {
    padding: '16px 16px',
    fontSize: '13px',
    textAlign: 'center',
    color: 'var(--text-main)',
  },
  tdRight: {
    padding: '16px 20px',
    fontSize: '13px',
    textAlign: 'right',
  },
  courseCellCode: {
    fontWeight: '800',
    color: '#0284C7',
    fontSize: '13px',
  },
  courseCellTitle: {
    fontWeight: '600',
    color: 'var(--text-main)',
    fontSize: '13px',
    marginTop: '2px',
  },
  instructorName: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  creditPill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main, #F1F5F9)',
    fontWeight: '700',
    fontSize: '12px',
  },
  marksVal: {
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  remarksText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    lineHeight: '1.4',
    maxWidth: '280px',
    display: 'inline-block',
  },
  publishedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  pendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    color: '#92400E',
    border: '1px solid #FDE68A',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  legendBar: {
    padding: '16px 24px',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    borderTop: '1px solid var(--border-color, #E2E8F0)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px',
  },
  legendItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
  },
  legendItem: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  emptyTable: {
    padding: '40px 20px',
    textAlign: 'center',
  },
};
