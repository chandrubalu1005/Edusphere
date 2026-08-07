import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../api/hooks.js';
import CommandPalette from './shared/CommandPalette.jsx';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

const ICONS = {
  home:        'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  book:        ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'],
  calendar:    ['M3 4h18v18H3z', 'M16 2v4M8 2v4M3 10h18'],
  users:       ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75', 'M9 7m-4 0a4 4 0 108 0 4 4 0 10-8 0'],
  chart:       ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  settings:    ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'],
  bell:        ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  search:      ['M11 17.25A6.25 6.25 0 1117.25 11 6.26 6.26 0 0111 17.25z', 'M16 16l4.5 4.5'],
  logout:      ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  clipboard:   ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'M9 2h6a1 1 0 010 2H9a1 1 0 010-2z'],
  award:       ['M12 15a7 7 0 100-14 7 7 0 000 14z', 'M8.21 13.89L7 23l5-3 5 3-1.21-9.12'],
  zap:         'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  shield:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  file:        ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'],
  mail:        ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'],
  building:    ['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10'],
  check:       'M20 6L9 17l-5-5',
  plus:        ['M12 5v14', 'M5 12h14'],
  edit:        ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  trash:       ['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2'],
  eye:         ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  download:    ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  sun:         ['M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42', 'M12 17A5 5 0 1012 7a5 5 0 000 10z'],
  moon:        'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  chevron:     'M9 18l6-6-6-6',
  briefcase:   ['M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z', 'M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'],
  headphones:  ['M3 18v-6a9 9 0 0118 0v6', 'M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z'],
  library:     ['M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z', 'M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z'],
  cpu:         ['M9 3H5a2 2 0 00-2 2v4', 'M15 3h4a2 2 0 012 2v4', 'M9 21H5a2 2 0 01-2-2v-4', 'M15 21h4a2 2 0 002-2v-4', 'M9 9h6v6H9z'],
  qr:          ['M5 3H3v2h2V3z', 'M3 8V3h5v5H3z', 'M16 3h2v2h-2V3z', 'M16 8V3h5v5h-5z', 'M3 16h2v2H3v-2z', 'M3 16v5h5v-5H3z'],
  x:           ['M18 6L6 18', 'M6 6l12 12'],
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
      { id: 'notifications',label: 'Notifications',           icon: 'bell' },
    ]},
  ],
  management: [
    { section: 'Executive View', items: [
      { id: 'dashboard',    label: 'Executive Dashboard',     icon: 'home' },
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
      { id: 'notifications',label: 'Notifications',            icon: 'bell' },
    ]},
  ],
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────
function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const { theme, setTheme, dark, setDark } = useTheme();
  const navSections = NAV_CONFIG[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">E</div>
        <div>
          <div className="sidebar-brand">EduSphere</div>
          <div className="sidebar-tagline">Enterprise Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">
                  <Icon d={ICONS[item.icon] || ICONS.home} size={17} />
                </span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="theme-switcher">
          <label>Theme</label>
          <select className="theme-select" value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="university">🎓 University</option>
            <option value="corporate">💼 Corporate</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="emerald">🌿 Emerald</option>
            <option value="midnight">🌙 Midnight</option>
          </select>
        </div>
        <div className="dark-toggle">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d={dark ? ICONS.moon : ICONS.sun} size={14} />
            {dark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <label className="toggle-switch">
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
            <span className="toggle-track"></span>
          </label>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <Icon d={ICONS.logout} size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────────────────
function Topbar({ user, currentPageLabel, onSearchChange, searchQuery, onSearchClick }) {
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

  const displayName = user ? (user.username || user.email || 'User') : 'User';
  const initials    = displayName.slice(0, 2).toUpperCase();
  const rolePill    = { student: '🎓 Student', faculty: '👩‍🏫 Faculty', admin: '⚙️ Admin', management: '📊 Management' };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="topbar-search" onClick={onSearchClick} style={{ cursor: 'pointer' }}>
        <Icon d={ICONS.search} size={15} />
        <input
          type="text"
          placeholder="Search courses, users, assignments…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          readOnly
        />
        <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '1px 6px', border: '1px solid var(--border)', borderRadius: 4, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>⌘K</span>
      </div>

      <div className="topbar-actions">
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="icon-btn" onClick={() => setShowNotifs(!showNotifs)} title="Notifications">
            <Icon d={ICONS.bell} size={17} />
            {unread > 0 && <span className="badge">{unread}</span>}
          </button>

          {showNotifs && (
            <div className="notifications-panel">
              <div className="card-header" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications</div>
                  <span className="badge badge-accent">{unread} new</span>
                </div>
                {unread > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', padding: 0 }}
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
                <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user-info-topbar">
          <div className="name">{displayName}</div>
          <div className="role">{rolePill[user?.role] || user?.role}</div>
        </div>
        <div className="user-avatar" title="Profile">{initials}</div>
      </div>
    </header>
  );
}

// ── APP SHELL LAYOUT ───────────────────────────────────────────────────────
export default function Layout({ children, currentPage, onNavigate, searchQuery, onSearchChange }) {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allNavItems = Object.values(NAV_CONFIG).flat().flatMap(s => s.items);
  const currentLabel = allNavItems.find(i => i.id === currentPage)?.label || 'Dashboard';

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        user={user}
        onLogout={logout}
      />
      <div className="main-area">
        <Topbar
          user={user}
          currentPageLabel={currentLabel}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchClick={() => setIsSearchOpen(true)}
        />
        <main className="page-body">{children}</main>
      </div>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={onNavigate} />
    </div>
  );
}

export { Icon, ICONS };
