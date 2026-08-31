import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import toast from 'react-hot-toast';

// ── Auth & Users ─────────────────────────────────────────────────────────
export const useUsers = (role) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const res = await api.get('/users', { params: { role } });
      return res.data;
    },
    retry: 1,
  });
};

// ── Academic Core (Enterprise) ───────────────────────────────────────────
export const useAcademicProgrammes = () => {
  return useQuery({
    queryKey: ['academic', 'programmes'],
    queryFn: async () => {
      const res = await api.get('/academic/programmes');
      return res.data;
    },
    retry: 1,
  });
};

export const useAcademicCurricula = () => {
  return useQuery({
    queryKey: ['academic', 'curricula'],
    queryFn: async () => {
      const res = await api.get('/academic/curricula');
      return res.data;
    },
    retry: 1,
  });
};

export const useAcademicCourseMaster = () => {
  return useQuery({
    queryKey: ['academic', 'courses'],
    queryFn: async () => {
      const res = await api.get('/academic/courses');
      return res.data;
    },
    retry: 1,
  });
};

export const useAcademicOfferings = () => {
  return useQuery({
    queryKey: ['academic', 'offerings'],
    queryFn: async () => {
      const res = await api.get('/academic/offerings');
      return res.data;
    },
    retry: 1,
  });
};

export const useAcademicSections = () => {
  return useQuery({
    queryKey: ['academic', 'sections'],
    queryFn: async () => {
      const res = await api.get('/academic/sections');
      return res.data;
    },
    retry: 1,
  });
};

export const useRegisterEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/academic/enrollments', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Registration submitted successfully');
      queryClient.invalidateQueries(['academic', 'sections']);
    },
  });
};

export const useProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }) => {
      const res = await api.put(`/users/${userId}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['users']);
    },
  });
};

// ── Courses ──────────────────────────────────────────────────────────────
export const useCourses = (params) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const res = await api.get('/courses', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useSearchCourses = (query) => {
  return useQuery({
    queryKey: ['searchCourses', query],
    queryFn: async () => {
      if (!query) return { courses: [], total: 0 };
      const res = await api.get('/courses/search', { params: { q: query } });
      return res.data;
    },
    enabled: Boolean(query),
    retry: 1,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseData) => {
      const res = await api.post('/courses', courseData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...courseData }) => {
      const res = await api.put(`/courses/${id}`, courseData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

export const useApproveCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId) => {
      const res = await api.post(`/courses/${courseId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course approved');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

export const useRejectCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, reason }) => {
      const res = await api.post(`/courses/${courseId}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course rejected');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

export const useUploadCourseContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, file, title, type, link }) => {
      // Simulate file upload URL if a file is provided, else use link URL
      const url = file ? `/uploads/courses/${courseId}/${encodeURIComponent(file.name)}` : link;
      const res = await api.post(`/courses/${courseId}/content`, { title, type, url });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Course content uploaded successfully');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

// ── Attendance & QR Sessions ──────────────────────────────────────────────
export const useCourseAttendance = (courseId, date) => {
  return useQuery({
    queryKey: ['courseAttendance', courseId, date],
    queryFn: async () => {
      const res = await api.get(`/attendance/course/${courseId}`, { params: { date } });
      return res.data;
    },
    enabled: Boolean(courseId && date),
    retry: 1,
  });
};

export const useStudentAttendanceStats = (studentId) => {
  return useQuery({
    queryKey: ['studentAttendanceStats', studentId],
    queryFn: async () => {
      const res = await api.get(`/attendance/student/${studentId}`);
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

export const useAttendanceLeaderboard = (courseId) => {
  return useQuery({
    queryKey: ['attendanceLeaderboard', courseId],
    queryFn: async () => {
      const res = await api.get(`/attendance/leaderboard/${courseId}`);
      return res.data;
    },
    enabled: Boolean(courseId),
    retry: 1,
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/attendance/mark', data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Attendance marked');
      queryClient.invalidateQueries(['courseAttendance', vars.courseId]);
      queryClient.invalidateQueries(['studentAttendanceStats', vars.studentId]);
    },
  });
};

export const useMarkAllAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/attendance/mark-all', data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Bulk attendance marked');
      queryClient.invalidateQueries(['courseAttendance', vars.courseId]);
    },
  });
};

export const useCreateQRSession = () => {
  return useMutation({
    mutationFn: async ({ courseId, date, windowMins }) => {
      const res = await api.post('/attendance/sessions', { courseId, date, windowMins });
      return res.data;
    },
    onSuccess: () => {
      toast.success('QR attendance session created!');
    },
  });
};

export const useScanQRSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId) => {
      const res = await api.post(`/attendance/sessions/${sessionId}/scan`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Attendance recorded via QR!');
      queryClient.invalidateQueries(['studentAttendanceStats']);
      queryClient.invalidateQueries(['studentHeatmap']);
    },
  });
};

// ── Assessments & Quizzes ─────────────────────────────────────────────────
export const useAssessments = (courseId) => {
  return useQuery({
    queryKey: ['assessments', courseId],
    queryFn: async () => {
      const res = await api.get('/assessments', { params: { courseId } });
      return res.data;
    },
    retry: 1,
  });
};

export const useStartAssessment = () => {
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/assessments/${id}/start`);
      return res.data;
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, answers }) => {
      const res = await api.post(`/assessments/${id}/submit`, { answers });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Assessment submitted');
      queryClient.invalidateQueries(['assessments']);
    },
  });
};

// ── Assignments ──────────────────────────────────────────────────────────
export const useAssignments = (courseId) => {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      const res = await api.get('/assignments', { params: { courseId } });
      return res.data;
    },
    retry: 1,
  });
};

export const useAssignmentStats = () => {
  return useQuery({
    queryKey: ['assignmentStats'],
    queryFn: async () => {
      const res = await api.get('/assignments/stats');
      return res.data;
    },
    retry: 1,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, file, remarks }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (remarks) formData.append('remarks', remarks);

      const res = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Assignment submitted successfully');
      queryClient.invalidateQueries(['assignments', variables.assignmentId]);
    },
  });
};

export const useDisputeGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, reason }) => {
      const res = await api.post(`/submissions/${submissionId}/dispute`, { reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Grade dispute submitted. Your faculty will be notified.');
      queryClient.invalidateQueries(['assignments']);
    },
  });
};
export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, resolution, newGrade }) => {
      const res = await api.patch(`/submissions/${submissionId}/resolve-dispute`, { resolution, newGrade });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Dispute resolved');
      queryClient.invalidateQueries(['assignments']);
      queryClient.invalidateQueries(['assignmentSubmissions']);
    },
  });
};
// ── Certificates ──────────────────────────────────────────────────────────
export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const res = await api.get('/certificates');
      return res.data;
    },
    retry: 1,
  });
};

// ── Notifications ─────────────────────────────────────────────────────────
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    retry: 1,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
};

// ── Timetable ────────────────────────────────────────────────────────────
export const useTimetable = (params) => {
  return useQuery({
    queryKey: ['timetable', params],
    queryFn: async () => {
      const res = await api.get('/timetable', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateTimetableSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/timetable', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Timetable slot added');
      queryClient.invalidateQueries(['timetable']);
    },
  });
};

// ── Academic Calendar ─────────────────────────────────────────────────────
export const useAcademicCalendar = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const res = await api.get('/calendar');
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/calendar', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Calendar event added');
      queryClient.invalidateQueries(['calendar']);
    },
  });
};

// ── Library Service ───────────────────────────────────────────────────────
export const useLibraryBooks = (query) => {
  return useQuery({
    queryKey: ['libraryBooks', query],
    queryFn: async () => {
      const res = await api.get('/library/books', { params: { q: query } });
      return res.data;
    },
    retry: 1,
  });
};

export const useLibraryIssues = (userId) => {
  return useQuery({
    queryKey: ['libraryIssues', userId],
    queryFn: async () => {
      const res = await api.get(`/library/issues/${userId}`);
      return res.data;
    },
    enabled: Boolean(userId),
    retry: 1,
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, dueDate }) => {
      const res = await api.post('/library/issues', { bookId, dueDate });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book issued successfully!');
      queryClient.invalidateQueries(['libraryBooks']);
      queryClient.invalidateQueries(['libraryIssues']);
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issueId) => {
      const res = await api.patch(`/library/issues/${issueId}/return`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book returned successfully!');
      queryClient.invalidateQueries(['libraryBooks']);
      queryClient.invalidateQueries(['libraryIssues']);
    },
  });
};

// ── Enterprise Library Circulation Hooks ─────────────────────────────────
export const useLibraryLoans = (memberId, status) => {
  return useQuery({
    queryKey: ['libraryLoans', memberId, status],
    queryFn: async () => {
      const params = {};
      if (memberId) params.memberId = memberId;
      if (status) params.status = status;
      const res = await api.get(`/library/circulation/loans`, { params });
      return res.data;
    },
    enabled: true,
  });
};

export const useIssueLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, copyId }) => {
      const res = await api.post('/library/circulation/issue', { memberId, copyId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book issued successfully!');
      queryClient.invalidateQueries(['libraryLoans']);
      queryClient.invalidateQueries(['libraryBooks']);
    },
  });
};

export const useReturnLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, conditionAtReturn }) => {
      const res = await api.patch(`/library/circulation/loans/${loanId}/return`, { conditionAtReturn });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book returned successfully!');
      queryClient.invalidateQueries(['libraryLoans']);
      queryClient.invalidateQueries(['libraryBooks']);
    },
  });
};

export const useRenewLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loanId) => {
      const res = await api.patch(`/library/circulation/loans/${loanId}/renew`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Loan renewed successfully!');
      queryClient.invalidateQueries(['libraryLoans']);
    },
  });
};

export const useSearchCatalog = (query, filters = {}) => {
  return useQuery({
    queryKey: ['libraryCatalog', query, filters],
    queryFn: async () => {
      const params = { q: query, ...filters };
      const res = await api.get('/library/catalog/search', { params });
      return res.data;
    },
    enabled: true,
  });
};

export const useDigitalResources = (titleId) => {
  return useQuery({
    queryKey: ['digitalResources', titleId],
    queryFn: async () => {
      const params = {};
      if (titleId) params.titleId = titleId;
      const res = await api.get('/library/digital-resources', { params });
      return res.data;
    },
    enabled: true,
  });
};

export const useAccessResource = () => {
  return useMutation({
    mutationFn: async ({ resourceId, memberId, action }) => {
      const res = await api.post(`/library/digital-resources/${resourceId}/access`, { memberId, action });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.url) {
        window.open(data.data.url, '_blank');
      }
    }
  });
};

// ── Placement Service ────────────────────────────────────────────────────
export const usePlacementDrives = (status) => {
  return useQuery({
    queryKey: ['placementDrives', status],
    queryFn: async () => {
      const res = await api.get('/placement/drives', { params: { status } });
      return res.data;
    },
    retry: 1,
  });
};

export const usePlacementApplications = (studentId) => {
  return useQuery({
    queryKey: ['placementApplications', studentId],
    queryFn: async () => {
      const res = await api.get(`/placement/applications/${studentId}`);
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

export const useApplyToDrive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driveId) => {
      const res = await api.post('/placement/applications', { driveId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries(['placementApplications']);
    },
  });
};

export const useDriveApplicants = (driveId) => {
  return useQuery({
    queryKey: ['driveApplicants', driveId],
    queryFn: async () => {
      const res = await api.get(`/placement/drives/${driveId}/applicants`);
      return res.data;
    },
    enabled: Boolean(driveId),
    retry: 1,
  });
};

// ── Discussion Service ───────────────────────────────────────────────────
export const useDiscussionThreads = (courseId) => {
  return useQuery({
    queryKey: ['discussionThreads', courseId],
    queryFn: async () => {
      const res = await api.get(`/discussion/threads/${courseId}`);
      return res.data;
    },
    enabled: Boolean(courseId),
    retry: 1,
  });
};

export const useThreadDetails = (threadId) => {
  return useQuery({
    queryKey: ['threadDetails', threadId],
    queryFn: async () => {
      const res = await api.get(`/discussion/thread/${threadId}`);
      return res.data;
    },
    enabled: Boolean(threadId),
    retry: 1,
  });
};

export const useCreateDiscussionThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/discussion/threads', data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Discussion thread created');
      queryClient.invalidateQueries(['discussionThreads', vars.courseId]);
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, content }) => {
      const res = await api.post(`/discussion/threads/${threadId}/reply`, { content });
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Reply posted');
      queryClient.invalidateQueries(['threadDetails', vars.threadId]);
    },
  });
};

// ── Analytics Service ────────────────────────────────────────────────────
export const useAnalyticsKPIs = () => {
  return useQuery({
    queryKey: ['analyticsKPIs'],
    queryFn: async () => {
      const res = await api.get('/analytics/kpis');
      return res.data;
    },
    retry: 1,
  });
};

export const useAnalyticsBudgets = () => {
  return useQuery({
    queryKey: ['analyticsBudgets'],
    queryFn: async () => {
      const res = await api.get('/analytics/budgets');
      return res.data;
    },
    retry: 1,
  });
};

export const useStudentHeatmap = (studentId, courseId) => {
  return useQuery({
    queryKey: ['studentHeatmap', studentId, courseId],
    queryFn: async () => {
      const res = await api.get(`/analytics/heatmap/${studentId}`, { params: { courseId } });
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

export const usePeerComparison = (studentId, courseId) => {
  return useQuery({
    queryKey: ['peerComparison', studentId, courseId],
    queryFn: async () => {
      const res = await api.get(`/analytics/peer-comparison/${studentId}`, { params: { courseId } });
      return res.data;
    },
    enabled: Boolean(studentId && courseId),
    retry: 1,
  });
};

export const useDepartmentKPIs = (departmentId) => {
  return useQuery({
    queryKey: ['departmentKPIs', departmentId],
    queryFn: async () => {
      const res = await api.get(`/analytics/department/${departmentId}/kpis`);
      return res.data;
    },
    enabled: Boolean(departmentId),
    retry: 1,
  });
};

// ── Admin Service ────────────────────────────────────────────────────────
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await api.get('/admin/health');
      return res.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });
};

export const useTriggerBackup = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/backup');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Database backup archive created successfully');
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/admin/departments');
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/departments', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Department created');
      queryClient.invalidateQueries(['departments']);
    },
  });
};

export const useSemesters = () => {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await api.get('/admin/semesters');
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/semesters', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Semester created');
      queryClient.invalidateQueries(['semesters']);
    },
  });
};

export const useActivateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/admin/semesters/${id}/activate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Semester activated');
      queryClient.invalidateQueries(['semesters']);
    },
  });
};

export const useAdminUsers = (params) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/users', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User account created');
      queryClient.invalidateQueries(['adminUsers']);
    },
  });
};

export const useAuditLogs = (params) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useAssignmentSubmissions = (assignmentId) => {
  return useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: async () => {
      const res = await api.get(`/assignments/${assignmentId}/submissions`);
      return res.data;
    },
    enabled: Boolean(assignmentId),
    retry: 1,
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, grade, feedback, rubricGrades }) => {
      const res = await api.patch(`/submissions/${submissionId}/grade`, { grade, feedback, rubricGrades });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Submission graded successfully!');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignmentStats'] });
    },
  });
};

export const useBulkGradeAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, grades }) => {
      const res = await api.post(`/assignments/${assignmentId}/bulk-grade`, { grades });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Bulk grading successful!');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignmentStats'] });
    },
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentData) => {
      const res = await api.post('/assignments', assignmentData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Assignment created successfully');
      queryClient.invalidateQueries(['assignments']);
    },
  });
};

export const useMySubmissions = (studentId) => {
  return useQuery({
    queryKey: ['mySubmissions', studentId],
    queryFn: async () => {
      const res = await api.get(`/students/${studentId}/submissions`);
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userIds, active }) => {
      const res = await api.patch('/admin/users/bulk', { userIds, active });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Bulk user status updated successfully');
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useBulkEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, studentIds }) => {
      const res = await api.post(`/courses/${courseId}/enrollments/bulk`, { studentIds });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Students bulk enrolled successfully');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

// ── Leave Management ──────────────────────────────────────────────────────
export const useLeaveRecords = (params) => {
  return useQuery({
    queryKey: ['leaveRecords', params],
    queryFn: async () => {
      const res = await api.get('/leave/requests', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useLeaveBalance = (userId) => {
  return useQuery({
    queryKey: ['leaveBalance', userId],
    queryFn: async () => {
      const res = await api.get(`/leave/quota/${userId}`);
      return res.data;
    },
    enabled: Boolean(userId),
    retry: 1,
  });
};

export const useApplyForLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/leave/requests', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Leave application submitted!');
      queryClient.invalidateQueries(['leaveRecords']);
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approverId, isOverride }) => {
      const res = await api.patch(`/leave/requests/${id}/approve`, { approverId, isOverride });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Leave request approved!');
      queryClient.invalidateQueries(['leaveRecords']);
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approverId, rejectionReason, isOverride }) => {
      const res = await api.patch(`/leave/requests/${id}/reject`, { approverId, rejectionReason, isOverride });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Leave request rejected.');
      queryClient.invalidateQueries(['leaveRecords']);
    },
  });
};

export const useWithdrawLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, requesterId }) => {
      const res = await api.patch(`/leave/requests/${id}/withdraw`, { requesterId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Leave request withdrawn.');
      queryClient.invalidateQueries(['leaveRecords']);
    },
  });
};

// ── Student Grades & Transcript ───────────────────────────────────────────
export const useStudentGrades = (studentId) => {
  return useQuery({
    queryKey: ['studentGrades', studentId],
    queryFn: async () => {
      const res = await api.get(`/analytics/grades/${studentId}`);
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

// ── Course Resources (Download Center) ────────────────────────────────────
export const useCourseResources = (courseId) => {
  return useQuery({
    queryKey: ['courseResources', courseId],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}/content`);
      return res.data;
    },
    enabled: Boolean(courseId),
    retry: 1,
  });
};

// ── All Course Resources (aggregated for Download Center) ─────────────────
export const useAllCourseResources = () => {
  return useQuery({
    queryKey: ['allCourseResources'],
    queryFn: async () => {
      const res = await api.get('/courses/resources/all');
      return res.data;
    },
    retry: 1,
  });
};

// ── Announcements ─────────────────────────────────────────────────────────
export const useAnnouncements = (params) => {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const res = await api.get('/notifications/announcements', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/notifications/announcements', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Announcement published!');
      queryClient.invalidateQueries(['announcements']);
    },
  });
};

// ── Attendance Weekly Summary (Faculty Dashboard Chart) ───────────────────
export const useWeeklyAttendanceSummary = (params) => {
  return useQuery({
    queryKey: ['weeklyAttendanceSummary', params],
    queryFn: async () => {
      const res = await api.get('/attendance/weekly-summary', { params });
      return res.data;
    },
    retry: 1,
  });
};

// ── AI Heuristic Endpoints (analytics-service) ────────────────────────────
export const useStudentRisk = (studentId) => {
  return useQuery({
    queryKey: ['studentRisk', studentId],
    queryFn: async () => {
      const res = await api.get(`/analytics/risk/${studentId}`);
      return res.data;
    },
    enabled: Boolean(studentId),
    retry: 1,
  });
};

export const useRubricTemplates = () => {
  return useQuery({
    queryKey: ['rubricTemplates'],
    queryFn: async () => {
      const res = await api.get('/analytics/ai/rubric-templates');
      return res.data;
    },
    retry: 1,
  });
};

export const useKPIForecast = () => {
  return useQuery({
    queryKey: ['kpiForecast'],
    queryFn: async () => {
      const res = await api.get('/analytics/ai/kpi-forecast');
      return res.data;
    },
    retry: 1,
  });
};

// ── Faculty Performance (Management) ─────────────────────────────────────
export const useFacultyPerformance = () => {
  return useQuery({
    queryKey: ['facultyPerformance'],
    queryFn: async () => {
      const res = await api.get('/analytics/management/faculty-performance');
      return res.data;
    },
    retry: 1,
  });
};

// ── Placement Stats (Management Analytics) ───────────────────────────────
export const usePlacementStats = () => {
  return useQuery({
    queryKey: ['placementStats'],
    queryFn: async () => {
      const res = await api.get('/analytics/management/placement-stats');
      return res.data;
    },
    retry: 1,
  });
};

// ── Help Desk / Support Tickets ───────────────────────────────────────────
export const useSupportTickets = (params) => {
  return useQuery({
    queryKey: ['supportTickets', params],
    queryFn: async () => {
      const res = await api.get('/admin/helpdesk/tickets', { params });
      return res.data;
    },
    retry: 1,
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/helpdesk/tickets', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Support ticket submitted! We will respond within 24 hours.');
      queryClient.invalidateQueries(['supportTickets']);
    },
  });
};

export const useRespondToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, response, status }) => {
      const res = await api.patch(`/admin/helpdesk/tickets/${ticketId}`, { response, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Response sent to student.');
      queryClient.invalidateQueries(['supportTickets']);
    },
  });
};

// ── System Health (All Services) ──────────────────────────────────────────
export const useAllServicesHealth = () => {
  return useQuery({
    queryKey: ['allServicesHealth'],
    queryFn: async () => {
      const res = await api.get('/admin/health/all');
      return res.data;
    },
    refetchInterval: 30000,
    retry: 0, // Don't retry health checks — fail fast
  });
};

// ── Backup Records ────────────────────────────────────────────────────────
export const useBackupRecords = () => {
  return useQuery({
    queryKey: ['backupRecords'],
    queryFn: async () => {
      const res = await api.get('/admin/backups');
      return res.data;
    },
    retry: 1,
  });
};

// ── Management: Department Performance ───────────────────────────────────
export const useDepartmentPerformance = () => {
  return useQuery({
    queryKey: ['departmentPerformance'],
    queryFn: async () => {
      const res = await api.get('/analytics/management/department-performance');
      return res.data;
    },
    retry: 1,
  });
};

// ── Feedback Surveys ──────────────────────────────────────────────────────
export const useFeedbackSurveys = (courseId) => {
  return useQuery({
    queryKey: ['feedbackSurveys', courseId],
    queryFn: async () => {
      const res = await api.get('/courses/feedback', { params: { courseId } });
      return res.data;
    },
    retry: 1,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/courses/feedback', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Feedback submitted anonymously!');
      queryClient.invalidateQueries(['feedbackSurveys']);
    },
  });
};

// ── Roles & Permissions (auth-service) ────────────────────────────────────
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/auth/roles');
      return res.data;
    },
    retry: 1,
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ role, permissions }) => {
      const res = await api.put(`/auth/roles/${role}`, { permissions });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Role permissions updated');
      queryClient.invalidateQueries(['roles']);
    },
  });
};

// ── Course Prerequisites ──────────────────────────────────────────────────
export const useUpdateCoursePrerequisites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, prerequisites }) => {
      const res = await api.patch(`/courses/${courseId}/prerequisites`, { prerequisites });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Prerequisites updated');
      queryClient.invalidateQueries(['courses']);
    },
  });
};

// ── Grade Dispute Resolution (faculty) ───────────────────────────────────
export const usePendingDisputes = (courseId) => {
  return useQuery({
    queryKey: ['pendingDisputes', courseId],
    queryFn: async () => {
      const res = await api.get('/assignments/disputes', { params: { courseId } });
      return res.data;
    },
    enabled: Boolean(courseId),
    retry: 1,
  });
};

// ── Semester Snapshot ─────────────────────────────────────────────────────
export const useCloseSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (semesterId) => {
      const res = await api.post(`/admin/semesters/${semesterId}/close`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Semester closed and snapshot saved');
      queryClient.invalidateQueries(['semesters']);
    },
  });
};



export const useRateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, rating, comment }) => {
      const res = await api.post(`/courses/${courseId}/rate`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course rated successfully!');
      queryClient.invalidateQueries(['enrolledCourses']);
    }
  });
};
