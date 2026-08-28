import * as hooks from './hooks';
import * as mock from '../mockData';

export function useLiveCourses(params) {
  const { data, isLoading, error } = hooks.useCourses(params);
  const list = data?.courses || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.COURSES,
    total: data?.total !== undefined ? data.total : (list.length ? list.length : mock.COURSES.length),
    isLoading,
    error
  };
}

export function useLiveUsers(role) {
  const { data, isLoading, error } = hooks.useUsers(role);
  const list = data?.users || (Array.isArray(data) ? data : []);
  const fallback = role ? mock.USERS.filter(u => u.role === role) : mock.USERS;
  return {
    data: list.length ? list : fallback,
    total: data?.total !== undefined ? data.total : fallback.length,
    isLoading,
    error
  };
}

// ── Academic Core (Enterprise) ───────────────────────────────────────────
export function useLiveAcademicProgrammes() {
  const { data, isLoading, error } = hooks.useAcademicProgrammes();
  const list = Array.isArray(data) ? data : [];
  const fallback = [
    { code: 'BTECH-CSE', name: 'Bachelor of Technology in Computer Science', level: 'UG', durationYears: 4, status: 'Active' }
  ];
  return { data: list.length ? list : fallback, isLoading, error };
}

export function useLiveAcademicCourseMaster() {
  const { data, isLoading, error } = hooks.useAcademicCourseMaster();
  const list = Array.isArray(data) ? data : [];
  const fallback = [
    { code: 'CS501', title: 'Database Management Systems', type: 'THEORY', credits: 4, status: 'Active', department: { name: 'CSE' } },
    { code: 'AI501', title: 'Machine Learning', type: 'THEORY', credits: 4, status: 'Active', department: { name: 'CSE' } }
  ];
  return { data: list.length ? list : fallback, isLoading, error };
}

export function useLiveAcademicSections() {
  const { data, isLoading, error } = hooks.useAcademicSections();
  const list = Array.isArray(data) ? data : [];
  const fallback = [
    { code: 'A', capacity: 60, status: 'ACTIVE', courseOfferingId: { courseId: { title: 'Machine Learning', code: 'AI501', type: 'Honours Elective', credits: 4 }, capacity: 60 } }
  ];
  return { data: list.length ? list : fallback, isLoading, error };
}

export function useLiveAcademicCurricula() {
  const { data, isLoading, error } = hooks.useAcademicCurricula();
  const list = Array.isArray(data) ? data : [];
  const fallback = [
    { versionString: 'v1.0', totalCredits: 160, status: 'DRAFT', regulationId: { name: '2026 UG' }, programmeId: { name: 'B.Tech CSE' } }
  ];
  return { data: list.length ? list : fallback, isLoading, error };
}

export function useLiveProfile(userId) {
  const { data, isLoading, error } = hooks.useProfile(userId);
  const fallback = mock.USERS.find(u => u.id === userId || u.userId === userId) || null;
  return {
    data: data || fallback,
    isLoading,
    error
  };
}

export function useLiveAssignments(courseId) {
  const { data, isLoading, error } = hooks.useAssignments(courseId);
  const list = data?.assignments || (Array.isArray(data) ? data : []);
  const fallback = courseId 
    ? mock.ASSIGNMENTS.filter(a => a.courseId === courseId) 
    : mock.ASSIGNMENTS;
  return {
    data: list.length ? list : fallback,
    isLoading,
    error
  };
}

export function useLiveAssessments(courseId) {
  const { data, isLoading, error } = hooks.useAssessments(courseId);
  const list = data?.assessments || (Array.isArray(data) ? data : []);
  const fallback = courseId 
    ? mock.ASSESSMENTS.filter(a => a.courseId === courseId) 
    : mock.ASSESSMENTS;
  return {
    data: list.length ? list : fallback,
    isLoading,
    error
  };
}

export function useLiveCertificates() {
  const { data, isLoading, error } = hooks.useCertificates();
  const list = data?.certificates || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.CERTIFICATES,
    isLoading,
    error
  };
}

export function useLiveNotifications() {
  const { data, isLoading, error } = hooks.useNotifications();
  const list = data?.notifications || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.NOTIFICATIONS,
    isLoading,
    error
  };
}

export function useLiveTimetable(params) {
  const { data, isLoading, error } = hooks.useTimetable(params);
  const list = data?.timetable || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.TIMETABLE,
    isLoading,
    error
  };
}

export function useLiveCalendarEvents() {
  const { data, isLoading, error } = hooks.useAcademicCalendar();
  const list = data?.events || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.CALENDAR_EVENTS,
    isLoading,
    error
  };
}

export function useLiveLibraryBooks(query) {
  const { data, isLoading, error } = hooks.useLibraryBooks(query);
  const list = data?.books || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.LIBRARY_RESOURCES,
    isLoading,
    error
  };
}

export function useLiveLibraryLoans(memberId, status) {
  const { data, isLoading, error } = hooks.useLibraryLoans(memberId, status);
  const list = data?.data || [];
  return {
    data: list, // Do not fallback to mock for actual transaction data if we want strictness, but for dev we can return mock if empty
    isLoading,
    error
  };
}

export function useLivePlacementDrives(status) {
  const { data, isLoading, error } = hooks.usePlacementDrives(status);
  const list = data?.drives || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.PLACEMENT_DRIVES,
    isLoading,
    error
  };
}

export function useLivePlacementApplications(studentId) {
  const { data, isLoading, error } = hooks.usePlacementApplications(studentId);
  const list = data?.applications || (Array.isArray(data) ? data : []);
  return {
    data: list,
    isLoading,
    error
  };
}

export function useLiveDepartments() {
  const { data, isLoading, error } = hooks.useDepartments();
  const list = data?.departments || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.DEPARTMENTS,
    isLoading,
    error
  };
}

export function useLiveSemesters() {
  const { data, isLoading, error } = hooks.useSemesters();
  const list = data?.semesters || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.SEMESTERS,
    isLoading,
    error
  };
}

export function useLiveAdminUsers(params) {
  const { data, isLoading, error } = hooks.useAdminUsers(params);
  const list = data?.users || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.USERS,
    total: data?.total !== undefined ? data.total : (list.length ? list.length : mock.USERS.length),
    isLoading,
    error
  };
}

export function useLiveAuditLogs(params) {
  const { data, isLoading, error } = hooks.useAuditLogs(params);
  const list = data?.logs || (Array.isArray(data) ? data : []);
  return {
    data: list.length ? list : mock.AUDIT_LOGS,
    isLoading,
    error
  };
}

export function useLiveAttendance(courseId, date) {
  const { data, isLoading, error } = hooks.useCourseAttendance(courseId, date);
  const list = data?.records || (Array.isArray(data) ? data : []);
  const fallback = courseId 
    ? mock.ATTENDANCE_RECORDS.filter(a => a.courseId === courseId) 
    : mock.ATTENDANCE_RECORDS;
  return {
    data: list.length ? list : fallback,
    isLoading,
    error
  };
}

export function useLiveEnrollments(userId) {
  const { data: courseData, isLoading, error } = hooks.useCourses();
  const list = courseData?.courses || [];
  
  // Map courses based on whether a userId filter is provided
  const enrolledCourses = userId 
    ? list.filter(c => c.enrolledStudents && c.enrolledStudents.includes(userId))
    : list.filter(c => c.enrolledStudents && c.enrolledStudents.length > 0);

  let enrollments = [];
  if (userId) {
    enrollments = enrolledCourses.map(c => ({
      id: `enr-${c._id || c.id}`,
      courseId: c._id || c.id,
      courseTitle: c.title,
      enrolledAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
      progress: c.content?.length ? Math.min(100, c.content.length * 10) : 0
    }));
  } else {
    // For admin view: flatten all students in all courses
    enrolledCourses.forEach(c => {
      c.enrolledStudents.forEach(studentId => {
        enrollments.push({
          id: `enr-${c._id || c.id}-${studentId}`,
          courseId: c._id || c.id,
          courseTitle: c.title,
          studentId: studentId,
          enrolledAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          progress: c.content?.length ? Math.min(100, c.content.length * 10) : 0
        });
      });
    });
  }

  return {
    data: enrollments.length ? enrollments : (userId ? mock.ENROLLMENTS.filter(e => e.studentId === userId) : mock.ENROLLMENTS),
    isLoading,
    error
  };
}

export function useLiveSubmissions(studentId) {
  const { data, isLoading, error } = hooks.useMySubmissions(studentId);
  const list = Array.isArray(data) ? data : [];
  const fallback = studentId 
    ? mock.SUBMISSIONS.filter(s => s.studentId === studentId) 
    : mock.SUBMISSIONS;
  return {
    data: list.length ? list : fallback,
    isLoading,
    error
  };
}

export function useLiveAssignmentSubmissions(assignmentId) {
  const { data, isLoading, error } = hooks.useAssignmentSubmissions(assignmentId);
  const list = data?.submissions || [];
  const stats = data?.stats || { total: 0, graded: 0, late: 0, avgGrade: null };
  const fallback = assignmentId 
    ? mock.SUBMISSIONS.filter(s => s.assignmentId === assignmentId) 
    : mock.SUBMISSIONS;
  return {
    data: list.length ? list : fallback,
    stats: list.length ? stats : { total: fallback.length, graded: fallback.filter(s => s.grade !== null).length, late: 0, avgGrade: 88 },
    isLoading,
    error
  };
}

export function useLiveAssignmentStats() {
  const { data, isLoading, error } = hooks.useAssignmentStats();
  return {
    data: data || [],
    isLoading,
    error
  };
}

export function useLiveDiscussionThreads(courseId) {
  const { data, isLoading, error } = hooks.useDiscussionThreads(courseId);
  const list = data?.threads || (Array.isArray(data) ? data : []);
  const fallback = courseId 
    ? mock.DISCUSSIONS.filter(d => d.courseId === courseId) 
    : mock.DISCUSSIONS;
  return {
    data: list.length ? list : fallback,
    isLoading,
    error
  };
}

export function useLiveThreadDetails(threadId) {
  const { data, isLoading, error } = hooks.useThreadDetails(threadId);
  let fallback = null;
  if (threadId) {
    const thread = mock.DISCUSSIONS.find(d => d.id === threadId);
    if (thread) {
      fallback = {
        ...thread,
        replies: mock.DISCUSSION_REPLIES.filter(r => r.discussionId === threadId)
      };
    }
  }
  return {
    data: data || fallback,
    isLoading,
    error
  };
}

export function useLiveLeaveRecords(params) {
  const { data, isLoading, error } = hooks.useLeaveRecords(params);
  const list = data?.requests || data?.records || (Array.isArray(data) ? data : []);
  return {
    data: list,
    isLoading,
    error
  };
}

export function useLiveLeaveBalance(userId) {
  const { data, isLoading, error } = hooks.useLeaveBalance(userId);
  const list = data?.balance || (Array.isArray(data) ? data : []);
  return {
    data: list,
    isLoading,
    error
  };
}

export function useLiveDepartmentPerformance() {
  const { data, isLoading, error } = hooks.useDepartmentPerformance();
  return {
    data: data?.performance || mock.DEPT_PERFORMANCE,
    isLoading,
    error
  };
}

export function useLiveFacultyPerformance() {
  const { data, isLoading, error } = hooks.useFacultyPerformance();
  return {
    data: data?.metrics || [],
    isLoading,
    error
  };
}

export function useLivePlacementStats() {
  const { data, isLoading, error } = hooks.usePlacementStats();
  return {
    data: data?.stats || mock.PREDICTIVE_DATA,
    isLoading,
    error
  };
}
export function useLiveKPIForecast() {
  const { data, isLoading, error } = hooks.useKPIForecast();
  return {
    data: data || null,
    isLoading,
    error
  };
}

export function useLiveBudgets() {
  const { data, isLoading, error } = hooks.useAnalyticsBudgets();
  return {
    data: data || [],
    isLoading,
    error
  };
}

export function useLiveKPIs() {
  const { data, isLoading, error } = hooks.useAnalyticsKPIs();
  return {
    data: data || null,
    isLoading,
    error
  };
}
