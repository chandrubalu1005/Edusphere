import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api', // Proxied by Vite and Nginx
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edu_token');
    
    // If using mock offline token, don't hit real backend (which would return 401)
    if (token && token.startsWith('mock_jwt_token')) {
      return Promise.reject({ isMockFallback: true, message: 'Offline mode active' });
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || 'An error occurred';

      if (status === 401) {
        // Handle Unauthorized (Token expiration or invalid)
        localStorage.removeItem('edu_token');
        localStorage.removeItem('edu_user');
        // Prevent toast flood
        if (!window.location.pathname.includes('login')) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
