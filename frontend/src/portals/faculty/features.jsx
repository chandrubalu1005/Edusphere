// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Faculty Portal Feature Modules
// New enterprise features split into separate file for maintainability
// ══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { Icon, ICONS } from '../../components/Layout.jsx';
import toast from 'react-hot-toast';
import {
  PageHeader, StatCard, DataTable, StatusBadge, Tabs, FilterBar,
  CalendarWidget, TimetableGrid, Timeline, BarChart, DonutChart,
  ProgressRing, MiniSparkline, AIChatInterface, NotificationCenter,
  EmptyState, Modal, CommandPalette, WorkflowTimeline
} from '../../components/shared/index.jsx';
import {
  TIMETABLE as MOCK_TIMETABLE, CALENDAR_EVENTS as MOCK_CALENDAR_EVENTS,
  DISCUSSIONS as MOCK_DISCUSSIONS, DISCUSSION_REPLIES as MOCK_DISCUSSION_REPLIES,
  TRANSCRIPTS as MOCK_TRANSCRIPTS, FEE_RECORDS as MOCK_FEE_RECORDS,
  DOWNLOADS as MOCK_DOWNLOADS, ACTIVITY_LOG as MOCK_ACTIVITY_LOG,
  LIBRARY_RESOURCES as MOCK_LIBRARY_RESOURCES, PLACEMENT_DRIVES as MOCK_PLACEMENT_DRIVES,
  ANNOUNCEMENTS as MOCK_ANNOUNCEMENTS, NOTIFICATIONS as MOCK_NOTIFICATIONS,
  ENROLLMENTS as MOCK_ENROLLMENTS, ATTENDANCE_RECORDS as MOCK_ATTENDANCE_RECORDS,
  COURSES as MOCK_COURSES, ASSIGNMENTS as MOCK_ASSIGNMENTS,
  USERS as MOCK_USERS, LEAVE_RECORDS as MOCK_LEAVE_RECORDS,
  LEAVE_BALANCE as MOCK_LEAVE_BALANCE, FEEDBACK_SURVEYS as MOCK_FEEDBACK_SURVEYS,
  GRADE_SUBMISSIONS as MOCK_GRADE_SUBMISSIONS
} from '../../mockData.js';
import {
  useLiveTimetable, useLiveCalendarEvents, useLiveCourses,
  useLiveAssignments, useLiveAssessments, useLiveAttendance,
  useLiveLeaveRecords, useLiveLeaveBalance, useLiveNotifications
} from '../../api/liveData.js';
import { useApplyForLeave, useApproveLeave, useRejectLeave, useWithdrawLeave } from '../../api/hooks.js';

// ── FACULTY TIMETABLE ───────────────────────────────────────────────────────
export function FacultyTimetable({ user }) {
  const { data: TIMETABLE } = useLiveTimetable();
  const facultySlots = TIMETABLE.filter(s => s.faculty === `Dr. Sarah Jenkins` || s.faculty.includes(user.lastName || '') || s.faculty.includes(user.username || ''));

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
  const students = MOCK_USERS.filter(u => u.role === 'student');

  return (
    <div>
      <PageHeader
        title="Student Performance"
        subtitle="Track class performance, GPAs, and identify at-risk students"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Performance' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Students Guided" value={students.length} icon="👥" />
        <StatCard label="Average GPA of Batches" value="8.79" trend="✓ On Track" trendType="up" icon="📊" />
        <StatCard label="At Risk Cohort" value="2" trend="Requires Intervention" trendType="down" icon="⚠️" />
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
          data={students}
        />
      </div>
    </div>
  );
}

// ── LEAVE MANAGEMENT ────────────────────────────────────────────────────────
export function LeaveManagement({ user }) {
  const { data: myRecords } = useLiveLeaveRecords({ role: 'student', userId: user.id }); // Using student role for faculty's own leaves to filter by requesterId easily
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
      daysCount: 1, // simplified
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
        { id: 'queue', label: 'Student Approvals', icon: '📋', badge: studentRequests.filter(r => r.status === 'pending').length },
        { id: 'myleaves', label: 'My Leaves', icon: '📅' }
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
              <StatCard key={b.type} label={`${b.type} Balance`} value={`${b.remaining} / ${b.total}`} icon="📅" trend={`${b.used} used`} trendType="neutral" />
            ))}
            {balanceData.length === 0 && (
               <StatCard label="Leave Policy" value="Loading..." icon="📅" />
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
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS.filter(a => a.authorId === user.id || a.author.includes(user.lastName)));
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('medium');

  function handleSubmit(e) {
    e.preventDefault();
    const newAnn = {
      id: `ann${announcements.length + 1}`,
      title,
      content,
      author: `Dr. ${user.lastName}`,
      authorId: user.id,
      target,
      priority,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([newAnn, ...announcements]);
    setModalOpen(false);
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
          { key: 'createdAt', label: 'Date', width: 100 },
          { key: 'title', label: 'Title' },
          { key: 'content', label: 'Content', render: v => <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div> },
          { key: 'target', label: 'Target Audience', render: v => <span className="badge badge-neutral">{v}</span> },
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
  const discussions = MOCK_DISCUSSIONS.filter(d => d.courseId === 'c1'); // Simulating faculty course
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [saving, setSaving] = useState(false);

  const initialStudents = [
    { id: 'st1', name: 'Alice Vance', attendance: '92%', a1: 18, a2: 19, exam: 45 },
    { id: 'st2', name: 'Bob Miller', attendance: '88%', a1: 15, a2: 17, exam: 38 },
    { id: 'st3', name: 'Charlie Dean', attendance: '74%', a1: 12, a2: 14, exam: 30 },
    { id: 'st4', name: 'Diana Prince', attendance: '98%', a1: 20, a2: 20, exam: 48 },
    { id: 'st5', name: 'Evan Wright', attendance: '81%', a1: 14, a2: 16, exam: 35 },
  ];

  function handleSelectCourse(course) {
    setSelectedCourse(course);
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
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Grades saved and published successfully!');
      setSelectedCourse(null);
    }, 1200);
  }

  if (selectedCourse) {
    return (
      <div>
        <PageHeader
          title={`Gradebook: ${selectedCourse.courseCode}`}
          subtitle={`Enter grades for ${selectedCourse.courseName}`}
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => setSelectedCourse(null) },
            { label: 'Grade Submission', onClick: () => setSelectedCourse(null) },
            { label: selectedCourse.courseCode }
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
            <button className="btn btn-primary btn-sm" disabled={row.status === 'submitted'} onClick={() => handleSelectCourse(row)}>
              {row.status === 'submitted' ? 'Submitted' : 'Enter Grades'}
            </button>
          ), sortable: false }
        ]}
        data={GRADE_SUBMISSIONS}
      />
    </div>
  );
}

// ── COURSE COMPLETION TRACKER ───────────────────────────────────────────────
export function CourseCompletionTracker({ user }) {
  const myCourses = COURSES.filter(c => c.facultyId === user.id);

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
  const myCourses = COURSES.filter(c => c.facultyId === user.id);
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
          <span style={{ fontSize: 32 }}>📤</span>
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
      if (activeTool === 'paper') {
        setOutput(`📝 **Generated Question Paper: Data Structures (CS201)**\n**Total Marks: 50 | Duration: 2 Hours**\n\n**Part A (Answer all questions - 2 Marks each)**\n1. Explain the differences between an Array and a Linked List.\n2. Define collision resolution in Hash Tables.\n3. What is the height of a balanced Binary Search Tree with N nodes?\n\n**Part B (Answer any three - 10 Marks each)**\n4. Write the algorithm for Merge Sort and derive its time complexity.\n5. Explain DFS and BFS traversal with clean trace tables.\n6. Implement a stack using queues from scratch.`);
      } else if (activeTool === 'rubric') {
        setOutput(`📊 **Generated Evaluation Rubric: DBMS Project**\n\n| Evaluation Criteria | Excellent (5-4 pts) | Good (3-2 pts) | Needs Work (1-0 pts) |\n|---|---|---|---|\n| **Schema Design** | Schema normalized to 3NF/BCNF. All relations correctly modeled. | Schema in 2NF. Slight errors in relation mapping. | No normalization. Massive redundancies. |\n| **Queries & Triggers** | All complex queries optimize indexes. Correct trigger execution. | Simple queries correct. Minor indexing errors. | Queries fail. Triggers cause database deadlock. |\n| **Presentation** | Professional slides, clean diagrams, clear voice. | Slides complete. Unclear voice or delivery. | Poor slides. No team coordination. |`);
      } else if (activeTool === 'evaluator') {
        setOutput(`🎓 **AI Essay Evaluation & Grading Report**\n\n• **Suggested Score:** **8.5 / 10** (Grade: **A-**)\n• **Detected Plagiarism:** **3.2%** (Excellent - Safe to accept)\n• **Readability Index:** **74.5** (Gunning Fog: 10.8 - Advanced)\n\n### Core Strength Analysis:\n1. **Concept Mastery:** The student shows a clear grasp of transaction ACID properties and distributed scaling.\n2. **Argument Flow:** Introduction and thesis statement transition smoothly to implementation benchmarks.\n\n### Suggested Improvements:\n- **Technical Depth:** Could expand further on two-phase commit protocols (2PC) and partition failures.\n- **Style Reference:** Include explicit bibliographic entries at the footer.`);
      } else {
        setOutput(`📈 **AI Attendance & Academic Summary**\n\n• **Total Active Batches:** 2\n• **Avg Attendance Rate:** 81.3%\n• **Alerts Raised:** 2 Students under 75% attendance in CS302.\n• **Performance Index:** Pass rate predicted to be 88% based on recent assessment trends.\n• **Recommendations:** Schedule an extra tutorial slot for CS302 to help struggling cohorts before mid-sem.`);
      }
    }, 1500);
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
            { id: 'paper', label: 'Question Paper Gen', icon: '📝' },
            { id: 'rubric', label: 'Rubric Generator', icon: '📊' },
            { id: 'evaluator', label: 'AI Essay Evaluator', icon: '🎓' },
            { id: 'summary', label: 'Batch Summary & Insights', icon: '📈' }
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
            {loading ? 'Analyzing & Generating...' : '⚡ Generate Output'}
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
  const feedbacks = FEEDBACK_SURVEYS.filter(f => f.facultyId === user.id || f.facultyName.includes(user.lastName));

  return (
    <div>
      <PageHeader
        title="Student Feedback"
        subtitle="View ratings, course evaluations, and sentiment details"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Feedback' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {feedbacks.map(f => (
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
                <div key={i} style={{ padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', fontSize: 12, width: '100%' }}>
                  💡 "{comment}"
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ── FACULTY PROFILE ────────────────────────────────────────────────────────
export function FacultyProfile({ user }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || '',
    designation: user.designation || 'Assistant Professor',
    bio: user.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/users/${user.id || user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('edu_token')}` },
        body: JSON.stringify(form)
      });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    if (pw.newPw.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await fetch(`/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('edu_token')}` },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw })
      });
      toast.success('Password changed successfully!');
      setPwMode(false);
      setPw({ current: '', newPw: '', confirm: '' });
    } catch {
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account settings"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Profile' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
        {/* Avatar Card */}
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 700, color: 'white'
          }}>
            {(user.firstName || 'F')[0]}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>{form.designation}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{form.department}</div>
          <div style={{ marginTop: 16 }}>
            <span className="badge badge-success">Faculty</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setPwMode(!pwMode)}>
              {pwMode ? '✕ Cancel' : '🔒 Change Password'}
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 24 }}>
          {!pwMode ? (
            <form onSubmit={handleSave}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20, color: 'var(--text-1)' }}>Personal Information</h3>
              <div style={fieldStyle}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone} placeholder="+91-xxxxx" onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select className="form-input" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}>
                    <option>Assistant Professor</option>
                    <option>Associate Professor</option>
                    <option>Professor</option>
                    <option>Lecturer</option>
                    <option>HOD</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={3} value={form.bio} placeholder="A short bio about you..." onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20, color: 'var(--text-1)' }}>Change Password</h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" required value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required minLength={8} value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" required value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPwMode(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FACULTY ASSESSMENTS ─────────────────────────────────────────────────────
export function FacultyAssessments({ user }) {
  const { data: COURSES } = useLiveCourses();
  const { data: ASSESSMENTS } = useLiveAssessments();
  const myCourses = COURSES.filter(c => c.facultyOwnerId === (user.id || user.userId));
  const myAssessments = ASSESSMENTS.filter(a => myCourses.find(c => c._id === a.courseId || c.id === a.courseId));

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [type, setType] = useState('quiz');
  const [scheduledAt, setScheduledAt] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('edu_token')}` },
        body: JSON.stringify({ title, courseId, duration: Number(duration), totalMarks: Number(totalMarks), type, scheduledAt })
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Assessment created successfully!');
      setShowCreate(false);
    } catch (err) {
      toast.error('Failed to create assessment: ' + err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Create and manage quizzes, exams, and tests for your courses"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Assessments' }]}
      >
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '+ Create Assessment'}
        </button>
      </PageHeader>

      {showCreate && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 16 }}>New Assessment</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Mid-term Quiz 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-input" required value={courseId} onChange={e => setCourseId(e.target.value)}>
                  <option value="">Select Course</option>
                  {myCourses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title} ({c.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Practical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" min={10} max={300} value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input className="form-input" type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled At</label>
                <input className="form-input" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="btn btn-primary">Create Assessment</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {myAssessments.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No assessments yet</div>
            <div className="empty-state-desc">Create your first assessment using the button above.</div>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'courseId', label: 'Course', render: (v) => myCourses.find(c => (c._id || c.id) === v)?.title || v },
              { key: 'type', label: 'Type', render: v => <span className={`badge badge-${v === 'exam' ? 'danger' : 'info'}`}>{v}</span> },
              { key: 'duration', label: 'Duration', render: v => `${v} min` },
              { key: 'totalMarks', label: 'Marks' },
              { key: 'status', label: 'Status', render: v => <span className={`badge badge-${v === 'published' || v === 'active' ? 'success' : 'neutral'}`}>{v || 'draft'}</span> },
              { key: 'scheduledAt', label: 'Scheduled', render: v => v ? new Date(v).toLocaleDateString() : '—' },
            ]}
            data={myAssessments}
          />
        )}
      </div>
    </div>
  );
}

// ── FACULTY NOTIFICATIONS ───────────────────────────────────────────────────
export function FacultyNotifications({ user }) {
  const { data, isLoading } = useLiveNotifications();
  const notifications = data.filter(n => !n.role || n.role === 'faculty' || n.role === 'all');
  const [filter, setFilter] = useState('all');
  const typeIcon = { assignment: '📝', attendance: '📅', leave: '🏖️', grade: '🎓', system: '⚙️', announcement: '📢' };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Stay updated with department and course alerts" />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {['all', 'unread', 'assignment', 'leave', 'announcement', 'system'].map(t => (
          <div key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'unread' && <span className="nav-badge" style={{ position: 'static', marginLeft: 4 }}>{notifications.filter(n => !n.read).length}</span>}
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading notifications…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-title">All caught up!</div>
          </div>
        ) : filtered.map(n => (
          <div key={n.id || n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} style={{ cursor: 'default', padding: '14px 18px' }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</div>
            <div className="notif-content" style={{ flex: 1 }}>
              <div className="notif-title" style={{ fontSize: 14 }}>{n.title}</div>
              <div className="notif-desc" style={{ fontSize: 13 }}>{n.description || n.message}</div>
              <div className="notif-time" style={{ marginTop: 5 }}>{n.createdAt}</div>
            </div>
            {!n.read && <span className="badge badge-accent">New</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
