import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store';

export default function Notifications() {
  const { user } = useAuth();
  const incrementUnread = useAppStore((state) => state.incrementUnread);

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

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error (expected if backend is down):', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, incrementUnread]);

  return null; // This is a headless component
}
