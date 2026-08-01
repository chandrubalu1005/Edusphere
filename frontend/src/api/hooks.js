import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import toast from 'react-hot-toast';

// ── Users & Auth ────────────────────────────────────────────────────────
export const useUsers = (role) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const res = await api.get('/users', { params: { role } });
      return res.data;
    },
    // Keep it fast, but allow failure gracefully
    retry: 1, 
  });
};

// ── Courses ─────────────────────────────────────────────────────────────
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

// ── Assessments & Quizzes ───────────────────────────────────────────────
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

// ── Assignments & File Uploads ──────────────────────────────────────────
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
      queryClient.invalidateQueries(['studentSubmissions']);
    },
  });
};

export const useUploadCourseContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, title, type, file }) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('file', file);
      // Assuming a hypothetical upload endpoint on course-service
      const res = await api.post(`/courses/${courseId}/content`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Content uploaded successfully');
      queryClient.invalidateQueries(['courses']);
    }
  });
};

// ── Certificates ────────────────────────────────────────────────────────
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

// ── Notifications ───────────────────────────────────────────────────────
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

// ── Timetable Service Hooks ─────────────────────────────────────────────
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
    }
  });
};

// ── Calendar Service Hooks ──────────────────────────────────────────────
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
    }
  });
};

// ── Library Service Hooks ───────────────────────────────────────────────
export const useLibraryBooks = () => {
  return useQuery({
    queryKey: ['libraryBooks'],
    queryFn: async () => {
      const res = await api.get('/library/books');
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
    retry: 1,
  });
};

// ── Placement Service Hooks ──────────────────────────────────────────────
export const usePlacementDrives = () => {
  return useQuery({
    queryKey: ['placementDrives'],
    queryFn: async () => {
      const res = await api.get('/placement/drives');
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
    retry: 1,
  });
};

// ── Discussion Service Hooks ─────────────────────────────────────────────
export const useDiscussionThreads = (courseId) => {
  return useQuery({
    queryKey: ['discussionThreads', courseId],
    queryFn: async () => {
      const res = await api.get(`/discussion/threads/${courseId}`);
      return res.data;
    },
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
    }
  });
};

// ── Analytics Service Hooks ──────────────────────────────────────────────
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

// ── Admin Service Hooks ──────────────────────────────────────────────────
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await api.get('/admin/health');
      return res.data;
    },
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
    }
  });
};

