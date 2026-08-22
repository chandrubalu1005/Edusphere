import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';
import {
  COURSES, DEPARTMENTS, USERS, MONTHLY_ENROLLMENT, DEPT_PERFORMANCE, AUDIT_LOGS
} from '../mockData.js';
import {
  useLiveCourses, useLiveDepartments, useLiveAdminUsers, useLiveAuditLogs
} from '../api/liveData.js';
import { useSystemHealth } from '../api/hooks.js';
import * as F from './management/features.jsx';


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

// ── EXECUTIVE DASHBOARD (Boardroom Mode) ────────────────────────────────────
function ExecutiveDashboard({ user, onNavigate }) {
  const { data: USERS } = useLiveAdminUsers();
  const { data: COURSES } = useLiveCourses();
  const { data: healthData } = useSystemHealth();

  const totalStudents = USERS.filter(u => u.role === 'student').length;
  const totalFaculty = USERS.filter(u => u.role === 'faculty').length;
  const publishedCourses = COURSES.filter(c => c.status === 'published').length;
  const pendingApprovals = COURSES.filter(c => c.status === 'pending').length;

  return (
    <div>
      {/* Boardroom Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #0A1628 100%)',
        borderRadius: 20,
        padding: '40px 40px 32px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(201,138,59,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -40, left: 100, width: 150, height: 150, background: 'radial-gradient(circle, rgba(76,124,89,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 8 }}>
            Executive Management Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'white', letterSpacing: -0.5, marginBottom: 4 }}>
            Welcome, <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{user.firstName} {user.lastName}</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; Academic Year 2025-26
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Students', value: totalStudents.toLocaleString(), icon: '👨‍🎓' },
          { label: 'Total Faculty', value: totalFaculty.toLocaleString(), icon: '👨‍🏫' },
          { label: 'Course Catalog', value: publishedCourses.toLocaleString(), icon: '📚' },
          { label: 'Pending Approvals', value: pendingApprovals.toLocaleString(), icon: '⏳', color: 'var(--warning)' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ overflow: 'visible' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text-2)' }}>{kpi.label}</div>
                <div style={{ fontSize: 22 }}>{kpi.icon}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{
                marginTop: 8, fontSize: 12, fontWeight: 600,
                color: kpi.good === true ? 'var(--secondary)' : kpi.good === false ? 'var(--danger)' : 'var(--text-2)',
              }}>
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
                            ? 'linear-gradient(180deg, var(--accent) 0%, rgba(201,138,59,0.3) 100%)'
                            : 'linear-gradient(180deg, rgba(30,42,74,0.7) 0%, rgba(30,42,74,0.2) 100%)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8, cursor: 'pointer' }} onClick={() => onNavigate('courses')}>
                  <span style={{ fontSize: 18 }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{pendingApprovals} Course Approvals</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Awaiting your review</div>
                  </div>
                  <Icon d={ICONS.chevron} size={14} />
                </div>
              )}
              {[
                { icon: '📊', label: 'Q2 Report Ready', sub: 'Download quarterly report', action: 'analytics' },
                { icon: '🏆', label: 'Placements Updated', sub: '47 new placements this month', action: 'placement' },
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Gross Enrollment Ratio', value: '92.4%', delta: '↑ 4.2%' },
          { label: 'Completion Rate', value: '87.8%', delta: '↑ 1.1%' },
          { label: 'Faculty:Student Ratio', value: '1:18', delta: 'Optimal' },
          { label: 'Research Publications', value: '412', delta: '+67 this year' },
          { label: 'Placement Rate', value: '94.1%', delta: '↑ 6% YoY' },
          { label: 'CGPA Average', value: '7.8/10', delta: 'Stable' },
        ].map(kpi => (
          <div className="stat-card" key={kpi.label}>
            <div className="stat-label">{kpi.label}</div>
            <div className="stat-value sm">{kpi.value}</div>
            <div className="stat-trend trend-up" style={{ fontSize: 12 }}>{kpi.delta}</div>
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
              { label: 'Students Eligible', value: '1,240' },
              { label: 'Offers Extended', value: '1,165' },
              { label: 'Highest Package', value: '$180K' },
              { label: 'Avg Package', value: '$72K' },
              { label: 'Companies Visited', value: '84' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {[
              { company: 'Google', count: 12 }, { company: 'Microsoft', count: 18 },
              { company: 'Amazon', count: 24 }, { company: 'TCS', count: 62 },
              { company: 'Infosys', count: 80 }, { company: 'Wipro', count: 45 },
              { company: 'Cognizant', count: 38 }, { company: 'Others', count: 120 },
            ].map(c => (
              <div key={c.company} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-2)' }}>{c.count}</div>
                <div style={{
                  width: '100%',
                  height: `${(c.count / 120) * 80}px`,
                  background: 'linear-gradient(180deg, var(--secondary), rgba(76,124,89,0.3))',
                  borderRadius: '3px 3px 0 0', opacity: 0.85,
                }}></div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>{c.company}</div>
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
  const pending = COURSES.filter(c => c.status === 'pending' && !approved.includes(c.id) && !rejected.includes(c.id));

  return (
    <div>
      <PageHeader title="Course Approvals" subtitle="Review and approve courses for publication.">
        <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: 13 }}>{pending.length} pending</span>
      </PageHeader>

      {pending.length === 0 && (
        <div className="alert alert-success">✓ All pending courses have been reviewed. No new approvals required.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pending.map(c => (
          <div className="card" key={c.id}>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className="badge badge-warning">Pending Approval</span>
                    <span className="badge badge-neutral">{c.dept_code}</span>
                    <span className="badge badge-neutral">{c.credits} Credits</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{c.code}: {c.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>{c.description}</p>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    Proposed by: <strong style={{ color: 'var(--text-1)' }}>{c.facultyName}</strong> · Capacity: {c.capacity} students
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setRejected(prev => [...prev, c.id])}
                  >
                    ✗ Reject
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setApproved(prev => [...prev, c.id])}
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Processed */}
        {(approved.length > 0 || rejected.length > 0) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 8, marginTop: 4 }}>Processed in this session</div>
            {COURSES.filter(c => approved.includes(c.id) || rejected.includes(c.id)).map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{c.code}: {c.title}</div>
                <span className={`badge ${approved.includes(c.id) ? 'badge-success' : 'badge-danger'}`}>
                  {approved.includes(c.id) ? '✓ Approved' : '✗ Rejected'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── COMPLIANCE LOGS ────────────────────────────────────────────────────────
function ComplianceLogs() {
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

// ── MANAGEMENT PORTAL ROUTER ─────────────────────────────────────────────
export default function ManagementPortal({ page, onNavigate }) {
  const { user } = useAuth();

  const pages = {
    dashboard:   <ExecutiveDashboard user={user} onNavigate={onNavigate} />,
    analytics:   <AnalyticsReports />,
    departments: <ManagementDepartments />,
    courses:     <CourseApprovals />,
    audit:       <ComplianceLogs />,
    placement:   <F.PlacementAnalytics user={user} />,
    notifications: <div style={{ padding: 20 }}><h1 className="page-title">Notifications</h1></div>,
    // New Enterprise Pages
    kpis:         <F.InstitutionalKPIs user={user} />,
    'faculty-perf': <F.FacultyPerformance user={user} />,
    'student-perf': <F.MgmtStudentPerf user={user} />,
    'placement-analytics': <F.PlacementAnalytics user={user} />,
    research:     <F.ResearchStats user={user} />,
    budget:       <F.BudgetOverview user={user} />,
    'risk-alerts': <F.RiskAlerts user={user} />,
    approvals:    <F.ApprovalCenter user={user} />,
    accreditation: <F.Accreditation user={user} />,
    'ai-insights': <F.AIInsights user={user} />,
    predictive:   <F.PredictiveAnalytics user={user} />,
    'executive-reports': <F.ExecutiveReports user={user} />,
  };

  return pages[page] || pages.dashboard;
}
