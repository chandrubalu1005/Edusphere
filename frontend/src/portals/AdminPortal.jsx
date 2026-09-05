import { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';

import {
  useLiveAdminUsers, useLiveCourses, useLiveDepartments,
  useLiveSemesters, useLiveEnrollments, useLiveAuditLogs, useLiveProfile, useLiveUsers
} from '../api/liveData.js';
import * as F from './admin/features.jsx';
import { useBulkUpdateUsers, useApproveCourse, useRejectCourse, useCreateCourse, useUpdateProfile , useSystemHealth, useSupportTickets } from '../api/hooks.js';
import toast from 'react-hot-toast';

import ProfilePage from '../components/profile/ProfilePage.jsx';
import UserManagement from '../components/users/UserManagement.jsx';
import { profileThemes } from '../components/profile/profileTheme.js';
import AcademicManagement from './management/AcademicManagement.jsx';
import CurriculumBuilder from './management/CurriculumBuilder.jsx';
import CourseCatalog from './management/CourseCatalog.jsx';
import { 
  Building2, GraduationCap, LayoutDashboard, Settings, Users, 
  ShieldCheck, ShieldAlert, Fingerprint, Activity, Shield, Server,
  Building, BookOpen, Calendar, ClipboardCheck, Ticket, HeartPulse 
} from 'lucide-react';

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDashboard({ onNavigate }) {
  const { data: USERS, total: totalUsersCount } = useLiveAdminUsers();
  const { data: COURSES, total: totalCoursesCount } = useLiveCourses();
  const { data: DEPARTMENTS } = useLiveDepartments();
  const { data: SEMESTERS } = useLiveSemesters();
  const { data: ENROLLMENTS } = useLiveEnrollments();
  const { data: AUDIT_LOGS } = useLiveAuditLogs();
  const { data: SUPPORT_TICKETS = [] } = { data: [] };
  const { data: MONTHLY_ENROLLMENT = [] } = { data: [] };

  const totalUsers = totalUsersCount || USERS.length;
  const activeUsers = USERS.filter(u => u.status === 'active' || u.active !== false).length; 
  const totalCourses = totalCoursesCount || COURSES.length;

  return (
    <div>
      <PageHeader title="System Administration" subtitle="University-wide control panel.">
        <button className="btn btn-outline btn-sm">
          <Icon d={ICONS.download} size={13} /> System Report
        </button>
      </PageHeader>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <Icon d={ICONS.shield} size={15} />
        <div><strong>System Health:</strong> {healthData?.overall === 'healthy' ? 'All services operational' : 'Degraded performance detected'} · DB status: {healthData?.database?.status === 'connected' ? 'Connected' : 'Error'}</div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total Users', value: totalUsers, sub: `${activeUsers} active`, icon: <Users size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'users' },
          { label: 'Total Courses', value: totalCourses, sub: `${COURSES.filter(c => c.status === 'published').length} published`, icon: <BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'courses' },
          { label: 'Departments', value: DEPARTMENTS.length, sub: 'Active departments', icon: <Building size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'departments' },
          { label: 'Active Semester', value: SEMESTERS.filter(s => s.status === 'active').length, sub: 'Running semesters', icon: <Calendar size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'semesters' },
          { label: 'Enrollments', value: ENROLLMENTS.length, sub: 'This semester', icon: <ClipboardCheck size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'enrollments' },
          { label: 'Open Tickets', value: SUPPORT_TICKETS.filter(t => t.status === 'open').length, sub: 'Awaiting response', icon: <Ticket size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, page: 'helpdesk' },
          { label: 'System Health', value: healthData?.overall === 'healthy' ? 'Operational' : 'Degraded', sub: 'Metrics Dashboard', icon: <HeartPulse size={24} color={healthData?.overall === 'healthy' ? 'var(--success)' : 'var(--danger)'} strokeWidth={1.5} />, page: 'system-health' },
        ].map(s => (
          <div className="stat-card" key={s.label} onClick={() => onNavigate(s.page)} style={{ cursor: 'pointer' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value sm">{s.value}</div>
            <div className="stat-trend trend-neutral" style={{ fontSize: 12 }}>{s.sub}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Recent Audit Logs */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-title">Recent Audit Activity</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('audit')}>View all →</button>
        </div>
        <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr><th>User</th><th>Action</th><th>Description</th><th>IP</th><th>Time</th></tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.slice(0, 5).map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.username}</td>
                  <td><span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{log.action}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{log.description}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.ipAddress}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{log.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly enrollment sparkline */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Annual Enrollment Trend</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {MONTHLY_ENROLLMENT.map(m => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(m.students / 1600) * 80}px`,
                  background: 'linear-gradient(180deg, var(--accent) 0%, var(--secondary) 100%)',
                  borderRadius: '3px 3px 0 0', opacity: 0.8,
                }}></div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DEPARTMENTS ─────────────────────────────────────────────────────────────
function DepartmentManagement() {
  const { data: DEPARTMENTS = [] } = useLiveDepartments();
  const { data: COURSES = [] } = useLiveCourses();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage academic departments and their resources.">
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon d={ICONS.plus} size={15} /> Add Department
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {DEPARTMENTS.map(dept => (
          <div className="card" key={dept.id}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)', letterSpacing: -0.5 }}>{dept.code}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{dept.name}</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{dept.faculty_count}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Faculty</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--secondary)' }}>{dept.student_count.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Students</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span><Users size={14} /> Head:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{dept.head}</span>
              </div>
            </div>
            <div className="course-card-footer">
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                {COURSES.filter(c => c.dept_code === dept.code).length} courses
              </span>
              <button className="btn btn-ghost btn-sm"><Icon d={ICONS.edit} size={13} /> Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── COURSE CATALOG (ADMIN) ─────────────────────────────────────────────────
function AdminCourses() {
  const [filter, setFilter] = useState('all');
  const { data: USERS } = useLiveAdminUsers();
  const { data: COURSES = [] } = useLiveCourses();
  const approveCourse = useApproveCourse();
  const rejectCourse = useRejectCourse();
  const createCourse = useCreateCourse();
  
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    code: '', credits: 3, title: '', description: '', department: 'CSE', capacity: 60, facultyOwnerId: ''
  });

  const handleCreate = () => {
    if (!formData.code || !formData.title || !formData.facultyOwnerId) {
      toast.error('Code, Title, and Faculty Owner are required');
      return;
    }
    const facultyUser = USERS.find(u => u.id === formData.facultyOwnerId || u._id === formData.facultyOwnerId);
    createCourse.mutate({
      ...formData,
      facultyName: facultyUser ? `${facultyUser.firstName} ${facultyUser.lastName}` : 'Unknown Faculty'
    }, {
      onSuccess: () => setShowNew(false)
    });
  };

  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.status === filter);

  return (
    <div>
      <PageHeader title="Course Catalog" subtitle="Review and manage all courses in the system.">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Icon d={ICONS.plus} size={15} /> New Course
          </button>
          {['all', 'published', 'pending'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && <span className="nav-badge" style={{ position: 'static', marginLeft: 4 }}>
                {COURSES.filter(c => c.status === 'pending').length}
              </span>}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Title</th>
              <th>Faculty</th>
              <th>Dept</th>
              <th>Enrolled</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{c.code}</td>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.facultyName}</td>
                <td><span className="badge badge-neutral">{c.dept_code}</span></td>
                <td>{c.students_enrolled}/{c.capacity}</td>
                <td style={{ fontWeight: 700 }}>{c.credits}</td>
                <td>
                  <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {c.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => approveCourse.mutate(c.id || c._id)}
                          disabled={approveCourse.isLoading}
                        >✓ Approve</button>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) rejectCourse.mutate({ courseId: c.id || c._id, reason });
                          }}
                          disabled={rejectCourse.isLoading}
                        >✗ Reject</button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm"><Icon d={ICONS.edit} size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Course Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Provision New Course</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Course Code <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. CS500" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <select className="form-input" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}>
                    <option value={3}>3</option><option value={4}>4</option><option value={5}>5</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Course Title <span className="required">*</span></label>
                <input className="form-input" placeholder="Full course title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Course overview and objectives…" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                    <option>CSE</option><option>EEE</option><option>MATH</option><option>PHY</option><option>MBA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input className="form-input" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Designate Faculty Owner <span className="required">*</span></label>
                <select className="form-input" value={formData.facultyOwnerId} onChange={e => setFormData({ ...formData, facultyOwnerId: e.target.value })}>
                  <option value="">Select Faculty...</option>
                  {USERS.filter(u => u.role === 'faculty').map(f => (
                    <option key={f.id || f._id} value={f.id || f._id}>{f.firstName} {f.lastName} ({f.department})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNew(false)} disabled={createCourse.isPending}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={createCourse.isPending}>
                {createCourse.isPending ? 'Creating...' : 'Provision Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SEMESTERS ──────────────────────────────────────────────────────────────
function SemesterManagement() {
  const { data: SEMESTERS = [] } = useLiveSemesters();
  return (
    <div>
      <PageHeader title="Academic Calendar & Semesters" subtitle="Manage academic periods and key dates.">
        <button className="btn btn-primary"><Icon d={ICONS.plus} size={15} /> New Semester</button>
      </PageHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SEMESTERS.map(s => (
          <div className="card" key={s.id}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {s.status === 'active' ? '● Active' : '○ Completed'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>AY {s.year}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-1)' }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} /> {new Date(s.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} —{' '}
                    {new Date(s.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm"><Icon d={ICONS.edit} size={13} /> Edit</button>
                  {s.status === 'active' && <button className="btn btn-danger btn-sm">End Semester</button>}
                </div>
              </div>

              {/* Timeline */}
              {s.status === 'active' && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                    <span>Start: {s.start}</span>
                    <span>Progress: {Math.round(((new Date() - new Date(s.start)) / (new Date(s.end) - new Date(s.start))) * 100)}%</span>
                    <span>End: {s.end}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: `${Math.round(((new Date() - new Date(s.start)) / (new Date(s.end) - new Date(s.start))) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUDIT LOGS ─────────────────────────────────────────────────────────────
function AuditLogs() {
  const { data: AUDIT_LOGS = [] } = useLiveAuditLogs();
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Complete system activity trail for compliance and security.">
        <button className="btn btn-outline btn-sm"><Icon d={ICONS.download} size={13} /> Export CSV</button>
      </PageHeader>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Description</th><th>IP Address</th></tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map(log => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{log.createdAt}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{log.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{log.userId}</div>
                </td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4,
                    color: log.action.includes('create') || log.action.includes('approved') ? 'var(--secondary)'
                          : log.action.includes('delete') || log.action.includes('deactivated') ? 'var(--danger)'
                          : 'var(--text-2)',
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{log.description}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SYSTEM SETTINGS ────────────────────────────────────────────────────────
function SystemSettings() {
  const [tab, setTab] = useState('general');

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Configure the CampusSphere platform." />

      <div className="tabs">
        {['general', 'email', 'security', 'integrations'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tab === 'general' && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input className="form-input" defaultValue="CampusSphere University" />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution Code</label>
                  <input className="form-input" defaultValue="ESU-2026" style={{ fontFamily: 'var(--font-mono)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Support Email</label>
                <input className="form-input" defaultValue="support@edusphere.edu" type="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Attendance Requirement (%)</label>
                <input className="form-input" defaultValue={75} type="number" style={{ maxWidth: 120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Default Late Penalty per Day (%)</label>
                <input className="form-input" defaultValue={5} type="number" style={{ maxWidth: 120 }} />
              </div>
            </>
          )}
          {tab === 'email' && (
            <>
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input className="form-input" defaultValue="smtp.gmail.com" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input className="form-input" defaultValue={587} type="number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Encryption</label>
                  <select className="form-input"><option>TLS</option><option>SSL</option></select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sender Email</label>
                <input className="form-input" defaultValue="noreply@edusphere.edu" type="email" />
              </div>
            </>
          )}
          {tab === 'security' && (
            <>
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input className="form-input" defaultValue={60} type="number" style={{ maxWidth: 120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Failed Login Attempts</label>
                <input className="form-input" defaultValue={5} type="number" style={{ maxWidth: 120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">JWT Access Token Expiry</label>
                <select className="form-input" style={{ maxWidth: 200 }}>
                  <option>15m</option><option>30m</option><option>1h</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Allowed IP Ranges (CIDR)</label>
                <textarea className="form-input" rows={3} defaultValue="0.0.0.0/0" placeholder="One per line…" />
              </div>
            </>
          )}
          {tab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Meilisearch', status: 'disconnected', url: 'http://es-meili:7700' },
                { name: 'Redis Cache', status: 'disconnected', url: 'redis://es-redis:6379' },
                { name: 'RabbitMQ', status: 'disconnected', url: 'amqp://es-rabbitmq:5672' },
                { name: 'MinIO Storage', status: 'disconnected', url: 'http://es-minio:9000' },
                { name: 'Mails (Nodemailer)', status: 'connected', url: 'smtp.gmail.com:587' },
              ].map(i => (
                <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.name}</div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{i.url}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${i.status === 'connected' ? 'badge-success' : 'badge-danger'}`}>
                      {i.status === 'connected' ? '● Connected' : '○ Disconnected'}
                    </span>
                    <button className="btn btn-outline btn-sm">Test</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ paddingTop: 8 }}>
            <button className="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ENROLLMENTS ────────────────────────────────────────────────────────────
function EnrollmentManagement() {
  const { data: ENROLLMENTS = [] } = useLiveEnrollments();
  const { data: USERS = [] } = useLiveUsers();
  const { data: COURSES = [] } = useLiveCourses();

  return (
    <div>
      <PageHeader title="Enrollment Management" subtitle="View and manage student course enrollments.">
        <button className="btn btn-outline btn-sm"><Icon d={ICONS.download} size={13} /> Export</button>
      </PageHeader>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Student</th><th>Course</th><th>Status</th><th>Progress</th><th>Enrolled</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {ENROLLMENTS.map(e => {
              const student = USERS.find(u => u.id === e.studentId);
              const course = COURSES.find(c => c.id === e.courseId);
              return (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{student?.firstName} {student?.lastName}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.courseCode}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{e.courseTitle}</div>
                  </td>
                  <td><span className="badge badge-success">{e.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${e.progress}%` }}></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{e.progress}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{e.enrolledAt}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Unenroll</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ADMIN HELP DESK ────────────────────────────────────────────────────────
function AdminHelpDesk() {
  const { data: SUPPORT_TICKETS = [] } = { data: [] };
  return (
    <div>
      <PageHeader title="Help Desk" subtitle="Manage all student support tickets." />

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Open', value: SUPPORT_TICKETS.filter(t => t.status === 'open').length, color: 'var(--warning)' },
          { label: 'In Progress', value: SUPPORT_TICKETS.filter(t => t.status === 'in-progress').length, color: 'var(--info)' },
          { label: 'Resolved Today', value: 8, color: 'var(--secondary)' },
          { label: 'Avg Resolution Time', value: '4h', color: 'var(--text-1)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value sm" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>ID</th><th>Student</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {SUPPORT_TICKETS.map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>#{t.id}</td>
                <td style={{ fontWeight: 600 }}>{t.studentName}</td>
                <td>{t.title}</td>
                <td><span className="badge badge-neutral">{t.category}</span></td>
                <td>
                  <span className={`badge ${t.priority === 'high' ? 'badge-danger' : t.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                    {t.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge ${t.status === 'open' ? 'badge-warning' : t.status === 'in-progress' ? 'badge-info' : 'badge-success'}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm">Respond</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ── ADMIN PROFILE ────────────────────────────────────────────────────────────
function AdminProfile({ user }) {
  const { data: profile, isLoading } = useLiveProfile(user.id || user._id);
  const { data: auditLogs } = useLiveAuditLogs();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const displayFirstName = profile?.firstName || user.firstName || 'System';
  const displayLastName = profile?.lastName || user.lastName || 'Administrator';
  const fullName = `${displayFirstName} ${displayLastName}`.trim();

  const formattedProfile = {
    userId: user.id || user._id,
    name: fullName,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    designation: 'System Administrator',
    department: 'IT Operations',
    id: (user.id || user._id).toUpperCase(),
    idLabel: 'Admin ID',
    status: 'System Active',
    avatar: 'N/A',
    email: user.email,
    phone: profile?.phone,
    dob: profile?.dob,
    gender: profile?.gender,
    address: profile?.address,
    bio: profile?.bio,
    professionalTitle: 'Administrative Information',
    professional: [
      ['Department', 'IT Operations'],
      ['Role', 'Super Administrator'],
      ['Experience', 'N/A'],
      ['Date of Joining', 'N/A']
    ],
    statsTitle: 'Account Overview',
    stats: [
      { icon: ShieldCheck, label: 'Status', value: 'Active', helper: 'System checks passed' },
      { icon: ShieldAlert, label: 'Security Logs', value: auditLogs?.length || 0, helper: 'Recorded actions' },
      { icon: Fingerprint, label: 'MFA Status', value: 'Enabled', helper: '2FA Active' },
      { icon: Activity, label: 'Last Login', value: 'Just now', helper: 'Current session' }
    ],
    activities: auditLogs?.slice(0, 3).map(log => ({
      title: log.action,
      description: `Target: ${log.targetId}`,
      time: new Date(log.timestamp).toLocaleString(),
      icon: Settings
    })) || [],
    metadata: [
      { icon: Shield, label: 'Role', value: 'Super Admin' },
      { icon: Server, label: 'Access Level', value: 'Global' }
    ]
  };

  return (
    <ProfilePage
      profile={formattedProfile}
      accent={profileThemes.admin}
      updateProfileHook={updateProfile}
    >
    </ProfilePage>
  );
}

// ── ADMIN PORTAL ROUTER ────────────────────────────────────────────────────
const PagePlaceholder = ({ title }) => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>
    <h2>{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

function AdminPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(`/admin/${path}`);

  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard onNavigate={handleNavigate} />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="courses" element={<AdminCourses />} />
      <Route path="departments" element={<DepartmentManagement />} />
      <Route path="semesters" element={<SemesterManagement />} />
      <Route path="enrollments" element={<EnrollmentManagement />} />
      <Route path="audit" element={<F.AuditLogsCenter />} />
      <Route path="settings" element={<F.ConfigurationCenter />} />
      <Route path="helpdesk" element={<AdminHelpDesk />} />
      <Route path="notifications" element={<div style={{ padding: 20 }}><h1 className="page-title">Notifications</h1></div>} />
      <Route path="profile" element={<AdminProfile user={user} />} />
      <Route path="timetable-mgmt" element={<F.TimetableMgmt />} />
      <Route path="cert-approval" element={<F.CertificateApproval />} />
      <Route path="roles" element={<F.RolePermissions />} />
      <Route path="system-health" element={<F.SystemHealth />} />
      <Route path="backup" element={<F.BackupRestore />} />
      <Route path="library-mgmt" element={<F.LibraryManagement />} />
      <Route path="placement-mgmt" element={<F.PlacementManagement />} />
      <Route path="email" element={<F.EmailBroadcast />} />
      <Route path="file-mgmt" element={<F.FileManager />} />
      <Route path="academic-core" element={<AcademicManagement />} />
      <Route path="curriculum" element={<CurriculumBuilder />} />
      <Route path="catalog" element={<CourseCatalog />} />
      <Route path="departments" element={<PagePlaceholder title="Departments" />} />
        <Route path="semesters" element={<PagePlaceholder title="Semesters" />} />
        <Route path="enrollments" element={<PagePlaceholder title="Enrollments" />} />
        <Route path="timetable-mgmt" element={<PagePlaceholder title="Timetable Management" />} />
        <Route path="academic-core" element={<PagePlaceholder title="Academic Core" />} />
        <Route path="cert-approval" element={<PagePlaceholder title="Certificate Approval" />} />
        <Route path="roles" element={<PagePlaceholder title="Roles & Permissions" />} />
        <Route path="announcements" element={<PagePlaceholder title="Announcements" />} />
        <Route path="library-mgmt" element={<PagePlaceholder title="Library Management" />} />
        <Route path="placement-mgmt" element={<PagePlaceholder title="Placement Management" />} />
        <Route path="calendar-mgmt" element={<PagePlaceholder title="Academic Calendar" />} />
        <Route path="system-health" element={<PagePlaceholder title="System Health" />} />
        <Route path="audit" element={<PagePlaceholder title="Audit & Logs" />} />
        <Route path="file-mgmt" element={<PagePlaceholder title="File Management" />} />
        <Route path="email" element={<PagePlaceholder title="Email Broadcast" />} />
        <Route path="backup" element={<PagePlaceholder title="Backup & Restore" />} />
        <Route path="settings" element={<PagePlaceholder title="Configuration" />} />
        <Route path="helpdesk" element={<PagePlaceholder title="Help Desk" />} />
        <Route path="reports" element={<PagePlaceholder title="Reports Center" />} />
        <Route path="profile" element={<PagePlaceholder title="Profile" />} />
        <Route path="notifications" element={<PagePlaceholder title="Notifications" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}


export default AdminPortal;
