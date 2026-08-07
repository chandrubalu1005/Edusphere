import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';
import { useDropzone } from 'react-dropzone';
import { useUploadCourseContent } from '../api/hooks.js';
import toast from 'react-hot-toast';
import {
  COURSES as MOCK_COURSES, ATTENDANCE_RECORDS as MOCK_ATTENDANCE_RECORDS,
  ASSESSMENTS as MOCK_ASSESSMENTS, ASSIGNMENTS as MOCK_ASSIGNMENTS,
  USERS as MOCK_USERS,
  WEEKLY_ATTENDANCE as MOCK_WEEKLY_ATTENDANCE
} from '../mockData.js';
import {
  useLiveCourses, useLiveAssignments, useLiveAssessments,
  useLiveAttendance, useLiveSubmissions
} from '../api/liveData.js';
import * as F from './faculty/features.jsx';


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
  const { data: SUBMISSIONS } = useLiveSubmissions(user.id || user.userId);

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);
  const totalStudents = myCourses.reduce((sum, c) => sum + (c.students_enrolled || 0), 0);
  const totalAssignments = ASSIGNMENTS.filter(a => myCourses.find(c => c.id === a.courseId || c._id === a.courseId)).length;
  const pendingGrading = SUBMISSIONS.filter(s => s.status !== 'graded').length;

  const dayAtt = MOCK_WEEKLY_ATTENDANCE;

  return (
    <div>
      <PageHeader title={`Welcome, Prof. ${user.lastName} 👨‍🏫`} subtitle="Teaching dashboard overview." />

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Active Courses</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-trend trend-up">📚 This semester</div>
          <div className="stat-icon">📚</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-trend trend-up">👥 Across all courses</div>
          <div className="stat-icon">👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Assignments Active</div>
          <div className="stat-value">{totalAssignments}</div>
          <div className="stat-trend trend-neutral">📝 Submissions open</div>
          <div className="stat-icon">📝</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Grading</div>
          <div className="stat-value" style={{ color: pendingGrading > 0 ? 'var(--warning)' : 'var(--secondary)' }}>{pendingGrading}</div>
          <div className={`stat-trend ${pendingGrading > 0 ? 'trend-down' : 'trend-up'}`}>
            {pendingGrading > 0 ? '⚠ Action needed' : '✓ All graded'}
          </div>
          <div className="stat-icon">✅</div>
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
              {dayAtt.map(d => (
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
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.students_enrolled}</td>
                  <td style={{ color: 'var(--text-2)' }}>{c.capacity}</td>
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
function FacultyCourses({ user }) {
  const { data: COURSES } = useLiveCourses();
  const [showNew, setShowNew] = useState(false);
  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Manage all your teaching assignments.">
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Icon d={ICONS.plus} size={15} /> New Course
        </button>
      </PageHeader>

      <div className="course-grid">
        {myCourses.map(course => (
          <div className="course-card" key={course.id}>
            <div className="course-card-banner"></div>
            <div className="course-card-body">
              <div className="course-dept-tag">{course.dept_code} · {course.credits} Credits</div>
              <div className="course-card-title">{course.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>
                {course.description}
              </p>
              <div className="course-card-meta">
                <span>👥 {course.students_enrolled}/{course.capacity} students</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${Math.round(course.students_enrolled / course.capacity * 100)}%` }}></div>
              </div>
            </div>
            <div className="course-card-footer">
              <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{course.status}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm">
                  <Icon d={ICONS.edit} size={13} />
                </button>
                <button className="btn btn-primary btn-sm">Manage</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Course</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Course Code <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. CS500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <select className="form-input"><option>3</option><option>4</option><option>5</option></select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Course Title <span className="required">*</span></label>
                <input className="form-input" placeholder="Full course title" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Course overview and objectives…"></textarea>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input">
                    <option>CSE</option><option>EEE</option><option>MATH</option><option>PHY</option><option>MBA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input className="form-input" type="number" defaultValue={60} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowNew(false)}>Create Course</button>
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
  const { data: USERS } = { data: MOCK_USERS };

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]?.id || myCourses[0]?._id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const students = USERS.filter(u => u.role === 'student').slice(0, 6);
  const [attendance, setAttendance] = useState(() => {
    const init = {};
    students.forEach(s => { init[s.id] = 'present'; });
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrTime, setQrTime] = useState(300);

  useEffect(() => {
    let timer;
    if (qrModal && qrTime > 0) {
      timer = setInterval(() => setQrTime(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [qrModal, qrTime]);

  function saveAttendance() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;

  return (
    <div>
      <PageHeader title="Mark Attendance" subtitle="Record student attendance for your classes.">
        <button className="btn btn-outline btn-sm" onClick={() => { setQrTime(300); setQrModal(true); }}>🔲 QR Code Mode</button>
      </PageHeader>

      {saved && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ Attendance saved successfully for {presentCount}/{students.length} present.</div>}

      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Live QR Attendance Session</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setQrModal(false)}><Icon d={ICONS.x} size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '2px solid var(--border)' }}>
                <div style={{ width: 180, height: 180, background: '#000', borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: 8 }}>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} style={{ background: i % 2 === 0 || i % 5 === 0 ? 'white' : 'transparent', borderRadius: 2 }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {Math.floor(qrTime / 60)}:{String(qrTime % 60).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Session expires automatically when timer hits zero</div>
              </div>
              <div className="badge badge-success" style={{ padding: '6px 14px', fontSize: 13 }}>
                ● 4 Students scanned live
              </div>
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
              <button className="btn btn-outline btn-sm" onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id, 'present'])))}>All Present</button>
              <button className="btn btn-outline btn-sm" onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id, 'absent'])))}>All Absent</button>
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
          <button className="btn btn-primary" onClick={saveAttendance}>
            <Icon d={ICONS.check} size={15} /> Save Attendance
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
                <th>Last Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 14, borderRadius: 8 }}>
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.id.toUpperCase()}</td>
                  <td><span className="badge badge-neutral">{s.department}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['present', 'absent', 'leave'].map(status => (
                        <button
                          key={status}
                          className={`btn btn-sm ${attendance[s.id] === status
                            ? status === 'present' ? 'btn-secondary'
                              : status === 'absent' ? 'btn-danger'
                              : 'btn-outline'
                            : 'btn-ghost'}`}
                          onClick={() => setAttendance(prev => ({ ...prev, [s.id]: status }))}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {status === 'present' ? '✓' : status === 'absent' ? '✗' : '~'} {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12 }}>
                    {ATTENDANCE_RECORDS.find(r => r.studentId === s.id)?.date || '—'}
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

// ── ASSIGNMENTS GRADING ────────────────────────────────────────────────────
function FacultyAssignments({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: ASSIGNMENTS } = useLiveAssignments();
  const { data: SUBMISSIONS } = { data: MOCK_SUBMISSIONS };

  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.facultyId === user.id);
  const myAssignments = ASSIGNMENTS.filter(a => myCourses.find(c => c.id === a.courseId || c._id === a.courseId));
  const [selected, setSelected] = useState(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Create and grade student assignments.">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon d={ICONS.plus} size={15} /> New Assignment
        </button>
      </PageHeader>

      {/* Assignment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {myAssignments.map(a => {
          const subs = SUBMISSIONS.filter(s => s.assignmentId === a.id);
          const gradedCount = subs.filter(s => s.grade !== null).length;
          return (
            <div className="card" key={a.id}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <span className="badge badge-neutral">{a.courseCode}</span>
                      <span className={`badge ${a.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{a.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{a.description}</div>
                    <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
                      <span>📅 Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span>📊 {a.totalMarks} marks</span>
                      <span>📨 {a.submissionsCount}/{a.studentsCount} submitted</span>
                      <span>✅ {gradedCount} graded</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(a)}>Grade Submissions</button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: `${Math.round(a.submissionsCount / a.studentsCount * 100)}%` }}></div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                    {Math.round(a.submissionsCount / a.studentsCount * 100)}% submission rate
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade Submission Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Grade Submissions</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{selected.title}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-wrapper" style={{ border: '1px solid var(--border)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Submitted At</th>
                      <th>File</th>
                      <th>Grade (/{selected.totalMarks})</th>
                      <th>Feedback</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBMISSIONS.filter(s => s.assignmentId === selected.id).map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sub.submittedAt}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm">
                            <Icon d={ICONS.download} size={13} /> Download
                          </button>
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            style={{ width: 80 }}
                            defaultValue={sub.grade || ''}
                            placeholder="—"
                            min={0}
                            max={selected.totalMarks}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            style={{ width: 200 }}
                            defaultValue={sub.feedback || ''}
                            placeholder="Feedback…"
                          />
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm">Save</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Assignment</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Assignment Title <span className="required">*</span></label>
                <input className="form-input" placeholder="Descriptive title" />
              </div>
              <div className="form-group">
                <label className="form-label">Course <span className="required">*</span></label>
                <select className="form-input">
                  {myCourses.map(c => <option key={c.id}>{c.code} — {c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Detailed assignment instructions…"></textarea>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input className="form-input" type="number" defaultValue={100} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowCreate(false)}>Publish Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FACULTY ANALYTICS ─────────────────────────────────────────────────────
function FacultyAnalytics({ user }) {
  const myCourses = COURSES.filter(c => c.facultyId === user.id);

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
              {myCourses.map((c, i) => {
                const att = [89, 72, 95][i % 3];
                const avgGrade = [82, 77, 91][i % 3];
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.code}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.title}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.students_enrolled}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 70 }}>
                          <div className={`progress-fill ${att < 75 ? 'danger' : 'success'}`} style={{ width: `${att}%` }}></div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{att}%</span>
                      </div>
                    </td>
                    <td>{Math.round(c.students_enrolled * 0.72)}/{c.students_enrolled}</td>
                    <td style={{ fontWeight: 700, color: avgGrade >= 80 ? 'var(--secondary)' : 'var(--warning)' }}>{avgGrade}/100</td>
                    <td>
                      <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
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
      toast.success('Simulated upload completed successfully.');
      setFile(null);
      setTitle('');
      setLink('');
    } catch (err) {
      console.warn('Real API upload failed, falling back to mock UI');
      toast.success('Simulated upload completed successfully.');
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

// ── FACULTY PORTAL ROUTER ─────────────────────────────────────────────────
export default function FacultyPortal({ page, onNavigate }) {
  const { user } = useAuth();

  const pages = {
    dashboard:   <FacultyDashboard user={user} onNavigate={onNavigate} />,
    courses:     <FacultyCourses user={user} />,
    content:     <F.ResourceUpload user={user} />,
    attendance:  <FacultyAttendance user={user} />,
    assignments: <FacultyAssignments user={user} />,
    assessments: <FacultyDashboard user={user} onNavigate={onNavigate} />, // Placeholder uses dashboard
    analytics:   <FacultyAnalytics user={user} />,
    profile:     <div><h1 className="page-title">Faculty Profile</h1></div>,
    notifications: <div style={{ padding: 20 }}><h1 className="page-title">Notifications</h1></div>,
    // New Enterprise Pages
    timetable:    <F.FacultyTimetable user={user} />,
    performance:  <F.StudentPerformance user={user} />,
    leave:        <F.LeaveManagement user={user} />,
    announcements:<F.AnnouncementMgmt user={user} />,
    discussions:  <F.DiscussionModeration user={user} />,
    grades:       <F.GradeSubmission user={user} />,
    completion:   <F.CourseCompletionTracker user={user} />,
    aiTools:      <F.AITools user={user} />,
    feedback:     <F.StudentFeedback user={user} />,
  };

  return pages[page] || pages.dashboard;
}
