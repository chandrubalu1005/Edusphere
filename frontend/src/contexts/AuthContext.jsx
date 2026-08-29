import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage (consistent with login below)
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem('edu_user');
      const storedToken = localStorage.getItem('edu_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem('edu_user');
      localStorage.removeItem('edu_token');
    }
    setLoading(false);
  }, []);

  // login expects { identifier, password, domain }
  const login = useCallback(async (identifier, password, domain) => {
    try {
      // backend auth-service POST /login expects { identifier, password, domain }
      const res = await axios.post('/api/auth/login', { identifier, password, domain });
      const { token, user: apiUser } = res.data; // backend returns { token, user }
      localStorage.setItem('edu_token', token);
      localStorage.setItem('edu_user', JSON.stringify(apiUser));
      setUser(apiUser);
      return apiUser;
    } catch (err) {
      console.error("Real API login failed", err);
      throw err;
    }
  }, []);

  // register expects { username, email, password }
  const register = useCallback(async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      const { token, user: apiUser } = res.data;
      localStorage.setItem('edu_token', token);
      localStorage.setItem('edu_user', JSON.stringify(apiUser));
      setUser(apiUser);
      return apiUser;
    } catch (err) {
      console.error("Real API registration failed", err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
    setUser(null);
  }, []);

  // switchRole is a dev-only convenience to test different role views without re-logging in.
  // In production builds this is a no-op since import.meta.env.DEV is false.
  const switchRole = useCallback((roleOrUser) => {
    if (!import.meta.env.DEV) return;
    if (typeof roleOrUser === 'object') {
      localStorage.setItem('edu_user', JSON.stringify(roleOrUser));
      setUser(roleOrUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

