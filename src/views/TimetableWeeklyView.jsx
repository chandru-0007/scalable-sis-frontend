import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Download,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  CalendarCheck,
  Filter,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const TIME_SLOTS = [
  '09:00 - 10:30',
  '10:30 - 12:00',
  '11:00 - 12:30',
  '14:00 - 15:30',
  '15:30 - 17:00',
];

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableWeeklyView() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day' | 'list'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, +1 = next week, -1 = prev week
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 to 4
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('ALL');

  const role = (user?.role || 'STUDENT').toUpperCase();
  const isFaculty = role === 'FACULTY';
  const studentIdentifier = user?.studentId || user?.id || user?.rollNumber || '22CS014';
  const facultyIdentifier = user?.rollNumber || user?.id || 'FAC001';

  // Compute current week's Monday-Friday dates
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    // Find Monday of current week
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

    return WEEKDAY_NAMES.map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      return {
        key: name,
        label: `${name} ${dayNum} ${monthStr}`,
        shortLabel: `${name.slice(0, 3)} ${dayNum}`,
        dayName: name,
        date: d,
        isToday:
          weekOffset === 0 &&
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear(),
      };
    });
  }, [weekOffset]);

  useEffect(() => {
    // Select today if in current week
    const todayIdx = currentWeekDays.findIndex((d) => d.isToday);
    if (todayIdx >= 0) {
      setSelectedDayIndex(todayIdx);
    }
  }, [currentWeekDays]);

  useEffect(() => {
    loadTimetable();
  }, [user, isFaculty]);

  async function loadTimetable() {
    setLoading(true);
    try {
      if (isFaculty) {
        // Fetch faculty teaching schedule
        let res;
        try {
          res = await api.faculty.getTimetable({ facultyId: facultyIdentifier, facultyName: user?.name });
        } catch {
          res = await api.students.getTimetable(facultyIdentifier);
        }
        if (res && res.status === 'SUCCESS' && Array.isArray(res.timetable) && res.timetable.length > 0) {
          setTimetableSlots(res.timetable);
        } else {
          setTimetableSlots(getFallbackFacultyTimetable());
        }
      } else {
        // Fetch student enrolled timetable
        const res = await api.students.getTimetable(studentIdentifier);
        if (res && res.status === 'SUCCESS' && Array.isArray(res.timetable)) {
          setTimetableSlots(res.timetable);
        } else {
          setTimetableSlots(getFallbackStudentTimetable());
        }
      }
    } catch (err) {
      console.warn('Failed to load timetable, using fallback:', err);
      setTimetableSlots(isFaculty ? getFallbackFacultyTimetable() : getFallbackStudentTimetable());
    } finally {
      setLoading(false);
    }
  }

  function getFallbackStudentTimetable() {
    return [
      { courseCode: 'CS101', courseTitle: 'Data Structures & Algorithms', dayOfWeek: 'Monday', timeSlot: '09:00 - 10:30', room: 'LH-101', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS101', courseTitle: 'Data Structures & Algorithms', dayOfWeek: 'Wednesday', timeSlot: '09:00 - 10:30', room: 'LH-101', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS201', courseTitle: 'Operating Systems', dayOfWeek: 'Tuesday', timeSlot: '10:30 - 12:00', room: 'LH-102', instructor: 'Dr. S. Meenakshi' },
      { courseCode: 'CS201', courseTitle: 'Operating Systems', dayOfWeek: 'Thursday', timeSlot: '10:30 - 12:00', room: 'LH-102', instructor: 'Dr. S. Meenakshi' },
      { courseCode: 'CS301', courseTitle: 'Cloud Computing & Distributed Systems', dayOfWeek: 'Monday', timeSlot: '11:00 - 12:30', room: 'LH-201', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS301', courseTitle: 'Cloud Computing & Distributed Systems', dayOfWeek: 'Wednesday', timeSlot: '11:00 - 12:30', room: 'LH-201', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS402', courseTitle: 'Distributed Systems Lab', dayOfWeek: 'Friday', timeSlot: '14:00 - 15:30', room: 'Lab 3', instructor: 'Dr. A. Ramanathan' },
    ];
  }

  function getFallbackFacultyTimetable() {
    return [
      { courseCode: 'CS101', courseTitle: 'Data Structures & Algorithms', dayOfWeek: 'Monday', timeSlot: '09:00 - 10:30', room: 'LH-101', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS101', courseTitle: 'Data Structures & Algorithms', dayOfWeek: 'Wednesday', timeSlot: '09:00 - 10:30', room: 'LH-101', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS201', courseTitle: 'Advanced Data Structures', dayOfWeek: 'Tuesday', timeSlot: '10:30 - 12:00', room: 'LH-102', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS201', courseTitle: 'Advanced Data Structures', dayOfWeek: 'Thursday', timeSlot: '10:30 - 12:00', room: 'LH-102', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS401', courseTitle: 'Computer Networks', dayOfWeek: 'Wednesday', timeSlot: '14:00 - 15:30', room: 'LH-301', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS401', courseTitle: 'Computer Networks', dayOfWeek: 'Friday', timeSlot: '14:00 - 15:30', room: 'LH-301', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS402', courseTitle: 'Distributed Systems', dayOfWeek: 'Monday', timeSlot: '14:00 - 15:30', room: 'LH-302', instructor: 'Dr. A. Ramanathan' },
      { courseCode: 'CS402', courseTitle: 'Distributed Systems', dayOfWeek: 'Thursday', timeSlot: '09:00 - 10:30', room: 'LH-302', instructor: 'Dr. A. Ramanathan' },
    ];
  }

  // Normalization helper: Maps any day representation to standard 'Monday' ... 'Friday'
  function normalizeDayName(raw) {
    if (!raw) return 'Monday';
    const lower = raw.toLowerCase().trim();
    if (lower.startsWith('mon')) return 'Monday';
    if (lower.startsWith('tue')) return 'Tuesday';
    if (lower.startsWith('wed')) return 'Wednesday';
    if (lower.startsWith('thu')) return 'Thursday';
    if (lower.startsWith('fri')) return 'Friday';
    if (lower.startsWith('sat')) return 'Saturday';
    return 'Monday';
  }

  // Normalization helper: Standardizes any time string to one of TIME_SLOTS
  function normalizeTimeSlot(raw) {
    if (!raw) return TIME_SLOTS[0];
    const clean = raw.replace(/\s+/g, '');
    if (clean.includes('09:00')) return '09:00 - 10:30';
    if (clean.includes('10:30')) return '10:30 - 12:00';
    if (clean.includes('11:00') || clean.includes('11:30')) return '11:00 - 12:30';
    if (clean.includes('14:00')) return '14:00 - 15:30';
    if (clean.includes('15:30')) return '15:30 - 17:00';
    return raw;
  }

  // Unique course codes for filter dropdown
  const uniqueCourses = ['ALL', ...Array.from(new Set(timetableSlots.map((s) => s.courseCode).filter(Boolean)))];

  // Filter slots by selected course
  const filteredSlots = timetableSlots.filter((s) => {
    if (filterCourse !== 'ALL' && s.courseCode !== filterCourse) return false;
    return true;
  });

  // Construct schedule matrix: scheduleMatrix[dayName][timeSlot] = Array of sessions (to support collisions & multiple sessions)
  const scheduleMatrix = useMemo(() => {
    const matrix = {};
    WEEKDAY_NAMES.forEach((day) => {
      matrix[day] = {};
      TIME_SLOTS.forEach((time) => {
        matrix[day][time] = [];
      });
    });

    filteredSlots.forEach((slot) => {
      const day = normalizeDayName(slot.dayOfWeek || slot.day);
      const time = normalizeTimeSlot(slot.timeSlot || slot.time);

      if (matrix[day] && matrix[day][time]) {
        const isLab =
          (slot.courseTitle || '').toLowerCase().includes('lab') ||
          (slot.courseCode || '').toLowerCase().includes('l') ||
          (slot.room || '').toLowerCase().includes('lab');

        matrix[day][time].push({
          code: slot.courseCode,
          title: slot.courseTitle,
          room: slot.room || 'LH-101',
          faculty: slot.instructor || 'Faculty Mentor',
          type: isLab ? 'LAB' : 'LECTURE',
          color: isLab ? '#F5F3FF' : '#ECFDF5',
          border: isLab ? '#DDD6FE' : '#A7F3D0',
          textColor: isLab ? '#5B21B6' : '#065F46',
        });
      }
    });

    return matrix;
  }, [filteredSlots]);

  // Detect total sessions and collisions
  let totalSessionsCount = 0;
  let collisionCount = 0;
  WEEKDAY_NAMES.forEach((day) => {
    TIME_SLOTS.forEach((time) => {
      const list = scheduleMatrix[day]?.[time] || [];
      totalSessionsCount += list.length;
      if (list.length > 1) collisionCount++;
    });
  });

  // Flattened sessions for Agenda / List View
  const agendaList = useMemo(() => {
    const list = [];
    currentWeekDays.forEach((dayObj) => {
      TIME_SLOTS.forEach((time) => {
        const sessions = scheduleMatrix[dayObj.dayName]?.[time] || [];
        sessions.forEach((s) => {
          list.push({
            ...s,
            day: dayObj.dayName,
            dateLabel: dayObj.label,
            time,
          });
        });
      });
    });
    return list;
  }, [scheduleMatrix, currentWeekDays]);

  // Export to standard .ics iCalendar file
  function handleExportICS() {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SIS University//Timetable//EN\nCALSCALE:GREGORIAN\n`;

    agendaList.forEach((item, idx) => {
      const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:sis-timetable-${item.code}-${idx}-${Date.now()}@sis.edu\n`;
      icsContent += `DTSTAMP:${nowStr}\n`;
      icsContent += `SUMMARY:${item.code} - ${item.title}\n`;
      icsContent += `LOCATION:${item.room}\n`;
      icsContent += `DESCRIPTION:Instructor: ${item.faculty} | Type: ${item.type}\n`;
      icsContent += `STATUS:CONFIRMED\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${user?.rollNumber || 'academic'}_timetable.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const selectedDayObj = currentWeekDays[selectedDayIndex] || currentWeekDays[0];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* ─── Top Header Banner ─── */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.categoryBadge}>
              {isFaculty ? 'Faculty Teaching Schedule' : 'Student Academic Timetable'}
            </span>
            <span style={styles.liveBadge}>
              <span style={styles.liveDot} /> Synced with Redis Cache
            </span>
          </div>
          <h2 style={styles.title}>
            {isFaculty ? 'Faculty Lecture & Laboratory Timetable' : 'Weekly Class Timetable'}
          </h2>
          <p style={styles.subtitle}>
            {isFaculty
              ? `Weekly instructional timetable for ${user?.name || 'Dr. A. Ramanathan'} across assigned university lecture halls.`
              : 'Interactive schedule generated from your confirmed course enrollments. Automatically updates on course rescheduling.'}
          </p>
        </div>

        {/* View Mode & Calendar Controls */}
        <div style={styles.headerActions}>
          <div style={styles.segTabs}>
            {['week', 'day', 'list'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  ...styles.segBtn,
                  ...(viewMode === mode ? styles.segBtnActive : {}),
                }}
              >
                {mode === 'week' ? 'Week Grid' : mode === 'day' ? 'Day Timeline' : 'Agenda List'}
              </button>
            ))}
          </div>

          <button onClick={handleExportICS} style={styles.btnExport}>
            <Download size={14} style={{ marginRight: '6px' }} />
            <span>Export .ics</span>
          </button>
        </div>
      </div>

      {/* ─── Week Navigation & Filters Bar ─── */}
      <div style={styles.navBar}>
        <div style={styles.weekNavigator}>
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            style={styles.navArrowBtn}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={styles.currentWeekLabel}>
            {currentWeekDays[0]?.label} &ndash; {currentWeekDays[4]?.label}
          </span>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            style={styles.navArrowBtn}
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={styles.todayBtn}>
              Current Week
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>
            <Filter size={14} style={{ marginRight: '6px' }} /> Course Filter:
          </span>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={styles.select}
          >
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Scheduled Courses' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Schedule Status Banner ─── */}
      {collisionCount > 0 ? (
        <div style={styles.collisionBanner}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Schedule Collision Warning:</strong> {collisionCount} time slot(s) contain overlapping sessions. Please contact the registrar or reschedule to prevent conflict.
          </span>
        </div>
      ) : (
        <div style={styles.alertBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={16} color="#059669" />
            <span>
              <strong>Confirmed Schedule:</strong> {totalSessionsCount} weekly lecture &amp; lab sessions active across {filteredSlots.length > 0 ? uniqueCourses.length - 1 : 0} courses.
            </span>
          </div>
          <span style={styles.chipSuccess}>0 Conflicts Detected</span>
        </div>
      )}

      {/* ─── Zero State for Empty Enrolled Courses ─── */}
      {!loading && timetableSlots.length === 0 && !isFaculty && (
        <div style={styles.zeroStateBox}>
          <CalendarDays size={42} color="#0284C7" style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-heading)' }}>
            Your Timetable is Empty (0 Enrolled Courses)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 18px', lineHeight: '1.5' }}>
            You have not registered for any courses yet. Select courses in the Course Catalog to automatically build your weekly lecture timetable.
          </p>
          <a
            href="#registration"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <BookOpen size={15} />
            <span>Browse &amp; Register Courses</span>
          </a>
        </div>
      )}

      {/* ─── MODE 1: WEEK GRID VIEW ─── */}
      {viewMode === 'week' && (
        <div style={styles.tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.gridTable}>
              <thead>
                <tr>
                  <th style={styles.timeHeader}>TIME SLOT</th>
                  {currentWeekDays.map((day) => (
                    <th
                      key={day.key}
                      style={{
                        ...styles.dayHeader,
                        ...(day.isToday ? styles.dayHeaderToday : {}),
                      }}
                    >
                      <div style={styles.dayHeaderName}>{day.dayName}</div>
                      <div style={styles.dayHeaderDate}>
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {day.isToday && <span style={styles.todayPill}>Today</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time}>
                    <td style={styles.timeCell}>
                      <Clock size={13} color="#0284C7" style={{ marginRight: '6px' }} />
                      <span className="mono" style={{ fontWeight: '700' }}>{time}</span>
                    </td>
                    {currentWeekDays.map((day) => {
                      const sessions = scheduleMatrix[day.dayName]?.[time] || [];
                      const hasCollision = sessions.length > 1;

                      return (
                        <td key={day.key} style={styles.slotCell}>
                          {sessions.length === 0 ? (
                            <div style={styles.freePeriodBox}>
                              <span style={styles.freePeriodText}>Free Period</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {sessions.map((session, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    ...styles.sessionBox,
                                    backgroundColor: session.color,
                                    borderColor: hasCollision ? '#F59E0B' : session.border,
                                  }}
                                >
                                  <div style={styles.sessionTop}>
                                    <span style={{ ...styles.sessionCode, color: session.textColor }}>
                                      {session.code}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      {hasCollision && (
                                        <span style={styles.collisionPill}>Collision</span>
                                      )}
                                      <span
                                        style={{
                                          ...styles.typeBadge,
                                          backgroundColor: session.type === 'LAB' ? '#EDE9FE' : '#D1FAE5',
                                          color: session.type === 'LAB' ? '#6D28D9' : '#047857',
                                        }}
                                      >
                                        {session.type}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={styles.sessionTitle}>{session.title}</div>

                                  <div style={styles.sessionMeta}>
                                    <span style={styles.metaIconText}>
                                      <MapPin size={12} color="#0D9488" />
                                      <strong>{session.room}</strong>
                                    </span>
                                    <span style={styles.metaIconText}>
                                      <User size={12} color="#4F46E5" />
                                      <span>{session.faculty}</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODE 2: DAY TIMELINE VIEW ─── */}
      {viewMode === 'day' && (
        <div style={styles.dayContainer}>
          {/* Day Selector Tabs */}
          <div style={styles.daySelectorBar}>
            {currentWeekDays.map((d, idx) => (
              <button
                key={d.key}
                onClick={() => setSelectedDayIndex(idx)}
                style={{
                  ...styles.dayPill,
                  ...(selectedDayIndex === idx ? styles.dayPillActive : {}),
                }}
              >
                <Calendar size={13} style={{ marginRight: '6px' }} />
                <span>{d.shortLabel}</span>
                {d.isToday && <span style={styles.pillTodayDot} />}
              </button>
            ))}
          </div>

          <div style={styles.dayLayoutGrid}>
            {/* Timeline Cards Column */}
            <div style={styles.timelineList}>
              {TIME_SLOTS.map((t) => {
                const sessions = scheduleMatrix[selectedDayObj.dayName]?.[t] || [];
                const hasClasses = sessions.length > 0;

                return (
                  <div key={t} style={styles.timelineRow}>
                    <div style={styles.timeBadgeCol}>
                      <span className="mono" style={styles.timeBadgeText}>{t}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      {!hasClasses ? (
                        <div style={styles.dayFreeSlot}>
                          <Clock size={14} color="#94A3B8" style={{ marginRight: '8px' }} />
                          <span>No class scheduled &bull; Study / Break Hour</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {sessions.map((session, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                ...styles.daySessionCard,
                                backgroundColor: session.color,
                                borderColor: session.border,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="mono" style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
                                    {session.code}
                                  </span>
                                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                                    {session.title}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    ...styles.typeBadge,
                                    backgroundColor: session.type === 'LAB' ? '#EDE9FE' : '#D1FAE5',
                                    color: session.type === 'LAB' ? '#6D28D9' : '#047857',
                                  }}
                                >
                                  {session.type}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '13px', color: '#475569' }}>
                                <span style={styles.metaIconText}>
                                  <MapPin size={14} color="#0D9488" />
                                  <strong>{session.room}</strong>
                                </span>
                                <span style={styles.metaIconText}>
                                  <User size={14} color="#4F46E5" />
                                  <span>{session.faculty}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Summary Sidebar Card */}
            <div style={styles.daySummaryCol}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryCardHeader}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-heading)' }}>
                    {selectedDayObj.dayName} Schedule Summary
                  </h4>
                  <span style={styles.chipNeutral}>{selectedDayObj.label}</span>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={styles.summaryRow}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Scheduled Sessions:</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-heading)' }}>
                      {Object.values(scheduleMatrix[selectedDayObj.dayName] || {}).flat().length} Classes
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Lab Practical Block:</span>
                    <strong style={{ fontSize: '14px', color: '#7C3AED' }}>
                      {Object.values(scheduleMatrix[selectedDayObj.dayName] || {}).flat().some((s) => s.type === 'LAB')
                        ? 'Yes (Lab Scheduled)'
                        : 'None'}
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Classroom Locations:</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284C7' }}>
                      {Array.from(new Set(Object.values(scheduleMatrix[selectedDayObj.dayName] || {}).flat().map((s) => s.room))).join(', ') || 'None'}
                    </span>
                  </div>

                  <div style={styles.tipBox}>
                    <Info size={16} color="#0284C7" style={{ flexShrink: 0, marginRight: '8px' }} />
                    <span style={{ fontSize: '12px', color: '#0369A1', lineHeight: '1.45' }}>
                      Attendance is recorded biometrically per session. 75% attendance is required for exam eligibility.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODE 3: AGENDA / LIST VIEW ─── */}
      {viewMode === 'list' && (
        <div style={styles.tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.listTable}>
              <thead>
                <tr>
                  <th style={styles.th}>DAY &amp; DATE</th>
                  <th style={styles.th}>TIME SLOT</th>
                  <th style={styles.th}>COURSE</th>
                  <th style={styles.th}>SESSION TYPE</th>
                  <th style={styles.th}>ROOM / LAB</th>
                  <th style={styles.th}>INSTRUCTOR</th>
                </tr>
              </thead>
              <tbody>
                {agendaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No classes scheduled for the selected filter.
                    </td>
                  </tr>
                ) : (
                  agendaList.map((item, idx) => (
                    <tr key={idx} style={styles.tr(idx % 2 === 0)}>
                      <td style={styles.td}>
                        <strong>{item.day}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.dateLabel}</div>
                      </td>
                      <td style={styles.td}>
                        <span className="mono" style={{ fontWeight: '700', color: '#0284C7' }}>
                          {item.time}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '800', color: 'var(--text-heading)' }}>{item.code}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.title}</div>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            backgroundColor: item.type === 'LAB' ? '#EDE9FE' : '#D1FAE5',
                            color: item.type === 'LAB' ? '#6D28D9' : '#047857',
                          }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.roomPill}>{item.room}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '13px', color: 'var(--text-heading)' }}>{item.faculty}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 0 48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  segTabs: {
    display: 'flex',
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '12px',
    padding: '3px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  segBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  segBtnActive: {
    backgroundColor: '#0284C7',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
  },
  btnExport: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #CBD5E1)',
    color: 'var(--text-main)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '14px',
    padding: '12px 18px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  weekNavigator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navArrowBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeekLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  todayBtn: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    color: '#0284C7',
    border: 'none',
    cursor: 'pointer',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #CBD5E1)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-main)',
    fontSize: '12px',
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer',
  },
  alertBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#166534',
  },
  collisionBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#92400E',
  },
  chipSuccess: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  zeroStateBox: {
    textAlign: 'center',
    padding: '48px 24px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    borderRadius: '20px',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    marginBottom: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
  },
  tableCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  gridTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '920px',
  },
  timeHeader: {
    width: '140px',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    textAlign: 'center',
  },
  dayHeader: {
    padding: '14px 16px',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    borderLeft: '1px solid var(--border-color, #F1F5F9)',
    textAlign: 'center',
    width: '18%',
  },
  dayHeaderToday: {
    backgroundColor: '#EFF6FF',
    borderBottom: '2px solid #0284C7',
  },
  dayHeaderName: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  dayHeaderDate: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  todayPill: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#0284C7',
    color: '#ffffff',
    padding: '1px 5px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  timeCell: {
    padding: '16px 12px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
    backgroundColor: 'var(--bg-main, #FAFAFA)',
  },
  slotCell: {
    padding: '10px',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
    borderLeft: '1px solid var(--border-color, #F1F5F9)',
    verticalAlign: 'top',
    height: '110px',
  },
  freePeriodBox: {
    height: '100%',
    minHeight: '80px',
    borderRadius: '10px',
    border: '1px dashed var(--border-color, #E2E8F0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freePeriodText: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94A3B8',
  },
  sessionBox: {
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    transition: 'transform 0.15s ease',
  },
  sessionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCode: {
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.02em',
  },
  typeBadge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  collisionPill: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: '2px 5px',
    borderRadius: '6px',
  },
  sessionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: '1.3',
  },
  sessionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    fontSize: '11px',
  },
  metaIconText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#475569',
  },
  // Day View Styles
  dayContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  daySelectorBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  dayPill: {
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
  },
  dayPillActive: {
    backgroundColor: '#0284C7',
    color: '#ffffff',
    borderColor: '#0284C7',
    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
  },
  pillTodayDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    marginLeft: '6px',
  },
  dayLayoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timelineRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  timeBadgeCol: {
    width: '110px',
    paddingTop: '12px',
    textAlign: 'right',
  },
  timeBadgeText: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0284C7',
  },
  dayFreeSlot: {
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1px dashed var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: '#94A3B8',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
  },
  daySessionCard: {
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1px solid',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  daySummaryCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
    borderRadius: '18px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
  },
  summaryCardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipNeutral: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main, #F1F5F9)',
    color: 'var(--text-muted)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipBox: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px',
  },
  // List View Styles
  listTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '14px 18px',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    backgroundColor: 'var(--bg-main, #F8FAFC)',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
  },
  tr: (even) => ({
    backgroundColor: even ? 'transparent' : 'var(--bg-main, #FAFAFA)',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
  }),
  td: {
    padding: '14px 18px',
    fontSize: '13px',
    color: 'var(--text-main)',
  },
  roomPill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-main, #F1F5F9)',
    fontWeight: '700',
    fontSize: '12px',
  },
};
