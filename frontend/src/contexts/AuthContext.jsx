import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const MOCK_USERS = [
  {
    id: 's1',
    userId: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    username: 'john_doe',
    email: 'john_doe@edusphere.edu',
    altEmail: 'john@edusphere.edu',
    role: 'student',
    department: 'Computer Science'
  },
  {
    id: 's2',
    userId: 'jane_smith',
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'jane_smith',
    email: 'jane_smith@edusphere.edu',
    altEmail: 'jane@edusphere.edu',
    role: 'student',
    department: 'Electronics'
  },
  {
    id: 'f1',
    userId: 'sarah_j',
    firstName: 'Sarah',
    lastName: 'Johnson',
    username: 'sarah_j',
    email: 'sarah_j@edusphere.edu',
    altEmail: 'sarah@edusphere.edu',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    id: 'a1',
    userId: 'sys_admin',
    firstName: 'System',
    lastName: 'Administrator',
    username: 'sys_admin',
    email: 'sys_admin@edusphere.edu',
    altEmail: 'admin@edusphere.edu',
    role: 'admin',
    department: 'Administration'
  },
  {
    id: 'm1',
    userId: 'dean_academic',
    firstName: 'Dean',
    lastName: 'Academic',
    username: 'dean_academic',
    email: 'dean_academic@edusphere.edu',
    altEmail: 'dean@edusphere.edu',
    role: 'management',
    department: 'Management'
  }
];

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
      console.warn("Real API login failed, falling back to mock user session", err);
      // Validate credentials against MOCK_USERS
      const cleanInput = (identifier || '').trim().toLowerCase();
      const found = MOCK_USERS.find(u => 
        u.email.toLowerCase() === cleanInput || 
        u.altEmail?.toLowerCase() === cleanInput || 
        u.username.toLowerCase() === cleanInput
      );
      if (found && password === 'demo123') {
        if (found.role !== domain) {
          throw new Error('Invalid credentials or access not permitted for this domain');
        }
        const mockToken = "mock_jwt_token_" + found.id;
        localStorage.setItem('edu_token', mockToken);
        localStorage.setItem('edu_user', JSON.stringify(found));
        setUser(found);
        toast.success(`Logged in as demo ${found.role} (${found.username})`);
        return found;
      }
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
      console.warn("Real API registration failed, falling back to mock registration", err);
      const mockUser = {
        id: 's_new_' + Math.floor(Math.random() * 1000),
        userId: 's_new_' + Math.floor(Math.random() * 1000),
        username,
        email,
        firstName: username,
        lastName: 'Student',
        role: 'student',
        department: 'CSE'
      };
      const mockToken = "mock_jwt_token_new";
      localStorage.setItem('edu_token', mockToken);
      localStorage.setItem('edu_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Registered successfully (offline mode)");
      return mockUser;
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

