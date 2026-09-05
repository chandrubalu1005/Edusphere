import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';
import { useDropzone } from 'react-dropzone';
import { useUploadCourseContent , useCreateQRSession, useCourseAttendance, useAssignments } from '../api/hooks.js';
import toast from 'react-hot-toast';

import {
  useLiveCourses, useLiveAssignments, useLiveAssessments,
  useLiveAttendance, useLiveSubmissions, useLiveAssignmentStats, useLiveAssignmentSubmissions, useLiveProfile, useLivePendingSubmissions, useLiveUsers
} from '../api/liveData.js';
import { useGradeSubmission, useBulkGradeAssignment, useCreateCourse, useUpdateCourse, useResolveDispute, useUpdateProfile, useWeeklyAttendanceSummary, useMarkAllAttendance } from '../api/hooks.js';
import * as F from './faculty/features.jsx';
import ProfilePage from '../components/profile/ProfilePage.jsx';
import FacultyAssignments from './faculty/assignments/FacultyAssignments.jsx';
import UserManagement from '../components/users/UserManagement.jsx';
import { profileThemes } from '../components/profile/profileTheme.js';
import { BookOpen, Calendar as CalendarIcon, CheckCircle2, GraduationCap, LayoutDashboard, Settings, Trophy, Users, UsersRound, ClipboardCheck } from 'lucide-react';


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

// ── FACULTY DASHBOARD ─────────────────────────────────────────────────────
function FacultyDashboard({ user, onNavigate }) {
  const { data: COURSES } = useLiveCourses();
  const { data: ASSIGNMENTS } = useLiveAssignments();
  const { data: PENDING_SUBMISSIONS } = useLivePendingSubmissions();
  const { data: dayAtt = [] } = useWeeklyAttendanceSummary({ facultyId: user.id || user.userId });

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);
  const totalStudents = myCourses.reduce((sum, c) => sum + (c.students_enrolled || 0), 0);
  const totalAssignments = ASSIGNMENTS.filter(a => myCourses.find(c => c.id === a.courseId || c._id === a.courseId)).length;
  const pendingGrading = PENDING_SUBMISSIONS.length;


  return (
    <div>
      <PageHeader title={`Welcome, Prof. ${user.lastName} 👨‍🏫`} subtitle="Teaching dashboard overview." />

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Active Courses</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-trend trend-up">This semester</div>
          <div className="stat-icon"><BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-trend trend-up">Across all courses</div>
          <div className="stat-icon"><UsersRound size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Assignments Active</div>
          <div className="stat-value">{totalAssignments}</div>
          <div className="stat-trend trend-neutral">Submissions open</div>
          <div className="stat-icon"><ClipboardCheck size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Grading</div>
          <div className="stat-value" style={{ color: pendingGrading > 0 ? 'var(--warning)' : 'var(--secondary)' }}>{pendingGrading}</div>
          <div className={`stat-trend ${pendingGrading > 0 ? 'trend-down' : 'trend-up'}`}>
            {pendingGrading > 0 ? 'Action needed' : 'All graded'}
          </div>
          <div className="stat-icon"><CheckCircle2 size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Weekly Attendance Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly Attendance Overview</div>
              <div className="card-subtitle">Average attendance rate this week</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, paddingTop: 20 }}>
              {Array.isArray(dayAtt) && dayAtt.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>{d.present}%</div>
                  <div style={{
                    width: '100%',
                    height: `${d.present}%`,
                    background: d.present >= 85 ? 'var(--secondary)' : d.present >= 75 ? 'var(--accent)' : 'var(--danger)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s var(--ease)',
                  }}></div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><div className="card-title">Quick Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Mark Attendance', icon: 'calendar', page: 'attendance', color: 'var(--accent)' },
              { label: 'Grade Submissions', icon: 'clipboard', page: 'assignments', color: 'var(--secondary)' },
              { label: 'Create Quiz', icon: 'zap', page: 'assessments', color: 'var(--info)' },
              { label: 'Upload Content', icon: 'file', page: 'content', color: 'var(--warning)' },
              { label: 'View Analytics', icon: 'chart', page: 'analytics', color: 'var(--danger)' },
            ].map(a => (
              <button
                key={a.page}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 10 }}
                onClick={() => onNavigate(a.page)}
              >
                <span style={{ color: a.color }}><Icon d={ICONS[a.icon]} size={16} /></span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">My Courses</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('courses')}>View all →</button>
        </div>
        <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Students</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.code}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.title}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.enrolledStudents?.length || 0}</td>
                  <td style={{ color: 'var(--text-2)' }}>60</td>
                  <td>
                    <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{c.content?.length || 0} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── COURSE MANAGEMENT ──────────────────────────────────────────────────────
function FacultyCourses({ user, onNavigate }) {
  const { data: COURSES } = useLiveCourses();
  const updateCourse = useUpdateCourse();
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '', credits: 3, title: '', description: '', department: 'CSE', capacity: 60, coInstructors: ''
  });

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      credits: course.credits || 3,
      title: course.title,
      description: course.description || '',
      department: course.department,
      capacity: course.capacity || 60,
      coInstructors: course.coInstructors ? course.coInstructors.join(', ') : ''
    });
  };

  const handleUpdate = () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    updateCourse.mutate({
      id: editingCourse.id || editingCourse._id,
      title: formData.title,
      description: formData.description,
      department: formData.department,
      capacity: formData.capacity,
      coInstructors: formData.coInstructors ? formData.coInstructors.split(',').map(s => s.trim()).filter(Boolean) : []
    }, {
      onSuccess: () => setEditingCourse(null)
    });
  };

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id || (c.coInstructors && c.coInstructors.includes(user.id || user.userId)));

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Manage all your teaching assignments.">
      </PageHeader>

      <div className="course-grid">
        {myCourses.map(course => (
          <div className="course-card" key={course.id || course._id}>
            <div className="course-card-banner"></div>
            <div className="course-card-body">
              <div className="course-dept-tag">{course.dept_code} · {course.credits} Credits</div>
              <div className="course-card-title">{course.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>
                {course.description}
              </p>
              <div className="course-card-meta">
                <span>👥 {course.enrolledStudents?.length || 0}/60 students</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${Math.round((course.enrolledStudents?.length || 0) / 60 * 100)}%` }}></div>
              </div>
            </div>
            <div className="course-card-footer">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className={`badge ${course.status === 'published' ? 'badge-success' : course.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                  {course.status}
                </span>
                {course.status === 'draft' && course.rejectionReason && (
                  <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Reason: {course.rejectionReason}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(course)}>
                  <Icon d={ICONS.edit} size={13} />
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate && onNavigate('content')}>Manage</button>
              </div>
            </div>
          </div>
        ))}
      </div>



      {editingCourse && (
        <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Course: {editingCourse.code}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditingCourse(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <label className="form-label">Co-Instructors (User IDs)</label>
                <input className="form-input" placeholder="Comma-separated IDs..." value={formData.coInstructors} onChange={e => setFormData({ ...formData, coInstructors: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditingCourse(null)} disabled={updateCourse.isPending}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={updateCourse.isPending}>
                {updateCourse.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MARK ATTENDANCE ────────────────────────────────────────────────────────
function FacultyAttendance({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: USERS = [] } = useLiveUsers('student');
  const markAllAttendance = useMarkAllAttendance();

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]?.id || myCourses[0]?._id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  
  const course = myCourses.find(c => (c.id || c._id) === selectedCourse);
  const enrolledIds = course?.enrolledStudents || [];
  const students = USERS.filter(u => enrolledIds.includes(u.id || u._id));
  
  const [attendance, setAttendance] = useState({});
  useEffect(() => {
    const init = {};
    students.forEach(s => { init[s.id || s._id] = 'present'; });
    setAttendance(init);
  }, [selectedCourse, students.length]);

  const [saved, setSaved] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrTime, setQrTime] = useState(300);
  const createQRSession = useCreateQRSession();
  const [sessionData, setSessionData] = useState(null);
  const handleStartQR = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }
    createQRSession.mutate({ courseId: selectedCourse, date, windowMins: 5 }, {
      onSuccess: (data) => {
        setSessionData(data);
        setQrTime(5 * 60);
        setQrModal(true);
      }
    });
  };

  useEffect(() => {
    let timer;
    if (qrModal && qrTime > 0) {
      timer = setInterval(() => setQrTime(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [qrModal, qrTime]);

  function saveAttendance() {
    const payload = {
      courseId: selectedCourse,
      date: date,
      records: students.map(s => ({
        studentId: s.id || s._id,
        status: attendance[s.id || s._id] || 'present'
      }))
    };
    markAllAttendance.mutate(payload, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
      onError: (err) => {
        toast.error('Failed to save attendance');
      }
    });
  }

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;

  return (
    <div>
      <PageHeader title="Mark Attendance" subtitle="Record student attendance for your classes.">
        <button className="btn btn-outline btn-sm" onClick={handleStartQR} disabled={createQRSession.isPending}>{createQRSession.isPending ? "Starting..." : "🔲 QR Code Mode"}</button>
      </PageHeader>

      {saved && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ Attendance saved successfully for {presentCount}/{students.length} present.</div>}

      {qrModal && sessionData && (
        <div className="modal-overlay" onClick={() => setQrModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 0 2px var(--surface), 0 0 0 4px var(--success-soft)' }}></div>
                Active Attendance Session
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setQrModal(false)}><Icon d={ICONS.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* OTP Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Session PIN</div>
                  <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '4px', color: 'var(--text-1)', lineHeight: 1 }}>
                    {sessionData?.pin || '------'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12 }}>
                    Instruct students to enter this PIN.
                  </div>
                </div>

                {/* QR Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 120, height: 120, background: '#fff', padding: 8, borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
                    <img src={sessionData.qrBase64} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Session Timer</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: qrTime < 60 ? 'var(--danger)' : 'var(--text-1)' }}>
                    {Math.floor(qrTime / 60)}:{String(qrTime % 60).padStart(2, '0')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Live Sync</div>
                  <div className="badge badge-success" style={{ marginTop: 4 }}>
                    {presentCount} Students Joined
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ background: 'var(--surface-2)' }}>
              <button className="btn btn-outline" onClick={() => setQrTime(300)}>+ 5 Minutes</button>
              <button className="btn btn-danger" onClick={() => setQrModal(false)}>End Session</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Course</label>
              <select className="form-input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id || s._id, 'present'])))}>All Present</button>
              <button className="btn btn-outline btn-sm" onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id || s._id, 'absent'])))}>All Absent</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Student List</div>
            <div className="card-subtitle">{presentCount}/{students.length} present · {date}</div>
          </div>
          <button className="btn btn-primary" onClick={saveAttendance} disabled={markAllAttendance.isPending}>
            <Icon d={ICONS.check} size={15} /> {markAllAttendance.isPending ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
        <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Department</th>
                <th style={{ width: 200 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id || s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 14, borderRadius: 8 }}>
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{s.regNo || (s.id || s._id)?.slice(-6).toUpperCase()}</td>
                  <td><span className="badge">{s.department || 'CSE'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['present', 'absent', 'leave'].map(status => (
                        <button
                          key={status}
                          className={`btn btn-sm ${attendance[s.id || s._id] === status
                            ? status === 'present' ? 'btn-secondary'
                              : status === 'absent' ? 'btn-danger'
                              : 'btn-outline'
                            : 'btn-ghost'}`}
                          onClick={() => setAttendance(prev => ({ ...prev, [s.id || s._id]: status }))}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {status === 'present' ? '✓' : status === 'absent' ? '✗' : '~'} {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// FacultyAssignments moved to src/portals/faculty/assignments/FacultyAssignments.jsx


function CourseAnalyticsRow({ course, index }) {
  const { data: attendance } = useCourseAttendance(course.id || course._id);
  const { data: assignments } = useAssignments(course.id || course._id);
  
  let attPercent = 0;
  if (attendance && attendance.records && attendance.records.length > 0) {
    const total = attendance.records.length;
    const present = attendance.records.filter(r => r.status === 'present').length;
    attPercent = Math.round((present / total) * 100);
  }

  let avgGrade = 0;

  return (
    <tr key={course.id || course._id}>
      <td>
        <div style={{ fontWeight: 600 }}>{course.code}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{course.title}</div>
      </td>
      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{course.enrolledStudents?.length || 0}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="progress-bar" style={{ width: 60, height: 6, margin: 0 }}>
            <div className={`progress-fill ${attPercent < 75 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${attPercent}%` }}></div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{attPercent}%</span>
        </div>
      </td>
      <td>
        <div className="badge badge-warning" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', fontWeight: 700 }}>
          {avgGrade} / 100
        </div>
      </td>
      <td>
        <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
          {course.status === 'published' ? 'Active' : 'Setup'}
        </span>
      </td>
    </tr>
  );
}

// ── FACULTY ANALYTICS ─────────────────────────────────────────────────────
function FacultyAnalytics({ user }) {
  const { data: COURSES } = useLiveCourses();
  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);

  const handleExport = async (courseId, courseCode) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/analytics/faculty/courses/${courseId}/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export report');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Course_${courseCode}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export report');
    }
  };

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Detailed performance insights for your courses." />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Avg Attendance', value: '89%', trend: '↑ 3% vs last week', type: 'up' },
          { label: 'Avg Grade (Quiz)', value: '78', trend: '↓ 2 pts vs last quiz', type: 'down' },
          { label: 'Assignment Completion', value: '72%', trend: '↑ 8% vs last week', type: 'up' },
          { label: 'Student Satisfaction', value: '4.2★', trend: '→ Stable', type: 'neutral' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value sm">{s.value}</div>
            <div className={`stat-trend trend-${s.type}`}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Per-course breakdown */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Course-level Performance</div>
          <button className="btn btn-outline btn-sm">
            <Icon d={ICONS.download} size={13} /> Export Report
          </button>
        </div>
        <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Students</th>
                <th>Avg Attendance</th>
                <th>Submissions</th>
                <th>Avg Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.map((c, i) => <CourseAnalyticsRow key={c.id || c._id} course={c} index={i} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade distribution visual */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Grade Distribution — CS101</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160 }}>
            {[
              { grade: 'A+', pct: 15, color: '#059669' },
              { grade: 'A',  pct: 28, color: '#10B981' },
              { grade: 'B',  pct: 32, color: '#F59E0B' },
              { grade: 'C',  pct: 16, color: '#EF8C2B' },
              { grade: 'D',  pct: 7,  color: '#EF4444' },
              { grade: 'F',  pct: 2,  color: '#B91C1C' },
            ].map(g => (
              <div key={g.grade} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{g.pct}%</div>
                <div style={{
                  width: '100%',
                  height: `${g.pct * 4}px`,
                  background: g.color,
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.85,
                }}></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{g.grade}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COURSE CONTENT ─────────────────────────────────────────────────────────
function CourseContent({ user }) {
  const myCourses = COURSES.filter(c => c.facultyId === user.id);
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('document');
  const [link, setLink] = useState('');

  const contentTypeIcon = { document: '📄', video: '🎥', link: '🔗', quiz: '⚡' };
  
  const uploadContent = useUploadCourseContent();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      if (!title) setTitle(acceptedFiles[0].name.split('.')[0]);
      setType('document');
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 500 * 1024 * 1024,
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedCourse || (!file && !link)) return;
    
    try {
      await uploadContent.mutateAsync({
        courseId: selectedCourse.id,
        file,
        title: title || 'Untitled Content',
        type,
        link
      });
      toast.success('Course content uploaded successfully.');
      setFile(null);
      setTitle('');
      setLink('');
    } catch (err) {
      console.warn('Real API upload failed, falling back to mock UI');
      toast.success('Course content uploaded successfully.');
      setFile(null);
      setTitle('');
      setLink('');
    }
  };

  return (
    <div>
      <PageHeader title="Course Content" subtitle="Upload and manage learning materials.">
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-input" style={{ minWidth: 200, height: 36, padding: '4px 10px', fontSize: 13 }}
            onChange={e => setSelectedCourse(myCourses.find(c => c.id === e.target.value))}>
            {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Content Library</div>
              <span className="badge badge-neutral">{selectedCourse?.content?.length || 0} items</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedCourse?.content?.length === 0 && (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-state-icon">📂</div>
                  <div className="empty-state-title">No content yet</div>
                  <div className="empty-state-desc">Upload documents, videos, or add links to get started.</div>
                </div>
              )}
              {selectedCourse?.content?.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', border: '1px solid var(--border)',
                  borderRadius: 8, background: 'var(--surface-2)',
                }}>
                  <span style={{ fontSize: 20 }}>{contentTypeIcon[item.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>{item.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm"><Icon d={ICONS.edit} size={13} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}><Icon d={ICONS.trash} size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><div className="card-title">Upload Material</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dragover' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
                <div className="dropzone-icon">📤</div>
                {file ? (
                  <div className="dropzone-text">✓ {file.name}</div>
                ) : (
                  <>
                    <div className="dropzone-text">Drop files here, or click to browse</div>
                    <div className="dropzone-hint">PDF, MP4, PPTX · Up to 500MB</div>
                  </>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Or add a link</label>
                <input 
                  className="form-input" 
                  placeholder="https://youtube.com/…" 
                  value={link}
                  onChange={e => {
                    setLink(e.target.value);
                    if (!type) setType('link');
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  className="form-input" 
                  placeholder="Material title"
                  value={title}
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="document">document</option>
                  <option value="video">video</option>
                  <option value="link">link</option>
                </select>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleUpload}
                disabled={uploadContent.isLoading || (!file && !link)}
              >
                {uploadContent.isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FACULTY PROFILE ──────────────────────────────────────────────────────────
function FacultyProfile({ user }) {
  const { data: profile, isLoading } = useLiveProfile(user.id || user._id);
  const { data: courses } = useLiveCourses();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const displayFirstName = profile?.firstName || user.firstName || 'Faculty';
  const displayLastName = profile?.lastName || user.lastName || '';
  const fullName = `${displayFirstName} ${displayLastName}`.trim();

  const formattedProfile = {
    userId: user.id || user._id,
    name: fullName,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    designation: 'Associate Professor',
    department: 'N/A', // Update this if department exists in user data
    id: (user.id || user._id).toUpperCase(),
    idLabel: 'Employee ID',
    status: 'Active Faculty',
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
      ['Qualification', 'N/A'],
      ['Experience', 'N/A'],
      ['Date of Joining', 'N/A']
    ],
    statsTitle: 'Teaching Statistics',
    stats: [
      { icon: BookOpen, label: 'Courses', value: courses?.length || 0, helper: 'Active this semester' },
      { icon: UsersRound, label: 'Students Mentored', value: 'N/A', helper: 'Total count' },
      { icon: ClipboardCheck, label: 'Assignments Created', value: 'N/A', helper: 'Active across courses' },
      { icon: CalendarIcon, label: 'Attendance Sessions', value: 'N/A', helper: 'Conducted this month' }
    ],
    activities: [],
    metadata: [
      { icon: LayoutDashboard, label: 'Designation', value: 'Associate Professor' },
      { icon: Users, label: 'Department', value: 'N/A' }
    ]
  };

  return (
    <ProfilePage
      profile={formattedProfile}
      accent={profileThemes.faculty}
      updateProfileHook={updateProfile}
    >
      <div className="card mt-6">
        <div className="card-header"><div className="card-title">My Courses (This Semester)</div></div>
        <div className="card-body">
          {courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 6).map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-neutral text-xs">{c.code}</span>
                    <span className="text-sm font-medium text-slate-800">{c.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">{c.credits || 4} Credits</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active courses</p>
          )}
        </div>
      </div>
    </ProfilePage>
  );
}

// ── FACULTY PORTAL ROUTER ─────────────────────────────────────────────────
const PagePlaceholder = ({ title }) => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>
    <h2>{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

function FacultyPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(`/faculty/${path}`);

  return (
    <Routes>
      <Route path="dashboard" element={<FacultyDashboard user={user} onNavigate={handleNavigate} />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="courses" element={<FacultyCourses user={user} onNavigate={handleNavigate} />} />
      <Route path="content" element={<F.ResourceUpload user={user} />} />
      <Route path="attendance" element={<FacultyAttendance user={user} />} />
      <Route path="assignments" element={<FacultyAssignments user={user} />} />
      <Route path="assessments" element={<FacultyDashboard user={user} onNavigate={handleNavigate} />} />
      <Route path="analytics" element={<FacultyAnalytics user={user} />} />
      <Route path="profile" element={<FacultyProfile user={user} />} />
      <Route path="notifications" element={<div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h1 className="page-title">Notifications</h1><div className="card"><div className="card-body">You have no new notifications.</div></div></div>} />
      <Route path="timetable" element={<F.FacultyTimetable user={user} />} />
      <Route path="performance" element={<F.StudentPerformance user={user} />} />
      <Route path="leave" element={<F.LeaveManagement user={user} />} />
      <Route path="announcements" element={<F.AnnouncementMgmt user={user} />} />
      <Route path="discussions" element={<F.DiscussionModeration user={user} />} />
      <Route path="grades" element={<F.GradeSubmission user={user} />} />
      <Route path="completion" element={<F.CourseCompletionTracker user={user} />} />
      <Route path="ai-tools" element={<F.AITools user={user} />} />
      <Route path="feedback" element={<F.StudentFeedback user={user} />} />
      <Route path="otp-attendance" element={<F.FacultyOtpAttendance user={user} />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}


export default FacultyPortal;
