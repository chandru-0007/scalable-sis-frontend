import React, { useState, useEffect, useMemo } from 'react';
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
  GraduationCap,
  PlusCircle,
  Trash2,
  Edit3,
  UserCheck,
  Megaphone,
  Briefcase,
  ExternalLink,
  X,
  Mail,
  Key,
  Copy,
  Check,
} from 'lucide-react';

const STANDARD_ROOMS = [
  { id: 'LH-101', label: 'LH-101 (Main Auditorium - 120 Seats)' },
  { id: 'LH-102', label: 'LH-102 (Smart Audio-Visual Hall - 90 Seats)' },
  { id: 'LH-201', label: 'LH-201 (Tiered Lecture Theatre - 75 Seats)' },
  { id: 'LH-301', label: 'LH-301 (Central Seminar Complex - 100 Seats)' },
  { id: 'LH-302', label: 'LH-302 (Computing Wing Hall - 60 Seats)' },
  { id: 'Tech Hall 405', label: 'Tech Hall 405 (Interactive Display Hall - 80 Seats)' },
  { id: 'Lab Block 304', label: 'Lab Block 304 (Distributed Systems Lab - 45 Seats)' },
  { id: 'AI Lab 202', label: 'AI Lab 202 (GPU High-Performance Lab - 40 Seats)' },
  { id: 'Seminar Hall B', label: 'Seminar Hall B (Central Executive Hall - 150 Seats)' },
];

const STANDARD_PERIODS = [
  { id: '08:30-10:00', label: 'Period 1: 08:30 AM – 10:00 AM' },
  { id: '10:15-11:45', label: 'Period 2: 10:15 AM – 11:45 AM' },
  { id: '12:00-13:30', label: 'Period 3: 12:00 PM – 01:30 PM' },
  { id: '14:00-15:30', label: 'Period 4: 02:00 PM – 03:30 PM' },
  { id: '15:45-17:15', label: 'Period 5: 03:45 PM – 05:15 PM' },
  { id: '09:00-12:00', label: 'Morning Lab: 09:00 AM – 12:00 PM' },
  { id: '14:00-17:00', label: 'Afternoon Lab: 02:00 PM – 05:00 PM' },
];

const STANDARD_SLOT_PRESETS = [
  { label: 'Mon & Wed: Period 1 (08:30 – 10:00)', value: 'Mon 08:30-10:00, Wed 08:30-10:00', days: ['Mon', 'Wed'], period: '08:30-10:00' },
  { label: 'Mon & Wed: Period 2 (10:15 – 11:45)', value: 'Mon 10:15-11:45, Wed 10:15-11:45', days: ['Mon', 'Wed'], period: '10:15-11:45' },
  { label: 'Mon & Thu: Period 3 (11:30 – 13:00)', value: 'Mon 11:30-13:00, Thu 11:30-13:00', days: ['Mon', 'Thu'], period: '11:30-13:00' },
  { label: 'Tue & Thu: Period 1 (08:30 – 10:00)', value: 'Tue 08:30-10:00, Thu 08:30-10:00', days: ['Tue', 'Thu'], period: '08:30-10:00' },
  { label: 'Tue & Thu: Period 2 (10:15 – 11:45)', value: 'Tue 10:15-11:45, Thu 10:15-11:45', days: ['Tue', 'Thu'], period: '10:15-11:45' },
  { label: 'Tue & Fri: Period 4 (14:00 – 15:30)', value: 'Tue 14:00-15:30, Fri 14:00-15:30', days: ['Tue', 'Fri'], period: '14:00-15:30' },
  { label: 'Wed & Fri: Period 2 (10:15 – 11:45)', value: 'Wed 10:15-11:45, Fri 10:15-11:45', days: ['Wed', 'Fri'], period: '10:15-11:45' },
  { label: 'Wed & Fri: Period 5 (15:45 – 17:15)', value: 'Wed 15:45-17:15, Fri 15:45-17:15', days: ['Wed', 'Fri'], period: '15:45-17:15' },
  { label: 'Mon Practical Lab (14:00 – 17:00)', value: 'Mon 14:00-17:00', days: ['Mon'], period: '14:00-17:00' },
  { label: 'Wed Practical Lab (14:00 – 17:00)', value: 'Wed 14:00-17:00', days: ['Wed'], period: '14:00-17:00' },
  { label: 'Thu Practical Lab (14:00 – 17:00)', value: 'Thu 14:00-17:00', days: ['Thu'], period: '14:00-17:00' },
  { label: 'Fri Morning Lab (09:00 – 12:00)', value: 'Fri 09:00-12:00', days: ['Fri'], period: '09:00-12:00' },
  { label: 'Sat Special Makeup (10:00 – 13:00)', value: 'Sat 10:00-13:00', days: ['Sat'], period: '10:00-13:00' },
];

const RESCHEDULE_REASONS = [
  'Air conditioning / HVAC maintenance in previous hall',
  'Mid-semester examination slot clash resolution',
  'Faculty academic symposium / conference travel',
  'Relocation to High-Performance Computing Lab Block',
  'Special guest lecture / Extended lab practical session',
  'Classroom capacity optimization and batch reallocation',
  'Elective clash elimination for core department batch',
];

export default function AdminPortalView({ initialTab = 'onboard', onNavigate }) {
  const { addToast } = useRealtime();

  // Active Tab: 'onboard' | 'courses' | 'reschedule' | 'students' | 'faculty' | 'debarred' | 'broadcast'
  const [activeTab, setActiveTab] = useState(initialTab || 'onboard');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'onboard') onNavigate('admin-onboard');
      else if (tab === 'courses') onNavigate('admin');
      else if (tab === 'reschedule') onNavigate('admin-reschedule');
      else if (tab === 'faculty') onNavigate('admin-faculty');
      else if (tab === 'debarred') onNavigate('admin-debarment');
      else if (tab === 'students') onNavigate('admin');
      else if (tab === 'broadcast') onNavigate('notifications');
    }
  };

  // Overview Metrics State
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Courses Management State
  const [courseList, setCourseList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    department: 'CSE',
    credits: 3,
    semester: 1,
    capacity: 60,
    instructor: 'Dr. Priya Sharma',
    facultyId: 'FAC002',
    schedule: 'Mon 09:00-10:30, Wed 09:00-10:30',
    room: 'LH-101',
  });
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Assign Faculty Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignCourseCode, setAssignCourseCode] = useState('');
  const [assignFacultyName, setAssignFacultyName] = useState('');
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [assignSchedule, setAssignSchedule] = useState('');
  const [assigningFaculty, setAssigningFaculty] = useState(false);

  // Reschedule Form State
  const [selectedCourse, setSelectedCourse] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [reason, setReason] = useState('Air conditioning maintenance in Lecture Hall 101');
  const [rescheduleResult, setRescheduleResult] = useState(null);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  // Reschedule Period & Day Selector State
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed']);
  const [selectedPeriod, setSelectedPeriod] = useState('08:30-10:00');

  // Pre-check Collision State
  const [conflictWarning, setConflictWarning] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Students Directory State
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(null);
  const [studentEnrollCourseCode, setStudentEnrollCourseCode] = useState('');
  const [enrollingStudent, setEnrollingStudent] = useState(false);
  const [studentActiveEnrollments, setStudentActiveEnrollments] = useState([]);

  // Faculty Onboard State
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facRoll, setFacRoll] = useState('');
  const [facDept, setFacDept] = useState('CSE');
  const [facPass, setFacPass] = useState('Faculty@123');
  const [facSubmitting, setFacSubmitting] = useState(false);

  // Unified User Onboarding State
  const [onboardRole, setOnboardRole] = useState('STUDENT');
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardRoll, setOnboardRoll] = useState('');
  const [onboardDept, setOnboardDept] = useState('CSE');
  const [onboardSemester, setOnboardSemester] = useState(1);
  const [autoGenPassword, setAutoGenPassword] = useState(true);
  const [customPassword, setCustomPassword] = useState('');
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [recentOnboardedUser, setRecentOnboardedUser] = useState(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [userDirectorySearch, setUserDirectorySearch] = useState('');
  const [userDirectoryRoleFilter, setUserDirectoryRoleFilter] = useState('ALL');

  // Debarred Audit State
  const [debarredStudents, setDebarredStudents] = useState([]);
  const [loadingDebarred, setLoadingDebarred] = useState(false);

  // Broadcast Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('CIRCULAR');
  const [noticeExternalUrl, setNoticeExternalUrl] = useState('');
  const [publishingNotice, setPublishingNotice] = useState(false);

  // Unified Pool of Existing Faculty (from Registered Faculty Accounts + Course Instructors)
  const allAvailableFaculty = useMemo(() => {
    const map = new Map();
    (facultyList || []).forEach((f) => {
      if (f.name) {
        map.set(f.name.toLowerCase().trim(), {
          name: f.name.trim(),
          rollNumber: f.rollNumber || f.id || 'FAC',
          department: f.department || 'CSE',
        });
      }
    });
    (courseList || []).forEach((c) => {
      if (c.instructor && c.instructor !== 'Unassigned' && !map.has(c.instructor.toLowerCase().trim())) {
        map.set(c.instructor.toLowerCase().trim(), {
          name: c.instructor.trim(),
          rollNumber: c.facultyId || 'FAC-INST',
          department: c.department || 'Academic',
        });
      }
    });
    return Array.from(map.values());
  }, [facultyList, courseList]);

  // Reschedule Selectors Helper Functions
  function handleSelectSlotPreset(presetVal) {
    if (!presetVal) return;
    const found = STANDARD_SLOT_PRESETS.find((p) => p.value === presetVal);
    if (found) {
      setSelectedDays(found.days);
      setSelectedPeriod(found.period);
      setNewSchedule(found.value);
    } else {
      setNewSchedule(presetVal);
    }
  }

  function toggleDay(day) {
    let nextDays;
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return;
      nextDays = selectedDays.filter((d) => d !== day);
    } else {
      nextDays = [...selectedDays, day];
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      nextDays.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    setSelectedDays(nextDays);
    const period = selectedPeriod || '08:30-10:00';
    setNewSchedule(nextDays.map((d) => `${d} ${period}`).join(', '));
  }

  function handlePeriodChange(period) {
    setSelectedPeriod(period);
    const days = selectedDays.length > 0 ? selectedDays : ['Mon', 'Wed'];
    setNewSchedule(days.map((d) => `${d} ${period}`).join(', '));
  }

  function setDayPattern(days) {
    setSelectedDays(days);
    const period = selectedPeriod || '08:30-10:00';
    setNewSchedule(days.map((d) => `${d} ${period}`).join(', '));
  }

  // Initial Data Fetch
  useEffect(() => {
    loadOverview();
    loadCourses();
    loadFaculty();
    loadStudents();
    loadDebarred();
  }, []);

  async function loadOverview() {
    setLoadingOverview(true);
    try {
      const data = await api.admin.getOverview();
      setOverview(data);
    } catch (err) {
      console.warn('Failed to fetch overview metrics:', err);
    } finally {
      setLoadingOverview(false);
    }
  }

  async function loadCourses() {
    setLoadingCourses(true);
    try {
      const res = await api.courses.getAll();
      const list = Array.isArray(res) ? res : (res?.courses || []);
      setCourseList(list);
      if (list.length > 0 && !selectedCourse) {
        setSelectedCourse(list[0].code);
        setNewSchedule(list[0].schedule || '');
        setNewRoom(list[0].room || '');
      }
    } catch (err) {
      console.warn('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadFaculty() {
    setLoadingFaculty(true);
    try {
      const res = await api.admin.getFacultyList();
      const list = Array.isArray(res) ? res : (res?.faculty || []);
      setFacultyList(list);
    } catch (err) {
      console.warn('Failed to load faculty:', err);
    } finally {
      setLoadingFaculty(false);
    }
  }

  async function loadStudents() {
    setLoadingStudents(true);
    try {
      const res = await api.students.list(100);
      const list = Array.isArray(res) ? res : (res?.students || []);
      setStudentList(list);
    } catch (err) {
      console.warn('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadDebarred() {
    setLoadingDebarred(true);
    try {
      const res = await api.admin.getDebarredStudents();
      const list = Array.isArray(res?.debarredStudents)
        ? res.debarredStudents
        : (Array.isArray(res) ? res : []);
      setDebarredStudents(list);
    } catch (err) {
      console.warn('Failed to load debarred students report:', err);
    } finally {
      setLoadingDebarred(false);
    }
  }

  // Course Selection for Rescheduling
  function handleSelectCourse(code) {
    setSelectedCourse(code);
    const found = courseList.find((c) => c.code === code);
    if (found) {
      setNewSchedule(found.schedule || '');
      setNewRoom(found.room || '');
    }
  }

  // Pre-check Collision
  async function handleCheckConflict() {
    if (!newSchedule.trim()) return;
    setCheckingConflict(true);
    setConflictWarning(null);
    try {
      const report = await api.admin.checkScheduleConflict({
        schedule: newSchedule,
        room: newRoom,
        excludeCourseCode: selectedCourse,
      });
      if (report.conflict) {
        setConflictWarning(report.reason || 'Schedule collision detected for this room/slot.');
      } else {
        addToast({
          type: 'success',
          title: 'Slot Available!',
          message: `Slot "${newSchedule}" in Room "${newRoom || 'TBA'}" has zero timetable collisions.`,
        });
      }
    } catch (err) {
      console.warn('Conflict check error:', err);
    } finally {
      setCheckingConflict(false);
    }
  }

  // Execute Reschedule
  async function handleReschedule(e) {
    e.preventDefault();
    if (!selectedCourse || !newSchedule) return;

    setLoadingReschedule(true);
    setRescheduleResult(null);

    try {
      const res = await api.admin.rescheduleCourse(selectedCourse, {
        newSchedule,
        newRoom,
        reason,
      });

      setRescheduleResult(res);

      addToast({
        type: 'success',
        title: 'Course Rescheduled!',
        message: `${selectedCourse} moved to ${newSchedule}. Student timetable cache evicted, notice dispatched.`,
      });

      loadCourses();
      loadOverview();
    } catch (err) {
      console.error('Reschedule failed:', err);
      addToast({
        type: 'error',
        title: 'Reschedule Failed',
        message: err.message || 'Error occurred while updating course schedule.',
      });
    } finally {
      setLoadingReschedule(false);
    }
  }

  // Assign Faculty Modal Open
  function openAssignModal(course) {
    const targetCourse = course || (courseList.length > 0 ? courseList[0] : null);
    if (targetCourse) {
      setAssignCourseCode(targetCourse.code);
      setAssignFacultyName(targetCourse.instructor || '');
      setAssignFacultyId(targetCourse.facultyId || '');
      setAssignRoom(targetCourse.room || 'LH-101');
      setAssignSchedule(targetCourse.schedule || 'Mon 09:00-10:30, Wed 09:00-10:30');
    } else {
      setAssignCourseCode('');
      setAssignFacultyName('');
      setAssignFacultyId('');
      setAssignRoom('LH-101');
      setAssignSchedule('Mon 09:00-10:30, Wed 09:00-10:30');
    }
    setShowAssignModal(true);
  }

  // Assign Faculty Submit
  async function handleAssignFacultySubmit(e) {
    e.preventDefault();
    if (!assignCourseCode || !assignFacultyName) return;

    setAssigningFaculty(true);
    try {
      await api.admin.assignFacultyToCourse(assignCourseCode, {
        facultyName: assignFacultyName,
        facultyId: assignFacultyId,
        room: assignRoom,
        schedule: assignSchedule,
      });

      addToast({
        type: 'success',
        title: 'Faculty Assigned!',
        message: `${assignFacultyName} is now instructor for ${assignCourseCode}.`,
      });

      setShowAssignModal(false);
      loadCourses();
      loadOverview();
    } catch (err) {
      console.error('Failed to assign faculty:', err);
      addToast({
        type: 'error',
        title: 'Assignment Failed',
        message: err.message || 'Error occurred while assigning instructor.',
      });
    } finally {
      setAssigningFaculty(false);
    }
  }

  // Create New Course Submit
  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!newCourse.code || !newCourse.title) return;

    setCreatingCourse(true);
    try {
      await api.admin.createCourse(newCourse);
      addToast({
        type: 'success',
        title: 'Course Created!',
        message: `Course ${newCourse.code} (${newCourse.title}) added to the university catalog.`,
      });
      setShowNewCourseModal(false);
      setNewCourse({
        code: '',
        title: '',
        department: 'CSE',
        credits: 3,
        semester: 1,
        capacity: 60,
        instructor: 'Dr. Priya Sharma',
        facultyId: 'FAC002',
        schedule: 'Mon 09:00-10:30, Wed 09:00-10:30',
        room: 'LH-101',
      });
      loadCourses();
      loadOverview();
    } catch (err) {
      console.error('Failed to create course:', err);
      addToast({
        type: 'error',
        title: 'Course Creation Failed',
        message: err.message || 'Error occurred while creating course.',
      });
    } finally {
      setCreatingCourse(false);
    }
  }

  // Onboard New Faculty Submit
  async function handleOnboardFaculty(e) {
    e.preventDefault();
    if (!facName || !facEmail || !facRoll) return;

    setFacSubmitting(true);
    try {
      const res = await api.admin.onboardFaculty({
        name: facName,
        email: facEmail,
        rollNumber: facRoll,
        department: facDept,
        password: facPass,
      });

      addToast({
        type: 'success',
        title: 'Faculty Onboarded!',
        message: `${facName} registered. Snowflake ID: ${res.id}, Shard: ${res.targetShard}`,
      });

      setFacName('');
      setFacEmail('');
      setFacRoll('');
      loadFaculty();
      loadOverview();
    } catch (err) {
      console.error('Onboarding failed:', err);
      addToast({
        type: 'error',
        title: 'Onboarding Failed',
        message: err.message || 'Failed to onboard faculty member.',
      });
    } finally {
      setFacSubmitting(false);
    }
  }

  // Unified User Onboarding Submit (Admin adds Student or Faculty with random password & email dispatch)
  async function handleOnboardUser(e) {
    e.preventDefault();
    if (!onboardName || !onboardEmail || !onboardRoll) return;

    setOnboardingSubmitting(true);
    setRecentOnboardedUser(null);
    setCopiedPass(false);

    try {
      const payload = {
        name: onboardName.trim(),
        email: onboardEmail.trim().toLowerCase(),
        rollNumber: onboardRoll.trim().toUpperCase(),
        department: onboardDept,
        role: onboardRole,
        semester: onboardRole === 'STUDENT' ? Number(onboardSemester) : 0,
      };

      if (!autoGenPassword && customPassword.trim()) {
        payload.password = customPassword.trim();
      }

      const res = await api.admin.addUser(payload);

      setRecentOnboardedUser(res);
      addToast({
        type: 'success',
        title: `${onboardRole} Account Created!`,
        message: `${payload.name} (${payload.rollNumber}) provisioned on ${res.user?.targetShard || 'cluster'}. Credentials email dispatched via Brevo.`,
      });

      // Clear input fields
      setOnboardName('');
      setOnboardEmail('');
      setOnboardRoll('');
      setCustomPassword('');

      // Refresh data
      loadStudents();
      loadFaculty();
      loadOverview();
    } catch (err) {
      console.error('Failed to onboard user:', err);
      addToast({
        type: 'error',
        title: 'Onboarding Failed',
        message: err.message || 'Error occurred while provisioning user.',
      });
    } finally {
      setOnboardingSubmitting(false);
    }
  }

  const allUsersList = useMemo(() => {
    const list = [];
    (studentList || []).forEach((s) => {
      list.push({
        ...s,
        role: s.role || 'STUDENT',
        displayName: s.name,
        rollOrId: s.rollNumber,
      });
    });
    (facultyList || []).forEach((f) => {
      list.push({
        ...f,
        role: f.role || 'FACULTY',
        displayName: f.name,
        rollOrId: f.rollNumber || f.id || 'FAC',
      });
    });

    return list.filter((u) => {
      if (userDirectoryRoleFilter !== 'ALL' && u.role !== userDirectoryRoleFilter) return false;
      if (!userDirectorySearch.trim()) return true;
      const q = userDirectorySearch.toLowerCase();
      return (
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.rollOrId && u.rollOrId.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    });
  }, [studentList, facultyList, userDirectorySearch, userDirectoryRoleFilter]);

  // Student Drilldown & Enrollments
  async function handleSelectStudent(student) {
    setSelectedStudentForEnroll(student);
    try {
      const res = await api.students.getEnrollments(student.studentId || student.id);
      const list = Array.isArray(res?.enrollments) ? res.enrollments : [];
      setStudentActiveEnrollments(list);
    } catch (err) {
      console.warn('Failed to load student enrollments:', err);
      setStudentActiveEnrollments([]);
    }
  }

  // Admin Override Enroll Student
  async function handleAdminEnrollStudent(e) {
    e.preventDefault();
    if (!selectedStudentForEnroll || !studentEnrollCourseCode) return;

    setEnrollingStudent(true);
    try {
      await api.admin.enrollStudent(
        selectedStudentForEnroll.studentId || selectedStudentForEnroll.id || selectedStudentForEnroll.rollNumber,
        studentEnrollCourseCode
      );

      addToast({
        type: 'success',
        title: 'Override Enrollment Confirmed!',
        message: `${selectedStudentForEnroll.name} (${selectedStudentForEnroll.rollNumber}) enrolled in ${studentEnrollCourseCode}.`,
      });

      // Refresh student enrollments and course list
      handleSelectStudent(selectedStudentForEnroll);
      loadCourses();
      loadOverview();
    } catch (err) {
      console.error('Admin enrollment failed:', err);
      addToast({
        type: 'error',
        title: 'Enrollment Override Failed',
        message: err.message || 'Error occurred while enrolling student.',
      });
    } finally {
      setEnrollingStudent(false);
    }
  }

  // Admin Override Drop Student
  async function handleAdminDropStudent(courseCode) {
    if (!selectedStudentForEnroll) return;
    try {
      await api.admin.dropStudent(
        selectedStudentForEnroll.studentId || selectedStudentForEnroll.id || selectedStudentForEnroll.rollNumber,
        courseCode
      );
      addToast({
        type: 'info',
        title: 'Course Dropped',
        message: `Removed ${courseCode} from ${selectedStudentForEnroll.name}'s schedule.`,
      });
      handleSelectStudent(selectedStudentForEnroll);
      loadCourses();
      loadOverview();
    } catch (err) {
      console.error('Admin drop failed:', err);
      addToast({
        type: 'error',
        title: 'Drop Failed',
        message: err.message || 'Error occurred while dropping course.',
      });
    }
  }

  // Publish Official Announcement Submit
  async function handlePublishNotice(e) {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    setPublishingNotice(true);
    try {
      const res = await api.admin.publishNotice({
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        author: 'Office of the Registrar',
        externalUrl: noticeExternalUrl.trim() || null,
      });

      addToast({
        type: 'success',
        title: 'Circular Broadcasted!',
        message: `Notice "${noticeTitle}" published with Short URL: ${res.shortUrl || 'Active'}. Broadcast sent via SSE.`,
      });

      setNoticeTitle('');
      setNoticeContent('');
      setNoticeExternalUrl('');
    } catch (err) {
      console.error('Failed to publish notice:', err);
      addToast({
        type: 'error',
        title: 'Broadcast Failed',
        message: err.message || 'Error occurred while broadcasting announcement.',
      });
    } finally {
      setPublishingNotice(false);
    }
  }

  // Filtered courses and students
  const filteredCourses = courseList.filter(
    (c) =>
      c.code.toLowerCase().includes(courseFilter.toLowerCase()) ||
      c.title.toLowerCase().includes(courseFilter.toLowerCase()) ||
      (c.instructor && c.instructor.toLowerCase().includes(courseFilter.toLowerCase()))
  );

  const filteredStudents = studentList.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="sis-view-container animate-fade-in" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Header & Main Tabs ─── */}
      <div style={styles.header}>
        <div>
          <h2 className="admin-header-title" style={styles.title}>Academic Registrar & Administrator Command Center</h2>
          <p style={styles.subtitle}>
            Course Catalog &bull; Faculty Assignment &bull; Student Overrides &bull; Rescheduling &bull; Debarment Audits
          </p>
        </div>

        <div className="admin-tabs-bar" style={styles.tabs}>
          <button
            onClick={() => handleTabSwitch('onboard')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'onboard' ? styles.tabBtnActive : {}),
            }}
          >
            <UserPlus size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Onboard Users
          </button>
          <button
            onClick={() => handleTabSwitch('courses')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'courses' ? styles.tabBtnActive : {}),
            }}
          >
            <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Course Catalog
          </button>
          <button
            onClick={() => handleTabSwitch('reschedule')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'reschedule' ? styles.tabBtnActive : {}),
            }}
          >
            <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Reschedule Engine
          </button>
          <button
            onClick={() => handleTabSwitch('students')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'students' ? styles.tabBtnActive : {}),
            }}
          >
            <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Student Overrides
          </button>
          <button
            onClick={() => handleTabSwitch('faculty')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'faculty' ? styles.tabBtnActive : {}),
            }}
          >
            <Briefcase size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Faculty Allocation
          </button>
          <button
            onClick={() => handleTabSwitch('debarred')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'debarred' ? styles.tabBtnActive : {}),
            }}
          >
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Debarment Audit
          </button>
          <button
            onClick={() => handleTabSwitch('broadcast')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'broadcast' ? styles.tabBtnActive : {}),
            }}
          >
            <Megaphone size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Broadcast Notice
          </button>
        </div>
      </div>

      {/* ─── University System Metrics Strip ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Registered Students</span>
            <Users size={18} color="var(--primary-blue)" />
          </div>
          <div className="stat-value">{overview?.totalStudents ?? studentList.length}</div>
          <div className="stat-meta">
            <span className="chip chip-info">Active Student Body</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Courses</span>
            <BookOpen size={18} color="var(--primary-blue)" />
          </div>
          <div className="stat-value">{overview?.activeCourses ?? courseList.length}</div>
          <div className="stat-meta">
            <span className="chip chip-neutral">Odd Semester (Fall 2026)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Confirmed Enrollments</span>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div className="stat-value">
            {overview?.totalEnrollments ?? courseList.reduce((acc, c) => acc + (c.enrolled || 0), 0)}
          </div>
          <div className="stat-meta">
            <span className="chip chip-success">Relational DB Parity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Debarment Risk (&lt;75%)</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div className="stat-value">{debarredStudents.length}</div>
          <div className="stat-meta">
            <span className={debarredStudents.length > 0 ? 'chip chip-danger' : 'chip chip-success'}>
              {debarredStudents.length > 0 ? 'Requires Dean Review' : '100% Compliant'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── TAB 0: USER ONBOARDING & PROVISIONING (Admin Only) ─── */}
      {activeTab === 'onboard' && (
        <div className="admin-grid-two animate-fade-in">
          {/* Left: Provision New Student or Faculty Member */}
          <div className="sis-card">
            <div className="sis-card-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3>Provision New University Account</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Admin-exclusive user creation with automatic random password &amp; Brevo email dispatch
                  </p>
                </div>
                <span className="chip chip-success" style={{ fontSize: '11px' }}>
                  Brevo Active
                </span>
              </div>
            </div>

            <div className="sis-card-body">
              {recentOnboardedUser && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                    <CheckCircle size={18} color="#10B981" />
                    <span>Account Successfully Provisioned!</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    User: <strong>{recentOnboardedUser.user?.name}</strong> ({recentOnboardedUser.user?.rollNumber}) &bull; Shard: <code>{recentOnboardedUser.user?.targetShard}</code>
                  </div>

                  <div style={{ backgroundColor: 'var(--card-bg, #FFFFFF)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      GENERATED TEMPORARY PASSWORD
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="mono" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary-blue)', letterSpacing: '0.05em' }}>
                        {recentOnboardedUser.temporaryPassword}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (recentOnboardedUser?.temporaryPassword) {
                            navigator.clipboard.writeText(recentOnboardedUser.temporaryPassword);
                            setCopiedPass(true);
                            setTimeout(() => setCopiedPass(false), 2000);
                          }
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 10px' }}
                      >
                        {copiedPass ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#047857' }}>
                    <Mail size={14} />
                    <span>
                      {recentOnboardedUser.emailDispatched
                        ? `Credentials email dispatched directly to ${recentOnboardedUser.user?.email} via Brevo.`
                        : `Credentials email queued for ${recentOnboardedUser.user?.email}.`}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleOnboardUser}>
                {/* Role Switcher Pill */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Account Persona / Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setOnboardRole('STUDENT')}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: onboardRole === 'STUDENT' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
                        backgroundColor: onboardRole === 'STUDENT' ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: onboardRole === 'STUDENT' ? '700' : '500',
                        color: onboardRole === 'STUDENT' ? 'var(--primary-blue)' : 'var(--text-main)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <GraduationCap size={16} />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnboardRole('FACULTY')}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: onboardRole === 'FACULTY' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
                        backgroundColor: onboardRole === 'FACULTY' ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: onboardRole === 'FACULTY' ? '700' : '500',
                        color: onboardRole === 'FACULTY' ? 'var(--primary-blue)' : 'var(--text-main)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Briefcase size={16} />
                      <span>Faculty Member</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    placeholder={onboardRole === 'STUDENT' ? 'e.g. Ramesh K' : 'e.g. Dr. Ramesh Kumar'}
                    className="form-input"
                    required
                  />
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">University Email Address</label>
                  <input
                    type="email"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder={onboardRole === 'STUDENT' ? 'e.g. ramesh.k@college.edu' : 'e.g. ramesh.kumar@college.edu'}
                    className="form-input"
                    required
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Login credentials will be automatically dispatched to this email address via Brevo.
                  </div>
                </div>

                {/* Roll / ID and Department */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">{onboardRole === 'STUDENT' ? 'Roll Number' : 'Faculty Employee ID'}</label>
                    <input
                      type="text"
                      value={onboardRoll}
                      onChange={(e) => setOnboardRoll(e.target.value)}
                      placeholder={onboardRole === 'STUDENT' ? 'e.g. 22CS088' : 'e.g. FAC008'}
                      className="form-input mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Department</label>
                    <select
                      value={onboardDept}
                      onChange={(e) => setOnboardDept(e.target.value)}
                      className="form-input"
                    >
                      <option value="CSE">Computer Science &amp; Engineering</option>
                      <option value="ECE">Electronics &amp; Communication</option>
                      <option value="IT">Information Technology</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="AIDS">Artificial Intelligence &amp; Data Science</option>
                      <option value="CSBS">Computer Science &amp; Business Systems</option>
                    </select>
                  </div>
                </div>

                {/* Semester (if Student) */}
                {onboardRole === 'STUDENT' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Current Academic Semester</label>
                    <select
                      value={onboardSemester}
                      onChange={(e) => setOnboardSemester(e.target.value)}
                      className="form-input"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password Configuration */}
                <div style={{ marginBottom: '22px', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #F8FAFC)', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={autoGenPassword}
                      onChange={(e) => setAutoGenPassword(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                    />
                    <span>Auto-generate cryptographically secure random password</span>
                  </label>
                  {!autoGenPassword && (
                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Custom Initial Password</label>
                      <input
                        type="text"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        placeholder="Enter custom password"
                        className="form-input mono"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={onboardingSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  {onboardingSubmitting ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px' }} />
                      <span>Provisioning Account &amp; Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Provision {onboardRole === 'STUDENT' ? 'Student' : 'Faculty'} Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Enrolled Users Directory & Status */}
          <div className="sis-card">
            <div className="sis-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3>University User Registry</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Showing {allUsersList.length} active students &amp; faculty across MongoDB Atlas Shards
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={userDirectoryRoleFilter}
                  onChange={(e) => setUserDirectoryRoleFilter(e.target.value)}
                  className="form-input"
                  style={{ width: '120px', fontSize: '12px', padding: '6px 10px' }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="FACULTY">Faculty</option>
                </select>
                <input
                  type="text"
                  placeholder="Search user..."
                  value={userDirectorySearch}
                  onChange={(e) => setUserDirectorySearch(e.target.value)}
                  className="form-input"
                  style={{ width: '180px', fontSize: '12px', padding: '6px 10px' }}
                />
              </div>
            </div>

            <div className="sis-card-body" style={{ padding: 0 }}>
              {allUsersList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found matching your search.
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-secondary)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>User</th>
                        <th style={{ padding: '10px 14px' }}>Role</th>
                        <th style={{ padding: '10px 14px' }}>Dept</th>
                        <th style={{ padding: '10px 14px' }}>Shard Node</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsersList.map((u, i) => (
                        <tr key={u.id || u.studentId || u.rollOrId || i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{u.displayName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              <span className="mono">{u.rollOrId}</span> &bull; {u.email}
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className={u.role === 'FACULTY' ? 'chip chip-purple' : 'chip chip-info'} style={{ fontSize: '10px' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontWeight: '500' }}>{u.department || 'CSE'}</span>
                            {u.semester ? <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> (S{u.semester})</span> : null}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className="chip chip-neutral mono" style={{ fontSize: '11px' }}>
                              {u.targetShard || u.assignedShard || 'sis_shard_0'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 1: COURSE CATALOG & CAPACITY MANAGEMENT ─── */}
      {activeTab === 'courses' && (
        <div className="sis-card animate-fade-in">
          <div className="sis-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>University Course Catalog & Capacity Control</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Real-time capacity tracking &bull; Faculty allocation &bull; Lifecycle management
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Search course code, title, faculty..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="form-input"
                style={{ width: '280px', fontSize: '13px' }}
              />
              <button
                onClick={() => openAssignModal(null)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', borderColor: '#0284C7', color: '#0284C7' }}
                title="Assign or reassign faculty instructor for courses"
              >
                <UserCheck size={15} />
                Assign Faculty
              </button>
              <button
                onClick={() => setShowNewCourseModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <PlusCircle size={15} />
                Create Course
              </button>
            </div>
          </div>

          <div className="sis-card-body" style={{ padding: 0 }}>
            {loadingCourses ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                Loading university course catalog...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No courses match your filter.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px' }}>Code</th>
                      <th style={{ padding: '12px 16px' }}>Title</th>
                      <th style={{ padding: '12px 16px' }}>Sem</th>
                      <th style={{ padding: '12px 16px' }}>Credits</th>
                      <th style={{ padding: '12px 16px' }}>Instructor</th>
                      <th style={{ padding: '12px 16px' }}>Schedule & Room</th>
                      <th style={{ padding: '12px 16px' }}>Enrolled / Capacity</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((c) => {
                      const isFull = (c.enrolled || 0) >= (c.capacity || 60);
                      return (
                        <tr key={c.code} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '700' }} className="mono">
                            {c.code}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-heading)' }}>
                            {c.title}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="chip chip-purple">Sem {c.semester}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{c.credits} Credits</td>
                          <td style={{ padding: '12px 16px', color: '#0284C7', fontWeight: '600' }}>
                            {c.instructor || 'Unassigned'}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                            <div>{c.schedule}</div>
                            <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{c.room || 'TBA'}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={isFull ? 'chip chip-danger' : 'chip chip-success'} style={{ fontWeight: '700' }}>
                              {c.enrolled || 0} / {c.capacity || 60}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => openAssignModal(c)}
                              className="btn btn-outline btn-sm"
                              style={{ marginRight: '6px' }}
                              title="Assign or reassign faculty instructor"
                            >
                              Assign Faculty
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCourse(c.code);
                                setNewSchedule(c.schedule || '');
                                setNewRoom(c.room || '');
                                setActiveTab('reschedule');
                              }}
                              className="btn btn-primary btn-sm"
                              title="Reschedule slot"
                            >
                              Reschedule
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: RESCHEDULE ENGINE ─── */}
      {activeTab === 'reschedule' && (
        <div className="admin-grid-two">
          {/* Left: Input Form */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Intelligent Course Rescheduling Engine</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Evicts student timetable caches and dispatches automated circular alerts via Consistent Hashing.
              </p>
            </div>
            <div className="sis-card-body">
              <form onSubmit={handleReschedule}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Target Academic Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleSelectCourse(e.target.value)}
                    className="form-input"
                  >
                    {courseList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} (Current: {c.schedule || 'TBA'}, Room: {c.room || 'No Room'})
                      </option>
                    ))}
                  </select>
                  {selectedCourse && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="chip chip-purple">{selectedCourse}</span>
                      <span>Current Venue: <strong>{courseList.find(c => c.code === selectedCourse)?.room || 'TBA'}</strong></span>
                      <span>•</span>
                      <span>Current Slot: <strong>{courseList.find(c => c.code === selectedCourse)?.schedule || 'TBA'}</strong></span>
                    </div>
                  )}
                </div>

                {/* 1. Quick Slot Presets Dropdown */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Standard College Timetable Slot (Quick Presets)</span>
                    <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '500' }}>Instant Schedule</span>
                  </label>
                  <select
                    value={STANDARD_SLOT_PRESETS.some(p => p.value === newSchedule) ? newSchedule : ''}
                    onChange={(e) => handleSelectSlotPreset(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: '500' }}
                  >
                    <option value="">-- Choose Standard Slot Preset --</option>
                    {STANDARD_SLOT_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Interactive Period & Day Builder */}
                <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-secondary, #F8FAFC)', border: '1px solid var(--border, #E2E8F0)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '600', margin: 0 }}>
                      2. Or Select Days & Class Period
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setDayPattern(['Mon', 'Wed'])}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
                      >
                        Mon & Wed
                      </button>
                      <button
                        type="button"
                        onClick={() => setDayPattern(['Tue', 'Thu'])}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
                      >
                        Tue & Thu
                      </button>
                      <button
                        type="button"
                        onClick={() => setDayPattern(['Mon', 'Wed', 'Fri'])}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
                      >
                        MWF
                      </button>
                      <button
                        type="button"
                        onClick={() => setDayPattern(['Fri'])}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
                      >
                        Fri Only
                      </button>
                    </div>
                  </div>

                  {/* Day Pills */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
                      const isSel = selectedDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: isSel ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#0284C7' : '#FFFFFF',
                            color: isSel ? '#FFFFFF' : 'var(--text-heading)',
                            fontWeight: isSel ? '700' : '500',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSel && <CheckCircle size={12} />}
                          {d}
                        </button>
                      );
                    })}
                  </div>

                  {/* Period Selection */}
                  <div>
                    <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Select Time Period:
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      className="form-input"
                    >
                      {STANDARD_PERIODS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Generated Slot Preview */}
                  <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '500' }}>
                      Selected Slot: <code style={{ fontWeight: '700', color: '#1D4ED8' }}>{newSchedule || 'Select days and period'}</code>
                    </span>
                    <span className="chip chip-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Room Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>New Lecture Hall / Lab Room</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                    <select
                      value={STANDARD_ROOMS.some(r => r.id === newRoom) ? newRoom : ''}
                      onChange={(e) => {
                        if (e.target.value) setNewRoom(e.target.value);
                      }}
                      className="form-input"
                    >
                      <option value="">-- Select Campus Hall / Room --</option>
                      {STANDARD_ROOMS.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      placeholder="or Custom Room..."
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Reason Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Official Rescheduling Justification / Circular Reason</label>
                  <select
                    value={RESCHEDULE_REASONS.includes(reason) ? reason : ''}
                    onChange={(e) => {
                      if (e.target.value) setReason(e.target.value);
                    }}
                    className="form-input"
                    style={{ marginBottom: '8px' }}
                  >
                    <option value="">-- Choose Standard Circular Reason --</option>
                    {RESCHEDULE_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-input"
                    rows={2}
                    placeholder="Official circular reason for students and faculty..."
                    required
                  />
                </div>

                {conflictWarning && (
                  <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertTriangle size={16} />
                    <span>{conflictWarning}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleCheckConflict}
                    disabled={checkingConflict}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    {checkingConflict ? 'Checking Collisions...' : 'Check Slot Collisions'}
                  </button>

                  <button
                    type="submit"
                    disabled={loadingReschedule}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {loadingReschedule ? 'Executing Reschedule...' : 'Commit & Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Reschedule Engine Pipeline Status */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Reschedule Engine Pipeline Telemetry</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Verification of Redis cache evictions, Short URLs, and live broadcast events.
              </p>
            </div>
            <div className="sis-card-body">
              {rescheduleResult ? (
                <div style={styles.resultBox} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--success)' }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: '600' }}>Schedule Mutation Committed Successfully</span>
                  </div>

                  <div style={styles.step}>
                    <Layers size={16} color="var(--primary-blue)" />
                    <div>
                      <strong>Database Shard State:</strong>
                      <p style={styles.stepDesc}>
                        Course document updated in MongoDB. Slot: <code>{rescheduleResult.newSchedule}</code>.
                      </p>
                    </div>
                  </div>

                  <div style={styles.step}>
                    <Clock size={16} color="var(--primary-blue)" />
                    <div>
                      <strong>Redis Key-Value Cache Eviction:</strong>
                      <p style={styles.stepDesc}>
                        Evicted cached timetables for {rescheduleResult.invalidatedStudentCaches || 0} enrolled students. Fresh loads read from MongoDB.
                      </p>
                    </div>
                  </div>

                  <div style={styles.step}>
                    <Send size={16} color="var(--primary-blue)" />
                    <div>
                      <strong>Academic Notice & Short URL Broadcast:</strong>
                      <p style={styles.stepDesc}>
                        Circular emitted via SSE. Short URL: <code>{rescheduleResult.shortUrl || 'Auto-generated Base62'}</code>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <Clock size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: '500', color: 'var(--text-heading)', margin: 0 }}>
                    Awaiting Schedule Change
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Select a course, enter the new slot and room, and execute the reschedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: STUDENT OVERRIDES & ADMISSIONS ─── */}
      {activeTab === 'students' && (
        <div className="admin-grid-two">
          {/* Left: Registered Students Directory */}
          <div className="sis-card">
            <div className="sis-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Student Academic Directory</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                  Select a student to inspect their enrolled courses or execute direct administrative enrollments.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search name, roll no..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="form-input"
                style={{ width: '180px', fontSize: '12px' }}
              />
            </div>
            <div className="sis-card-body" style={{ padding: 0, maxHeight: '520px', overflowY: 'auto' }}>
              {loadingStudents ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No students found.
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudentForEnroll && (selectedStudentForEnroll.studentId === s.studentId || selectedStudentForEnroll.id === s.id);
                  return (
                    <div
                      key={s.studentId || s.id || s.rollNumber}
                      onClick={() => handleSelectStudent(s)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-heading)' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span className="mono" style={{ fontWeight: '600' }}>{s.rollNumber}</span> &bull; {s.department} &bull; Sem {s.semester}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="chip chip-purple" style={{ fontSize: '11px' }}>
                          Shard: {s.targetShard || 'sis_shard_1'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Student Enrollments & Direct Override Form */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Administrative Override & Enrollment Manager</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Direct course assignment and seat override bypassing client prerequisites.
              </p>
            </div>
            <div className="sis-card-body">
              {selectedStudentForEnroll ? (
                <div>
                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-heading)' }}>
                          {selectedStudentForEnroll.name}
                        </span>
                        <span className="mono" style={{ marginLeft: '8px', fontSize: '13px', color: '#0284C7', fontWeight: '700' }}>
                          ({selectedStudentForEnroll.rollNumber})
                        </span>
                      </div>
                      <span className="chip chip-info">Semester {selectedStudentForEnroll.semester}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Email: {selectedStudentForEnroll.email} &bull; Shard: {selectedStudentForEnroll.targetShard || 'sis_shard_1'}
                    </div>
                  </div>

                  {/* Active Enrollments */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px' }}>
                      Currently Enrolled Courses ({studentActiveEnrollments.length})
                    </div>
                    {studentActiveEnrollments.length === 0 ? (
                      <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-secondary)', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Student is not currently enrolled in any course.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {studentActiveEnrollments.map((en) => (
                          <div
                            key={en.courseCode}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <div>
                              <span className="mono" style={{ fontWeight: '700', fontSize: '13px', marginRight: '8px' }}>
                                {en.courseCode}
                              </span>
                              <span style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                                {en.courseTitle}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAdminDropStudent(en.courseCode)}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '4px 8px', fontSize: '11px' }}
                            >
                              Drop Enrollment
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Direct Override Enroll Form */}
                  <form onSubmit={handleAdminEnrollStudent} style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '8px' }}>
                      Direct Course Override Enrollment
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={studentEnrollCourseCode}
                        onChange={(e) => setStudentEnrollCourseCode(e.target.value)}
                        className="form-input"
                        style={{ flex: 1, fontSize: '13px' }}
                        required
                      >
                        <option value="">-- Select Course to Enroll --</option>
                        {courseList.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.title} (Sem {c.semester}, Enrolled: {c.enrolled || 0}/{c.capacity})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={enrollingStudent || !studentEnrollCourseCode}
                        className="btn btn-primary"
                        style={{ fontSize: '13px' }}
                      >
                        {enrollingStudent ? 'Enrolling...' : 'Enroll Student'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <Users size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: '500', color: 'var(--text-heading)', margin: 0 }}>
                    Select a Student from the Directory
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Click any student on the left to inspect their courses and perform administrative overrides.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: FACULTY ALLOCATION & ONBOARDING ─── */}
      {activeTab === 'faculty' && (
        <div className="admin-grid-two">
          {/* Left: Onboard Faculty Member */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Onboard New Academic Faculty Member</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Generates Twitter Snowflake ID and assigns physical shard node via Consistent Hash Ring.
              </p>
            </div>
            <div className="sis-card-body">
              <form onSubmit={handleOnboardFaculty}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Full Name & Title</label>
                  <input
                    type="text"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Official University Email</label>
                  <input
                    type="email"
                    value={facEmail}
                    onChange={(e) => setFacEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@college.edu"
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Faculty Employee ID</label>
                    <input
                      type="text"
                      value={facRoll}
                      onChange={(e) => setFacRoll(e.target.value)}
                      placeholder="e.g. FAC003"
                      className="form-input mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Department</label>
                    <select
                      value={facDept}
                      onChange={(e) => setFacDept(e.target.value)}
                      className="form-input"
                    >
                      <option value="CSE">Computer Science & Engineering</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="IT">Information Technology</option>
                      <option value="MECH">Mechanical Engineering</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label">Initial Password</label>
                  <input
                    type="text"
                    value={facPass}
                    onChange={(e) => setFacPass(e.target.value)}
                    className="form-input mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={facSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <UserPlus size={16} />
                  {facSubmitting ? 'Onboarding & Routing Shards...' : 'Provision Faculty Account'}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Registered Faculty Members List */}
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Registered Faculty Body ({facultyList.length})</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Active faculty members eligible for course assignment across department courses.
              </p>
            </div>
            <div className="sis-card-body" style={{ padding: 0 }}>
              {loadingFaculty ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading faculty list...
                </div>
              ) : facultyList.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No faculty records found.
                </div>
              ) : (
                facultyList.map((f) => (
                  <div
                    key={f.id || f.rollNumber}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-heading)' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span className="mono" style={{ fontWeight: '600' }}>{f.rollNumber}</span> &bull; {f.email} &bull; {f.department}
                      </div>
                    </div>
                    <span className="chip chip-info" style={{ fontSize: '11px' }}>
                      Shard: {f.targetShard || 'sis_shard_1'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: ATTENDANCE DEBARMENT AUDIT ─── */}
      {activeTab === 'debarred' && (
        <div className="sis-card animate-fade-in">
          <div className="sis-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>University Debarment Audit (&lt;75% Attendance Threshold)</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Dynamic detection of students barred from semester examinations based on active course attendance records.
              </p>
            </div>
            <button
              onClick={loadDebarred}
              disabled={loadingDebarred}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={loadingDebarred ? 'animate-spin' : ''} />
              Re-audit Database
            </button>
          </div>

          <div className="sis-card-body" style={{ padding: 0 }}>
            {loadingDebarred ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                Running live debarment compliance check across shards...
              </div>
            ) : debarredStudents.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: '600', color: 'var(--text-heading)', margin: 0 }}>
                  Zero Debarred Students
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  All registered students are currently meeting the 75% attendance threshold.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px' }}>Roll Number</th>
                      <th style={{ padding: '12px 16px' }}>Student Name</th>
                      <th style={{ padding: '12px 16px' }}>Flagged Course</th>
                      <th style={{ padding: '12px 16px' }}>Attendance %</th>
                      <th style={{ padding: '12px 16px' }}>Attended / Total</th>
                      <th style={{ padding: '12px 16px' }}>Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debarredStudents.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#FEF2F2' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700' }} className="mono">
                          {s.rollNumber || s.studentRollNumber || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-heading)' }}>
                          {s.name || s.studentName || 'Student Record'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0284C7' }}>
                          {s.courseCode || 'All Enrolled Courses'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#DC2626' }}>
                          {s.attendancePercentage ? `${s.attendancePercentage.toFixed(1)}%` : '< 75.0%'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          {s.classesAttended || 0} / {s.totalClasses || 30} Lectures
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="chip chip-danger" style={{ fontWeight: '700' }}>
                            Debarred from Exam
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: BROADCAST OFFICIAL CIRCULAR ─── */}
      {activeTab === 'broadcast' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="sis-card">
            <div className="sis-card-header">
              <h3>Broadcast Official University Circular</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Publishes an official announcement with an automated Base62 Short URL and emits a live SSE alert to all connected students and faculty.
              </p>
            </div>
            <div className="sis-card-body">
              <form onSubmit={handlePublishNotice}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Circular Title</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Schedule for End-Semester Practical Examinations (Fall 2026)"
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Notice Category</label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value)}
                      className="form-input"
                    >
                      <option value="CIRCULAR">Official Academic Circular</option>
                      <option value="EXAMINATION">Examination Schedule</option>
                      <option value="INTERNSHIP">Internship & Placement</option>
                      <option value="HACKATHON">TechFest & Competitions</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">External Reference Link (Optional)</label>
                    <input
                      type="url"
                      value={noticeExternalUrl}
                      onChange={(e) => setNoticeExternalUrl(e.target.value)}
                      placeholder="e.g. https://college.edu/circulars/fall-exam.pdf"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label">Circular Content / Detailed Announcement</label>
                  <textarea
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="form-input"
                    rows={5}
                    placeholder="Enter full notice body to be stored in MongoDB and indexed by the search system..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishingNotice}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '42px', fontSize: '14px' }}
                >
                  <Megaphone size={16} />
                  {publishingNotice ? 'Publishing & Shortening URL...' : 'Publish & Broadcast Circular'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ASSIGN / REASSIGN FACULTY ─── */}
      {/* ─── MODAL: ASSIGN FACULTY ─── */}
      {showAssignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="animate-scale-in">
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-heading)' }}>
                  Assign Faculty Instructor
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Select an academic course and choose from existing faculty instructors.
                </span>
              </div>
              <button onClick={() => setShowAssignModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignFacultySubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Select Academic Course</label>
                <select
                  value={assignCourseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setAssignCourseCode(code);
                    const found = courseList.find((c) => c.code === code);
                    if (found) {
                      setAssignFacultyName(found.instructor || '');
                      setAssignFacultyId(found.facultyId || '');
                      setAssignRoom(found.room || 'LH-101');
                      setAssignSchedule(found.schedule || 'Mon 09:00-10:30, Wed 09:00-10:30');
                    }
                  }}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Course to Assign Faculty --</option>
                  {courseList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title} (Current: {c.instructor || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Select Existing Faculty Member</label>
                <select
                  value={assignFacultyName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setAssignFacultyName(name);
                    const found = allAvailableFaculty.find((f) => f.name === name);
                    if (found) {
                      setAssignFacultyId(found.rollNumber);
                    }
                  }}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Existing Faculty --</option>
                  {allAvailableFaculty.map((f) => (
                    <option key={f.rollNumber + f.name} value={f.name}>
                      {f.name} ({f.rollNumber} • {f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Designated Lecture Hall / Room</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                  <select
                    value={STANDARD_ROOMS.some(r => r.id === assignRoom) ? assignRoom : ''}
                    onChange={(e) => {
                      if (e.target.value) setAssignRoom(e.target.value);
                    }}
                    className="form-input"
                  >
                    <option value="">-- Standard Venues --</option>
                    {STANDARD_ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={assignRoom}
                    onChange={(e) => setAssignRoom(e.target.value)}
                    placeholder="or type Room..."
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Weekly Schedule Slot</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={STANDARD_SLOT_PRESETS.some(p => p.value === assignSchedule) ? assignSchedule : ''}
                    onChange={(e) => {
                      if (e.target.value) setAssignSchedule(e.target.value);
                    }}
                    className="form-input"
                  >
                    <option value="">-- Standard Slot Presets --</option>
                    {STANDARD_SLOT_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={assignSchedule}
                    onChange={(e) => setAssignSchedule(e.target.value)}
                    placeholder="e.g. Mon 09:00-10:30, Wed 09:00-10:30"
                    className="form-input mono"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningFaculty}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {assigningFaculty ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE NEW COURSE ─── */}
      {showNewCourseModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '650px' }} className="animate-scale-in">
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-heading)' }}>
                  Create New Academic Course
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Adds course to MongoDB catalog and indexes prefix tokens into Trie Autocomplete.
                </span>
              </div>
              <button onClick={() => setShowNewCourseModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS601"
                    className="form-input mono"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="e.g. Deep Reinforcement Learning"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Semester</label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({ ...newCourse, semester: parseInt(e.target.value, 10) })}
                    className="form-input"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value, 10) })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Seat Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, capacity: parseInt(e.target.value, 10) })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Instructor</label>
                  <select
                    value={newCourse.instructor}
                    onChange={(e) => {
                      const found = facultyList.find((f) => f.name === e.target.value);
                      setNewCourse({
                        ...newCourse,
                        instructor: e.target.value,
                        facultyId: found ? found.rollNumber || found.id : 'FAC001',
                      });
                    }}
                    className="form-input"
                  >
                    {facultyList.map((f) => (
                      <option key={f.rollNumber || f.id} value={f.name}>
                        {f.name} ({f.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Room</label>
                  <input
                    type="text"
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    placeholder="LH-101"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Schedule Slot</label>
                <input
                  type="text"
                  value={newCourse.schedule}
                  onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                  placeholder="Mon 09:00-10:30, Wed 09:00-10:30"
                  className="form-input mono"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {creatingCourse ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
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
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
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
    flexWrap: 'wrap',
    gap: '2px',
  },
  tabBtn: {
    padding: '8px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'var(--bg-surface)',
    color: '#0284C7',
    fontWeight: '700',
    boxShadow: 'var(--shadow-small-btn)',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 1fr',
    gap: '24px',
  },
  resultBox: {
    padding: '16px',
    borderRadius: '10px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
  },
  step: {
    display: 'flex',
    gap: '12px',
    marginBottom: '14px',
    fontSize: '13px',
  },
  stepDesc: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
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
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid #E2E8F0',
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
};
