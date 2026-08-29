import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../api/hooks.js';
import CommandPalette from './shared/CommandPalette.jsx';

import { 
  Home, BookOpen, Calendar, Users, BarChart2, Settings, Bell, Search, 
  LogOut, Clipboard, Award, Zap, Shield, FileText, Mail, Building, 
  Check, Plus, Edit, Trash2, Eye, Download, Sun, Moon, ChevronRight, 
  Briefcase, Headphones, Library, Cpu, QrCode, X, Menu 
} from 'lucide-react';

// ── SVG Icons (Lucide) ───────────────────────────────────────────────────────────────
const ICONS = {
  home:        Home,
  book:        BookOpen,
  calendar:    Calendar,
  users:       Users,
  chart:       BarChart2,
  settings:    Settings,
  bell:        Bell,
  search:      Search,
  logout:      LogOut,
  clipboard:   Clipboard,
  award:       Award,
  zap:         Zap,
  shield:      Shield,
  file:        FileText,
  mail:        Mail,
  building:    Building,
  check:       Check,
  plus:        Plus,
  edit:        Edit,
  trash:       Trash2,
  eye:         Eye,
  download:    Download,
  sun:         Sun,
  moon:        Moon,
  chevron:     ChevronRight,
  briefcase:   Briefcase,
  headphones:  Headphones,
  library:     Library,
  cpu:         Cpu,
  qr:          QrCode,
  x:           X,
  menu:        Menu,
};

const Icon = ({ d, size = 18 }) => {
  const IconComponent = d || Home;
  return <IconComponent size={size} />;
};

// ── Theme swatch colors ──────────────────────────────────────────────────────
const THEME_SWATCHES = {
  crimson: '#C43D3D',
  emerald: '#2D7A5A',
  cobalt:  '#2A5FA5',
  plum:    '#7C3A8A',
};

// ── NAV CONFIG ────────────────────────────────────────────────────────────
const NAV_CONFIG = {
  student: [
    { section: 'My Learning', items: [
      { id: 'dashboard',    label: 'Dashboard',           icon: 'home', path: '/student/dashboard' },
      { id: 'courses',      label: 'My Courses',          icon: 'book', path: '/student/courses' },
      { id: 'assignments',  label: 'Assignments',         icon: 'clipboard', badge: 2, path: '/student/assignments' },
      { id: 'assessments',  label: 'Quizzes & Tests',     icon: 'zap', path: '/student/assessments' },
      { id: 'attendance',   label: 'My Attendance',        icon: 'calendar', path: '/student/attendance' },
      { id: 'timetable',    label: 'Weekly Timetable',     icon: 'calendar', path: '/student/timetable' },
      { id: 'progress',     label: 'Learning Progress',    icon: 'chart', path: '/student/progress' },
    ]},
    { section: 'Academic', items: [
      { id: 'plan',         label: 'Degree Plan',          icon: 'check', path: '/student/plan' },
      { id: 'registration', label: 'Course Registration',  icon: 'plus', path: '/student/registration' },
      { id: 'transcript',   label: 'Grades & Transcript',  icon: 'file', path: '/student/transcript' },
      { id: 'certificates', label: 'Certificates',         icon: 'award', path: '/student/certificates' },
      { id: 'acad-calendar',label: 'Academic Calendar',     icon: 'calendar', path: '/student/acad-calendar' },
      { id: 'downloads',    label: 'Download Center',       icon: 'download', path: '/student/downloads' },
    ]},
    { section: 'Services', items: [
      { id: 'library',      label: 'Digital Library',       icon: 'library', path: '/student/library' },
      { id: 'placement',    label: 'Placement Portal',      icon: 'briefcase', path: '/student/placement' },
      { id: 'discussions',  label: 'Communication Hub',     icon: 'mail', path: '/student/discussions' },
      { id: 'fees',         label: 'Fee & Payments',        icon: 'shield', path: '/student/fees' },
      { id: 'helpdesk',     label: 'Help Desk',             icon: 'headphones', badge: 1, path: '/student/helpdesk' },
    ]},
    { section: 'AI & Account', items: [
      { id: 'ai-assistant', label: 'AI Assistant',          icon: 'cpu', path: '/student/ai-assistant' },
      { id: 'activity',     label: 'Activity Timeline',     icon: 'eye', path: '/student/activity' },
      { id: 'profile',      label: 'My Profile & ID',       icon: 'shield', path: '/student/profile' },
      { id: 'notifications',label: 'Notifications',         icon: 'bell', badge: 3, path: '/student/notifications' },
    ]},
  ],
  faculty: [
    { section: 'Teaching', items: [
      { id: 'dashboard',    label: 'Dashboard',             icon: 'home', path: '/faculty/dashboard' },
      { id: 'courses',      label: 'My Courses',            icon: 'book', path: '/faculty/courses' },
      { id: 'content',      label: 'Course Content',        icon: 'file', path: '/faculty/content' },
      { id: 'assessments',  label: 'Assessments',           icon: 'zap', path: '/faculty/assessments' },
      { id: 'assignments',  label: 'Assignments',           icon: 'clipboard', path: '/faculty/assignments' },
      { id: 'attendance',   label: 'Mark Attendance',        icon: 'calendar', path: '/faculty/attendance' },
      { id: 'timetable',    label: 'My Timetable',           icon: 'calendar', path: '/faculty/timetable' },
    ]},
    { section: 'Student Management', items: [
      { id: 'users',        label: 'User Management',        icon: 'users', path: '/faculty/users' },
      { id: 'performance',  label: 'Student Performance',    icon: 'chart', path: '/faculty/performance' },
      { id: 'grades',       label: 'Grade Submission',       icon: 'edit', path: '/faculty/grades' },
      { id: 'completion',   label: 'Course Completion',      icon: 'check', path: '/faculty/completion' },
      { id: 'feedback',     label: 'Student Feedback',       icon: 'mail', path: '/faculty/feedback' },
    ]},
    { section: 'Communication', items: [
      { id: 'discussions',  label: 'Communication Hub',      icon: 'mail', path: '/faculty/discussions' },
      { id: 'announcements',label: 'Announcements',          icon: 'bell', path: '/faculty/announcements' },
      { id: 'analytics',    label: 'Analytics',              icon: 'chart', path: '/faculty/analytics' },
    ]},
    { section: 'Account', items: [
      { id: 'leave',        label: 'Leave Management',       icon: 'calendar', path: '/faculty/leave' },
      { id: 'ai-tools',     label: 'AI Teaching Tools',      icon: 'cpu', path: '/faculty/ai-tools' },
      { id: 'profile',      label: 'Profile',                icon: 'shield', path: '/faculty/profile' },
      { id: 'notifications',label: 'Notifications',          icon: 'bell', path: '/faculty/notifications' },
    ]},
  ],
  admin: [
    { section: 'Management', items: [
      { id: 'dashboard',    label: 'Dashboard',              icon: 'home', path: '/admin/dashboard' },
      { id: 'users',        label: 'User Management',        icon: 'users', path: '/admin/users' },
      { id: 'courses',      label: 'Course Catalog',         icon: 'book', path: '/admin/courses' },
      { id: 'departments',  label: 'Departments',            icon: 'building', path: '/admin/departments' },
      { id: 'semesters',    label: 'Semesters',              icon: 'calendar', path: '/admin/semesters' },
      { id: 'enrollments',  label: 'Enrollments',            icon: 'clipboard', path: '/admin/enrollments' },
      { id: 'timetable-mgmt',label: 'Timetable Mgmt',       icon: 'calendar', path: '/admin/timetable-mgmt' },
    ]},
    { section: 'Enterprise', items: [
      { id: 'academic-core',label: 'Academic Core',          icon: 'building', path: '/admin/academic-core' },
      { id: 'curriculum',   label: 'Curriculum Builder',     icon: 'edit', path: '/admin/curriculum' },
      { id: 'catalog',      label: 'Central Catalog',        icon: 'book', path: '/admin/catalog' },
      { id: 'cert-approval',label: 'Certificate Approval',   icon: 'award', path: '/admin/cert-approval' },
      { id: 'roles',        label: 'Roles & Permissions',    icon: 'shield', path: '/admin/roles' },
      { id: 'announcements',label: 'Announcements',          icon: 'bell', path: '/admin/announcements' },
      { id: 'library-mgmt', label: 'Library Management',     icon: 'library', path: '/admin/library-mgmt' },
      { id: 'placement-mgmt',label: 'Placement Management',  icon: 'briefcase', path: '/admin/placement-mgmt' },
      { id: 'calendar-mgmt',label: 'Academic Calendar',      icon: 'calendar', path: '/admin/calendar-mgmt' },
    ]},
    { section: 'System', items: [
      { id: 'system-health',label: 'System Health',           icon: 'cpu', path: '/admin/system-health' },
      { id: 'audit',        label: 'Audit & Logs',            icon: 'shield', path: '/admin/audit' },
      { id: 'file-mgmt',    label: 'File Management',         icon: 'file', path: '/admin/file-mgmt' },
      { id: 'email',        label: 'Email Broadcast',         icon: 'mail', path: '/admin/email' },
      { id: 'backup',       label: 'Backup & Restore',        icon: 'download', path: '/admin/backup' },
      { id: 'settings',     label: 'Configuration',           icon: 'settings', path: '/admin/settings' },
      { id: 'helpdesk',     label: 'Help Desk',               icon: 'headphones', path: '/admin/helpdesk' },
    ]},
    { section: 'Account', items: [
      { id: 'reports',      label: 'Reports Center',          icon: 'chart', path: '/admin/reports' },
      { id: 'profile',      label: 'Profile',                 icon: 'shield', path: '/admin/profile' },
      { id: 'notifications',label: 'Notifications',           icon: 'bell', path: '/admin/notifications' },
    ]},
  ],
  management: [
    { section: 'Executive View', items: [
      { id: 'dashboard',    label: 'Executive Dashboard',     icon: 'home', path: '/management/dashboard' },
      { id: 'users',        label: 'User Management',         icon: 'users', path: '/management/users' },
      { id: 'analytics',    label: 'Analytics & Reports',     icon: 'chart', path: '/management/analytics' },
      { id: 'kpis',         label: 'Institutional KPIs',      icon: 'chart', path: '/management/kpis' },
      { id: 'departments',  label: 'Dept Comparison',         icon: 'building', path: '/management/departments' },
    ]},
    { section: 'Performance', items: [
      { id: 'faculty-perf', label: 'Faculty Performance',     icon: 'users', path: '/management/faculty-perf' },
      { id: 'student-perf', label: 'Student Performance',     icon: 'users', path: '/management/student-perf' },
      { id: 'placement-analytics',label: 'Placement Analytics',icon: 'briefcase', path: '/management/placement-analytics' },
      { id: 'research',     label: 'Research Statistics',     icon: 'file', path: '/management/research' },
    ]},
    { section: 'Governance', items: [
      { id: 'academic-core',label: 'Academic Operations',    icon: 'building', path: '/management/academic-core' },
      { id: 'curriculum',   label: 'Curriculum Strategy',    icon: 'award', path: '/management/curriculum' },
      { id: 'approvals',    label: 'Approval Center',         icon: 'check', badge: 4, path: '/management/approvals' },
      { id: 'courses',      label: 'Course Approvals',        icon: 'book', badge: 1, path: '/management/courses' },
      { id: 'budget',       label: 'Budget Overview',          icon: 'chart', path: '/management/budget' },
      { id: 'risk-alerts',  label: 'Risk Alerts',             icon: 'bell', path: '/management/risk-alerts' },
      { id: 'accreditation',label: 'Accreditation',            icon: 'award', path: '/management/accreditation' },
      { id: 'audit',        label: 'Compliance Logs',          icon: 'shield', path: '/management/audit' },
    ]},
    { section: 'AI & Account', items: [
      { id: 'ai-insights',  label: 'AI Insights',             icon: 'cpu', path: '/management/ai-insights' },
      { id: 'predictive',   label: 'Predictive Analytics',    icon: 'zap', path: '/management/predictive' },
      { id: 'executive-reports',label: 'Executive Reports',    icon: 'download', path: '/management/executive-reports' },
      { id: 'placement',    label: 'Placement Stats',          icon: 'briefcase', path: '/management/placement' },
      { id: 'profile',      label: 'Profile',                 icon: 'shield', path: '/management/profile' },
      { id: 'notifications',label: 'Notifications',            icon: 'bell', path: '/management/notifications' },
    ]},
  ],
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout, onClose }) {
  const { theme, setTheme, dark, setDark } = useTheme();
  const navSections = NAV_CONFIG[user?.role] || [];
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="M3.27 6.96L12 12.01l8.73-5.05" />
            <path d="M12 22.08V12" />
          </svg>
        </div>
        <div>
          <div className="sidebar-brand">CampusSphere</div>
          <div className="sidebar-tagline">Academic Intelligence</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--sidebar-fg-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
            aria-label="Close sidebar"
          >
            <Icon d={ICONS.x} size={16} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onClose?.()}
                  role="button"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">
                    <Icon d={ICONS[item.icon] || ICONS.home} size={16} />
                  </span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Theme Swatches */}
        <div className="theme-switcher">
          <label>Theme</label>
          <div className="theme-swatches">
            {Object.entries(THEME_SWATCHES).map(([name, color]) => (
              <button
                key={name}
                title={name.charAt(0).toUpperCase() + name.slice(1)}
                className={`theme-swatch ${theme === name ? 'active' : ''}`}
                style={{ background: color }}
                onClick={() => setTheme(name)}
                aria-label={`${name} theme`}
              />
            ))}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="dark-toggle">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Icon d={dark ? ICONS.moon : ICONS.sun} size={13} />
            {dark ? 'Dark' : 'Light'} Mode
          </span>
          <label className="toggle-switch" aria-label="Toggle dark mode">
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
            <span className="toggle-track"></span>
          </label>
        </div>

        <button className="logout-btn" onClick={onLogout} aria-label="Sign out">
          <Icon d={ICONS.logout} size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────────────────
function Topbar({ user, onSearchChange, searchQuery, onSearchClick, onMenuClick }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { data: notifData } = useNotifications();
  const notifications = notifData?.notifications || notifData || [];
  const unread = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  const location = useLocation();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = user
    ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || user.email || 'User')
    : 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rolePill = { student: 'Student', faculty: 'Faculty', admin: 'Admin', management: 'Management' };

  let breadcrumb = 'Dashboard';
  const navSections = NAV_CONFIG[user?.role] || [];
  for (const sec of navSections) {
    const item = sec.items.find(i => location.pathname.startsWith(i.path));
    if (item) {
      breadcrumb = `${sec.section} / ${item.label}`;
      break;
    }
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile hamburger — shown via CSS at ≤1024px */}
        <button
          className="icon-btn mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Icon d={ICONS.menu} size={17} />
        </button>
        <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
          {breadcrumb}
        </div>
      </div>

      <div className="topbar-search" onClick={onSearchClick} style={{ cursor: 'pointer' }}>
        <Icon d={ICONS.search} size={14} />
        <input
          type="text"
          placeholder="Search courses, users, assignments…"
          value={searchQuery}
          onChange={e => onSearchChange && onSearchChange(e.target.value)}
          readOnly
          aria-label="Open search"
        />
        <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '1px 6px', border: '1px solid var(--border)', borderRadius: 4, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>⌘K</span>
      </div>

      <div className="topbar-actions">
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Icon d={ICONS.bell} size={16} />
            {unread > 0 && <span className="badge">{unread}</span>}
          </button>

          {showNotifs && (
            <div className="notifications-panel" role="dialog" aria-label="Notifications">
              <div className="card-header" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Notifications</div>
                  {unread > 0 && <span className="badge badge-accent">{unread} new</span>}
                </div>
                {unread > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 11, cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {Array.isArray(notifications) && notifications.slice(0, 5).map(n => (
                <div
                  key={n._id || n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => !n.read && markReadMutation.mutate(n._id || n.id)}
                  style={{ cursor: !n.read ? 'pointer' : 'default' }}
                >
                  {!n.read && <div className="notif-dot"></div>}
                  {n.read && <div style={{ width: 8 }}></div>}
                  <div className="notif-content">
                    <div className="notif-title">{n.title || n.type}</div>
                    <div className="notif-desc">{n.description || n.message}</div>
                    <div className="notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : ''}</div>
                  </div>
                </div>
              ))}
              {(!Array.isArray(notifications) || notifications.length === 0) && (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                  No notifications yet
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user-info-topbar">
          <div className="name">{displayName}</div>
          <div className="role">{rolePill[user?.role] || user?.role}</div>
        </div>
        <div className="user-avatar" title="Profile" aria-label={`${displayName} profile`}>{initials}</div>
      </div>
    </header>
  );
}

// ── APP SHELL LAYOUT ───────────────────────────────────────────────────────
export default function Layout({ children, searchQuery, onSearchChange }) {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-shell">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          user={user}
          onLogout={logout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="main-area">
        <Topbar
          user={user}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchClick={() => setIsSearchOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-body">{children}</main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(path) => navigate(path)} />
    </div>
  );
}

export { Icon, ICONS };
