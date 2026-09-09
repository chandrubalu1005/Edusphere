import { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';

import {
  useLiveProfile,
  useLiveDepartments, useLiveDepartmentPerformance, useLiveCourses, useLiveAuditLogs, useLiveAdminUsers
, useLivePlacementStats } from '../api/liveData.js';
import { useSystemHealth, useUpdateProfile } from '../api/hooks.js';
import * as F from './management/features.jsx';
import toast from 'react-hot-toast';
import ProfilePage from '../components/profile/ProfilePage.jsx';
import UserManagement from '../components/users/UserManagement.jsx';
import { profileThemes } from '../components/profile/profileTheme.js';
import AcademicManagement from './management/AcademicManagement.jsx';
import CurriculumBuilder from './management/CurriculumBuilder.jsx';
import CourseCatalog from './management/CourseCatalog.jsx';
import { Building2, Landmark, Target, Users, LayoutDashboard, Settings, UsersRound, BookOpen, Hourglass, BarChart2, Trophy } from 'lucide-react';

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

// Greeting helper
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── EXECUTIVE DASHBOARD (Boardroom Mode) ────────────────────────────────────
function ExecutiveDashboard({ user, onNavigate }) {
  const { data: USERS = [] } = useLiveAdminUsers();
  const { data: COURSES = [] } = useLiveCourses();
  const { data: healthData } = useSystemHealth();
  const { data: MONTHLY_ENROLLMENT = [] } = { data: [] };

  const totalStudents = USERS.filter(u => u.role === 'student').length;
  const totalFaculty = USERS.filter(u => u.role === 'faculty').length;
  const publishedCourses = COURSES.filter(c => c.status === 'published').length;
  const pendingApprovals = COURSES.filter(c => c.status === 'pending').length;

  return (
    <div>
      {/* Clean Executive Dashboard Header */}
      <PageHeader
        title={`${getGreeting()}, ${user.displayName || user.username || 'Executive'}`}
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Academic Year 2025-26`}
      >
        <span className="badge badge-neutral" style={{ fontSize: 11 }}>Executive Portal</span>
      </PageHeader>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Students', value: totalStudents.toLocaleString(), icon: <Users size={24} color="var(--brand)" strokeWidth={1.5} /> },
          { label: 'Total Faculty', value: totalFaculty.toLocaleString(), icon: <UsersRound size={24} color="var(--brand)" strokeWidth={1.5} /> },
          { label: 'Course Catalog', value: publishedCourses.toLocaleString(), icon: <BookOpen size={24} color="var(--brand)" strokeWidth={1.5} /> },
          { label: 'Pending Approvals', value: pendingApprovals.toLocaleString(), icon: <Hourglass size={24} color="var(--warning)" strokeWidth={1.5} />, color: 'var(--warning)' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ overflow: 'visible' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text-3)' }}>{kpi.label}</div>
                <div>{kpi.icon}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: kpi.color || 'var(--text-1)', lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: kpi.good === true ? 'var(--success)' : kpi.good === false ? 'var(--danger)' : 'var(--text-2)' }}>
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Annual Enrollment Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Annual Enrollment Trend</div>
              <div className="card-subtitle">Monthly student registration across all programs</div>
            </div>
            <button className="btn btn-outline btn-sm"><Icon d={ICONS.download} size={13} /> Export</button>
          </div>
          <div className="card-body">
            {/* Area Chart (pure CSS) */}
            <div style={{ position: 'relative', height: 180 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '100%', paddingBottom: 24 }}>
                {MONTHLY_ENROLLMENT.map((m, i) => {
                  const h = Math.round((m.students / 1600) * 130);
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: '100%', height: `${h}px`,
                          background: i === MONTHLY_ENROLLMENT.length - 1
                            ? 'linear-gradient(180deg, var(--accent) 0%, var(--accent-light) 100%)'
                            : 'linear-gradient(180deg, var(--surface-2) 0%, transparent 100%)',
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        title={`${m.month}: ${m.students.toLocaleString()} students`}
                      >
                        {i === MONTHLY_ENROLLMENT.length - 1 && (
                          <div style={{
                            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                            fontSize: 10, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap'
                          }}>
                            {m.students.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', position: 'absolute', bottom: 0 }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Pending Actions</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingApprovals > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--warning-soft)', border: '1px solid var(--warning)', borderRadius: 8, cursor: 'pointer' }} onClick={() => onNavigate('courses')}>
                  <span style={{ fontSize: 18 }}><BookOpen size={18} color="var(--warning)" /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{pendingApprovals} Course Approvals</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Awaiting your review</div>
                  </div>
                  <Icon d={ICONS.chevron} size={14} />
                </div>
              )}
              {[
                { icon: <BarChart2 size={18} />, label: 'Q2 Report Ready', sub: 'Download quarterly report', action: 'analytics' },
                { icon: <Trophy size={18} />, label: 'Placements Updated', sub: '47 new placements this month', action: 'placement' },
              ].map(i => (
                <div
                  key={i.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => onNavigate(i.action)}
                >
                  <span style={{ fontSize: 18 }}>{i.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{i.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{i.sub}</div>
                  </div>
                  <Icon d={ICONS.chevron} size={14} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">System Health</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {healthData?.services ? healthData.services.slice(0, 5).map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{s.name.replace('-service', '')}</span>
                  <span className={`badge ${s.status === 'UP' ? 'badge-success' : 'badge-warning'}`}>
                    {s.status === 'UP' ? '● ' : '⚠ '} {s.status === 'UP' ? 'Operational' : 'Degraded'}
                  </span>
                </div>
              )) : (
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading health data...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS & REPORTS ────────────────────────────────────────────────────
function AnalyticsReports() {
  const [period, setPeriod] = useState('semester');
  const { data: DEPARTMENTS = [] } = useLiveDepartments();
  const { data: DEPT_PERFORMANCE = [] } = useLiveDepartmentPerformance();
  const { data: PLACEMENT_STATS } = useLivePlacementStats();

  return (
    <div>
      <PageHeader title="Analytics & Reports" subtitle="Comprehensive institutional performance data.">
        <div style={{ display: 'flex', gap: 8 }}>
          {['semester', 'year', '3year'].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(p)}>
              {p === 'semester' ? 'This Semester' : p === 'year' ? 'This Year' : 'Last 3 Years'}
            </button>
          ))}
          <button className="btn btn-outline btn-sm"><Icon d={ICONS.download} size={13} /> Export PDF</button>
        </div>
      </PageHeader>

      {/* Top-level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {[
          { label: 'Gross Enrollment Ratio', value: '92.4%', delta: '↑ 4.2%' },
          { label: 'Completion Rate', value: '87.8%', delta: '↑ 1.1%' },
          { label: 'Faculty:Student Ratio', value: '1:18', delta: 'Optimal' },
          { label: 'Research Publications', value: '412', delta: '+67 this year' },
          { label: 'Placement Rate', value: '94.1%', delta: '↑ 6% YoY' },
          { label: 'CGPA Average', value: '7.8/10', delta: 'Stable' },
        ].map(kpi => (
          <div className="card" key={kpi.label} style={{ padding: '24px 32px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-2)', marginBottom: 12 }}>{kpi.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary)' }}>{kpi.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Performance */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Department Performance Matrix</div>
        </div>
        <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Avg Attendance</th>
                <th>Pass Rate</th>
                <th>Student Satisfaction</th>
                <th>Performance Index</th>
              </tr>
            </thead>
            <tbody>
              {DEPT_PERFORMANCE.map(d => {
                const index = Math.round((d.attendance + d.passRate + d.satisfaction * 20) / 3);
                return (
                  <tr key={d.dept}>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{d.dept}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>
                        {DEPARTMENTS.find(dep => dep.code === d.dept)?.name?.split(' ')[0] || ''}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className={`progress-fill ${d.attendance < 85 ? 'warning' : 'success'}`} style={{ width: `${d.attendance}%` }}></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{d.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill success" style={{ width: `${d.passRate}%` }}></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{d.passRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ fontSize: 14, color: star <= Math.round(d.satisfaction) ? '#F59E0B' : 'var(--border)' }}>★</span>
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 4 }}>{d.satisfaction}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className={`progress-fill ${index >= 85 ? 'success' : index >= 70 ? '' : 'danger'}`} style={{ width: `${index}%` }}></div>
                        </div>
                        <span style={{ fontWeight: 700, color: index >= 85 ? 'var(--secondary)' : index >= 70 ? 'var(--accent)' : 'var(--danger)' }}>{index}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placement Stats */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Placement Statistics — AY 2025-26</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Depts Participating', value: PLACEMENT_STATS?.total || 0 },
              { label: 'Students Evaluated', value: PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.eligibleStudents || 0), 0) || 0 },
              { label: 'Total Passed', value: PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.passedCount || 0), 0) || 0 },
              { label: 'Avg Assessment Score', value: (PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.avgAssessmentScore || 0), 0) / (PLACEMENT_STATS?.total || 1)).toFixed(1) || 0 },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {(PLACEMENT_STATS?.departments || []).slice(0, 8).map(d => (
              <div key={d.department} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-2)' }}>{d.passedCount} Passed</div>
                <div style={{
                  width: '100%',
                  height: `${Math.max(10, ((d.passedCount || 0) / 100) * 80)}px`,
                  background: 'linear-gradient(180deg, var(--secondary), var(--secondary-light))',
                  borderRadius: '3px 3px 0 0', opacity: 0.85,
                }}></div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>{d.department}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MANAGEMENT DEPARTMENTS ─────────────────────────────────────────────────
function ManagementDepartments() {
  const { data: DEPARTMENTS = [] } = useLiveDepartments();
  const { data: COURSES = [] } = useLiveCourses();
  const { data: DEPT_PERFORMANCE = [] } = useLiveDepartmentPerformance();

  return (
    <div>
      <PageHeader title="Department Overview" subtitle="Strategic view of all departments." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {DEPARTMENTS.map(dept => {
          const perf = DEPT_PERFORMANCE.find(d => d.dept === dept.code);
          const courses = COURSES.filter(c => c.dept_code === dept.code);
          const totalEnrolled = courses.reduce((s, c) => s + c.students_enrolled, 0);

          return (
            <div className="card" key={dept.id}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent)', letterSpacing: -1 }}>{dept.code}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{dept.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 8 }}>Head: {dept.head}</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { v: dept.faculty_count, l: 'Faculty' },
                    { v: dept.student_count.toLocaleString(), l: 'Students' },
                    { v: courses.length, l: 'Courses' },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {perf && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Attendance', val: perf.attendance },
                      { label: 'Pass Rate', val: perf.passRate },
                    ].map(p => (
                      <div key={p.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-2)' }}>{p.label}</span>
                          <span style={{ fontWeight: 700 }}>{p.val}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${p.val >= 85 ? 'success' : p.val >= 75 ? '' : 'danger'}`} style={{ width: `${p.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Satisfaction</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ fontSize: 14, color: star <= Math.round(perf.satisfaction) ? '#F59E0B' : 'var(--border)' }}>★</span>
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 4 }}>{perf.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COURSE APPROVALS (MANAGEMENT) ──────────────────────────────────────────
function CourseApprovals() {
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const { data: COURSES = [] } = useLiveCourses();
  const pending = COURSES.filter(c => c.status === 'pending' && !approved.includes(c.id) && !rejected.includes(c.id));

  return (
    <div>
      <PageHeader title="Course Approvals" subtitle="Review and approve courses for publication.">
        <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: 13 }}>{pending.length} pending</span>
      </PageHeader>

      {pending.length === 0 && (
        <div className="alert alert-success">✓ All pending courses have been reviewed. No new approvals required.</div>
      )}

      {pending.length > 0 && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Code & Title</th>
                  <th>Department / Credits</th>
                  <th>Proposed By</th>
                  <th>Capacity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.code}: {c.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="badge badge-neutral">{c.dept_code}</span>
                        <span className="badge badge-neutral">{c.credits} Credits</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.facultyName}</td>
                    <td>{c.capacity} students</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setRejected(prev => [...prev, c.id])}>Reject</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setApproved(prev => [...prev, c.id])}>Approve</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processed */}
      {(approved.length > 0 || rejected.length > 0) && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 12 }}>Processed in this session</div>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <tbody>
                  {COURSES.filter(c => approved.includes(c.id) || rejected.includes(c.id)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.code}: {c.title}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${approved.includes(c.id) ? 'badge-success' : 'badge-danger'}`}>
                          {approved.includes(c.id) ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COMPLIANCE LOGS ────────────────────────────────────────────────────────
function ComplianceLogs() {
  const { data: AUDIT_LOGS = [] } = useLiveAuditLogs();

  return (
    <div>
      <PageHeader title="Compliance & Audit Logs" subtitle="Institutional compliance activity trail.">
        <button className="btn btn-outline btn-sm"><Icon d={ICONS.download} size={13} /> Download Report</button>
      </PageHeader>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Events (30d)', value: '12,847' },
          { label: 'Security Events', value: '23', color: 'var(--warning)' },
          { label: 'Anomalies Detected', value: '0', color: 'var(--secondary)' },
          { label: 'Uptime (30d)', value: '99.96%', color: 'var(--secondary)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value sm" style={s.color ? { color: s.color } : {}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Description</th><th>IP</th></tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map(log => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.createdAt}</td>
                <td style={{ fontWeight: 600 }}>{log.username}</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4 }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{log.description}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MANAGEMENT PROFILE ───────────────────────────────────────────────────────
function ManagementProfile({ user }) {
  const { data: profile, isLoading } = useLiveProfile(user.id || user._id);
  const { data: departments } = useLiveDepartments();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const displayFirstName = profile?.firstName || user.firstName || 'Management';
  const displayLastName = profile?.lastName || user.lastName || 'Executive';
  const fullName = `${displayFirstName} ${displayLastName}`.trim();

  const formattedProfile = {
    userId: user.id || user._id,
    name: fullName,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    designation: 'Dean Academic',
    department: 'N/A', // Update this if department exists in user data
    id: (user.id || user._id).toUpperCase(),
    idLabel: 'Management ID',
    status: 'Active Executive',
    avatar: 'N/A',
    email: user.email,
    phone: profile?.phone,
    dob: profile?.dob,
    gender: profile?.gender,
    address: profile?.address,
    bio: profile?.bio,
    professionalTitle: 'Professional Information',
    professional: [
      ['Department', 'N/A'],
      ['Designation', 'N/A'],
      ['Experience', 'N/A'],
      ['Date of Joining', 'N/A']
    ],
    statsTitle: 'Responsibilities Overview',
    stats: [
      { icon: Building2, label: 'Departments', value: departments?.length || 0, helper: 'Under purview' },
      { icon: Landmark, label: 'Institutes', value: 'N/A', helper: 'Total count' },
      { icon: Target, label: 'KPIs Managed', value: 'N/A', helper: 'Performance metrics' },
      { icon: Users, label: 'Direct Reports', value: 'N/A', helper: 'Heads & Deans' }
    ],
    activities: [],
    metadata: [
      { icon: LayoutDashboard, label: 'Designation', value: 'Dean Academic' },
      { icon: Users, label: 'Department', value: 'N/A' }
    ]
  };

  return (
    <ProfilePage
      profile={formattedProfile}
      accent={profileThemes.management}
      updateProfileHook={updateProfile}
    >
    </ProfilePage>
  );
}

// ── MANAGEMENT PORTAL ROUTER ─────────────────────────────────────────────
const PagePlaceholder = ({ title }) => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>
    <h2>{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

function ManagementPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(`/management/${path}`);

  return (
    <Routes>
      <Route path="dashboard" element={<ExecutiveDashboard user={user} onNavigate={handleNavigate} />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="analytics" element={<AnalyticsReports />} />
      <Route path="departments" element={<ManagementDepartments />} />
      <Route path="courses" element={<CourseApprovals />} />
      <Route path="audit" element={<ComplianceLogs />} />
      <Route path="placement" element={<F.PlacementAnalytics user={user} />} />
      <Route path="profile" element={<ManagementProfile user={user} />} />
      <Route path="notifications" element={<div style={{ padding: 20 }}><h1 className="page-title">Notifications</h1></div>} />
      <Route path="kpis" element={<F.InstitutionalKPIs user={user} />} />
      <Route path="faculty-perf" element={<F.FacultyPerformance user={user} />} />
      <Route path="student-perf" element={<F.MgmtStudentPerf user={user} />} />
      <Route path="placement-analytics" element={<F.PlacementAnalytics user={user} />} />
      <Route path="research" element={<F.ResearchStats user={user} />} />
      <Route path="budget" element={<F.BudgetOverview user={user} />} />
      <Route path="risk-alerts" element={<F.RiskAlerts user={user} />} />
      <Route path="approvals" element={<F.ApprovalCenter user={user} />} />
      <Route path="accreditation" element={<F.Accreditation user={user} />} />
      <Route path="ai-insights" element={<F.AIInsights user={user} />} />
      <Route path="predictive" element={<F.PredictiveAnalytics user={user} />} />
      <Route path="executive-reports" element={<F.ExecutiveReports user={user} />} />
      <Route path="library" element={<F.LibraryAnalytics user={user} />} />
      <Route path="academic-core" element={<AcademicManagement />} />
      <Route path="curriculum" element={<CurriculumBuilder />} />
      <Route path="catalog" element={<CourseCatalog />} />
      <Route path="departments" element={<PagePlaceholder title="Dept Comparison" />} />
        <Route path="faculty-perf" element={<PagePlaceholder title="Faculty Performance" />} />
        <Route path="student-perf" element={<PagePlaceholder title="Student Performance" />} />
        <Route path="placement-analytics" element={<PagePlaceholder title="Placement Analytics" />} />
        <Route path="research" element={<PagePlaceholder title="Research Statistics" />} />
        <Route path="cert-approval" element={<PagePlaceholder title="Certificate Approval" />} />
        <Route path="audit" element={<PagePlaceholder title="Compliance Audit" />} />
        <Route path="reports" element={<PagePlaceholder title="Custom Reports" />} />
        <Route path="finance-overview" element={<PagePlaceholder title="Financial Overview" />} />
        <Route path="fee-collection" element={<PagePlaceholder title="Fee Collection" />} />
        <Route path="budgeting" element={<PagePlaceholder title="Budgeting" />} />
        <Route path="scholarships" element={<PagePlaceholder title="Scholarships" />} />
        <Route path="profile" element={<PagePlaceholder title="Profile" />} />
        <Route path="notifications" element={<PagePlaceholder title="Notifications" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}


export default ManagementPortal;
