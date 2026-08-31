const fs = require('fs');

const PLACEHOLDER_IMPORT = `\nconst PagePlaceholder = ({ title }) => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>
    <h2>{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);\n\n`;

// ── 1. Update FacultyPortal ──
let fp = fs.readFileSync('frontend/src/portals/FacultyPortal.jsx', 'utf8');
if (!fp.includes('PagePlaceholder')) {
  fp = fp.replace(/function FacultyPortal\(\) \{/, PLACEHOLDER_IMPORT + 'function FacultyPortal() {');
}
const fpRoutes = [
  '<Route path="content" element={<PagePlaceholder title="Course Content" />} />',
  '<Route path="assessments" element={<PagePlaceholder title="Assessments" />} />',
  '<Route path="assignments" element={<PagePlaceholder title="Assignments" />} />',
  '<Route path="attendance" element={<PagePlaceholder title="Mark Attendance" />} />',
  '<Route path="timetable" element={<PagePlaceholder title="My Timetable" />} />',
  '<Route path="performance" element={<PagePlaceholder title="Student Performance" />} />',
  '<Route path="grades" element={<PagePlaceholder title="Grade Submission" />} />',
  '<Route path="completion" element={<PagePlaceholder title="Course Completion" />} />',
  '<Route path="discussions" element={<PagePlaceholder title="Communication Hub" />} />',
  '<Route path="announcements" element={<PagePlaceholder title="Announcements" />} />',
  '<Route path="analytics" element={<PagePlaceholder title="Analytics" />} />',
  '<Route path="leave" element={<PagePlaceholder title="Leave Management" />} />',
  '<Route path="ai-tools" element={<PagePlaceholder title="AI Teaching Tools" />} />',
  '<Route path="profile" element={<PagePlaceholder title="Profile" />} />',
  '<Route path="notifications" element={<PagePlaceholder title="Notifications" />} />'
];

for (const r of fpRoutes) {
  if (!fp.includes(r)) {
    fp = fp.replace(/<Route path="\*" element=\{<Navigate to="dashboard" replace \/>\} \/>/, r + '\n        <Route path="*" element={<Navigate to="dashboard" replace />} />');
  }
}
fs.writeFileSync('frontend/src/portals/FacultyPortal.jsx', fp);

// ── 2. Update AdminPortal ──
let ap = fs.readFileSync('frontend/src/portals/AdminPortal.jsx', 'utf8');
if (!ap.includes('PagePlaceholder')) {
  ap = ap.replace(/function AdminPortal\(\) \{/, PLACEHOLDER_IMPORT + 'function AdminPortal() {');
}
const apRoutes = [
  '<Route path="departments" element={<PagePlaceholder title="Departments" />} />',
  '<Route path="semesters" element={<PagePlaceholder title="Semesters" />} />',
  '<Route path="enrollments" element={<PagePlaceholder title="Enrollments" />} />',
  '<Route path="timetable-mgmt" element={<PagePlaceholder title="Timetable Management" />} />',
  '<Route path="academic-core" element={<PagePlaceholder title="Academic Core" />} />',
  '<Route path="cert-approval" element={<PagePlaceholder title="Certificate Approval" />} />',
  '<Route path="roles" element={<PagePlaceholder title="Roles & Permissions" />} />',
  '<Route path="announcements" element={<PagePlaceholder title="Announcements" />} />',
  '<Route path="library-mgmt" element={<PagePlaceholder title="Library Management" />} />',
  '<Route path="placement-mgmt" element={<PagePlaceholder title="Placement Management" />} />',
  '<Route path="calendar-mgmt" element={<PagePlaceholder title="Academic Calendar" />} />',
  '<Route path="system-health" element={<PagePlaceholder title="System Health" />} />',
  '<Route path="audit" element={<PagePlaceholder title="Audit & Logs" />} />',
  '<Route path="file-mgmt" element={<PagePlaceholder title="File Management" />} />',
  '<Route path="email" element={<PagePlaceholder title="Email Broadcast" />} />',
  '<Route path="backup" element={<PagePlaceholder title="Backup & Restore" />} />',
  '<Route path="settings" element={<PagePlaceholder title="Configuration" />} />',
  '<Route path="helpdesk" element={<PagePlaceholder title="Help Desk" />} />',
  '<Route path="reports" element={<PagePlaceholder title="Reports Center" />} />',
  '<Route path="profile" element={<PagePlaceholder title="Profile" />} />',
  '<Route path="notifications" element={<PagePlaceholder title="Notifications" />} />'
];
for (const r of apRoutes) {
  if (!ap.includes(r)) {
    ap = ap.replace(/<Route path="\*" element=\{<Navigate to="dashboard" replace \/>\} \/>/, r + '\n        <Route path="*" element={<Navigate to="dashboard" replace />} />');
  }
}
fs.writeFileSync('frontend/src/portals/AdminPortal.jsx', ap);

// ── 3. Update ManagementPortal ──
let mp = fs.readFileSync('frontend/src/portals/ManagementPortal.jsx', 'utf8');
if (!mp.includes('PagePlaceholder')) {
  mp = mp.replace(/function ManagementPortal\(\) \{/, PLACEHOLDER_IMPORT + 'function ManagementPortal() {');
}
const mpRoutes = [
  '<Route path="departments" element={<PagePlaceholder title="Dept Comparison" />} />',
  '<Route path="faculty-perf" element={<PagePlaceholder title="Faculty Performance" />} />',
  '<Route path="student-perf" element={<PagePlaceholder title="Student Performance" />} />',
  '<Route path="placement-analytics" element={<PagePlaceholder title="Placement Analytics" />} />',
  '<Route path="research" element={<PagePlaceholder title="Research Statistics" />} />',
  '<Route path="cert-approval" element={<PagePlaceholder title="Certificate Approval" />} />',
  '<Route path="audit" element={<PagePlaceholder title="Compliance Audit" />} />',
  '<Route path="reports" element={<PagePlaceholder title="Custom Reports" />} />',
  '<Route path="finance-overview" element={<PagePlaceholder title="Financial Overview" />} />',
  '<Route path="fee-collection" element={<PagePlaceholder title="Fee Collection" />} />',
  '<Route path="budgeting" element={<PagePlaceholder title="Budgeting" />} />',
  '<Route path="scholarships" element={<PagePlaceholder title="Scholarships" />} />',
  '<Route path="profile" element={<PagePlaceholder title="Profile" />} />',
  '<Route path="notifications" element={<PagePlaceholder title="Notifications" />} />'
];
for (const r of mpRoutes) {
  if (!mp.includes(r)) {
    mp = mp.replace(/<Route path="\*" element=\{<Navigate to="dashboard" replace \/>\} \/>/, r + '\n        <Route path="*" element={<Navigate to="dashboard" replace />} />');
  }
}
fs.writeFileSync('frontend/src/portals/ManagementPortal.jsx', mp);

console.log('Success Portals Patched');
