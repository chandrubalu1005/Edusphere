import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { USERS } from '../mockData.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('edusphere_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      // Attempt real API call
      const res = await axios.post('/api/auth/login', { username, password });
      const { user: apiUser, accessToken } = res.data;
      localStorage.setItem('edu_token', accessToken);
      localStorage.setItem('edu_user', JSON.stringify(apiUser));
      setUser(apiUser);
      return apiUser;
    } catch (err) {
      console.warn("Real API login failed, falling back to mock data", err);
      // Fallback
      await new Promise(r => setTimeout(r, 600));
      const found = USERS.find(u => u.username === username);
      if (!found || password !== 'demo123') {
        throw new Error('Invalid credentials. Use any username with password: demo123');
      }
      localStorage.setItem('edu_user', JSON.stringify(found));
      setUser(found);
      return found;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('edusphere_user');
    setUser(null);
  }, []);

  const switchRole = useCallback((role) => {
    const found = USERS.find(u => u.role === role);
    if (found) {
      sessionStorage.setItem('edusphere_user', JSON.stringify(found));
      setUser(found);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
