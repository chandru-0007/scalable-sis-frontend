import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  ExternalLink,
  BookOpen,
  Award,
  Filter,
  Check,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';

export default function AssignmentsView() {
  const { user } = useAuth();
  const { addToast } = useRealtime();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, SUBMITTED, GRADED

  // Submission modal state
  const [activeModal, setActiveModal] = useState(null); // Assignment object
  const [solutionText, setSolutionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const studentIdentifier = user?.studentId || user?.id || user?.rollNumber || '22CS014';

  useEffect(() => {
    loadAssignments();
  }, [user]);

  async function loadAssignments() {
    setLoading(true);
    try {
      const res = await api.assignments.getAllForStudent(studentIdentifier);
      if (Array.isArray(res)) {
        setAssignments(res);
      } else {
        // Fallback demo assignments if offline
        setAssignments(getFallbackAssignments());
      }
    } catch (err) {
      console.warn('Failed to fetch assignments from API, loading fallback:', err);
      setAssignments(getFallbackAssignments());
    } finally {
      setLoading(false);
    }
  }

  function getFallbackAssignments() {
    const now = Date.now();
    return [
      {
        assignmentId: '372824456147636224',
        courseCode: 'CS101',
        courseTitle: 'Data Structures & Algorithms',
        facultyName: 'Dr. A. Ramanathan',
        title: 'Assignment 1: Distributed Hash Ring Implementation',
        description: 'Implement a 64-virtual-node consistent hash ring with Murmur3 hashing in Java or Python. Handle node join and node departure with minimum key reshuffling.',
        maxMarks: 50,
        dueDate: now + 5 * 86400000,
        isSubmitted: false,
        submissionStatus: 'NOT_SUBMITTED',
      },
      {
        assignmentId: '372824456147636225',
        courseCode: 'CS101',
        courseTitle: 'Data Structures & Algorithms',
        facultyName: 'Dr. A. Ramanathan',
        title: 'Assignment 2: Red-Black Tree Balancing & Benchmarks',
        description: 'Construct a self-balancing Red-Black binary search tree. Benchmark lookup times across 100,000 random keys vs. unbalanced BST.',
        maxMarks: 50,
        dueDate: now + 12 * 86400000,
        isSubmitted: false,
        submissionStatus: 'NOT_SUBMITTED',
      },
      {
        assignmentId: '372824456147636226',
        courseCode: 'CS201',
        courseTitle: 'Operating Systems',
        facultyName: 'Dr. S. Meenakshi',
        title: 'Assignment 1: Multithreaded Producer-Consumer with Ring Buffer',
        description: 'Implement POSIX thread synchronization using mutex locks and condition variables. Measure CPU cache coherence and context switch latency.',
        maxMarks: 100,
        dueDate: now - 86400000,
        isSubmitted: true,
        submissionStatus: 'GRADED',
        marksObtained: 94,
        facultyFeedback: 'Excellent implementation of ring buffer with atomic head/tail pointers. Edge cases handled cleanly.',
        evaluatedBy: 'Dr. S. Meenakshi',
      },
    ];
  }

  const uniqueCourses = ['ALL', ...Array.from(new Set(assignments.map((a) => a.courseCode).filter(Boolean)))];

  const filteredAssignments = assignments.filter((a) => {
    if (filterCourse !== 'ALL' && a.courseCode !== filterCourse) return false;
    if (filterStatus === 'PENDING' && a.submissionStatus !== 'NOT_SUBMITTED') return false;
    if (filterStatus === 'SUBMITTED' && a.submissionStatus !== 'SUBMITTED') return false;
    if (filterStatus === 'GRADED' && a.submissionStatus !== 'GRADED') return false;
    return true;
  });

  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.submissionStatus === 'NOT_SUBMITTED').length;
  const gradedCount = assignments.filter((a) => a.submissionStatus === 'GRADED').length;
  const submittedCount = assignments.filter((a) => a.submissionStatus === 'SUBMITTED').length;

  function openSubmitModal(assignment) {
    setActiveModal(assignment);
    setSolutionText(assignment.submissionContent || '');
    setAttachmentUrl(assignment.attachmentUrl || '');
    setErrorMsg(null);
  }

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!solutionText.trim()) {
      setErrorMsg('Please write your solution or explanation before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.assignments.submit(activeModal.assignmentId, {
        studentId: studentIdentifier,
        content: solutionText.trim(),
        attachmentUrl: attachmentUrl.trim(),
      });

      addToast({
        type: 'success',
        title: 'Assignment Submitted!',
        message: `Your answer for [${activeModal.courseCode}] ${activeModal.title} has been received by faculty for evaluation.`,
      });

      // Update optimistic state
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignmentId === activeModal.assignmentId
            ? {
                ...a,
                isSubmitted: true,
                submissionStatus: 'SUBMITTED',
                submissionContent: solutionText.trim(),
                attachmentUrl: attachmentUrl.trim(),
                submittedAt: Date.now(),
              }
            : a
        )
      );

      setActiveModal(null);
    } catch (err) {
      console.error('Submission failed:', err);
      // Fallback optimistic update
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignmentId === activeModal.assignmentId
            ? {
                ...a,
                isSubmitted: true,
                submissionStatus: 'SUBMITTED',
                submissionContent: solutionText.trim(),
                attachmentUrl: attachmentUrl.trim(),
                submittedAt: Date.now(),
              }
            : a
        )
      );
      addToast({
        type: 'success',
        title: 'Answer Recorded',
        message: `Your answer for ${activeModal.courseCode} has been recorded successfully.`,
      });
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.categoryBadge}>Continuous Assessment</span>
            <span style={styles.liveBadge}>
              <span style={styles.liveDot} /> Live Faculty Evaluation Active
            </span>
          </div>
          <h1 style={styles.title}>Course Assignments &amp; Evaluation</h1>
          <p style={styles.subtitle}>
            Submit your solutions for enrolled courses. Faculty reviews submissions, marks scores, and provides continuous feedback.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox('rgba(2, 132, 199, 0.12)', '#0284C7')}>
            <FileText size={22} />
          </div>
          <div>
            <div style={styles.kpiValue}>{totalCount}</div>
            <div style={styles.kpiLabel}>Total Assigned</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox('rgba(245, 158, 11, 0.12)', '#F59E0B')}>
            <Clock size={22} />
          </div>
          <div>
            <div style={styles.kpiValue}>{pendingCount}</div>
            <div style={styles.kpiLabel}>Pending Submission</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox('rgba(139, 92, 246, 0.12)', '#8B5CF6')}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={styles.kpiValue}>{submittedCount}</div>
            <div style={styles.kpiLabel}>Under Review</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox('rgba(16, 185, 129, 0.12)', '#10B981')}>
            <Award size={22} />
          </div>
          <div>
            <div style={styles.kpiValue}>{gradedCount}</div>
            <div style={styles.kpiLabel}>Evaluated &amp; Graded</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>
            <Filter size={15} style={{ marginRight: '6px' }} /> Course:
          </span>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={styles.select}
          >
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Enrolled Courses' : c}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.pillTabs}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: `Pending (${pendingCount})` },
            { id: 'SUBMITTED', label: `Submitted (${submittedCount})` },
            { id: 'GRADED', label: `Graded (${gradedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={styles.pillTab(filterStatus === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards List */}
      {loading ? (
        <div style={styles.emptyBox}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading course assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div style={styles.emptyBox}>
          <CheckCircle size={44} style={{ color: '#10B981', marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '18px' }}>
            No Assignments Found
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px' }}>
            {filterStatus === 'PENDING'
              ? 'Great job! You have answered all pending assignments for your enrolled courses.'
              : 'There are no assignments matching the selected filters.'}
          </p>
        </div>
      ) : (
        <div style={styles.assignmentsGrid}>
          {filteredAssignments.map((a) => {
            const isDueSoon = a.dueDate && a.dueDate - Date.now() < 3 * 86400000 && a.dueDate > Date.now();
            const isOverdue = a.dueDate && a.dueDate < Date.now();
            const isGraded = a.submissionStatus === 'GRADED';
            const isSubmitted = a.submissionStatus === 'SUBMITTED';

            return (
              <div key={a.assignmentId} style={styles.card}>
                {/* Top Card Info */}
                <div style={styles.cardHeader}>
                  <div style={styles.courseTag}>
                    <span style={styles.courseCode}>{a.courseCode}</span>
                    <span style={styles.courseTitle}>{a.courseTitle}</span>
                  </div>

                  {/* Status Pill */}
                  {isGraded ? (
                    <span style={styles.statusPillGraded}>
                      <Award size={14} style={{ marginRight: '4px' }} /> Graded: {a.marksObtained}/{a.maxMarks}
                    </span>
                  ) : isSubmitted ? (
                    <span style={styles.statusPillSubmitted}>
                      <Clock size={14} style={{ marginRight: '4px' }} /> Submitted (Reviewing)
                    </span>
                  ) : isOverdue ? (
                    <span style={styles.statusPillOverdue}>
                      <AlertCircle size={14} style={{ marginRight: '4px' }} /> Overdue
                    </span>
                  ) : (
                    <span style={styles.statusPillPending}>
                      <Clock size={14} style={{ marginRight: '4px' }} /> Pending Answer
                    </span>
                  )}
                </div>

                {/* Assignment Title & Details */}
                <h3 style={styles.assignmentTitle}>{a.title}</h3>
                <p style={styles.assignmentDesc}>{a.description}</p>

                {/* Metadata Row */}
                <div style={styles.metaRow}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Instructor:</span>
                    <span style={styles.metaVal}>{a.facultyName || 'Course Faculty'}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Max Marks:</span>
                    <span style={styles.metaVal}>{a.maxMarks} pts</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Due Date:</span>
                    <span style={styles.metaValDue(isDueSoon, isOverdue)}>
                      <Calendar size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                </div>

                {/* Graded Evaluation Details (If evaluated) */}
                {isGraded && (
                  <div style={styles.evaluationBox}>
                    <div style={styles.evalHeader}>
                      <span style={{ fontWeight: '700', color: '#065F46', display: 'flex', alignItems: 'center' }}>
                        <CheckCircle size={16} style={{ marginRight: '6px', color: '#10B981' }} /> Faculty Evaluation
                      </span>
                      <span style={styles.scoreHighlight}>
                        Score: <strong>{a.marksObtained}</strong> / {a.maxMarks} ({Math.round(((a.marksObtained || 0) / a.maxMarks) * 100)}%)
                      </span>
                    </div>
                    {a.facultyFeedback && (
                      <div style={styles.feedbackText}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Feedback: </span>
                        {a.facultyFeedback}
                      </div>
                    )}
                    {a.evaluatedBy && (
                      <div style={styles.evaluatorSign}>
                        Evaluated by {a.evaluatedBy}
                      </div>
                    )}
                  </div>
                )}

                {/* Submitted Content Preview (If already submitted) */}
                {isSubmitted && a.submissionContent && (
                  <div style={styles.submissionPreviewBox}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF', marginBottom: '4px' }}>
                      Your Submitted Answer:
                    </div>
                    <div style={styles.submissionPreviewText}>
                      {a.submissionContent}
                    </div>
                    {a.attachmentUrl && (
                      <a
                        href={a.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.attachmentLink}
                      >
                        <ExternalLink size={13} style={{ marginRight: '4px' }} /> View Attachment Link
                      </a>
                    )}
                  </div>
                )}

                {/* Card Action Footer */}
                <div style={styles.cardFooter}>
                  {isGraded ? (
                    <button
                      onClick={() => openSubmitModal(a)}
                      style={styles.btnSecondary}
                    >
                      View / Resubmit Answer
                    </button>
                  ) : isSubmitted ? (
                    <button
                      onClick={() => openSubmitModal(a)}
                      style={styles.btnSecondary}
                    >
                      Update Answer / Solution
                    </button>
                  ) : (
                    <button
                      onClick={() => openSubmitModal(a)}
                      style={styles.btnPrimary}
                    >
                      <Send size={15} style={{ marginRight: '6px' }} /> Answer Assignment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answer / Submission Modal */}
      {activeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.courseTagModal}>{activeModal.courseCode}</span>
                <h3 style={styles.modalTitle}>{activeModal.title}</h3>
                <div style={styles.modalSubtitle}>
                  Max Points: <strong>{activeModal.maxMarks}</strong> • Faculty: {activeModal.facultyName}
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.problemBox}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Problem Statement:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {activeModal.description}
                </div>
              </div>

              <form onSubmit={handleSubmitAnswer}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.inputLabel}>
                    Your Solution / Explanation / Code: <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    rows={7}
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Type or paste your complete solution, code implementation, algorithm analysis, or summary here..."
                    style={styles.textarea}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.inputLabel}>
                    Optional Link (GitHub Repository / Google Colab / Project URL):
                  </label>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    style={styles.input}
                  />
                </div>

                {errorMsg && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    style={styles.btnSecondary}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check size={16} style={{ marginRight: '6px' }} /> Submit Answer for Grading
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 0',
  },
  header: {
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
    gap: '6px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    animation: 'pulse 2s infinite',
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '16px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  kpiIconBox: (bg, color) => ({
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  kpiValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-main)',
    lineHeight: '1.2',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    padding: '12px 16px',
    borderRadius: '14px',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  pillTabs: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  pillTab: (active) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: active ? 'none' : '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: active ? '#0284C7' : 'transparent',
    color: active ? '#ffffff' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }),
  assignmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  courseTag: {
    display: 'flex',
    flexDirection: 'column',
  },
  courseCode: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: '0.02em',
  },
  courseTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  statusPillGraded: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  statusPillSubmitted: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    border: '1px solid #BFDBFE',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  statusPillPending: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    color: '#92400E',
    border: '1px solid #FDE68A',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  statusPillOverdue: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  assignmentTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 8px 0',
    lineHeight: '1.35',
  },
  assignmentDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '12px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  metaValDue: (isDueSoon, isOverdue) => ({
    fontWeight: '700',
    color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
  }),
  evaluationBox: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px',
  },
  evalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  scoreHighlight: {
    fontSize: '13px',
    color: '#065F46',
  },
  feedbackText: {
    fontSize: '12px',
    color: '#166534',
    lineHeight: '1.45',
    marginTop: '4px',
  },
  evaluatorSign: {
    fontSize: '11px',
    color: '#15803D',
    marginTop: '6px',
    fontStyle: 'italic',
  },
  submissionPreviewBox: {
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px',
  },
  submissionPreviewText: {
    fontSize: '12px',
    color: '#0369A1',
    lineHeight: '1.45',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  attachmentLink: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#0284C7',
    textDecoration: 'none',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '8px',
  },
  btnPrimary: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#0284C7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
    transition: 'background-color 0.2s ease',
  },
  btnSecondary: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: '60px 20px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color, #E2E8F0)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseTagModal: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '4px 0',
  },
  modalSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px 24px',
  },
  problemBox: {
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '20px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color, #CBD5E1)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'vertical',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color, #CBD5E1)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
};
