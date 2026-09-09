import { useLiveDiscussionThreads as useLiveDiscussionThreadsHook } from '../../api/liveData.js';
// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Faculty Portal Feature Modules
// New enterprise features split into separate file for maintainability
// ══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { Icon, ICONS } from '../../components/Layout.jsx';
import toast from 'react-hot-toast';
import {
  PageHeader, StatCard, DataTable, StatusBadge, Tabs, FilterBar,
  CalendarWidget, TimetableGrid, Timeline, BarChart, DonutChart,
  ProgressRing, MiniSparkline, AIChatInterface, NotificationCenter,
  EmptyState, Modal, CommandPalette, WorkflowTimeline
} from '../../components/shared/index.jsx';
import { 
  Users, UsersRound, Calendar, BookOpen, Star, AlertTriangle, AlertCircle, TrendingUp, CheckCircle2, Megaphone, Target, Settings, Zap, Award, Inbox, Clock, MapPin, Briefcase, Building, FileText, Download, MessageSquare, Pin, HelpCircle, GraduationCap, Copy, Share2, Printer, Activity, ClipboardCheck, MessageCircle, BarChart2, ListOrdered, CheckSquare, BrainCircuit, NotebookPen, PenTool, LayoutTemplate, MessageSquareMore, UploadCloud
} from 'lucide-react';

import {
  useLiveTimetable, useLiveCalendarEvents, useLiveCourses,
  useLiveAssignments, useLiveAssessments, useLiveAttendance,
  useLiveLeaveRecords, useLiveLeaveBalance, useLiveUsers,
  useLiveCourseResources
} from '../../api/liveData.js';
import {
  useApplyForLeave, useApproveLeave, useRejectLeave, useWithdrawLeave,
  useAnnouncements, useCreateAnnouncement,
  useUploadCourseResource
} from '../../api/hooks.js';

// ── FACULTY TIMETABLE ───────────────────────────────────────────────────────
export function FacultyTimetable({ user }) {
  const { data: TIMETABLE } = useLiveTimetable();
  const facultySlots = TIMETABLE.filter(s => {
    const instructor = s.instructor || s.faculty || '';
    return instructor === user.id || instructor === user.userId || instructor === user.username || instructor.includes(user.lastName || '') || instructor.includes(user.firstName || '');
  });

  return (
    <div>
      <PageHeader
        title="Teaching Schedule"
        subtitle="Your scheduled lectures, tutorials, and lab sessions"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Timetable' }]}
      />
      <div className="card" style={{ padding: 20 }}>
        <TimetableGrid slots={facultySlots} />
      </div>
    </div>
  );
}

// ── STUDENT PERFORMANCE ANALYTICS ───────────────────────────────────────────
export function StudentPerformance({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: filteredUsers = [] } = useLiveUsers('student');

  return (
    <div>
      <PageHeader
        title="Student Performance"
        subtitle="Track class performance, GPAs, and identify at-risk students"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Performance' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Students Guided" value={filteredUsers.length} icon={<UsersRound size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Average GPA of Batches" value="8.79" trend="On Track" trendType="up" icon={<BarChart2 size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="At Risk Cohort" value="2" trend="Requires Intervention" trendType="down" icon={<AlertTriangle size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Student List</h3>
        <DataTable
          columns={[
            { key: 'regNo', label: 'Register No', render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span> },
            { key: 'firstName', label: 'Name', render: (_, row) => `${row.firstName} ${row.lastName}` },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Dept', width: 80 },
            { key: 'gpa', label: 'CGPA', render: v => <strong>{v}</strong> },
            { key: 'status', label: 'Status', render: (v, row) => row.gpa < 8.0 ? <span className="badge badge-danger">At Risk</span> : <span className="badge badge-success">Good</span> }
          ]}
          data={filteredUsers}
        />
      </div>
    </div>
  );
}

// ── LEAVE MANAGEMENT ────────────────────────────────────────────────────────
export function LeaveManagement({ user }) {
  const { data: myRecords } = useLiveLeaveRecords({ role: 'student', userId: user.id });
  const { data: studentRequests } = useLiveLeaveRecords({ role: 'faculty' });
  const { data: balanceData } = useLiveLeaveBalance(user.id);
  
  const applyMutation = useApplyForLeave();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const withdrawMutation = useWithdrawLeave();

  const [activeTab, setActiveTab] = useState('queue');
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [type, setType] = useState('Casual Leave');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    applyMutation.mutate({
      requesterId: user.id,
      requesterRole: 'faculty',
      leaveType: type,
      startDate: from,
      endDate: to,
      daysCount: 1,
      affectedCourses: [],
      reason
    });
    setModalOpen(false);
  }

  function handleApprove(id) {
    approveMutation.mutate({ id, approverId: user.id });
  }

  function handleRejectSubmit(e) {
    e.preventDefault();
    rejectMutation.mutate({ id: selectedRequest._id || selectedRequest.id, approverId: user.id, rejectionReason });
    setRejectModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle="Manage student leave approvals and apply for your own leaves"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Leave Management' }]}
      >
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Apply Leave</button>
      </PageHeader>

      <Tabs tabs={[
        { id: 'queue', label: 'Student Approvals', icon: <CheckSquare size={16} />, badge: studentRequests.filter(r => r.status === 'pending').length },
        { id: 'myleaves', label: 'My Leaves', icon: <Calendar size={16} /> }
      ]} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'queue' && (
        <div style={{ marginTop: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Pending Approvals</h3>
            <DataTable
              columns={[
                { key: 'requesterId', label: 'Student ID' },
                { key: 'leaveType', label: 'Type' },
                { key: 'startDate', label: 'From' },
                { key: 'endDate', label: 'To' },
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
                { key: 'id', label: 'Action', width: 160, render: (v, row) => (
                  row.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleApprove(row._id || row.id)}>Approve</button>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => { setSelectedRequest(row); setRejectModalOpen(true); }}>Reject</button>
                    </div>
                  ) : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Processed</span>
                ), sortable: false }
              ]}
              data={studentRequests}
            />
          </div>
        </div>
      )}

      {activeTab === 'myleaves' && (
        <div style={{ marginTop: 20 }}>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            {balanceData.map(b => (
              <StatCard key={b.type} label={`${b.type} Balance`} value={`${b.remaining} / ${b.total}`} icon={<Calendar size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} trend={`${b.used} used`} trendType="neutral" />
            ))}
            {balanceData.length === 0 && (
               <StatCard label="Leave Policy" value="Loading..." icon={<FileText size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
            )}
          </div>
          <div className="card" style={{ padding: 20 }}>
             <DataTable
              columns={[
                { key: 'leaveType', label: 'Type' },
                { key: 'startDate', label: 'From Date' },
                { key: 'endDate', label: 'To Date' },
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
                { key: 'id', label: 'Action', render: (v, row) => (
                   row.status === 'pending' ? (
                     <button className="btn btn-outline btn-sm" onClick={() => withdrawMutation.mutate({ id: row._id || row.id, requesterId: user.id })}>Withdraw</button>
                   ) : null
                ), sortable: false }
              ]}
              data={myRecords}
              searchable={false}
            />
          </div>
        </div>
      )}

      <Modal open={modalOpen} title="Apply for Leave" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              {balanceData.map(b => <option key={b.type} value={b.type}>{b.type}</option>)}
              {balanceData.length === 0 && <option value="Casual Leave">Casual Leave</option>}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" required value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" required value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-textarea" required value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={applyMutation.isLoading}>Submit Application</button>
          </div>
        </form>
      </Modal>

      <Modal open={rejectModalOpen} title="Reject Leave Request" onClose={() => setRejectModalOpen(false)}>
        <form onSubmit={handleRejectSubmit}>
          <div className="form-group">
            <label className="form-label">Rejection Reason (Required)</label>
            <textarea className="form-textarea" required value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} placeholder="Provide a reason for rejection..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setRejectModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)' }} disabled={rejectMutation.isLoading}>Reject Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── ANNOUNCEMENT MANAGEMENT ─────────────────────────────────────────────────
export function AnnouncementMgmt({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const { data: announcementsData } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const announcements = announcementsData?.announcements || [];
  
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('student');
  const [priority, setPriority] = useState('normal');

  function handleSubmit(e) {
    e.preventDefault();
    createAnnouncement.mutate({
      title,
      content,
      targetRoles: target === 'all' ? ['student', 'faculty', 'admin', 'management'] : [target],
      priority
    });
    setModalOpen(false);
    setTitle('');
    setContent('');
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Manage and publish class and course announcements"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Announcements' }]}
      >
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Create Announcement</button>
      </PageHeader>

      <DataTable
        columns={[
          { key: 'createdAt', label: 'Date', width: 100, render: v => v ? new Date(v).toLocaleDateString() : 'N/A' },
          { key: 'title', label: 'Title' },
          { key: 'content', label: 'Content', render: v => <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div> },
          { key: 'targetRoles', label: 'Target Audience', render: (v) => <span className="badge badge-neutral">{(v && v.length) ? v.join(', ') : 'all'}</span> },
          { key: 'priority', label: 'Priority', render: v => <StatusBadge status={v} /> }
        ]}
        data={announcements}
      />

      <Modal open={modalOpen} title="Create Announcement" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" required value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select className="form-select" value={target} onChange={e => setTarget(e.target.value)}>
              <option value="all">All Students & Faculty</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── DISCUSSION MODERATION ───────────────────────────────────────────────────
export function DiscussionModeration({ user }) {
  const { data: threads } = useLiveDiscussionThreadsHook('all');
  const [filter, setFilter] = useState('all');

  const discussions = threads?.length ? threads : [];
  return (
    <div>
      <PageHeader
        title="Communication Hub Moderation"
        subtitle="Manage discussions, resolve student queries, and pin helpful posts"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Moderation' }]}
      />

      <DataTable
        columns={[
          { key: 'courseCode', label: 'Course', width: 90 },
          { key: 'title', label: 'Discussion Thread' },
          { key: 'author', label: 'Author', width: 120 },
          { key: 'upvotes', label: 'Upvotes', width: 70 },
          { key: 'replies', label: 'Replies', width: 70 },
          { key: 'status', label: 'Status', render: (_, row) => row.resolved ? <span className="badge badge-success">Resolved</span> : <span className="badge badge-warning">Unresolved</span> },
          { key: 'id', label: 'Actions', render: () => (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-outline btn-sm">View</button>
              <button className="btn btn-ghost btn-sm">Pin</button>
            </div>
          ), sortable: false }
        ]}
        data={discussions}
      />
    </div>
  );
}

// ── GRADE SUBMISSION ────────────────────────────────────────────────────────
export function GradeSubmission({ user }) {
  const { data: COURSES } = useLiveCourses();
  const myCourses = COURSES.filter(c => c.instructorId === user.id);
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]?.id || null);
  const [gradesData, setGradesData] = useState([]);
  const [saving, setSaving] = useState(false);
  const records = [].filter(g => g.courseId === selectedCourse);

  const initialStudents = [
    { id: 'st1', name: 'Alice Vance', attendance: '92%', a1: 18, a2: 19, exam: 45 },
    { id: 'st2', name: 'Bob Miller', attendance: '88%', a1: 15, a2: 17, exam: 38 },
    { id: 'st3', name: 'Charlie Dean', attendance: '74%', a1: 12, a2: 14, exam: 30 },
    { id: 'st4', name: 'Diana Prince', attendance: '98%', a1: 20, a2: 20, exam: 48 },
    { id: 'st5', name: 'Evan Wright', attendance: '81%', a1: 14, a2: 16, exam: 35 },
  ];

  function handleSelectCourse(courseId) {
    setSelectedCourse(courseId);
    setGradesData(initialStudents);
  }

  function handleGradeChange(studentId, field, val) {
    const numeric = Math.min(Math.max(Number(val) || 0, 0), field === 'exam' ? 50 : 20);
    setGradesData(prev => prev.map(s => s.id === studentId ? { ...s, [field]: numeric } : s));
  }

  function getGrade(total) {
    if (total >= 85) return 'S';
    if (total >= 75) return 'A';
    if (total >= 65) return 'B';
    if (total >= 50) return 'C';
    return 'F';
  }

  async function handleSave() {
    toast.error('Service unavailable (Grade submission API not connected)');
  }

  if (selectedCourse) {
    return (
      <div>
        <PageHeader
          title={`Gradebook: ${selectedCourse}`}
          subtitle={`Enter grades for course ${selectedCourse}`}
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => setSelectedCourse(null) },
            { label: 'Grade Submission', onClick: () => setSelectedCourse(null) },
            { label: selectedCourse }
          ]}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedCourse(null)}>Back</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Publish Grades'}
            </button>
          </div>
        </PageHeader>

        <div className="card" style={{ padding: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>Student Name</th>
                <th style={{ padding: '12px 8px' }}>Attendance</th>
                <th style={{ padding: '12px 8px' }}>Assigment 1 (max 20)</th>
                <th style={{ padding: '12px 8px' }}>Assignment 2 (max 20)</th>
                <th style={{ padding: '12px 8px' }}>Exam (max 50)</th>
                <th style={{ padding: '12px 8px' }}>Total (max 90)</th>
                <th style={{ padding: '12px 8px' }}>Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {gradesData.map(s => {
                const total = s.a1 + s.a2 + s.exam;
                const letterGrade = getGrade(total);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '10px 8px', color: s.attendance.replace('%', '') < 75 ? 'var(--danger)' : 'var(--text-1)' }}>{s.attendance}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 80, padding: '4px 8px' }}
                        value={s.a1}
                        onChange={e => handleGradeChange(s.id, 'a1', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 80, padding: '4px 8px' }}
                        value={s.a2}
                        onChange={e => handleGradeChange(s.id, 'a2', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 80, padding: '4px 8px' }}
                        value={s.exam}
                        onChange={e => handleGradeChange(s.id, 'exam', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{total} / 90</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${letterGrade === 'F' ? 'badge-danger' : 'badge-success'}`}>
                        {letterGrade}
                      </span>
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

  return (
    <div>
      <PageHeader
        title="Grade Submission"
        subtitle="Submit final grades for validation and CGPA calculation"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Grade Submission' }]}
      />

      <DataTable
        columns={[
          { key: 'courseCode', label: 'Course Code', width: 100 },
          { key: 'courseName', label: 'Course Name' },
          { key: 'totalStudents', label: 'Students', width: 80 },
          { key: 'gradesSubmitted', label: 'Graded', width: 80 },
          { key: 'deadline', label: 'Deadline', width: 100 },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          { key: 'courseId', label: 'Action', render: (_, row) => (
            <button className="btn btn-primary btn-sm" disabled={row.status === 'submitted'} onClick={() => handleSelectCourse(row.courseId)}>
              {row.status === 'submitted' ? 'Submitted' : 'Enter Grades'}
            </button>
          ), sortable: false }
        ]}
        data={[]}
      />
    </div>
  );
}

// ── COURSE COMPLETION TRACKER ───────────────────────────────────────────────
export function CourseCompletionTracker({ user }) {
  const { data: COURSES } = useLiveCourses();
  const myCourses = COURSES.filter(c => c.instructorId === user.id);

  return (
    <div>
      <PageHeader
        title="Syllabus Completion"
        subtitle="Track percentage completion of your active courses syllabus"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Syllabus Tracker' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {myCourses.map(course => (
          <div key={course.id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
            <ProgressRing value={course.syllabus_completion} size={80} color="var(--secondary)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{course.code}</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{course.title}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Students: {course.students_enrolled}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RESOURCE UPLOAD CENTER ──────────────────────────────────────────────────
export function ResourceUpload({ user }) {
  const { data: COURSES } = useLiveCourses();
  const myCourses = COURSES.filter(c => c.facultyOwnerId === user.id || c.coInstructors?.includes(user.id) || c.facultyId === user.id);
  return (
    <div>
      <PageHeader
        title="Resource Center"
        subtitle="Upload and manage study materials, slides, and manuals"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Resource Upload' }]}
      />

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12, color: 'var(--text-1)' }}>Upload Material</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <select className="form-select">
            <option>Select Course</option>
            {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
          </select>
          <input className="form-input" placeholder="Title/Topic Name..." />
        </div>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '32px 16px', textAlignment: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <UploadCloud size={48} color="var(--text-3)" strokeWidth={1} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Drag & Drop or Click to browse files</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>PDF, PPTX, MP4, ZIP (Max 50MB)</div>
        </div>
      </div>
    </div>
  );
}

// ── AI TEACHING TOOLS ───────────────────────────────────────────────────────
export function AITools({ user }) {
  const [activeTool, setActiveTool] = useState('paper');
  const [prompt, setPrompt] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    const inputContent = activeTool === 'evaluator' ? essayContent : prompt;
    if (!inputContent.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.error('Service unavailable (AI Engine not connected)');
    }, 500);
  }

  return (
    <div>
      <PageHeader
        title="AI Teaching Tools"
        subtitle="Generate question papers, evaluation rubrics, and batch summaries using AI"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'AI Tools' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          {[
            { id: 'paper', label: 'Question Paper Gen', icon: <NotebookPen size={18} /> },
            { id: 'rubric', label: 'Rubric Generator', icon: <LayoutTemplate size={18} /> },
            { id: 'evaluator', label: 'AI Essay Evaluator', icon: <PenTool size={18} /> },
            { id: 'summary', label: 'Batch Summary & Insights', icon: <BarChart2 size={18} /> }
          ].map(tool => (
            <div
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setOutput(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--r-sm)',
                cursor: 'pointer', background: activeTool === tool.id ? 'var(--surface-2)' : 'transparent',
                fontWeight: activeTool === tool.id ? 700 : 500, color: activeTool === tool.id ? 'var(--accent)' : 'var(--text-2)'
              }}
            >
              <span>{tool.icon}</span>
              <span style={{ fontSize: 13 }}>{tool.label}</span>
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12, color: 'var(--text-1)' }}>
            {activeTool === 'paper' && 'AI Question Paper Generator'}
            {activeTool === 'rubric' && 'AI Evaluation Rubric Generator'}
            {activeTool === 'evaluator' && 'AI Essay Evaluator'}
            {activeTool === 'summary' && 'AI Batch Summary & Analytics'}
          </h3>

          <div className="form-group">
            <label className="form-label">
              {activeTool === 'paper' && 'Describe topics, difficulty level, and marks structure:'}
              {activeTool === 'rubric' && 'Describe project guidelines or grading focus areas:'}
              {activeTool === 'evaluator' && 'Paste the student\'s essay/submission contents below:'}
              {activeTool === 'summary' && 'Select course batch for analytics and recommendations:'}
            </label>
            {activeTool === 'summary' ? (
              <select className="form-select" value={prompt} onChange={e => setPrompt(e.target.value)}>
                <option value="">Select Course Batch</option>
                <option value="cs101">CS101 - Intro to Computer Science</option>
                <option value="cs302">CS302 - Database Systems</option>
              </select>
            ) : activeTool === 'evaluator' ? (
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Paste student text here (e.g. Distributed database partitioning has key advantages...)"
                value={essayContent}
                onChange={e => setEssayContent(e.target.value)}
              />
            ) : (
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={activeTool === 'paper' ? 'e.g. Data Structures, mid-sem, 50 marks, topics: linked list, hashes, BST' : 'e.g. DBMS Final Year project rubric, focus on schema design, query optimization, security'}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            )}
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || (activeTool === 'evaluator' ? !essayContent.trim() : !prompt.trim() && activeTool !== 'summary')}>
            {loading ? 'Analyzing & Generating...' : <><Zap size={14} style={{ marginRight: 4 }} /> Generate Output</>}
          </button>

          {output && (
            <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
              <div dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '<br/>') }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── STUDENT FEEDBACK ────────────────────────────────────────────────────────
export function StudentFeedback({ user }) {
  const mySurveys = [].filter(s => s.instructorId === user.id);

  return (
    <div>
      <PageHeader
        title="Student Feedback"
        subtitle="View ratings, course evaluations, and sentiment details"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Feedback' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {mySurveys.map(f => (
          <div key={f.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{f.courseCode}</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 8 }}>{f.semester}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>★ {f.avgRating}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Responses: {f.responses} students</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {f.comments.map((comment, i) => (
                <div key={i} style={{ padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', fontSize: 12, width: '100%', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <MessageSquareMore size={14} color="var(--brand, #C43D3D)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>"{comment}"</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── OTP ATTENDANCE MANAGEMENT ───────────────────────────────────────────────
import axios from 'axios';
import { io } from 'socket.io-client';

const ATTENDANCE_URL = import.meta.env.VITE_ATTENDANCE_URL || '/api/attendance';

export function FacultyOtpAttendance({ user }) {
  const { data: COURSES } = useLiveCourses();
  const myCourses = COURSES.filter(c => c.instructorId === user.id || c.facultyOwnerId === user.id || c.facultyOwnerId === user.userId || c.instructorId === user.userId);
  
  const [courseId, setCourseId] = useState('');
  const [classSessions, setClassSessions] = useState([]);
  const [selectedClassSessionId, setSelectedClassSessionId] = useState('');
  
  const [activeSession, setActiveSession] = useState(null); // Full attendanceSession object
  const [currentOtp, setCurrentOtp] = useState('------');
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [purpose, setPurpose] = useState('JOIN');
  const [submissions, setSubmissions] = useState([]);
  
  // 1. Resolve today's classes
  const handleResolveClasses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${ATTENDANCE_URL}/class-sessions/resolve`, { dateStr: today }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const res = await axios.get(`${ATTENDANCE_URL}/class-sessions?dateStr=${today}&facultyId=${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setClassSessions(res.data);
      toast.success('Classes resolved for today');
    } catch (err) {
      toast.error('Failed to resolve classes');
    }
  };

  // 2. Start Session
  const startSession = async () => {
    if (!selectedClassSessionId) return toast.error('Select a class session');
    try {
      const res = await axios.post(`${ATTENDANCE_URL}/otp-attendance/sessions/start`, { classSessionId: selectedClassSessionId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Session Created (READY)');
      setActiveSession({ id: res.data.sessionId, status: 'READY', courseId: classSessions.find(c => c._id === selectedClassSessionId)?.courseId });
      setSubmissions([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start session');
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await axios.patch(`${ATTENDANCE_URL}/otp-attendance/sessions/${activeSession.id}/status`, { newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setActiveSession(prev => ({ ...prev, status: newStatus }));
      toast.success(`Session moved to ${newStatus}`);
      if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
        setActiveSession(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change status');
    }
  };

  // 3. Socket & OTP Polling
  useEffect(() => {
    let socket;
    let interval;
    if (activeSession && (activeSession.status === 'CHECK_IN_OPEN' || activeSession.status === 'ENDING' || activeSession.status === 'LIVE' || activeSession.status === 'CHECK_IN_CLOSED')) {
      socket = io({ path: '/attendance-socket' });
      
      socket.on('participant_joined', (data) => {
        setSubmissions(prev => [data, ...prev]);
        toast.success(`${data.studentName} joined`);
      });

      socket.on('participant_checkout', (data) => {
        setSubmissions(prev => prev.map(p => p.studentId === data.studentId ? { ...p, checkOutAt: data.checkOutAt } : p));
        toast.success(`Student checked out`);
      });

      socket.on('status_changed', (data) => {
         setActiveSession(prev => ({ ...prev, status: data.status }));
      });

      const fetchOtp = async () => {
        try {
          if (activeSession.status === 'CHECK_IN_OPEN' || activeSession.status === 'ENDING') {
            const mode = activeSession.status === 'ENDING' ? 'END' : 'JOIN';
            const res = await axios.get(`${ATTENDANCE_URL}/otp-attendance/sessions/${activeSession.id}/current-otp?purpose=${mode}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            setCurrentOtp(res.data.currentOtp);
            setTimeRemaining(res.data.timeRemaining);
            setPurpose(res.data.purpose);
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      fetchOtp();
      interval = setInterval(fetchOtp, 1000); // 1-second sync
    }
    
    return () => {
      if (socket) socket.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [activeSession, user.token]);


  return (
    <div>
      <PageHeader
        title="Attendance Center"
        subtitle="Enterprise session management and cryptographic OTP generation"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Attendance Center' }]}
      />

      {!activeSession ? (
        <div className="card" style={{ padding: 24, maxWidth: 600 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Initialize Class Session</h3>
          
          <div style={{ marginBottom: 20 }}>
            <button className="btn btn-outline w-full" onClick={handleResolveClasses}>
              1. Resolve Today's Timetable Slots
            </button>
          </div>

          {classSessions.length > 0 && (
            <div className="form-group">
              <label className="form-label">Select Class to Open</label>
              <select className="form-select" value={selectedClassSessionId} onChange={e => setSelectedClassSessionId(e.target.value)}>
                <option value="">Select...</option>
                {classSessions.map(c => <option key={c._id} value={c._id}>{c.courseId} - Room {c.room} ({c.status})</option>)}
              </select>
              <button className="btn btn-primary w-full mt-4" onClick={startSession} disabled={!selectedClassSessionId}>
                2. Start Attendance Session
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: 24 }}>
          
          {/* Column 1: Control Panel */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>State Machine Controls</h3>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              Current State: <StatusBadge status={activeSession.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-outline" disabled={activeSession.status !== 'READY' && activeSession.status !== 'CHECK_IN_CLOSED'} onClick={() => changeStatus('LIVE')}>
                Make Session LIVE
              </button>
              <button className="btn btn-outline" disabled={activeSession.status !== 'LIVE' && activeSession.status !== 'CHECK_IN_CLOSED'} onClick={() => changeStatus('CHECK_IN_OPEN')}>
                Open Check-In (JOIN OTP)
              </button>
              <button className="btn btn-outline" disabled={activeSession.status !== 'CHECK_IN_OPEN'} onClick={() => changeStatus('CHECK_IN_CLOSED')}>
                Close Check-In
              </button>
              <button className="btn btn-outline" disabled={activeSession.status !== 'CHECK_IN_CLOSED' && activeSession.status !== 'LIVE'} onClick={() => changeStatus('ENDING')}>
                Open Check-Out (END OTP)
              </button>
              <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={activeSession.status === 'COMPLETED'} onClick={() => changeStatus('COMPLETED')}>
                Complete & Lock Session
              </button>
            </div>
          </div>

          {/* Column 2: Active Display */}
          <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 16, color: 'var(--text-1)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
              {activeSession.status === 'CHECK_IN_OPEN' ? 'JOIN CLASS NOW' : activeSession.status === 'ENDING' ? 'CHECK-OUT NOW' : 'WAITING FOR PROFESSOR'}
            </div>
            
            {(activeSession.status === 'CHECK_IN_OPEN' || activeSession.status === 'ENDING') ? (
              <>
                <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0' }}>
                  {/* 25-Second Countdown Ring */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="140" cy="140" r="130" fill="none" stroke="var(--border)" strokeWidth="16" />
                    <circle 
                      cx="140" cy="140" r="130" fill="none" 
                      stroke={purpose === 'END' ? 'var(--warning)' : 'var(--accent)'} strokeWidth="16" 
                      strokeDasharray={2 * Math.PI * 130} 
                      strokeDashoffset={2 * Math.PI * 130 * (1 - timeRemaining / 25)} 
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 2 }}>
                      {purpose} CODE
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '0.1em', zIndex: 10, lineHeight: 1 }}>
                      {currentOtp}
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: 20, color: timeRemaining <= 5 ? 'var(--danger)' : 'var(--text-2)', fontWeight: 600 }}>
                  Rotates in {timeRemaining}s
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
                  Strict 25-second bucket. No grace period.
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.5, padding: 60 }}>
                 <span style={{ fontSize: 48 }}>⏸️</span>
                 <p style={{ marginTop: 16, fontSize: 18 }}>OTP Generation Paused</p>
              </div>
            )}
          </div>

          {/* Column 3: Live Submissions */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span>Live Registry</span>
              <span className="badge badge-primary">{submissions.length} Joined</span>
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>
                  Waiting for students...
                </div>
              ) : submissions.map((sub, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sub.studentName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                      In: {new Date(sub.checkInAt).toLocaleTimeString()}
                      {sub.checkOutAt && ` | Out: ${new Date(sub.checkOutAt).toLocaleTimeString()}`}
                    </div>
                  </div>
                  {sub.suspicious ? (
                    <span className="badge badge-danger">Suspicious</span>
                  ) : sub.checkOutAt ? (
                     <span className="badge badge-success">Completed</span>
                  ) : (
                    <span className="badge badge-warning">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── FACULTY LIBRARY (Units 1-5 & Catalog) ──────────────────────────────────
export function FacultyLibrary({ user }) {
  const [tab, setTab] = useState('resources');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const { data: COURSES } = useLiveCourses();
  const assignedCourses = (COURSES || []).filter(c => c.instructor === user.id || c.instructor === user.userId || c.instructor === user.username);
  
  const { data: courseResources, isLoading } = useLiveCourseResources(
    selectedCourse?._id, 
    selectedCourse?.departmentId || user.departmentId, 
    selectedUnit
  );
  
  const uploadMutation = useUploadCourseResource();

  const handleUpload = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    form.append('courseOfferingId', selectedCourse._id);
    form.append('departmentId', selectedCourse.departmentId || user.departmentId || 'GENERAL');
    form.append('unitNumber', selectedUnit);
    
    uploadMutation.mutate(form, {
      onSuccess: () => {
        e.target.reset();
        toast.success('Resource uploaded successfully');
      }
    });
  };

  return (
    <div>
      <PageHeader title="Course Library & Resources" subtitle="Upload and manage academic resources for your assigned courses"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Course Library' }]}
      />
      <Tabs tabs={[
        { id: 'resources', label: 'Course Resources (Units 1-5)', icon: <BookOpen size={16} /> },
        { id: 'catalog', label: 'Physical Library Search', icon: <BookOpen size={16} /> },
      ]} active={tab} onChange={setTab} />
      
      {tab === 'resources' && (
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Select Assigned Course</label>
              <select className="select" onChange={e => {
                const c = assignedCourses.find(x => x._id === e.target.value);
                setSelectedCourse(c);
                setSelectedUnit(1); // Default to unit 1
              }}>
                <option value="">-- Choose Course --</option>
                {assignedCourses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
              </select>
            </div>
            {selectedCourse && (
              <div style={{ flex: 1 }}>
                <label className="form-label">Select Unit</label>
                <select className="select" value={selectedUnit || ''} onChange={e => setSelectedUnit(Number(e.target.value))}>
                  <option value={1}>Unit 1</option>
                  <option value={2}>Unit 2</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                  <option value={5}>Unit 5</option>
                </select>
              </div>
            )}
          </div>

          {selectedCourse && selectedUnit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3>Upload New Resource (Unit {selectedUnit})</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  <input type="text" name="title" className="input" placeholder="Resource Title" required />
                  <textarea name="description" className="input" placeholder="Description (Optional)"></textarea>
                  <select name="resourceType" className="select" required>
                    <option value="">-- Type --</option>
                    <option value="LECTURE_NOTES">Lecture Notes</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="QUESTION_BANK">Question Bank</option>
                    <option value="VIDEO">Video Link</option>
                    <option value="SYLLABUS">Syllabus</option>
                  </select>
                  <input type="file" name="file" className="input" required />
                  <button type="submit" className="btn btn-primary" disabled={uploadMutation.isLoading}>
                    {uploadMutation.isLoading ? 'Uploading...' : 'Upload Resource'}
                  </button>
                </form>
              </div>
              
              <div>
                <h3>Current Resources (Unit {selectedUnit})</h3>
                {isLoading ? <p>Loading...</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {(courseResources || []).length === 0 ? (
                      <p style={{ color: 'var(--text-3)' }}>No resources uploaded for this unit yet.</p>
                    ) : courseResources.map(r => (
                      <div key={r._id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                        <strong>{r.title}</strong> <span className="badge badge-neutral">{r.resourceType}</span>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                          Version {r.activeVersionId?.versionNumber || 1} • {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
