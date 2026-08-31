import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon, ICONS } from '../components/Layout.jsx';
import { useDropzone } from 'react-dropzone';
import { useSubmitAssignment, useUpdateProfile, useScanQRSession, useRateCourse } from '../api/hooks.js';
import toast from 'react-hot-toast';

import { useLiveAssignments, useLiveCourses, useLiveSubmissions, useLiveAttendance, useLiveProfile, useLiveNotifications, useLiveAssessments, useLiveCertificates, useLiveEnrollments, useLivePlacementDrives } from '../api/liveData.js';
import * as F from './student/features.jsx';
import OtpAttendanceWidget from '../components/OtpAttendanceWidget.jsx';
import ProfilePage from '../components/profile/ProfilePage.jsx';
import { profileThemes } from '../components/profile/profileTheme.js';
import AcademicPlan from './student/AcademicPlan.jsx';
import CourseRegistration from './student/CourseRegistration.jsx';
import StudentAssignments from './student/assignments/StudentAssignments.jsx';
import { BookOpen, Calendar as CalendarIcon, CheckCircle2, GraduationCap, LayoutDashboard, Settings, Trophy, Users, CalendarDays, MapPin, CheckCircle, Clock, User, Book, Award, Bell, BarChart2, Calendar as CalIcon, CreditCard, PlayCircle, ShieldCheck, BrainCircuit, Activity, Download, MessageSquare, Plus, FileText, Upload } from 'lucide-react';
const SUPPORT_TICKETS = [];


// ── Reusable Components ────────────────────────────────────────────────────
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

// ── STUDENT DASHBOARD ─────────────────────────────────────────────────────
function StudentDashboard({ user, onNavigate }) {
  const { data: NOTIFICATIONS = [] } = useLiveNotifications();
  const { data: COURSES = [] } = useLiveCourses();
  const { data: ENROLLMENTS = [] } = useLiveEnrollments(user.id || user.userId);
  const { data: ATTENDANCE_RECORDS = [] } = useLiveAttendance();
  const { data: ASSIGNMENTS = [] } = useLiveAssignments();
  const { data: ASSESSMENTS = [] } = useLiveAssessments();
  const { data: CERTIFICATES = [] } = useLiveCertificates();


  const enrolled = ENROLLMENTS.filter(e => e.studentId === user.id || e.studentId === user.userId);
  const myAttendance = ATTENDANCE_RECORDS.filter(a => a.studentId === user.id || a.studentId === user.userId);
  const present = myAttendance.filter(a => a.status === 'present').length;
  const attendancePct = myAttendance.length ? Math.round((present / myAttendance.length) * 100) : 0;
  const pendingAssignments = ASSIGNMENTS.filter(a => a.status === 'active' || a.status === 'published');
  const upcomingQuizzes = ASSESSMENTS.filter(q => q.status === 'active' || q.status === 'upcoming' || q.status === 'published');

  return (
    <div>
      <PageHeader
        title={`${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${user.firstName || user.username}`}
        subtitle="Here's your academic overview for today."
      />

      {/* Stats Row */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => onNavigate('courses')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Enrolled Courses</div>
          <div className="stat-value">{enrolled.length}</div>
          <div className="stat-trend trend-up">Active semester</div>
          <div className="stat-icon"><BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('attendance')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Attendance Rate</div>
          <div className="stat-value" style={{ color: attendancePct < 75 ? 'var(--danger)' : 'var(--success)' }}>
            {attendancePct}%
          </div>
          <div className={`stat-trend ${attendancePct < 75 ? 'trend-down' : 'trend-up'}`}>
            {attendancePct < 75 ? 'Below threshold' : 'Good standing'}
          </div>
          <div className="stat-icon"><CalendarIcon size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('assignments')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Pending Assignments</div>
          <div className="stat-value">{pendingAssignments.length}</div>
          <div className="stat-trend trend-neutral">Due this month</div>
          <div className="stat-icon"><BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('certificates')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Certificates Earned</div>
          <div className="stat-value">{CERTIFICATES.filter(c => c.studentId === user.id).length}</div>
          <div className="stat-trend trend-up">Verified credentials</div>
          <div className="stat-icon"><Trophy size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
        </div>
      </div>

      {/* Low Attendance Alert */}
      {attendancePct < 75 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <Icon d={ICONS.bell} size={16} />
          <div>
            <strong>Attendance Warning</strong> — Your attendance is {attendancePct}%, below the required 75%.
            Please contact your course instructor immediately.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Course Progress */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Course Progress</div>
              <div className="card-subtitle">Your current semester enrollments</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('courses')}>View all →</button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {enrolled.map(enr => {
              const course = COURSES.find(c => c.id === enr.courseId);
              return (
                <div key={enr.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{enr.courseTitle}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {course?.facultyName} · {course?.credits} Credits
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{enr.progress}%</div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${enr.progress < 30 ? 'warning' : enr.progress > 80 ? 'success' : ''}`}
                      style={{ width: `${enr.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pendingAssignments.slice(0, 2).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--warning-soft)', color: 'var(--warning)', borderRadius: 8, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={18} strokeWidth={2} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.courseCode}</div>
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2, fontWeight: 600 }}>
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
            {upcomingQuizzes.slice(0, 1).map(q => (
              <div key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--success-soft)', color: 'var(--success)', borderRadius: 8, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={18} strokeWidth={2} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{q.courseCode} · {q.duration} min</div>
                  <span className="badge badge-success" style={{ marginTop: 2 }}>Active</span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--info-soft)', color: 'var(--info)', borderRadius: 8, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Trophy size={18} strokeWidth={2} /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Certificate Ready</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Database Systems & Design</div>
                <div style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 2, fontWeight: 600 }}>Download now →</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Recent Notifications</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('notifications')}>View all</button>
        </div>
        <div>
          {NOTIFICATIONS.slice(0, 4).map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} style={{ cursor: 'default' }}>
              {!n.read && <div className="notif-dot"></div>}
              {n.read && <div style={{ width: 8 }}></div>}
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-desc">{n.description}</div>
                <div className="notif-time">{n.createdAt}</div>
              </div>
              {!n.read && <span className="badge badge-accent">New</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MY COURSES ─────────────────────────────────────────────────────────────
function StudentCourses({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: ENROLLMENTS } = useLiveEnrollments();
  const enrolled = ENROLLMENTS.filter(e => e.studentId === user.id || e.studentId === user.userId);
  const [tab, setTab] = useState('enrolled');
  const availableCourses = COURSES.filter(c =>
    (c.status === 'published' || c.status === 'active') && !enrolled.find(e => e.courseId === c.id || e.courseId === c._id)
  );

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Manage and track your enrolled courses." />

      <div className="tabs">
        <div className={`tab ${tab === 'enrolled' ? 'active' : ''}`} onClick={() => setTab('enrolled')}>
          Enrolled ({enrolled.length})
        </div>
        <div className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
          Browse Available ({availableCourses.length})
        </div>
      </div>

      {tab === 'enrolled' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Info</th>
                  <th>Faculty</th>
                  <th>Credits</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolled.map(enr => {
                  const course = COURSES.find(c => c.id === enr.courseId);
                  if (!course) return null;
                  return (
                    <tr key={enr.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{course.dept_code} · {course.code}</div>
                      </td>
                      <td>{course.facultyName}</td>
                      <td>{course.credits}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60, height: 6 }}>
                            <div className="progress-fill" style={{ width: `${enr.progress}%` }}></div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{enr.progress}%</span>
                        </div>
                      </td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => {
                            const rating = prompt("Rate this course (1-5):");
                              if (rating >= 1 && rating <= 5) rateCourse.mutate({ courseId: c.id, rating: parseInt(rating, 10), comment: '' });
                          }}>Rate</button>
                          <button className="btn btn-outline btn-sm">Continue</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'browse' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Info</th>
                  <th>Description</th>
                  <th>Faculty</th>
                  <th>Credits</th>
                  <th>Enrollment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableCourses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{course.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{course.dept_code} · {course.code}</div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13, color: 'var(--text-2)' }}>
                        {course.description}
                      </div>
                    </td>
                    <td>{course.facultyName}</td>
                    <td>{course.credits}</td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{course.students_enrolled}/{course.capacity}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-primary btn-sm">Enroll</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ATTENDANCE ─────────────────────────────────────────────────────────────
function StudentAttendance({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: ENROLLMENTS } = useLiveEnrollments();
  const { data: ATTENDANCE_RECORDS } = useLiveAttendance();
  const [activeSession, setActiveSession] = useState(null);
  
  const records = ATTENDANCE_RECORDS.filter(a => a.studentId === user.id || a.studentId === user.userId);
  const enrolled = ENROLLMENTS.filter(e => e.studentId === user.id || e.studentId === user.userId);

  // OTP Logic
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('JOIN');
  const [currentOtp, setCurrentOtp] = useState('');
  
  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const ATTEND_URL = import.meta.env.VITE_ATTENDANCE_URL || '/api/attendance';
      const res = await fetch(`${ATTEND_URL}/class-sessions`, { // Ideally an endpoint for 'active sessions for my enrolled courses'
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessions = await res.json();
      if (sessions && sessions.length > 0) {
        // Just mocking for UI demo. Real implementation would get the LIVE AttendanceSession 
        setActiveSession({ id: 'dummy', courseId: 'CS301', status: 'CHECK_IN_OPEN' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const scanQRSession = useScanQRSession();
  
  const handleOtpSubmit = () => {
    if (currentOtp.length < 5) return toast.error('Please enter a valid PIN');
    
    // We pass the PIN to the API (or full sessionId if scanned). The backend should be updated to resolve PINs to sessions.
    scanQRSession.mutate(currentOtp, {
      onSuccess: () => {
        setOtpOpen(false);
        setCurrentOtp('');
        // Remove active session badge since we checked in
        setActiveSession(null); 
      }
    });
  };

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Track your attendance across all enrolled courses." />

      {/* Active Session Alert */}
      {activeSession && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '1px solid var(--accent)', background: 'var(--warning-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="badge badge-accent animate-pulse">Live Session</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{activeSession.courseId}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Professor has opened {activeSession.status === 'CHECK_IN_OPEN' ? 'Check-In' : 'Check-Out'}.</div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setOtpPurpose(activeSession.status === 'ENDING' ? 'END' : 'JOIN');
                setOtpOpen(true);
              }}
            >
              Enter {activeSession.status === 'ENDING' ? 'END' : 'JOIN'} OTP
            </button>
          </div>
        </div>
      )}

      {/* Legacy OTP Modal */}
      {otpOpen && (
        <div className="modal-overlay" onClick={() => setOtpOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Enter {otpPurpose} OTP</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setOtpOpen(false)}><Icon d={ICONS.x} size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Enter the 6-digit OTP displayed on the screen. It rotates every 25 seconds.</p>
              <input
                type="text"
                maxLength="6"
                placeholder="------"
                value={currentOtp}
                onChange={e => setCurrentOtp(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ width: '100%', textAlign: 'center', fontSize: 32, letterSpacing: '0.2em', padding: 16, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--surface-2)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
              <button className="btn btn-accent w-full" onClick={handleOtpSubmit}>
                Submit {otpPurpose} OTP
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {enrolled.map(enr => {
          const courseRecords = records.filter(r => r.courseId === enr.courseId);
          const present = courseRecords.filter(r => r.status === 'present').length;
          const pct = courseRecords.length ? Math.round((present / courseRecords.length) * 100) : 0;
          const course = COURSES.find(c => c.id === enr.courseId);
          return (
            <div className="stat-card" key={enr.id}>
              <div className="stat-label">{course?.code || enr.courseCode}</div>
              <div className="stat-value sm" style={{ color: pct < 75 ? 'var(--danger)' : pct < 85 ? 'var(--warning)' : 'var(--secondary)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{present}/{courseRecords.length} classes attended</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div
                  className={`progress-fill ${pct < 75 ? 'danger' : pct < 85 ? 'warning' : 'success'}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              {pct < 75 && (
                <span className="badge badge-danger" style={{ marginTop: 6 }}>⚠ Low Attendance</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Attendance History</div>
          <button className="btn btn-outline btn-sm">
            <Icon d={ICONS.download} size={13} /> Export
          </button>
        </div>
        <div className="table-wrapper" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const course = COURSES.find(c => c.id === r.courseId);
                return (
                  <tr key={r.id}>
                    <td><span style={{ fontWeight: 600 }}>{course?.code}</span> — {course?.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.date}</td>
                    <td>
                      <span className={`badge ${r.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status === 'present' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{r.markedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ASSESSMENTS / QUIZZES ──────────────────────────────────────────────────
function StudentAssessments({ user }) {
  const { data: ASSESSMENTS } = useLiveAssessments();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  function startQuiz(quiz) {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }

  function submitQuiz() {
    let correct = 0;
    activeQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
  }

  if (activeQuiz && !submitted) {
    return (
      <div>
        <PageHeader title={activeQuiz.title} subtitle={`${activeQuiz.questions.length} questions · ${activeQuiz.duration} minutes`}>
          <button className="btn btn-outline" onClick={() => setActiveQuiz(null)}>← Exit</button>
        </PageHeader>

        <div style={{ maxWidth: 720 }}>
          {activeQuiz.questions.map((q, idx) => (
            <div className="card" key={q.id} style={{ marginBottom: 16 }}>
              <div className="card-body">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--text-1)' }}>
                  <span style={{ color: 'var(--accent)', marginRight: 8 }}>Q{idx + 1}.</span>{q.text}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`quiz-option ${answers[q.id] === optIdx ? 'selected' : ''}`}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        border: '2px solid var(--border)',
                        background: answers[q.id] === optIdx ? 'var(--accent)' : 'transparent',
                        borderColor: answers[q.id] === optIdx ? 'var(--accent)' : 'var(--border)',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {answers[q.id] === optIdx && <Icon d={ICONS.check} size={12} />}
                      </div>
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Answered: {Object.keys(answers).length}/{activeQuiz.questions.length}
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < activeQuiz.questions.length}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeQuiz && submitted) {
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F';
    const passed = score >= activeQuiz.pass_marks;
    return (
      <div>
        <PageHeader title="Quiz Submitted!" subtitle="Here are your results." />
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>{passed ? '🎉' : '📚'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700, color: passed ? 'var(--secondary)' : 'var(--danger)' }}>
              {score}%
            </div>
            <div style={{ fontSize: 24, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>Grade: {grade}</div>
            <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 24 }}>
              {passed ? '✓ You passed this quiz!' : '✗ Below passing score. Review the material and retake.'}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setActiveQuiz(null)}>← Back to Quizzes</button>
              <button className="btn btn-primary" onClick={() => startQuiz(activeQuiz)}>Retake Quiz</button>
            </div>
          </div>

          {/* Leaderboard */}
          {activeQuiz.leaderboard?.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><div className="card-title">Leaderboard</div></div>
              <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>Rank</th><th>Student</th><th>Score</th><th>Time</th></tr></thead>
                  <tbody>
                    {activeQuiz.leaderboard.map(l => (
                      <tr key={l.rank} style={l.studentName === `${user.firstName} ${user.lastName}` ? { background: 'var(--warning-soft)' } : {}}>
                        <td style={{ fontWeight: 700, fontSize: 18 }}>
                          {l.rank === 1 ? '🥇' : l.rank === 2 ? '🥈' : l.rank === 3 ? '🥉' : `#${l.rank}`}
                        </td>
                        <td style={{ fontWeight: 600 }}>{l.studentName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{l.score}%</td>
                        <td style={{ color: 'var(--text-2)' }}>{l.timeTaken}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Quizzes & Assessments" subtitle="Complete your pending assessments and view past results." />
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Assessment Info</th>
                <th>Course</th>
                <th>Duration / Questions</th>
                <th>Passing Criteria</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ASSESSMENTS.map(q => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {q.leaderboard?.length > 0 ? `${q.leaderboard.length} students completed` : 'No attempts yet'}
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{q.courseCode}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    ⏱ {q.duration} min<br/>
                    ❓ {q.questions.length} questions
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-2)' }}>📊 {q.pass_marks}% to pass</td>
                  <td>
                    <span className={`badge ${q.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {q.status === 'active' ? '🟢 Active' : '🕐 Upcoming'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${q.status === 'active' ? 'btn-accent' : 'btn-outline'}`}
                      onClick={() => q.status === 'active' && startQuiz(q)}
                      disabled={q.status !== 'active'}
                    >
                      {q.status === 'active' ? 'Start Quiz →' : 'Locked'}
                    </button>
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

// StudentAssignments moved to src/portals/student/assignments/StudentAssignments.jsx

// ── CERTIFICATES ───────────────────────────────────────────────────────────
function StudentCertificates({ user }) {
  const { data: CERTIFICATES } = useLiveCertificates();
  const [preview, setPreview] = useState(null);
  const myCerts = CERTIFICATES.filter(c => c.studentId === user.id || c.studentId === user.userId);

  return (
    <div>
      <PageHeader title="My Certificates" subtitle="Download and verify your earned credentials." />

      {myCerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No certificates yet</div>
          <div className="empty-state-desc">Complete a course to earn your first verified certificate.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {myCerts.map(cert => (
            <div className="card" key={cert.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderTop: '4px solid var(--accent)', padding: '24px 20px 12px 20px', textAlign: 'center', background: 'var(--surface)' }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>🏆</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>Certificate of Completion</div>
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--text-1)' }}>{cert.courseTitle}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
                    Issued on {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date not available'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span className="badge badge-success">Grade: {cert.grade}</span>
                    {cert.verified && <span className="badge badge-info">✓ Verified</span>}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{cert.certificateNo}</div>
              </div>
              <div className="course-card-footer" style={{ background: 'var(--surface-2)', padding: '12px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreview(cert)}>Preview</button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const link = `${window.location.origin}/verify/${cert.certificateNo || cert.id}`;
                  navigator.clipboard.writeText(link);
                  toast.success('Verification link copied to clipboard!');
                }}>Share Link</button>
                <button className="btn btn-primary btn-sm" onClick={() => toast.error('Service unavailable (Certificate generation API not connected)')}>
                  <Icon d={ICONS.download} size={13} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Certificate Preview</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setPreview(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="certificate">
                <div className="certificate-title">CampusSphere University</div>
                <div className="certificate-headline">Certificate<br />of Completion</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>This is to certify that</div>
                <div className="certificate-recipient">{preview.studentName}</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 6 }}>has successfully completed</div>
                <div className="certificate-course" style={{ fontWeight: 700, color: 'var(--text-1)' }}>{preview.courseTitle}</div>
                <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: 32 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--accent)' }}>{preview.grade}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Final Grade</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{preview.certificateNo}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Certificate No.</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  Issued: {preview.issuedAt ? new Date(preview.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPreview(null)}>Close</button>
              <button className="btn btn-primary">
                <Icon d={ICONS.download} size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STUDENT ID & PROFILE ───────────────────────────────────────────────────
function StudentProfile({ user }) {
  const { data: profile, isLoading } = useLiveProfile(user.id || user._id);
  const { data: courses } = useLiveCourses();
  const { data: assignments } = useLiveAssignments();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const displayFirstName = profile?.firstName || user.firstName || 'Student';
  const displayLastName = profile?.lastName || user.lastName || '';
  const fullName = `${displayFirstName} ${displayLastName}`.trim();

  const formattedProfile = {
    userId: user.id || user._id,
    name: fullName,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    designation: 'Student',
    department: 'N/A', // Update this if department exists in user data
    id: (user.id || user._id).toUpperCase(),
    idLabel: 'Student ID',
    status: 'Active Student',
    avatar: 'N/A',
    email: user.email,
    phone: profile?.phone,
    dob: profile?.dob,
    gender: profile?.gender,
    address: profile?.address,
    bio: profile?.bio,
    professionalTitle: 'Academic Information',
    professional: [
      ['Department', 'N/A'],
      ['Program', 'N/A'],
      ['Current Semester', 'N/A'],
      ['Section', 'N/A'],
      ['Academic Year', 'N/A'],
      ['Roll No', 'N/A'],
      ['Batch', 'N/A'],
      ['CGPA', 'N/A']
    ],
    statsTitle: 'Academic Statistics',
    stats: [
      { icon: GraduationCap, label: 'CGPA', value: 'N/A', helper: 'Out of 10.00' },
      { icon: CheckCircle2, label: 'Courses Enrolled', value: courses?.length || 0, helper: 'This Semester' },
      { icon: CalendarIcon, label: 'Attendance', value: 'N/A', helper: 'This Semester' },
      { icon: Trophy, label: 'Assignments', value: assignments?.length || 0, helper: 'Till Date' }
    ],
    activities: [],
    metadata: [
      { icon: LayoutDashboard, label: 'Roll No', value: 'N/A' },
      { icon: Users, label: 'Batch', value: 'N/A' }
    ]
  };

  return (
    <ProfilePage
      profile={formattedProfile}
      accent={profileThemes.student}
      updateProfileHook={updateProfile}
    >
      <div className="card mt-6">
        <div className="card-header"><div className="card-title">Enrolled Courses (This Semester)</div></div>
        <div className="card-body">
          {courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 6).map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-neutral text-xs">{c.code}</span>
                    <span className="text-sm font-medium text-slate-800">{c.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">4 Credits</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No courses enrolled</p>
          )}
        </div>
      </div>
    </ProfilePage>
  );
}

// ── HELP DESK ──────────────────────────────────────────────────────────────
function HelpDesk({ user }) {
  const [showNew, setShowNew] = useState(false);
  const myTickets = SUPPORT_TICKETS.filter(t => t.userId === user.id);

  return (
    <div>
      <PageHeader title="Help Desk" subtitle="Get technical or academic support from our team.">
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Icon d={ICONS.plus} size={15} /> New Ticket
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* FAQ */}
        <div className="card">
          <div className="card-header"><div className="card-title">Quick FAQs</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'How do I enroll in a course?',
              'Where can I download my certificate?',
              'How is attendance calculated?',
              'How to submit an assignment?',
              'What is the grading policy?',
            ].map((faq, i) => (
              <div key={i} style={{
                padding: '10px 12px', background: 'var(--surface-2)',
                borderRadius: 8, fontSize: 13, color: 'var(--text-1)',
                cursor: 'pointer', border: '1px solid var(--border)',
                transition: 'border-color 0.2s'
              }}>
                ❓ {faq}
              </div>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div>
          <div className="card-title" style={{ marginBottom: 12 }}>My Tickets ({myTickets.length})</div>
          {myTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: 60 }}>
              <div className="empty-state-icon">🎫</div>
              <div className="empty-state-title">No tickets yet</div>
              <div className="empty-state-desc">Create a support ticket to get help from our team.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myTickets.map(t => (
                <div className="card" key={t.id}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</div>
                      <span className={`badge ${
                        t.status === 'open' ? 'badge-warning' :
                        t.status === 'in-progress' ? 'badge-info' : 'badge-success'
                      }`}>
                        {t.status === 'open' ? '🟡 Open' : t.status === 'in-progress' ? '🔵 In Progress' : '🟢 Resolved'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-2)' }}>
                      <span>📂 {t.category}</span>
                      <span>⚠ Priority: {t.priority}</span>
                      <span>📅 {t.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Support Ticket</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject <span className="required">*</span></label>
                <input className="form-input" placeholder="Brief description of your issue" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input">
                    <option>Technical</option>
                    <option>Academic</option>
                    <option>Financial</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input">
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea className="form-input" rows={4} placeholder="Describe your issue in detail…"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowNew(false)}>Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PLACEMENT PORTAL ───────────────────────────────────────────────────────
function PlacementPortal({ user }) {
  const jobs = [
    { id: 'j1', title: 'Frontend Developer Intern', company: 'TechCorp Inc.', location: 'Remote', type: 'Internship', salary: '$25/hr', skills: ['React', 'TypeScript', 'CSS'], deadline: '2026-07-20', logo: '💻' },
    { id: 'j2', title: 'Data Science Graduate', company: 'DataMind AI', location: 'New York, NY', type: 'Full-time', salary: '$85,000/yr', skills: ['Python', 'ML', 'SQL'], deadline: '2026-07-25', logo: '🤖' },
    { id: 'j3', title: 'Software Engineer I', company: 'Global Systems Ltd', location: 'San Francisco, CA', type: 'Full-time', salary: '$110,000/yr', skills: ['Java', 'Spring', 'AWS'], deadline: '2026-08-01', logo: '⚙️' },
    { id: 'j4', title: 'UX Research Intern', company: 'DesignHub', location: 'Chicago, IL', type: 'Internship', salary: '$22/hr', skills: ['Figma', 'User Research', 'Prototyping'], deadline: '2026-07-15', logo: '🎨' },
  ];

  return (
    <div>
      <PageHeader title="Placement Portal" subtitle="Explore job opportunities and campus recruitment drives.">
        <button className="btn btn-outline btn-sm">📄 Upload Resume</button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.map(job => (
            <div className="card" key={job.id} style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 36, width: 52, height: 52, background: 'var(--surface-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {job.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{job.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{job.company}</div>
                      </div>
                      <span className={`badge ${job.type === 'Full-time' ? 'badge-success' : 'badge-info'}`}>{job.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)', marginTop: 8, flexWrap: 'wrap' }}>
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                      <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {job.skills.map(s => <span key={s} className="badge badge-neutral">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="course-card-footer">
                <span></span>
                <button className="btn btn-accent btn-sm">Apply Now →</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">My Profile</div></div>
            <div className="card-body" style={{ fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 20 }}>{(user.firstName || user.username || 'S')[0]}{(user.lastName || 'T')[0]}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.firstName || user.username} {user.lastName || ''}</div>
                  <div style={{ color: 'var(--text-2)' }}>{user.department || 'Student'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-2)' }}>Profile Strength</span>
                  <span style={{ fontWeight: 700 }}>65%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill warning" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Complete Profile</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Campus Drives</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { company: 'Google', date: 'Jul 18', slots: 5 },
                { company: 'Microsoft', date: 'Jul 22', slots: 8 },
                { company: 'Infosys', date: 'Aug 1', slots: 25 },
              ].map(d => (
                <div key={d.company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.company}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>📅 {d.date} · {d.slots} openings</div>
                  </div>
                  <button className="btn btn-primary btn-sm">Register</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIBRARY ────────────────────────────────────────────────────────────────
function Library({ user }) {
  const books = [
    { id: 'b1', title: 'Introduction to Algorithms', author: 'CLRS', category: 'Computer Science', available: 3, isbn: '978-0-262-03384-8' },
    { id: 'b2', title: 'Database System Concepts', author: 'Silberschatz et al.', category: 'Computer Science', available: 0, isbn: '978-0-07-352332-3' },
    { id: 'b3', title: 'Linear Algebra Done Right', author: 'Sheldon Axler', category: 'Mathematics', available: 5, isbn: '978-3-319-11079-0' },
    { id: 'b4', title: 'The Art of Electronics', author: 'Horowitz & Hill', category: 'Electronics', available: 2, isbn: '978-0-521-80926-9' },
    { id: 'b5', title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', available: 1, isbn: '978-0-13-235088-4' },
  ];

  return (
    <div>
      <PageHeader title="Library" subtitle="Search, borrow, and reserve books from the university library.">
        <button className="btn btn-outline btn-sm">📚 My Borrowings</button>
      </PageHeader>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>📖 {b.title}</td>
                <td style={{ color: 'var(--text-2)' }}>{b.author}</td>
                <td><span className="badge badge-neutral">{b.category}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{b.isbn}</td>
                <td>
                  <span className={`badge ${b.available > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {b.available > 0 ? `${b.available} Available` : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button className={`btn btn-sm ${b.available > 0 ? 'btn-primary' : 'btn-outline'}`} disabled={b.available === 0}>
                    {b.available > 0 ? 'Borrow' : 'Reserve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS PAGE ─────────────────────────────────────────────────────
function NotificationsPage({ user }) {
  const { data: NOTIFICATIONS = [] } = useLiveNotifications();
  const [filter, setFilter] = useState('all');
  const my = NOTIFICATIONS.filter(n => n.userId === user.id);
  const filtered = filter === 'all' ? my : filter === 'unread' ? my.filter(n => !n.read) : my.filter(n => n.type === filter);

  const typeIcon = { assignment: '📝', quiz: '⚡', attendance: '📅', certificate: '🏆', announcement: '📢' };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Stay updated with your academic alerts.">
        <button className="btn btn-outline btn-sm">Mark all as read</button>
      </PageHeader>

      <div className="tabs">
        {['all', 'unread', 'assignment', 'quiz', 'attendance', 'certificate'].map(t => (
          <div key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'unread' && <span className="nav-badge" style={{ position: 'static', marginLeft: 4 }}>{my.filter(n => !n.read).length}</span>}
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-title">All caught up!</div>
          </div>
        ) : filtered.map(n => (
          <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} style={{ cursor: 'default', padding: '14px 18px' }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</div>
            <div className="notif-content" style={{ flex: 1 }}>
              <div className="notif-title" style={{ fontSize: 14 }}>{n.title}</div>
              <div className="notif-desc" style={{ fontSize: 13 }}>{n.description}</div>
              <div className="notif-time" style={{ marginTop: 5 }}>{n.createdAt}</div>
            </div>
            {!n.read && <span className="badge badge-accent">New</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STUDENT PORTAL ROUTER ──────────────────────────────────────────────────
export default function StudentPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(`/student/${path}`);

  return (
    <>
      <Routes>
        <Route path="dashboard" element={<StudentDashboard user={user} onNavigate={handleNavigate} />} />
        <Route path="courses" element={<StudentCourses user={user} onNavigate={handleNavigate} />} />
        <Route path="attendance" element={<StudentAttendance user={user} />} />
        <Route path="assessments" element={<StudentAssessments user={user} />} />
        <Route path="assignments" element={<StudentAssignments user={user} />} />
        <Route path="certificates" element={<StudentCertificates user={user} />} />
        <Route path="library" element={<F.StudentLibrary user={user} />} />
        <Route path="placement" element={<F.StudentPlacement user={user} />} />
        <Route path="helpdesk" element={<HelpDesk user={user} />} />
        <Route path="profile" element={<StudentProfile user={user} />} />
        <Route path="notifications" element={<F.StudentNotifications user={user} />} />
        <Route path="timetable" element={<F.StudentTimetable user={user} />} />
        <Route path="acad-calendar" element={<F.AcademicCalendar user={user} />} />
        <Route path="progress" element={<F.LearningProgress user={user} />} />
        <Route path="discussions" element={<F.CommunicationHub user={user} />} />
        <Route path="transcript" element={<F.TranscriptGrades user={user} />} />
        <Route path="fees" element={<F.FeePayment user={user} />} />
        <Route path="downloads" element={<F.DownloadCenter user={user} />} />
        <Route path="activity" element={<F.ActivityTimeline user={user} />} />
        <Route path="ai-assistant" element={<F.AIAssistant user={user} />} />
        <Route path="plan" element={<AcademicPlan user={user} />} />
        <Route path="registration" element={<CourseRegistration user={user} />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
      {user?.token && <OtpAttendanceWidget token={user.token} />}
    </>
  );
}

