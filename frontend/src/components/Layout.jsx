import { useState, useRef, useEffect } from 'react';
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
      { id: 'dashboard',    label: 'Dashboard',           icon: 'home' },
      { id: 'courses',      label: 'My Courses',          icon: 'book' },
      { id: 'assignments',  label: 'Assignments',         icon: 'clipboard', badge: 2 },
      { id: 'assessments',  label: 'Quizzes & Tests',     icon: 'zap' },
      { id: 'attendance',   label: 'My Attendance',        icon: 'calendar' },
      { id: 'timetable',    label: 'Weekly Timetable',     icon: 'calendar' },
      { id: 'progress',     label: 'Learning Progress',    icon: 'chart' },
    ]},
    { section: 'Academic', items: [
      { id: 'plan',         label: 'Degree Plan',          icon: 'check' },
      { id: 'registration', label: 'Course Registration',  icon: 'plus' },
      { id: 'transcript',   label: 'Grades & Transcript',  icon: 'file' },
      { id: 'certificates', label: 'Certificates',         icon: 'award' },
      { id: 'acad-calendar',label: 'Academic Calendar',     icon: 'calendar' },
      { id: 'downloads',    label: 'Download Center',       icon: 'download' },
    ]},
    { section: 'Services', items: [
      { id: 'library',      label: 'Digital Library',       icon: 'library' },
      { id: 'placement',    label: 'Placement Portal',      icon: 'briefcase' },
      { id: 'discussions',  label: 'Communication Hub',     icon: 'mail' },
      { id: 'fees',         label: 'Fee & Payments',        icon: 'shield' },
      { id: 'helpdesk',     label: 'Help Desk',             icon: 'headphones', badge: 1 },
    ]},
    { section: 'AI & Account', items: [
      { id: 'ai-assistant', label: 'AI Assistant',          icon: 'cpu' },
      { id: 'activity',     label: 'Activity Timeline',     icon: 'eye' },
      { id: 'profile',      label: 'My Profile & ID',       icon: 'shield' },
      { id: 'notifications',label: 'Notifications',         icon: 'bell', badge: 3 },
    ]},
  ],
  faculty: [
    { section: 'Teaching', items: [
      { id: 'dashboard',    label: 'Dashboard',             icon: 'home' },
      { id: 'courses',      label: 'My Courses',            icon: 'book' },
      { id: 'content',      label: 'Course Content',        icon: 'file' },
      { id: 'assessments',  label: 'Assessments',           icon: 'zap' },
      { id: 'assignments',  label: 'Assignments',           icon: 'clipboard' },
      { id: 'attendance',   label: 'Mark Attendance',        icon: 'calendar' },
      { id: 'timetable',    label: 'My Timetable',           icon: 'calendar' },
    ]},
    { section: 'Student Management', items: [
      { id: 'users',        label: 'User Management',        icon: 'users' },
      { id: 'performance',  label: 'Student Performance',    icon: 'chart' },
      { id: 'grades',       label: 'Grade Submission',       icon: 'edit' },
      { id: 'completion',   label: 'Course Completion',      icon: 'check' },
      { id: 'feedback',     label: 'Student Feedback',       icon: 'mail' },
    ]},
    { section: 'Communication', items: [
      { id: 'discussions',  label: 'Communication Hub',      icon: 'mail' },
      { id: 'announcements',label: 'Announcements',          icon: 'bell' },
      { id: 'analytics',    label: 'Analytics',              icon: 'chart' },
    ]},
    { section: 'Account', items: [
      { id: 'leave',        label: 'Leave Management',       icon: 'calendar' },
      { id: 'ai-tools',     label: 'AI Teaching Tools',      icon: 'cpu' },
      { id: 'profile',      label: 'Profile',                icon: 'shield' },
      { id: 'notifications',label: 'Notifications',          icon: 'bell' },
    ]},
  ],
  admin: [
    { section: 'Management', items: [
      { id: 'dashboard',    label: 'Dashboard',              icon: 'home' },
      { id: 'users',        label: 'User Management',        icon: 'users' },
      { id: 'courses',      label: 'Course Catalog',         icon: 'book' },
      { id: 'departments',  label: 'Departments',            icon: 'building' },
      { id: 'semesters',    label: 'Semesters',              icon: 'calendar' },
      { id: 'enrollments',  label: 'Enrollments',            icon: 'clipboard' },
      { id: 'timetable-mgmt',label: 'Timetable Mgmt',       icon: 'calendar' },
    ]},
    { section: 'Enterprise', items: [
      { id: 'academic-core',label: 'Academic Core',          icon: 'building' },
      { id: 'curriculum',   label: 'Curriculum Builder',     icon: 'edit' },
      { id: 'catalog',      label: 'Central Catalog',        icon: 'book' },
      { id: 'cert-approval',label: 'Certificate Approval',   icon: 'award' },
      { id: 'roles',        label: 'Roles & Permissions',    icon: 'shield' },
      { id: 'announcements',label: 'Announcements',          icon: 'bell' },
      { id: 'library-mgmt', label: 'Library Management',     icon: 'library' },
      { id: 'placement-mgmt',label: 'Placement Management',  icon: 'briefcase' },
      { id: 'calendar-mgmt',label: 'Academic Calendar',      icon: 'calendar' },
    ]},
    { section: 'System', items: [
      { id: 'system-health',label: 'System Health',           icon: 'cpu' },
      { id: 'audit',        label: 'Audit & Logs',            icon: 'shield' },
      { id: 'file-mgmt',    label: 'File Management',         icon: 'file' },
      { id: 'email',        label: 'Email Broadcast',         icon: 'mail' },
      { id: 'backup',       label: 'Backup & Restore',        icon: 'download' },
      { id: 'settings',     label: 'Configuration',           icon: 'settings' },
      { id: 'helpdesk',     label: 'Help Desk',               icon: 'headphones' },
    ]},
    { section: 'Account', items: [
      { id: 'reports',      label: 'Reports Center',          icon: 'chart' },
      { id: 'profile',      label: 'Profile',                 icon: 'shield' },
      { id: 'notifications',label: 'Notifications',           icon: 'bell' },
    ]},
  ],
  management: [
    { section: 'Executive View', items: [
      { id: 'dashboard',    label: 'Executive Dashboard',     icon: 'home' },
      { id: 'users',        label: 'User Management',         icon: 'users' },
      { id: 'analytics',    label: 'Analytics & Reports',     icon: 'chart' },
      { id: 'kpis',         label: 'Institutional KPIs',      icon: 'chart' },
      { id: 'departments',  label: 'Dept Comparison',         icon: 'building' },
    ]},
    { section: 'Performance', items: [
      { id: 'faculty-perf', label: 'Faculty Performance',     icon: 'users' },
      { id: 'student-perf', label: 'Student Performance',     icon: 'users' },
      { id: 'placement-analytics',label: 'Placement Analytics',icon: 'briefcase' },
      { id: 'research',     label: 'Research Statistics',     icon: 'file' },
    ]},
    { section: 'Governance', items: [
      { id: 'academic-core',label: 'Academic Operations',    icon: 'building' },
      { id: 'curriculum',   label: 'Curriculum Strategy',    icon: 'award' },
      { id: 'approvals',    label: 'Approval Center',         icon: 'check', badge: 4 },
      { id: 'courses',      label: 'Course Approvals',        icon: 'book', badge: 1 },
      { id: 'budget',       label: 'Budget Overview',          icon: 'chart' },
      { id: 'risk-alerts',  label: 'Risk Alerts',             icon: 'bell' },
      { id: 'accreditation',label: 'Accreditation',            icon: 'award' },
      { id: 'audit',        label: 'Compliance Logs',          icon: 'shield' },
    ]},
    { section: 'AI & Account', items: [
      { id: 'ai-insights',  label: 'AI Insights',             icon: 'cpu' },
      { id: 'predictive',   label: 'Predictive Analytics',    icon: 'zap' },
      { id: 'executive-reports',label: 'Executive Reports',    icon: 'download' },
      { id: 'placement',    label: 'Placement Stats',          icon: 'briefcase' },
      { id: 'profile',      label: 'Profile',                 icon: 'shield' },
      { id: 'notifications',label: 'Notifications',            icon: 'bell' },
    ]},
  ],
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────
function Sidebar({ currentPage, onNavigate, user, onLogout, onClose }) {
  const { theme, setTheme, dark, setDark } = useTheme();
  const navSections = NAV_CONFIG[user?.role] || [];

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
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => { onNavigate(item.id); onClose?.(); }}
                role="button"
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <Icon d={ICONS[item.icon] || ICONS.home} size={16} />
                </span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
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
function Topbar({ user, currentPageLabel, onSearchChange, searchQuery, onSearchClick, onMenuClick }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { data: notifData } = useNotifications();
  const notifications = notifData?.notifications || notifData || [];
  const unread = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

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
  if (currentPageLabel !== 'Dashboard') {
    const navSections = NAV_CONFIG[user?.role] || [];
    for (const sec of navSections) {
      const item = sec.items.find(i => i.label === currentPageLabel);
      if (item) {
        breadcrumb = `${sec.section} / ${item.label}`;
        break;
      }
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
          onChange={e => onSearchChange(e.target.value)}
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
export default function Layout({ children, currentPage, onNavigate, searchQuery, onSearchChange }) {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const allNavItems = Object.values(NAV_CONFIG).flat().flatMap(s => s.items);
  const currentLabel = allNavItems.find(i => i.id === currentPage)?.label || 'Dashboard';

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
          currentPage={currentPage}
          onNavigate={onNavigate}
          user={user}
          onLogout={logout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="main-area">
        <Topbar
          user={user}
          currentPageLabel={currentLabel}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchClick={() => setIsSearchOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-body">{children}</main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={onNavigate} />
    </div>
  );
}

export { Icon, ICONS };
