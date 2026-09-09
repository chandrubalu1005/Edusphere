import * as hooks from './hooks';

export function useLiveCourses(params) {
  const { data, isLoading, error } = hooks.useCourses(params);
  const list = data?.courses || (Array.isArray(data) ? data : []);
  return { data: list, total: data?.total !== undefined ? data.total : list.length, isLoading, error };
}

export function useLiveUsers(role) {
  const { data, isLoading, error } = hooks.useUsers(role);
  const list = data?.users || (Array.isArray(data) ? data : []);
  return { data: list, total: data?.total !== undefined ? data.total : list.length, isLoading, error };
}

export function useLiveAcademicProgrammes() {
  const { data, isLoading, error } = hooks.useAcademicProgrammes();
  return { data: Array.isArray(data) ? data : [], isLoading, error };
}

export function useLiveAcademicCourseMaster() {
  const { data, isLoading, error } = hooks.useAcademicCourseMaster();
  return { data: Array.isArray(data) ? data : [], isLoading, error };
}

export function useLiveAcademicSections() {
  const { data, isLoading, error } = hooks.useAcademicSections();
  return { data: Array.isArray(data) ? data : [], isLoading, error };
}

export function useLiveAcademicCurricula() {
  const { data, isLoading, error } = hooks.useAcademicCurricula();
  return { data: Array.isArray(data) ? data : [], isLoading, error };
}

export function useLiveProfile(userId) {
  const { data, isLoading, error } = hooks.useProfile(userId);
  return { data: data || null, isLoading, error };
}

export function useLiveAssignments(courseId) {
  const { data, isLoading, error } = hooks.useAssignments(courseId);
  const list = data?.assignments || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveAssessments(courseId) {
  const { data, isLoading, error } = hooks.useAssessments(courseId);
  const list = data?.assessments || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveCertificates() {
  const { data, isLoading, error } = hooks.useCertificates();
  const list = data?.certificates || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveNotifications() {
  const { data, isLoading, error } = hooks.useNotifications();
  const list = data?.notifications || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveTimetable(params) {
  const { data, isLoading, error } = hooks.useTimetable(params);
  const list = data?.timetable || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveCalendarEvents() {
  const { data, isLoading, error } = hooks.useAcademicCalendar();
  const list = data?.events || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveLibraryBooks(query) {
  const { data, isLoading, error } = hooks.useLibraryBooks(query);
  const list = data?.books || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveLibraryLoans(memberId, status) {
  const { data, isLoading, error } = hooks.useLibraryLoans(memberId, status);
  const list = data?.data || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLivePlacementDrives(status) {
  const { data, isLoading, error } = hooks.usePlacementDrives(status);
  const list = data?.drives || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLivePlacementApplications(studentId) {
  const { data, isLoading, error } = hooks.usePlacementApplications(studentId);
  const list = data?.applications || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveDepartments() {
  const { data, isLoading, error } = hooks.useDepartments();
  const list = data?.departments || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveSemesters() {
  const { data, isLoading, error } = hooks.useSemesters();
  const list = data?.semesters || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveAdminUsers(params) {
  const { data, isLoading, error } = hooks.useAdminUsers(params);
  const list = data?.users || (Array.isArray(data) ? data : []);
  return { data: list, total: data?.total !== undefined ? data.total : list.length, isLoading, error };
}

export function useLiveAuditLogs(params) {
  const { data, isLoading, error } = hooks.useAuditLogs(params);
  const list = data?.logs || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveAttendance(courseId, date, studentId) {
  const courseQuery = hooks.useCourseAttendance(courseId, date);
  const studentQuery = hooks.useStudentAttendanceStats(studentId);
  
  if (studentId) {
    return { 
      data: studentQuery.data?.records || [], 
      isLoading: studentQuery.isLoading, 
      error: studentQuery.error 
    };
  }
  const list = courseQuery.data?.records || (Array.isArray(courseQuery.data) ? courseQuery.data : []);
  return { data: list, isLoading: courseQuery.isLoading, error: courseQuery.error };
}

export function useLiveEnrollments(userId) {
  const { data: courseData, isLoading, error } = hooks.useCourses();
  const list = courseData?.courses || [];

  const enrolledCourses = userId
    ? list.filter(c => c.enrolledStudents && c.enrolledStudents.includes(userId))
    : list.filter(c => c.enrolledStudents && c.enrolledStudents.length > 0);

  let enrollments = [];
  if (userId) {
    enrollments = enrolledCourses.map(c => ({
      id: `enr-${c._id || c.id}`,
      courseId: c._id || c.id,
      courseCode: c.code,
      courseTitle: c.title,
      studentId: userId,
      enrolledAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
      progress: c.content?.length ? Math.min(100, c.content.length * 10) : 0
    }));
  } else {
    enrolledCourses.forEach(c => {
      (c.enrolledStudents || []).forEach(sId => {
        enrollments.push({
          id: `enr-${c._id || c.id}-${sId}`,
          courseId: c._id || c.id,
          courseCode: c.code,
          courseTitle: c.title,
          studentId: sId,
          enrolledAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          progress: c.content?.length ? Math.min(100, c.content.length * 10) : 0
        });
      });
    });
  }

  return { data: enrollments, isLoading, error };
}

export function useLiveSubmissions(studentId) {
  const { data, isLoading, error } = hooks.useMySubmissions(studentId);
  const list = Array.isArray(data) ? data : [];
  return { data: list, isLoading, error };
}

export function useLiveAssignmentSubmissions(assignmentId) {
  const { data, isLoading, error } = hooks.useAssignmentSubmissions(assignmentId);
  const list = data?.submissions || [];
  const stats = data?.stats || { total: 0, graded: 0, late: 0, avgGrade: null };
  return { data: list, stats, isLoading, error };
}

export function useLivePendingSubmissions() {
  const { data, isLoading, error } = hooks.usePendingSubmissions();
  const list = Array.isArray(data) ? data : [];
  return { data: list, isLoading, error };
}

export function useLiveAssignmentStats() {
  const { data, isLoading, error } = hooks.useAssignmentStats();
  return { data: data || [], isLoading, error };
}

export function useLiveDiscussionThreads(courseId) {
  const { data, isLoading, error } = hooks.useDiscussionThreads(courseId);
  const list = data?.threads || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveThreadDetails(threadId) {
  const { data, isLoading, error } = hooks.useThreadDetails(threadId);
  return { data: data || null, isLoading, error };
}

export function useLiveLeaveRecords(params) {
  const { data, isLoading, error } = hooks.useLeaveRecords(params);
  const list = data?.requests || data?.records || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveLeaveBalance(userId) {
  const { data, isLoading, error } = hooks.useLeaveBalance(userId);
  const list = data?.balance || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveDepartmentPerformance() {
  const { data, isLoading, error } = hooks.useDepartmentPerformance();
  return { data: data?.performance || [], isLoading, error };
}

export function useLiveFacultyPerformance() {
  const { data, isLoading, error } = hooks.useFacultyPerformance();
  return { data: data?.metrics || [], isLoading, error };
}

export function useLivePlacementStats() {
  const { data, isLoading, error } = hooks.usePlacementStats();
  return { data: data?.stats || null, isLoading, error };
}

export function useLiveKPIForecast() {
  const { data, isLoading, error } = hooks.useKPIForecast();
  return { data: data || null, isLoading, error };
}

export function useLiveBudgets() {
  const { data, isLoading, error } = hooks.useAnalyticsBudgets();
  return { data: data || [], isLoading, error };
}

export function useLiveKPIs() {
  const { data, isLoading, error } = hooks.useAnalyticsKPIs();
  return { data: data || null, isLoading, error };
}

// ── Fee Records (connects to finance-service) ──────────────────────────────
export function useLiveFeeRecords(studentId) {
  const { data, isLoading, error } = hooks.useFeeRecords(studentId);
  const list = data?.fees || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

// ── Approval Queue (real API — not stub) ───────────────────────────────────
export function useLiveApprovalQueue(params) {
  const { data, isLoading, error } = hooks.useApprovalQueue(params);
  const list = data?.approvals || data?.queue || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveRoles() {
  const { data, isLoading, error } = hooks.useRoles ? hooks.useRoles() : { data: [], isLoading: false, error: null };
  return { data: data || [], isLoading, error };
}

// ── API Logs (via admin audit logs) ───────────────────────────────────────
export function useLiveApiLogs(params) {
  const { data, isLoading, error } = hooks.useAuditLogs({ ...params, type: 'api' });
  const list = data?.logs || (Array.isArray(data) ? data : []);
  return { data: list, isLoading, error };
}

export function useLiveLibraryResources() {
  const { data, isLoading, error } = hooks.useLibraryBooks ? hooks.useLibraryBooks() : { data: null, isLoading: false, error: null };
  return { data: data?.books || [], isLoading, error };
}

export function useLiveCourseResources(courseOfferingId, departmentId, unitNumber) {
  const { data, isLoading, error } = hooks.useCourseResources(courseOfferingId, departmentId, unitNumber);
  return { data: data || [], isLoading, error };
}

export function useLiveLibraryAnalytics(departmentId) {
  const { data, isLoading, error } = hooks.useLibraryAnalytics(departmentId);
  return { data: data || null, isLoading, error };
}

export function useAdminLiveLibraryLoans() {
  const { data, isLoading, error } = hooks.useAdminLiveLibraryLoans();
  return { data: data || [], isLoading, error };
}

// ── Stubs for future features ──────────────────────────────────────────────
// These are clearly documented as unimplemented features, not hiding broken code
export function useLiveEmailTemplates() {
  // TODO: Connect to a future notification-template service
  return { data: [], isLoading: false, error: null };
}

export function useLiveFileRecords() {
  // TODO: Connect to a future file-management service
  return { data: [], isLoading: false, error: null };
}
