import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store';

import { useQueryClient } from '@tanstack/react-query';

export default function Notifications() {
  const { user } = useAuth();
  const incrementUnread = useAppStore((state) => state.incrementUnread);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Connect to the notification service via Nginx API Gateway
    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('edu_token') }
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected for real-time notifications');
    });

    socket.on('new_notification', (data) => {
      // Trigger global toast
      toast(data.title, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: 'var(--surface)',
          color: 'var(--text-1)',
          border: '1px solid var(--border)',
        },
      });
      // Update global unread count
      incrementUnread();
    });

    // ── Live Domain Events ────────────────────────────────────────────────
    socket.on('leave.newRequest', (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast.success('New leave request received!');
    });
    
    socket.on('leave.statusChanged', (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveQuota'] });
      toast(`Leave request ${data.status}`, { icon: data.status === 'approved' ? '✅' : '❌' });
    });

    socket.on('grade.updated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['courseGrades'] });
      toast.success('Your assignment has been graded!');
    });

    socket.on('submission.received', (data) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      // Toast optional if it's too noisy for faculty
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error (expected if backend is down):', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, incrementUnread, queryClient]);

  return null; // This is a headless component
}
