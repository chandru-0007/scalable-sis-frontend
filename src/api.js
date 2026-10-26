/**
 * Central API Client for Scalable Student Information System.
 * Connects directly to Spring Boot backend via /api proxy.
 */

const BASE_URL = '';

function getHeaders() {
  const token = localStorage.getItem('sis_session_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['X-Session-Token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const config = {
    headers: getHeaders(),
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = (typeof data === 'object' && data.message) ? data.message : (data || `HTTP ${res.status}`);
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // ─── Authentication & Session ───
  auth: {
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/api/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/api/auth/me'),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
  },

  // ─── Students & Profiles ───
  students: {
    getProfile: (id) => request(`/api/students/${id}`),
    updateProfile: (id, updates) => request(`/api/students/${id}`, { method: 'PUT', body: updates }),
    updateProfilePicture: (id, profilePicture) => request(`/api/students/${id}/profile-picture`, {
      method: 'PUT',
      body: { profilePicture },
    }),
    list: (limit = 50) => request(`/api/students?limit=${limit}`),
    getTimetable: (id) => request(`/api/students/${id}/timetable`),
    getEnrollments: (id) => request(`/api/students/${id}/enrollments`),
    getResults: (id) => request(`/api/students/${id}/results`),
  },

  // ─── Courses & Autocomplete ───
  courses: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/courses${q ? `?${q}` : ''}`);
    },
    suggest: (query) => request(`/api/search/suggest?query=${encodeURIComponent(query)}`),
    enroll: (studentId, courseCode) => request('/api/courses/enroll', {
      method: 'POST',
      body: { studentId, courseCode },
    }),
    unenroll: (studentId, courseCode) => request('/api/courses/enroll', {
      method: 'DELETE',
      body: { studentId, courseCode },
    }),
  },

  // ─── System Design Monitor & Metrics ───
  system: {
    getMetrics: () => request('/api/system/metrics'),
    getHashRing: (key = '') => request(`/api/system/hash-ring${key ? `?key=${encodeURIComponent(key)}` : ''}`),
    addShard: (shard) => request(`/api/system/shards/add?shard=${encodeURIComponent(shard)}`, { method: 'POST' }),
    removeShard: (shard) => request(`/api/system/shards/remove?shard=${encodeURIComponent(shard)}`, { method: 'POST' }),
    drainRemoveShard: (shard) => request(`/api/system/shards/drain-remove?shard=${encodeURIComponent(shard)}`, { method: 'POST' }),
    rebalanceShards: () => request('/api/system/shards/rebalance', { method: 'POST' }),
    generateSnowflakeIds: (count = 5) => request(`/api/id/generate?count=${count}`),
    runBenchmark: (workload = 'MEDIUM') => request(`/api/system/benchmark/run?workload=${encodeURIComponent(workload)}`, { method: 'POST' }),
    simulateFailure: (scenario = 'SHARD_FAILOVER') => request(`/api/system/benchmark/simulate-failure?scenario=${encodeURIComponent(scenario)}`, { method: 'POST' }),
  },

  // ─── Academic Notices, Web Crawler & URL Shortener ───
  notices: {
    getAll: (dept = '') => request(`/api/notices${dept ? `?department=${encodeURIComponent(dept)}` : ''}`),
    getInternships: (dept = '') => request(`/api/notices/internships${dept ? `?department=${encodeURIComponent(dept)}` : ''}`),
    triggerCrawl: (dept = '') => request(`/api/notices/crawl${dept ? `?department=${encodeURIComponent(dept)}` : ''}`, { method: 'POST' }),
    shortenUrl: (originalUrl) => request('/api/url/shorten', { method: 'POST', body: { url: originalUrl, originalUrl } }),
  },

  // ─── Base62 URL Shortener ───
  url: {
    shorten: (url) => request('/api/url/shorten', { method: 'POST', body: { url, originalUrl: url } }),
  },

  // ─── Faculty Portal ───
  faculty: {
    getCourses: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/faculty/courses${q ? `?${q}` : ''}`);
    },
    getRoster: (courseCode) => request(`/api/faculty/courses/${courseCode}/roster`),
    markAttendance: (courseCode, attendanceList) => request(`/api/faculty/courses/${courseCode}/attendance`, {
      method: 'POST',
      body: attendanceList,
    }),
    submitGrade: (courseCode, enrollmentId, grade, gradePoint, marks = null, remarks = null) => {
      const payload = { enrollmentId, grade, gradePoint: gradePoint || 0.0 };
      if (marks !== null) payload.marks = marks;
      if (remarks) payload.remarks = remarks;
      return request(`/api/faculty/courses/${courseCode}/grades`, {
        method: 'PUT',
        body: payload,
      });
    },
    publishCourseResults: (courseCode, grades = [], facultyName = '') => request(
      `/api/faculty/courses/${encodeURIComponent(courseCode)}/publish-results`,
      {
        method: 'POST',
        body: { grades, facultyName },
      }
    ),
    postAnnouncement: (courseCode, title, content, author) => request(
      `/api/faculty/announcements?courseCode=${encodeURIComponent(courseCode)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&author=${encodeURIComponent(author)}`,
      { method: 'POST' }
    ),
  },

  // ─── Assignments & Continuous Assessment ───
  assignments: {
    getAllForStudent: (studentId) => request(`/api/assignments/student/${encodeURIComponent(studentId)}`),
    getByCourse: (courseCode) => request(`/api/assignments/course/${encodeURIComponent(courseCode)}`),
    create: (data) => request('/api/assignments', { method: 'POST', body: data }),
    submit: (assignmentId, data) => request(`/api/assignments/${encodeURIComponent(assignmentId)}/submit`, {
      method: 'POST',
      body: data,
    }),
    getSubmissions: (assignmentId) => request(`/api/assignments/${encodeURIComponent(assignmentId)}/submissions`),
    evaluate: (assignmentId, data) => request(`/api/assignments/${encodeURIComponent(assignmentId)}/evaluate`, {
      method: 'POST',
      body: data,
    }),
    delete: (assignmentId) => request(`/api/assignments/${encodeURIComponent(assignmentId)}`, { method: 'DELETE' }),
  },

  // ─── Official Published Results & Transcripts ───
  results: {
    getStudentResults: (studentId) => request(`/api/students/${encodeURIComponent(studentId)}/results`),
    publishCourseResults: (courseCode, grades, facultyName) => request(
      `/api/faculty/courses/${encodeURIComponent(courseCode)}/publish-results`,
      {
        method: 'POST',
        body: { grades, facultyName },
      }
    ),
  },

  // ─── Academic Admin / Registrar Portal ───
  admin: {
    getAllCourses: () => request('/api/admin/courses'),
    getFacultyList: () => request('/api/admin/faculty'),
    getFacultyWorkload: () => request('/api/admin/faculty/workload'),
    onboardFaculty: (data) => request('/api/admin/faculty', { method: 'POST', body: data }),
    assignFacultyToCourse: (code, payload) => request(`/api/admin/courses/${code}/assign-faculty`, {
      method: 'PUT',
      body: payload,
    }),
    rescheduleCourse: (code, payload) => request(`/api/admin/courses/${code}/reschedule`, {
      method: 'PUT',
      body: payload,
    }),
    checkScheduleConflict: (payload) => request('/api/admin/courses/check-schedule-conflict', {
      method: 'POST',
      body: payload,
    }),
    createCourse: (data) => request('/api/admin/courses', { method: 'POST', body: data }),
    updateCapacity: (code, capacity) => request(`/api/admin/courses/${code}/capacity?capacity=${capacity}`, { method: 'PUT' }),
    deleteCourse: (code) => request(`/api/admin/courses/${code}`, { method: 'DELETE' }),
    getStudents: (limit = 100) => request(`/api/students?limit=${limit}`),
    enrollStudent: (studentId, courseCode) => request('/api/admin/students/enroll', {
      method: 'POST',
      body: { studentId, courseCode },
    }),
    dropStudent: (studentId, courseCode) => request('/api/admin/students/enroll', {
      method: 'DELETE',
      body: { studentId, courseCode },
    }),
    getDebarredStudents: () => request('/api/admin/attendance/debarred-report'),
    getOverview: () => request('/api/admin/overview'),
    publishNotice: (payload) => request('/api/admin/notices', {
      method: 'POST',
      body: payload,
    }),
  },

  // ─── Parent Portal ───
  parent: {
    getStudentReport: (rollNumber) => request(`/api/parent/student/${encodeURIComponent(rollNumber)}`),
  },

  // ─── Real-Time Cluster Event Stream & Live Telemetry ───
  realtime: {
    subscribe: (onEvent, onError) => {
      try {
        const eventSource = new EventSource('/api/realtime/stream');
        eventSource.onmessage = (e) => {
          try { onEvent(JSON.parse(e.data)); } catch (err) { onEvent({ data: e.data }); }
        };
        const eventTypes = [
          'CONNECTED', 'TELEMETRY', 'ENROLLMENT', 'RESCHEDULE',
          'ATTENDANCE_MARKED', 'GRADE_SUBMITTED', 'SHARD_CHANGE', 'TRAFFIC_BURST'
        ];
        eventTypes.forEach((type) => {
          eventSource.addEventListener(type, (e) => {
            try {
              const parsed = JSON.parse(e.data);
              onEvent({ eventType: type, ...parsed });
            } catch (err) {
              onEvent({ eventType: type, message: e.data });
            }
          });
        });
        if (onError) eventSource.onerror = onError;
        return eventSource;
      } catch (err) {
        console.warn('SSE fallback:', err);
        return null;
      }
    },
    simulateTraffic: (requests = 15) => request(`/api/realtime/simulate-traffic?requests=${requests}`, { method: 'POST' }),
    getStatus: () => request('/api/realtime/status'),
  },
};
