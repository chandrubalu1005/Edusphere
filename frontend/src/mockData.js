// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Mock Database v3.0
// Simulates the full backend data layer for demo / offline mode
// ══════════════════════════════════════════════════════════════════════════════

// ── Departments ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: 'd1', code: 'CSE',  name: 'Computer Science & Engineering',       head: 'Dr. Sarah Jenkins',  faculty_count: 24, student_count: 1240, budget: 4500000, spent: 3200000 },
  { id: 'd2', code: 'EEE',  name: 'Electrical & Electronics Engineering', head: 'Prof. Robert Chen',   faculty_count: 18, student_count: 980,  budget: 3800000, spent: 2900000 },
  { id: 'd3', code: 'MATH', name: 'Mathematics & Statistics',             head: 'Prof. David Vance',   faculty_count: 12, student_count: 620,  budget: 2200000, spent: 1800000 },
  { id: 'd4', code: 'PHY',  name: 'Physics & Applied Sciences',           head: 'Dr. Emma Walsh',      faculty_count: 10, student_count: 540,  budget: 2000000, spent: 1500000 },
  { id: 'd5', code: 'MBA',  name: 'Business Administration',              head: 'Prof. James Carter',  faculty_count: 20, student_count: 1560, budget: 5200000, spent: 4100000 },
  { id: 'd6', code: 'MECH', name: 'Mechanical Engineering',               head: 'Dr. Alan Torres',     faculty_count: 16, student_count: 890,  budget: 3500000, spent: 2800000 },
  { id: 'd7', code: 'CIVIL',name: 'Civil Engineering',                    head: 'Prof. Linda Hayes',   faculty_count: 14, student_count: 720,  budget: 3100000, spent: 2400000 },
];

// ── Semesters ───────────────────────────────────────────────────────────────
export const SEMESTERS = [
  { id: 'sem1', name: 'Semester 1 — 2026', year: 2026, term: 'Odd',  status: 'active',    start: '2026-01-10', end: '2026-05-30' },
  { id: 'sem2', name: 'Semester 2 — 2025', year: 2025, term: 'Even', status: 'completed', start: '2025-08-01', end: '2025-12-20' },
  { id: 'sem3', name: 'Semester 3 — 2025', year: 2025, term: 'Odd',  status: 'completed', start: '2025-01-10', end: '2025-05-30' },
];

// ── Courses ─────────────────────────────────────────────────────────────────
export const COURSES = [
  { id: 'c1', code: 'CS101', title: 'Introduction to Computer Science', description: 'Fundamentals of programming, algorithms, and computational thinking.', department: 'CSE', dept_code: 'CSE', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', status: 'published', students_enrolled: 142, capacity: 160, semester: 'sem1', credits: 4, syllabus_completion: 68, content: [{ id: 'mat1', title: 'Week 1 - Variables & Data Types', type: 'document', url: '#' }, { id: 'mat2', title: 'Week 2 - Control Flow', type: 'video', url: '#' }, { id: 'mat3', title: 'Week 3 - Functions', type: 'document', url: '#' }] },
  { id: 'c2', code: 'CS302', title: 'Database Systems & Design', description: 'Relational databases, SQL, normalization, indexing, and NoSQL.', department: 'CSE', dept_code: 'CSE', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', status: 'published', students_enrolled: 98, capacity: 120, semester: 'sem1', credits: 4, syllabus_completion: 85, content: [{ id: 'mat4', title: 'ER Diagrams PDF', type: 'document', url: '#' }, { id: 'mat5', title: 'SQL Basics Video', type: 'video', url: '#' }] },
  { id: 'c3', code: 'CS450', title: 'Machine Learning & AI', description: 'Supervised, unsupervised learning. Neural networks and deep learning.', department: 'CSE', dept_code: 'CSE', facultyId: 'f2', facultyName: 'Prof. Alice Moon', status: 'published', students_enrolled: 210, capacity: 250, semester: 'sem1', credits: 5, syllabus_completion: 45, content: [{ id: 'mat6', title: 'Intro to ML Slides', type: 'document', url: '#' }] },
  { id: 'c4', code: 'MATH201', title: 'Linear Algebra & Applications', description: 'Vector spaces, matrices, eigenvalues, applications to data science.', department: 'MATH', dept_code: 'MATH', facultyId: 'f3', facultyName: 'Prof. David Vance', status: 'published', students_enrolled: 76, capacity: 100, semester: 'sem1', credits: 3, syllabus_completion: 72, content: [] },
  { id: 'c5', code: 'EEE201', title: 'Circuit Theory', description: 'Kirchhoff laws, AC/DC analysis, transient response, circuit simulation.', department: 'EEE', dept_code: 'EEE', facultyId: 'f4', facultyName: 'Prof. Robert Chen', status: 'published', students_enrolled: 88, capacity: 110, semester: 'sem1', credits: 4, syllabus_completion: 60, content: [] },
  { id: 'c6', code: 'CS499', title: 'Quantum Computing Fundamentals', description: 'Quantum gates, qubits, Shor algorithm, cryptography applications.', department: 'CSE', dept_code: 'CSE', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', status: 'pending', students_enrolled: 0, capacity: 50, semester: 'sem1', credits: 3, syllabus_completion: 0, content: [] },
  { id: 'c7', code: 'MBA301', title: 'Strategic Management', description: 'Corporate strategy, competitive advantage, and business models.', department: 'MBA', dept_code: 'MBA', facultyId: 'f5', facultyName: 'Prof. James Carter', status: 'published', students_enrolled: 180, capacity: 200, semester: 'sem1', credits: 3, syllabus_completion: 55, content: [] },
];

// ── Enrollments ─────────────────────────────────────────────────────────────
export const ENROLLMENTS = [
  { id: 'enr1', studentId: 's1', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', status: 'active', progress: 42, enrolledAt: '2026-01-12', grade: 'B+' },
  { id: 'enr2', studentId: 's1', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems & Design', status: 'active', progress: 85, enrolledAt: '2026-01-12', grade: 'A+' },
  { id: 'enr3', studentId: 's1', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', status: 'active', progress: 20, enrolledAt: '2026-01-15', grade: 'A' },
  { id: 'enr4', studentId: 's2', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', status: 'active', progress: 65, enrolledAt: '2026-01-12', grade: 'A' },
  { id: 'enr5', studentId: 's2', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems & Design', status: 'active', progress: 50, enrolledAt: '2026-01-14', grade: 'B' },
  { id: 'enr6', studentId: 's3', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', status: 'active', progress: 90, enrolledAt: '2026-01-12', grade: 'A+' },
  { id: 'enr7', studentId: 's3', courseId: 'c5', courseCode: 'EEE201', courseTitle: 'Circuit Theory', status: 'active', progress: 70, enrolledAt: '2026-01-13', grade: 'B+' },
];

// ── Attendance Records ──────────────────────────────────────────────────────
export const ATTENDANCE_RECORDS = [
  { id: 'att1',  studentId: 's1', studentName: 'John Doe',   courseId: 'c1', status: 'present', date: '2026-06-30', markedBy: 'sarah_j' },
  { id: 'att2',  studentId: 's1', studentName: 'John Doe',   courseId: 'c1', status: 'present', date: '2026-07-01', markedBy: 'sarah_j' },
  { id: 'att3',  studentId: 's1', studentName: 'John Doe',   courseId: 'c2', status: 'absent',  date: '2026-06-30', markedBy: 'sarah_j' },
  { id: 'att4',  studentId: 's2', studentName: 'Jane Smith',  courseId: 'c1', status: 'present', date: '2026-06-30', markedBy: 'sarah_j' },
  { id: 'att5',  studentId: 's2', studentName: 'Jane Smith',  courseId: 'c1', status: 'absent',  date: '2026-07-01', markedBy: 'sarah_j' },
  { id: 'att6',  studentId: 's3', studentName: 'Riya Patel',  courseId: 'c1', status: 'present', date: '2026-06-30', markedBy: 'sarah_j' },
  { id: 'att7',  studentId: 's3', studentName: 'Riya Patel',  courseId: 'c1', status: 'present', date: '2026-07-01', markedBy: 'sarah_j' },
  { id: 'att8',  studentId: 's1', studentName: 'John Doe',   courseId: 'c1', status: 'present', date: '2026-07-02', markedBy: 'sarah_j' },
  { id: 'att9',  studentId: 's1', studentName: 'John Doe',   courseId: 'c3', status: 'present', date: '2026-07-02', markedBy: 'alice_moon' },
  { id: 'att10', studentId: 's1', studentName: 'John Doe',   courseId: 'c3', status: 'absent',  date: '2026-07-03', markedBy: 'alice_moon' },
];

// ── Assessments ─────────────────────────────────────────────────────────────
export const ASSESSMENTS = [
  {
    id: 'quiz1', title: 'CS101 - Week 2 Quiz: Loops & Functions', courseId: 'c1', courseCode: 'CS101',
    status: 'active', duration: 30, total_marks: 100, pass_marks: 40,
    questions: [
      { id: 'q1', text: 'What does a "for" loop do in programming?', options: ['Executes code once', 'Repeats code a fixed number of times', 'Always runs infinitely', 'Declares a variable'], correct: 1 },
      { id: 'q2', text: 'Which keyword is used to define a function in Python?', options: ['func', 'function', 'def', 'define'], correct: 2 },
      { id: 'q3', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
      { id: 'q4', text: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correct: 1 },
      { id: 'q5', text: 'What does "recursion" mean in programming?', options: ['A function calling itself', 'Sorting an array', 'Allocating memory', 'None of the above'], correct: 0 },
    ],
    leaderboard: [
      { rank: 1, studentName: 'Riya Patel', score: 95, timeTaken: '18 min' },
      { rank: 2, studentName: 'John Doe', score: 88, timeTaken: '22 min' },
      { rank: 3, studentName: 'Arjun Kumar', score: 82, timeTaken: '25 min' },
    ]
  },
  {
    id: 'quiz2', title: 'CS302 - SQL Fundamentals Quiz', courseId: 'c2', courseCode: 'CS302',
    status: 'upcoming', duration: 45, total_marks: 100, pass_marks: 50,
    questions: [
      { id: 'q6', text: 'Which SQL clause is used to filter records?', options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], correct: 2 },
    ],
    leaderboard: []
  },
  {
    id: 'quiz3', title: 'CS450 - Neural Networks Mid-Sem', courseId: 'c3', courseCode: 'CS450',
    status: 'upcoming', duration: 60, total_marks: 100, pass_marks: 40,
    questions: [],
    leaderboard: []
  },
];

// ── Assignments ─────────────────────────────────────────────────────────────
export const ASSIGNMENTS = [
  { id: 'asgn1', title: 'Implement a Sorting Algorithm', courseId: 'c1', courseCode: 'CS101', description: 'Implement Merge Sort and Quick Sort in Python. Submit .zip with source code and report.', dueDate: '2026-07-15', totalMarks: 100, status: 'active', submissionsCount: 87, studentsCount: 142, late_penalty: 10 },
  { id: 'asgn2', title: 'Database Schema Design Project', courseId: 'c2', courseCode: 'CS302', description: 'Design an ER diagram for a Hospital Management System. Include normalization up to 3NF.', dueDate: '2026-07-20', totalMarks: 100, status: 'active', submissionsCount: 45, studentsCount: 98, late_penalty: 5 },
  { id: 'asgn3', title: 'Literature Review on Neural Networks', courseId: 'c3', courseCode: 'CS450', description: '3000-word literature review on neural network architectures.', dueDate: '2026-07-10', totalMarks: 50, status: 'closed', submissionsCount: 198, studentsCount: 210, late_penalty: 0 },
  { id: 'asgn4', title: 'Python Data Structures Implementation', courseId: 'c1', courseCode: 'CS101', description: 'Implement Stack, Queue, and Linked List from scratch.', dueDate: '2026-07-25', totalMarks: 100, status: 'active', submissionsCount: 30, studentsCount: 142, late_penalty: 10 },
];

// ── Submissions ─────────────────────────────────────────────────────────────
export const SUBMISSIONS = [
  { id: 'sub1', assignmentId: 'asgn1', studentId: 's1', studentName: 'John Doe',  fileUrl: '#', submittedAt: '2026-07-10 14:32', grade: null, feedback: '', status: 'submitted' },
  { id: 'sub2', assignmentId: 'asgn2', studentId: 's1', studentName: 'John Doe',  fileUrl: '#', submittedAt: '2026-07-18 09:11', grade: 88, feedback: 'Excellent ER diagram, minor issues with 3NF.', status: 'graded' },
  { id: 'sub3', assignmentId: 'asgn1', studentId: 's2', studentName: 'Jane Smith', fileUrl: '#', submittedAt: '2026-07-11 16:20', grade: 92, feedback: 'Outstanding implementation.', status: 'graded' },
  { id: 'sub4', assignmentId: 'asgn3', studentId: 's1', studentName: 'John Doe',  fileUrl: '#', submittedAt: '2026-07-09 11:00', grade: 45, feedback: 'Good research, needs deeper analysis.', status: 'graded' },
  { id: 'sub5', assignmentId: 'asgn1', studentId: 's3', studentName: 'Riya Patel', fileUrl: '#', submittedAt: '2026-07-12 08:45', grade: 95, feedback: 'Perfect implementation with excellent documentation.', status: 'graded' },
];

// ── Certificates ────────────────────────────────────────────────────────────
export const CERTIFICATES = [
  { id: 'cert1', studentId: 's1', studentName: 'John Doe', courseId: 'c2', courseTitle: 'Database Systems & Design', issuedAt: '2026-06-28', grade: 'A+', verified: true, certificateNo: 'EDU-2026-CS302-001', status: 'approved' },
  { id: 'cert2', studentId: 's3', studentName: 'Riya Patel', courseId: 'c1', courseTitle: 'Introduction to Computer Science', issuedAt: '2026-06-25', grade: 'A+', verified: true, certificateNo: 'EDU-2026-CS101-003', status: 'approved' },
  { id: 'cert3', studentId: 's1', studentName: 'John Doe', courseId: 'c3', courseTitle: 'Machine Learning & AI', issuedAt: null, grade: 'A', verified: false, certificateNo: 'EDU-2026-CS450-001', status: 'pending' },
];

// ── Notifications ───────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 'n1', userId: 's1', type: 'assignment',    title: 'New Assignment Posted',      description: 'CS101: "Implement a Sorting Algorithm" is due July 15th.',        createdAt: '2 hours ago', read: false },
  { id: 'n2', userId: 's1', type: 'quiz',          title: 'Quiz Result Ready',          description: 'Your CS101 Week 2 Quiz score: 88/100.',                           createdAt: '1 day ago',   read: false },
  { id: 'n3', userId: 's1', type: 'attendance',    title: 'Low Attendance Alert',       description: 'Your attendance in CS302 is 40%. Minimum required: 75%.',          createdAt: '2 days ago',  read: false },
  { id: 'n4', userId: 's1', type: 'certificate',   title: 'Certificate Issued',         description: 'Your certificate for CS302 is now available.',                     createdAt: '5 days ago',  read: true },
  { id: 'n5', userId: 's1', type: 'announcement',  title: 'Holiday Notice',             description: 'No classes on July 4th. All assignments due dates unchanged.',     createdAt: '1 week ago',  read: true },
  { id: 'n6', userId: 's1', type: 'grade',         title: 'Grade Published',            description: 'CS302 Assignment "Database Schema Design" graded: 88/100.',        createdAt: '3 days ago',  read: false },
  { id: 'n7', userId: 'f1', type: 'system',        title: 'System Maintenance',         description: 'Scheduled maintenance window: July 20 02:00-04:00 AM.',           createdAt: '1 day ago',   read: false },
  { id: 'n8', userId: 'f1', type: 'assignment',    title: 'Submissions Due',            description: '87 of 142 students submitted CS101 Sorting Algorithm assignment.', createdAt: '3 hours ago', read: false },
  { id: 'n9', userId: 'a1', type: 'system',        title: 'High CPU Usage Alert',       description: 'Assessment service CPU at 89%. Consider scaling.',                 createdAt: '30 min ago',  read: false },
  { id: 'n10',userId: 'm1', type: 'announcement',  title: 'Course Approval Required',   description: 'CS499 "Quantum Computing" awaiting your approval.',                createdAt: '2 hours ago', read: false },
];

// ── Users ───────────────────────────────────────────────────────────────────
export const USERS = [
  { id: 's1', username: 'john_doe',      email: 'john@edusphere.edu',   firstName: 'John',    lastName: 'Doe',           role: 'student',    department: 'CSE',   status: 'active', joinedAt: '2024-08-15', lastLogin: '2026-07-02', semester: 7, regNo: 'CSE2024001', phone: '+91 98765 43210', gpa: 8.74 },
  { id: 's2', username: 'jane_smith',    email: 'jane@edusphere.edu',   firstName: 'Jane',    lastName: 'Smith',         role: 'student',    department: 'CSE',   status: 'active', joinedAt: '2024-08-15', lastLogin: '2026-07-01', semester: 7, regNo: 'CSE2024002', phone: '+91 98765 43211', gpa: 9.12 },
  { id: 's3', username: 'riya_patel',    email: 'riya@edusphere.edu',   firstName: 'Riya',    lastName: 'Patel',         role: 'student',    department: 'EEE',   status: 'active', joinedAt: '2024-08-20', lastLogin: '2026-07-02', semester: 7, regNo: 'EEE2024003', phone: '+91 98765 43212', gpa: 9.45 },
  { id: 's4', username: 'arjun_kumar',   email: 'arjun@edusphere.edu',  firstName: 'Arjun',   lastName: 'Kumar',         role: 'student',    department: 'CSE',   status: 'active', joinedAt: '2024-08-15', lastLogin: '2026-07-01', semester: 7, regNo: 'CSE2024004', phone: '+91 98765 43213', gpa: 7.85 },
  { id: 's5', username: 'priya_sharma',  email: 'priya@edusphere.edu',  firstName: 'Priya',   lastName: 'Sharma',        role: 'student',    department: 'MBA',   status: 'active', joinedAt: '2024-08-20', lastLogin: '2026-07-02', semester: 5, regNo: 'MBA2024005', phone: '+91 98765 43214', gpa: 8.92 },
  { id: 'f1', username: 'sarah_j',      email: 'sarah@edusphere.edu',  firstName: 'Sarah',   lastName: 'Jenkins',       role: 'faculty',    department: 'CSE',   status: 'active', joinedAt: '2022-03-01', lastLogin: '2026-07-02', designation: 'Associate Professor', experience: 12, rating: 4.6, publications: 28 },
  { id: 'f2', username: 'alice_moon',   email: 'alice@edusphere.edu',  firstName: 'Alice',   lastName: 'Moon',          role: 'faculty',    department: 'CSE',   status: 'active', joinedAt: '2021-06-15', lastLogin: '2026-07-01', designation: 'Assistant Professor', experience: 8, rating: 4.3, publications: 15 },
  { id: 'f3', username: 'david_v',      email: 'david@edusphere.edu',  firstName: 'David',   lastName: 'Vance',         role: 'faculty',    department: 'MATH',  status: 'active', joinedAt: '2020-08-01', lastLogin: '2026-06-30', designation: 'Professor', experience: 20, rating: 4.8, publications: 45 },
  { id: 'f4', username: 'robert_c',     email: 'robert@edusphere.edu', firstName: 'Robert',  lastName: 'Chen',          role: 'faculty',    department: 'EEE',   status: 'active', joinedAt: '2019-04-10', lastLogin: '2026-07-01', designation: 'Professor & HOD', experience: 22, rating: 4.5, publications: 38 },
  { id: 'f5', username: 'james_c',      email: 'james@edusphere.edu',  firstName: 'James',   lastName: 'Carter',        role: 'faculty',    department: 'MBA',   status: 'active', joinedAt: '2020-01-15', lastLogin: '2026-07-02', designation: 'Professor & HOD', experience: 18, rating: 4.7, publications: 22 },
  { id: 'm1', username: 'dean_academic',email: 'dean@edusphere.edu',   firstName: 'Margaret',lastName: 'Foster',        role: 'management', department: 'Admin', status: 'active', joinedAt: '2018-01-01', lastLogin: '2026-07-02' },
  { id: 'a1', username: 'sys_admin',    email: 'admin@edusphere.edu',  firstName: 'System',  lastName: 'Administrator', role: 'admin',      department: 'Admin', status: 'active', joinedAt: '2018-01-01', lastLogin: '2026-07-02' },
];

// ── Audit Logs ──────────────────────────────────────────────────────────────
export const AUDIT_LOGS = [
  { id: 'log1', userId: 'f1', username: 'sarah_j',       action: 'attendance.marked_bulk', description: 'Marked attendance for CS101 (42 students)', ipAddress: '192.168.1.10', createdAt: '2026-07-02 10:23' },
  { id: 'log2', userId: 's1', username: 'john_doe',      action: 'enrollment.created',     description: 'Enrolled in CS101',                         ipAddress: '192.168.1.42', createdAt: '2026-07-01 09:10' },
  { id: 'log3', userId: 'a1', username: 'sys_admin',     action: 'user.deactivated',       description: 'Deactivated user: temp_account',            ipAddress: '192.168.1.1',  createdAt: '2026-06-30 14:05' },
  { id: 'log4', userId: 'f1', username: 'sarah_j',       action: 'course.created',         description: 'Created course: CS499',                     ipAddress: '192.168.1.10', createdAt: '2026-06-29 11:00' },
  { id: 'log5', userId: 'm1', username: 'dean_academic', action: 'course.approved',        description: 'Approved course: CS450 for publication',    ipAddress: '10.0.0.5',     createdAt: '2026-06-28 15:30' },
  { id: 'log6', userId: 'a1', username: 'sys_admin',     action: 'backup.created',         description: 'Database backup completed (12.4 GB)',       ipAddress: '192.168.1.1',  createdAt: '2026-07-02 02:00' },
  { id: 'log7', userId: 'f2', username: 'alice_moon',    action: 'assignment.graded',      description: 'Graded 45 submissions for CS450',           ipAddress: '192.168.1.15', createdAt: '2026-07-01 16:30' },
  { id: 'log8', userId: 's1', username: 'john_doe',      action: 'assignment.submitted',   description: 'Submitted CS101 Sorting Algorithm',         ipAddress: '192.168.1.42', createdAt: '2026-07-02 14:32' },
];

// ── Support Tickets ─────────────────────────────────────────────────────────
export const SUPPORT_TICKETS = [
  { id: 'tkt1', userId: 's1', studentName: 'John Doe',   title: 'Cannot access CS302 lecture recording', category: 'Technical', priority: 'medium', status: 'open',        createdAt: '2026-07-01', replies: 0 },
  { id: 'tkt2', userId: 's2', studentName: 'Jane Smith',  title: 'Assignment submission portal not loading', category: 'Technical', priority: 'high',   status: 'in-progress', createdAt: '2026-07-02', replies: 2 },
  { id: 'tkt3', userId: 's4', studentName: 'Arjun Kumar', title: 'Wrong attendance marked for July 1st',    category: 'Academic',  priority: 'medium', status: 'open',        createdAt: '2026-07-03', replies: 0 },
  { id: 'tkt4', userId: 's3', studentName: 'Riya Patel',  title: 'Certificate download not working',         category: 'Technical', priority: 'low',    status: 'resolved',    createdAt: '2026-06-28', replies: 3 },
];

// ── Analytics Data ──────────────────────────────────────────────────────────
export const MONTHLY_ENROLLMENT = [
  { month: 'Jan', students: 780 },  { month: 'Feb', students: 920 },  { month: 'Mar', students: 1100 },
  { month: 'Apr', students: 1050 }, { month: 'May', students: 1320 }, { month: 'Jun', students: 1200 },
  { month: 'Jul', students: 1450 }, { month: 'Aug', students: 1600 }, { month: 'Sep', students: 1380 },
  { month: 'Oct', students: 1550 }, { month: 'Nov', students: 1480 }, { month: 'Dec', students: 1200 },
];

export const DEPT_PERFORMANCE = [
  { dept: 'CSE',   attendance: 94, passRate: 87, satisfaction: 4.2, placement: 92, research: 78 },
  { dept: 'EEE',   attendance: 88, passRate: 79, satisfaction: 3.9, placement: 85, research: 72 },
  { dept: 'MATH',  attendance: 91, passRate: 82, satisfaction: 4.1, placement: 70, research: 88 },
  { dept: 'PHY',   attendance: 85, passRate: 76, satisfaction: 3.7, placement: 65, research: 82 },
  { dept: 'MBA',   attendance: 96, passRate: 91, satisfaction: 4.5, placement: 95, research: 60 },
  { dept: 'MECH',  attendance: 87, passRate: 80, satisfaction: 4.0, placement: 82, research: 70 },
  { dept: 'CIVIL', attendance: 84, passRate: 78, satisfaction: 3.8, placement: 78, research: 65 },
];

export const WEEKLY_ATTENDANCE = [
  { day: 'Mon', present: 92 }, { day: 'Tue', present: 88 }, { day: 'Wed', present: 95 },
  { day: 'Thu', present: 87 }, { day: 'Fri', present: 79 }, { day: 'Sat', present: 60 },
];

// ══════════════════════════════════════════════════════════════════════════════
// NEW ENTERPRISE DATA
// ══════════════════════════════════════════════════════════════════════════════

// ── Timetable ───────────────────────────────────────────────────────────────
export const TIMETABLE = [
  { id: 'tt1',  day: 'Monday',    period: 1, time: '09:00 - 09:50', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Intro to CS',          room: 'LH-301', faculty: 'Dr. Sarah Jenkins',  type: 'lecture' },
  { id: 'tt2',  day: 'Monday',    period: 2, time: '10:00 - 10:50', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems',      room: 'LH-205', faculty: 'Dr. Sarah Jenkins',  type: 'lecture' },
  { id: 'tt3',  day: 'Monday',    period: 4, time: '12:00 - 12:50', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', room: 'LH-401', faculty: 'Prof. Alice Moon',   type: 'lecture' },
  { id: 'tt4',  day: 'Tuesday',   period: 1, time: '09:00 - 09:50', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', room: 'Lab-2',  faculty: 'Prof. Alice Moon',   type: 'lab' },
  { id: 'tt5',  day: 'Tuesday',   period: 2, time: '10:00 - 10:50', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', room: 'Lab-2',  faculty: 'Prof. Alice Moon',   type: 'lab' },
  { id: 'tt6',  day: 'Tuesday',   period: 3, time: '11:00 - 11:50', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Intro to CS',          room: 'Lab-1',  faculty: 'Dr. Sarah Jenkins',  type: 'lab' },
  { id: 'tt7',  day: 'Wednesday', period: 1, time: '09:00 - 09:50', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems',      room: 'LH-205', faculty: 'Dr. Sarah Jenkins',  type: 'lecture' },
  { id: 'tt8',  day: 'Wednesday', period: 3, time: '11:00 - 11:50', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Intro to CS',          room: 'LH-301', faculty: 'Dr. Sarah Jenkins',  type: 'tutorial' },
  { id: 'tt9',  day: 'Thursday',  period: 1, time: '09:00 - 09:50', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', room: 'LH-401', faculty: 'Prof. Alice Moon',   type: 'lecture' },
  { id: 'tt10', day: 'Thursday',  period: 2, time: '10:00 - 10:50', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems',      room: 'Lab-3',  faculty: 'Dr. Sarah Jenkins',  type: 'lab' },
  { id: 'tt11', day: 'Thursday',  period: 3, time: '11:00 - 11:50', courseId: 'c2', courseCode: 'CS302', courseTitle: 'Database Systems',      room: 'Lab-3',  faculty: 'Dr. Sarah Jenkins',  type: 'lab' },
  { id: 'tt12', day: 'Friday',    period: 1, time: '09:00 - 09:50', courseId: 'c1', courseCode: 'CS101', courseTitle: 'Intro to CS',          room: 'LH-301', faculty: 'Dr. Sarah Jenkins',  type: 'lecture' },
  { id: 'tt13', day: 'Friday',    period: 3, time: '11:00 - 11:50', courseId: 'c3', courseCode: 'CS450', courseTitle: 'Machine Learning & AI', room: 'LH-401', faculty: 'Prof. Alice Moon',   type: 'tutorial' },
];

// ── Academic Calendar Events ────────────────────────────────────────────────
export const CALENDAR_EVENTS = [
  { id: 'ev1',  title: 'Semester Begins',            date: '2026-01-10', endDate: null,        type: 'academic',  priority: 'high',   description: 'Spring semester 2026 classes commence.' },
  { id: 'ev2',  title: 'Republic Day',               date: '2026-01-26', endDate: null,        type: 'holiday',   priority: 'medium', description: 'National holiday.' },
  { id: 'ev3',  title: 'Mid-Semester Exams',          date: '2026-03-10', endDate: '2026-03-20',type: 'exam',      priority: 'high',   description: 'Mid-semester examinations for all courses.' },
  { id: 'ev4',  title: 'Spring Break',                date: '2026-03-21', endDate: '2026-03-28',type: 'holiday',   priority: 'medium', description: 'One week spring break.' },
  { id: 'ev5',  title: 'Project Submission Deadline',  date: '2026-04-15', endDate: null,        type: 'deadline',  priority: 'high',   description: 'Final project submission for all S7 courses.' },
  { id: 'ev6',  title: 'Cultural Fest — TechnoVista',  date: '2026-04-20', endDate: '2026-04-22',type: 'event',     priority: 'medium', description: 'Annual inter-college cultural and tech fest.' },
  { id: 'ev7',  title: 'End-Semester Exams Begin',     date: '2026-05-05', endDate: '2026-05-25',type: 'exam',      priority: 'high',   description: 'Final examinations for Spring 2026.' },
  { id: 'ev8',  title: 'Semester Ends',                date: '2026-05-30', endDate: null,        type: 'academic',  priority: 'high',   description: 'Last day of Spring semester 2026.' },
  { id: 'ev9',  title: 'Convocation Ceremony',         date: '2026-06-15', endDate: null,        type: 'event',     priority: 'high',   description: 'Annual graduation ceremony.' },
  { id: 'ev10', title: 'CS101 Quiz 3',                 date: '2026-07-18', endDate: null,        type: 'exam',      priority: 'medium', description: 'Week 3 quiz on functions and recursion.' },
  { id: 'ev11', title: 'Independence Day',             date: '2026-08-15', endDate: null,        type: 'holiday',   priority: 'medium', description: 'National holiday.' },
  { id: 'ev12', title: 'Placement Drive — Google',     date: '2026-07-25', endDate: '2026-07-26',type: 'placement', priority: 'high',   description: 'Google campus recruitment drive.' },
];

// ── Discussion Forum ────────────────────────────────────────────────────────
export const DISCUSSIONS = [
  { id: 'disc1', courseId: 'c1', courseCode: 'CS101', title: 'Confusion about Merge Sort time complexity', author: 'John Doe', authorId: 's1', authorRole: 'student', content: 'Can someone explain why merge sort is O(n log n) and not O(n²)?', createdAt: '2026-07-01 10:30', upvotes: 12, replies: 4, pinned: false, resolved: true },
  { id: 'disc2', courseId: 'c1', courseCode: 'CS101', title: 'Assignment 1 — Can we use C++ instead of Python?', author: 'Arjun Kumar', authorId: 's4', authorRole: 'student', content: 'I\'m more comfortable with C++. Is that allowed for the sorting algorithm assignment?', createdAt: '2026-07-02 14:15', upvotes: 8, replies: 2, pinned: false, resolved: false },
  { id: 'disc3', courseId: 'c2', courseCode: 'CS302', title: 'Best practices for ER diagram normalization', author: 'Dr. Sarah Jenkins', authorId: 'f1', authorRole: 'faculty', content: 'Here are some tips for your upcoming ER diagram project. Focus on identifying all functional dependencies first.', createdAt: '2026-07-03 09:00', upvotes: 24, replies: 7, pinned: true, resolved: false },
  { id: 'disc4', courseId: 'c3', courseCode: 'CS450', title: 'GPU vs CPU for training neural networks', author: 'Jane Smith', authorId: 's2', authorRole: 'student', content: 'What\'s the actual performance difference? I only have a laptop GPU.', createdAt: '2026-07-02 16:45', upvotes: 15, replies: 5, pinned: false, resolved: false },
  { id: 'disc5', courseId: 'c1', courseCode: 'CS101', title: 'Important: Assignment submission format clarification', author: 'Dr. Sarah Jenkins', authorId: 'f1', authorRole: 'faculty', content: 'Please submit your work as a single .zip file containing src/ and docs/ folders.', createdAt: '2026-07-04 08:00', upvotes: 30, replies: 1, pinned: true, resolved: false },
];

export const DISCUSSION_REPLIES = [
  { id: 'rep1', discussionId: 'disc1', author: 'Dr. Sarah Jenkins', authorId: 'f1', authorRole: 'faculty', content: 'Great question! Merge sort divides the array into halves (log n levels) and at each level does O(n) work for merging. Hence O(n log n).', createdAt: '2026-07-01 11:00', upvotes: 18, isAnswer: true },
  { id: 'rep2', discussionId: 'disc1', author: 'Riya Patel', authorId: 's3', authorRole: 'student', content: 'This visualization helped me understand: think of it as a tree of recursive calls.', createdAt: '2026-07-01 11:30', upvotes: 6, isAnswer: false },
  { id: 'rep3', discussionId: 'disc2', author: 'Dr. Sarah Jenkins', authorId: 'f1', authorRole: 'faculty', content: 'Yes, C++ is acceptable. Please mention it in your README.', createdAt: '2026-07-02 15:00', upvotes: 10, isAnswer: true },
  { id: 'rep4', discussionId: 'disc3', author: 'John Doe', authorId: 's1', authorRole: 'student', content: 'Thank you, Professor! Should we use Boyce-Codd Normal Form or is 3NF sufficient?', createdAt: '2026-07-03 10:15', upvotes: 3, isAnswer: false },
];

// ── Transcript & Grade Report ───────────────────────────────────────────────
export const TRANSCRIPTS = [
  { studentId: 's1', semester: 'S1', year: '2024-25', sgpa: 8.2, courses: [
    { code: 'CS101', title: 'Intro to CS', credits: 4, grade: 'A', gradePoint: 9 },
    { code: 'MATH101', title: 'Calculus I', credits: 3, grade: 'B+', gradePoint: 8 },
    { code: 'PHY101', title: 'Physics I', credits: 3, grade: 'B', gradePoint: 7 },
    { code: 'ENG101', title: 'Technical English', credits: 2, grade: 'A+', gradePoint: 10 },
  ]},
  { studentId: 's1', semester: 'S2', year: '2024-25', sgpa: 8.5, courses: [
    { code: 'CS201', title: 'Data Structures', credits: 4, grade: 'A', gradePoint: 9 },
    { code: 'MATH201', title: 'Linear Algebra', credits: 3, grade: 'A', gradePoint: 9 },
    { code: 'CS202', title: 'Digital Logic', credits: 3, grade: 'B+', gradePoint: 8 },
    { code: 'HUM101', title: 'Economics', credits: 2, grade: 'B', gradePoint: 7 },
  ]},
  { studentId: 's1', semester: 'S3', year: '2025-26', sgpa: 8.9, courses: [
    { code: 'CS301', title: 'Algorithms', credits: 4, grade: 'A+', gradePoint: 10 },
    { code: 'CS302', title: 'Database Systems', credits: 4, grade: 'A+', gradePoint: 10 },
    { code: 'CS303', title: 'Operating Systems', credits: 3, grade: 'A', gradePoint: 9 },
    { code: 'MATH301', title: 'Probability & Stats', credits: 3, grade: 'B+', gradePoint: 8 },
  ]},
  { studentId: 's1', semester: 'S4 (Current)', year: '2025-26', sgpa: null, courses: [
    { code: 'CS101', title: 'Intro to CS (Review)', credits: 4, grade: 'In Progress', gradePoint: null },
    { code: 'CS302', title: 'Database Systems', credits: 4, grade: 'In Progress', gradePoint: null },
    { code: 'CS450', title: 'Machine Learning & AI', credits: 5, grade: 'In Progress', gradePoint: null },
  ]},
];

// ── Fee & Payment Records ───────────────────────────────────────────────────
export const FEE_RECORDS = [
  { id: 'fee1', studentId: 's1', semester: 'S1 2024-25', tuition: 85000, hostel: 35000, lab: 8000, library: 3000, exam: 5000, total: 136000, paid: 136000, status: 'paid', paidDate: '2024-08-10', method: 'Online', receiptNo: 'REC-2024-001' },
  { id: 'fee2', studentId: 's1', semester: 'S2 2024-25', tuition: 85000, hostel: 35000, lab: 8000, library: 3000, exam: 5000, total: 136000, paid: 136000, status: 'paid', paidDate: '2025-01-05', method: 'Online', receiptNo: 'REC-2025-001' },
  { id: 'fee3', studentId: 's1', semester: 'S3 2025-26', tuition: 90000, hostel: 38000, lab: 10000, library: 3000, exam: 5000, total: 146000, paid: 146000, status: 'paid', paidDate: '2025-08-08', method: 'Bank Transfer', receiptNo: 'REC-2025-045' },
  { id: 'fee4', studentId: 's1', semester: 'S4 2025-26', tuition: 90000, hostel: 38000, lab: 10000, library: 3000, exam: 5000, total: 146000, paid: 100000, status: 'partial', paidDate: '2026-01-08', method: 'Online', receiptNo: 'REC-2026-012', dueDate: '2026-02-28' },
];

// ── Library Resources ───────────────────────────────────────────────────────
export const LIBRARY_RESOURCES = [
  { id: 'lib1', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'Textbook', department: 'CSE', copies: 15, available: 8, type: 'physical' },
  { id: 'lib2', title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0078022159', category: 'Textbook', department: 'CSE', copies: 12, available: 5, type: 'physical' },
  { id: 'lib3', title: 'Deep Learning', author: 'Ian Goodfellow', isbn: '978-0262035613', category: 'Textbook', department: 'CSE', copies: 8, available: 3, type: 'physical' },
  { id: 'lib4', title: 'IEEE Transactions on ML', author: 'IEEE', isbn: '-', category: 'Journal', department: 'CSE', copies: 1, available: 1, type: 'digital' },
  { id: 'lib5', title: 'Python Crash Course', author: 'Eric Matthes', isbn: '978-1593279288', category: 'Reference', department: 'CSE', copies: 20, available: 14, type: 'physical' },
  { id: 'lib6', title: 'Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091888', category: 'Textbook', department: 'MATH', copies: 25, available: 18, type: 'physical' },
  { id: 'lib7', title: 'ACM Digital Library Access', author: 'ACM', isbn: '-', category: 'Database', department: 'All', copies: 1, available: 1, type: 'digital' },
  { id: 'lib8', title: 'Circuit Analysis: Theory and Practice', author: 'Robbins & Miller', isbn: '978-1285401928', category: 'Textbook', department: 'EEE', copies: 10, available: 7, type: 'physical' },
];

// ── Placement Data ──────────────────────────────────────────────────────────
export const PLACEMENT_DRIVES = [
  { id: 'pd1', company: 'Google',     role: 'Software Engineer',        package: '₹45 LPA', date: '2026-07-25', status: 'upcoming',  eligible: 120, applied: 0,  selected: 0, logo: '🔵' },
  { id: 'pd2', company: 'Microsoft',  role: 'Full Stack Developer',     package: '₹38 LPA', date: '2026-07-20', status: 'ongoing',   eligible: 150, applied: 98, selected: 0, logo: '🟦' },
  { id: 'pd3', company: 'Amazon',     role: 'SDE-1',                    package: '₹32 LPA', date: '2026-06-15', status: 'completed', eligible: 200, applied: 180, selected: 12, logo: '🟧' },
  { id: 'pd4', company: 'TCS',        role: 'Systems Engineer',         package: '₹7 LPA',  date: '2026-06-01', status: 'completed', eligible: 500, applied: 420, selected: 85, logo: '⬜' },
  { id: 'pd5', company: 'Infosys',    role: 'Digital Specialist',       package: '₹9 LPA',  date: '2026-06-10', status: 'completed', eligible: 450, applied: 380, selected: 65, logo: '🟩' },
  { id: 'pd6', company: 'Meta',       role: 'Research Scientist Intern',package: '₹50 LPA', date: '2026-08-05', status: 'upcoming',  eligible: 80,  applied: 0,  selected: 0, logo: '🔷' },
];

// ── Announcements ───────────────────────────────────────────────────────────
export const ANNOUNCEMENTS = [
  { id: 'ann1', title: 'Mid-Semester Exam Schedule Released', content: 'The mid-semester examination schedule for Spring 2026 has been published. Check the academic calendar for dates.', author: 'Dean Academic Office', authorId: 'm1', target: 'all', priority: 'high', createdAt: '2026-03-01', expiresAt: '2026-03-25' },
  { id: 'ann2', title: 'Library Extended Hours During Exams', content: 'The central library will remain open until 11 PM during the examination period (March 10-20).', author: 'Library Administration', authorId: 'a1', target: 'all', priority: 'medium', createdAt: '2026-03-05', expiresAt: '2026-03-22' },
  { id: 'ann3', title: 'Google Placement Drive Registration Open', content: 'Students with CGPA ≥ 7.5 are eligible. Register before July 20th.', author: 'Placement Cell', authorId: 'a1', target: 'student', priority: 'high', createdAt: '2026-07-10', expiresAt: '2026-07-24' },
  { id: 'ann4', title: 'Faculty Meeting — Semester Review', content: 'All faculty members are requested to attend the semester review meeting on July 15th at 3 PM, Board Room.', author: 'Dean Academic', authorId: 'm1', target: 'faculty', priority: 'high', createdAt: '2026-07-08', expiresAt: '2026-07-15' },
  { id: 'ann5', title: 'Campus Wi-Fi Maintenance', content: 'Campus Wi-Fi will be down for maintenance on July 14th from 2 AM to 6 AM.', author: 'IT Department', authorId: 'a1', target: 'all', priority: 'low', createdAt: '2026-07-12', expiresAt: '2026-07-15' },
];

// ── Leave Records (Faculty) ─────────────────────────────────────────────────
export const LEAVE_RECORDS = [
  { id: 'lv1', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', type: 'Casual Leave',   fromDate: '2026-07-08', toDate: '2026-07-09', days: 2, reason: 'Personal work',         status: 'approved',  approvedBy: 'HOD CSE', appliedAt: '2026-07-01' },
  { id: 'lv2', facultyId: 'f2', facultyName: 'Prof. Alice Moon',  type: 'Medical Leave',  fromDate: '2026-06-20', toDate: '2026-06-24', days: 5, reason: 'Health issue',           status: 'approved',  approvedBy: 'HOD CSE', appliedAt: '2026-06-18' },
  { id: 'lv3', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', type: 'Conference',     fromDate: '2026-08-10', toDate: '2026-08-14', days: 5, reason: 'IEEE Conference, Mumbai', status: 'pending',   approvedBy: null,      appliedAt: '2026-07-05' },
  { id: 'lv4', facultyId: 'f3', facultyName: 'Prof. David Vance', type: 'Earned Leave',   fromDate: '2026-07-15', toDate: '2026-07-20', days: 6, reason: 'Family vacation',        status: 'rejected', approvedBy: 'Dean',    appliedAt: '2026-07-02' },
];

export const LEAVE_BALANCE = [
  { facultyId: 'f1', casual: 10, medical: 12, earned: 15, conference: 10, used_casual: 4, used_medical: 0, used_earned: 3, used_conference: 5 },
  { facultyId: 'f2', casual: 10, medical: 12, earned: 15, conference: 10, used_casual: 2, used_medical: 5, used_earned: 0, used_conference: 0 },
  { facultyId: 'f3', casual: 10, medical: 12, earned: 15, conference: 10, used_casual: 6, used_medical: 2, used_earned: 8, used_conference: 3 },
];

// ── Student Feedback (for Faculty) ──────────────────────────────────────────
export const FEEDBACK_SURVEYS = [
  { id: 'fb1', courseId: 'c1', courseCode: 'CS101', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', semester: 'S3 2025-26', responses: 128, avgRating: 4.6, ratings: { teaching: 4.7, content: 4.5, engagement: 4.6, availability: 4.4, overall: 4.6 }, comments: ['Excellent teaching style!', 'More coding examples would help.', 'Very approachable professor.', 'Assignments are well-designed.'] },
  { id: 'fb2', courseId: 'c2', courseCode: 'CS302', facultyId: 'f1', facultyName: 'Dr. Sarah Jenkins', semester: 'S3 2025-26', responses: 85, avgRating: 4.4, ratings: { teaching: 4.5, content: 4.3, engagement: 4.4, availability: 4.2, overall: 4.4 }, comments: ['Great practical sessions.', 'SQL labs are very helpful.', 'Sometimes moves too fast.'] },
  { id: 'fb3', courseId: 'c3', courseCode: 'CS450', facultyId: 'f2', facultyName: 'Prof. Alice Moon', semester: 'S3 2025-26', responses: 190, avgRating: 4.3, ratings: { teaching: 4.4, content: 4.5, engagement: 4.1, availability: 4.2, overall: 4.3 }, comments: ['Fascinating subject!', 'More hands-on labs needed.', 'Research-oriented approach.'] },
];

// ── Download Center ─────────────────────────────────────────────────────────
export const DOWNLOADS = [
  { id: 'dl1', title: 'CS101 Syllabus 2026',             category: 'Syllabus',        course: 'CS101', fileType: 'PDF',  size: '245 KB', uploadedAt: '2026-01-05', uploadedBy: 'Dr. Sarah Jenkins' },
  { id: 'dl2', title: 'CS302 Previous Year Questions',     category: 'Question Paper',  course: 'CS302', fileType: 'PDF',  size: '1.2 MB', uploadedAt: '2026-02-10', uploadedBy: 'Dr. Sarah Jenkins' },
  { id: 'dl3', title: 'CS450 Lab Manual',                  category: 'Lab Manual',      course: 'CS450', fileType: 'PDF',  size: '3.8 MB', uploadedAt: '2026-01-15', uploadedBy: 'Prof. Alice Moon' },
  { id: 'dl4', title: 'Academic Calendar 2025-26',         category: 'Calendar',        course: 'General', fileType: 'PDF', size: '520 KB', uploadedAt: '2025-12-20', uploadedBy: 'Admin Office' },
  { id: 'dl5', title: 'CS101 Week 3 Lecture Notes',        category: 'Notes',           course: 'CS101', fileType: 'PDF',  size: '890 KB', uploadedAt: '2026-07-05', uploadedBy: 'Dr. Sarah Jenkins' },
  { id: 'dl6', title: 'Sorting Algorithms Reference',      category: 'Reference',       course: 'CS101', fileType: 'PDF',  size: '1.5 MB', uploadedAt: '2026-06-28', uploadedBy: 'Dr. Sarah Jenkins' },
  { id: 'dl7', title: 'Database Design Cheat Sheet',       category: 'Reference',       course: 'CS302', fileType: 'PDF',  size: '450 KB', uploadedAt: '2026-03-01', uploadedBy: 'Dr. Sarah Jenkins' },
  { id: 'dl8', title: 'Neural Network Architectures Poster',category: 'Reference',       course: 'CS450', fileType: 'PNG',  size: '2.1 MB', uploadedAt: '2026-04-10', uploadedBy: 'Prof. Alice Moon' },
];

// ── Activity Timeline ───────────────────────────────────────────────────────
export const ACTIVITY_LOG = [
  { id: 'act1',  userId: 's1', action: 'assignment.submitted',  description: 'Submitted "Implement a Sorting Algorithm" for CS101', timestamp: '2026-07-10 14:32', icon: '📝' },
  { id: 'act2',  userId: 's1', action: 'quiz.completed',        description: 'Completed CS101 Week 2 Quiz — Score: 88/100',        timestamp: '2026-07-09 11:45', icon: '⚡' },
  { id: 'act3',  userId: 's1', action: 'course.material_viewed',description: 'Viewed "Week 3 - Functions" in CS101',                timestamp: '2026-07-08 16:20', icon: '📖' },
  { id: 'act4',  userId: 's1', action: 'forum.posted',          description: 'Posted in CS101 Forum: "Confusion about Merge Sort"',  timestamp: '2026-07-01 10:30', icon: '💬' },
  { id: 'act5',  userId: 's1', action: 'certificate.downloaded',description: 'Downloaded certificate for CS302',                    timestamp: '2026-06-28 14:00', icon: '🏆' },
  { id: 'act6',  userId: 's1', action: 'attendance.marked',     description: 'Attendance marked: Present in CS101',                 timestamp: '2026-07-02 09:05', icon: '✅' },
  { id: 'act7',  userId: 's1', action: 'enrollment.created',    description: 'Enrolled in CS450 — Machine Learning & AI',           timestamp: '2026-01-15 10:00', icon: '📚' },
  { id: 'act8',  userId: 's1', action: 'profile.updated',       description: 'Updated profile photo and contact details',           timestamp: '2026-01-12 09:30', icon: '👤' },
  { id: 'act9',  userId: 's1', action: 'grade.received',        description: 'Received grade A+ for CS302 Database Schema Project', timestamp: '2026-07-05 12:00', icon: '🎯' },
  { id: 'act10', userId: 's1', action: 'library.book_issued',   description: 'Issued "Introduction to Algorithms (CLRS)"',          timestamp: '2026-06-20 10:15', icon: '📕' },
  { id: 'act11', userId: 'f1', action: 'attendance.marked_bulk',description: 'Marked attendance for CS101 — 42 students',           timestamp: '2026-07-02 10:23', icon: '📋' },
  { id: 'act12', userId: 'f1', action: 'assignment.graded',     description: 'Graded 15 submissions for CS302',                     timestamp: '2026-07-03 15:00', icon: '✏️' },
  { id: 'act13', userId: 'f1', action: 'content.uploaded',      description: 'Uploaded "Week 4 Lecture Notes" for CS101',            timestamp: '2026-07-04 09:00', icon: '📤' },
  { id: 'act14', userId: 'a1', action: 'user.created',          description: 'Created 25 new student accounts for MBA batch',       timestamp: '2026-07-01 11:00', icon: '👥' },
  { id: 'act15', userId: 'a1', action: 'backup.completed',      description: 'System backup completed — 12.4 GB',                   timestamp: '2026-07-02 02:00', icon: '💾' },
];

// ── Roles & Permissions (Admin) ─────────────────────────────────────────────
export const ROLES = [
  { id: 'role1', name: 'student',    label: 'Student',    description: 'Access to courses, assignments, and academic records',  userCount: 3200, permissions: ['view_courses', 'submit_assignments', 'view_grades', 'view_attendance', 'view_certificates', 'use_library', 'apply_placement', 'create_ticket'] },
  { id: 'role2', name: 'faculty',    label: 'Faculty',    description: 'Teaching, grading, attendance, and course management',  userCount: 180,  permissions: ['view_courses', 'create_course', 'manage_content', 'mark_attendance', 'grade_assignments', 'create_assessment', 'view_analytics', 'manage_announcements'] },
  { id: 'role3', name: 'admin',      label: 'Admin',      description: 'Full system administration and configuration',          userCount: 5,    permissions: ['manage_users', 'manage_courses', 'manage_departments', 'manage_semesters', 'view_audit', 'system_settings', 'manage_roles', 'manage_library', 'manage_placement', 'backup_restore'] },
  { id: 'role4', name: 'management', label: 'Management', description: 'Executive oversight, analytics, and approvals',         userCount: 3,    permissions: ['view_analytics', 'approve_courses', 'view_kpis', 'view_audit', 'export_reports', 'manage_budget'] },
];

// ── System Health (Admin) ───────────────────────────────────────────────────
export const SYSTEM_HEALTH = {
  services: [
    { name: 'Auth Service',         port: 3001, status: 'healthy', uptime: '99.98%', latency: '12ms',  memory: '128 MB', cpu: '5%' },
    { name: 'User Service',         port: 3002, status: 'healthy', uptime: '99.95%', latency: '18ms',  memory: '156 MB', cpu: '8%' },
    { name: 'Course Service',       port: 3003, status: 'healthy', uptime: '99.97%', latency: '15ms',  memory: '142 MB', cpu: '6%' },
    { name: 'Notification Service', port: 3004, status: 'healthy', uptime: '99.90%', latency: '22ms',  memory: '198 MB', cpu: '12%' },
    { name: 'Assessment Service',   port: 3005, status: 'healthy', uptime: '99.93%', latency: '25ms',  memory: '178 MB', cpu: '10%' },
    { name: 'Assignment Service',   port: 3006, status: 'warning', uptime: '99.85%', latency: '45ms',  memory: '256 MB', cpu: '35%' },
    { name: 'Certificate Service',  port: 3007, status: 'healthy', uptime: '99.99%', latency: '8ms',   memory: '98 MB',  cpu: '3%' },
    { name: 'Attendance Service',   port: 3008, status: 'healthy', uptime: '99.96%', latency: '14ms',  memory: '134 MB', cpu: '7%' },
  ],
  infrastructure: [
    { name: 'MongoDB',    status: 'healthy', uptime: '99.99%', details: 'Primary: connected, 3 replicas' },
    { name: 'Redis',      status: 'healthy', uptime: '99.99%', details: 'Memory: 145/256 MB used' },
    { name: 'RabbitMQ',   status: 'healthy', uptime: '99.97%', details: '12 queues, 0 messages pending' },
    { name: 'MeiliSearch',status: 'healthy', uptime: '99.95%', details: '45,000 documents indexed' },
    { name: 'MinIO',      status: 'healthy', uptime: '99.98%', details: 'Storage: 28.4/100 GB used' },
    { name: 'Nginx',      status: 'healthy', uptime: '99.99%', details: '2,340 requests/min' },
  ],
  database: {
    collections: [
      { name: 'users',         documents: 3388, size: '2.4 MB',  indexes: 4 },
      { name: 'courses',       documents: 456,  size: '1.8 MB',  indexes: 3 },
      { name: 'enrollments',   documents: 12450,size: '5.2 MB',  indexes: 5 },
      { name: 'attendance',    documents: 89230,size: '18.6 MB', indexes: 4 },
      { name: 'assessments',   documents: 234,  size: '890 KB',  indexes: 3 },
      { name: 'assignments',   documents: 567,  size: '2.1 MB',  indexes: 3 },
      { name: 'submissions',   documents: 8920, size: '45.3 MB', indexes: 4 },
      { name: 'certificates',  documents: 1200, size: '3.4 MB',  indexes: 3 },
      { name: 'notifications', documents: 45600,size: '12.8 MB', indexes: 3 },
      { name: 'audit_logs',    documents: 156000,size: '78.2 MB',indexes: 5 },
    ],
    totalSize: '168.8 MB',
    connections: 42,
    opsPerSec: 1250,
  },
};

// ── API Logs (Admin) ────────────────────────────────────────────────────────
export const API_LOGS = [
  { id: 'api1', method: 'POST',  endpoint: '/api/auth/login',       status: 200, duration: '45ms',  userId: 's1', ip: '192.168.1.42', timestamp: '2026-07-02 09:00:12' },
  { id: 'api2', method: 'GET',   endpoint: '/api/courses',          status: 200, duration: '23ms',  userId: 's1', ip: '192.168.1.42', timestamp: '2026-07-02 09:00:15' },
  { id: 'api3', method: 'POST',  endpoint: '/api/attendance/mark',  status: 201, duration: '67ms',  userId: 'f1', ip: '192.168.1.10', timestamp: '2026-07-02 10:23:00' },
  { id: 'api4', method: 'GET',   endpoint: '/api/users',            status: 200, duration: '38ms',  userId: 'a1', ip: '192.168.1.1',  timestamp: '2026-07-02 11:00:00' },
  { id: 'api5', method: 'POST',  endpoint: '/api/auth/login',       status: 401, duration: '12ms',  userId: null, ip: '192.168.1.99', timestamp: '2026-07-02 11:05:23' },
  { id: 'api6', method: 'PUT',   endpoint: '/api/users/s1',         status: 200, duration: '55ms',  userId: 's1', ip: '192.168.1.42', timestamp: '2026-07-02 11:30:00' },
  { id: 'api7', method: 'POST',  endpoint: '/api/assignments/submit',status: 201, duration: '234ms', userId: 's1', ip: '192.168.1.42', timestamp: '2026-07-02 14:32:00' },
  { id: 'api8', method: 'GET',   endpoint: '/api/notifications',    status: 200, duration: '15ms',  userId: 's1', ip: '192.168.1.42', timestamp: '2026-07-02 14:33:00' },
  { id: 'api9', method: 'DELETE',endpoint: '/api/users/temp_acc',   status: 403, duration: '8ms',   userId: 's2', ip: '192.168.1.50', timestamp: '2026-07-02 15:00:00' },
  { id: 'api10',method: 'GET',   endpoint: '/api/courses/c1',       status: 200, duration: '19ms',  userId: 'f1', ip: '192.168.1.10', timestamp: '2026-07-02 16:00:00' },
];

// ── Backup Records (Admin) ──────────────────────────────────────────────────
export const BACKUP_RECORDS = [
  { id: 'bk1', type: 'Full Backup',        size: '12.4 GB', status: 'completed', startedAt: '2026-07-02 02:00', completedAt: '2026-07-02 02:45', triggeredBy: 'Scheduled' },
  { id: 'bk2', type: 'Incremental Backup', size: '1.8 GB',  status: 'completed', startedAt: '2026-07-01 02:00', completedAt: '2026-07-01 02:15', triggeredBy: 'Scheduled' },
  { id: 'bk3', type: 'Full Backup',        size: '12.1 GB', status: 'completed', startedAt: '2026-06-25 02:00', completedAt: '2026-06-25 02:42', triggeredBy: 'Scheduled' },
  { id: 'bk4', type: 'Manual Backup',      size: '12.0 GB', status: 'completed', startedAt: '2026-06-20 14:30', completedAt: '2026-06-20 15:12', triggeredBy: 'sys_admin' },
];

// ── Institutional KPIs (Management) ─────────────────────────────────────────
export const INSTITUTIONAL_KPIS = {
  overall: {
    studentSuccessRate: 87.3,
    graduationRate: 92.1,
    placementRate: 85.6,
    facultyStudentRatio: '1:18',
    researchIndex: 78.4,
    naacGrade: 'A++',
    nbaAccredited: true,
    avgAttendance: 89.3,
    studentSatisfaction: 4.2,
  },
  yearlyTrend: [
    { year: '2022-23', placement: 78, graduation: 88, attendance: 85, satisfaction: 3.9, research: 65 },
    { year: '2023-24', placement: 82, graduation: 90, attendance: 87, satisfaction: 4.0, research: 70 },
    { year: '2024-25', placement: 84, graduation: 91, attendance: 88, satisfaction: 4.1, research: 74 },
    { year: '2025-26', placement: 86, graduation: 92, attendance: 89, satisfaction: 4.2, research: 78 },
  ],
};

// ── Budget Overview (Management — Demo) ─────────────────────────────────────
export const BUDGET_DATA = {
  totalBudget: 25000000,
  totalSpent: 18200000,
  categories: [
    { name: 'Faculty Salaries',     allocated: 12000000, spent: 10800000, icon: '👩‍🏫' },
    { name: 'Infrastructure',       allocated: 5000000,  spent: 3500000,  icon: '🏗️' },
    { name: 'Lab Equipment',        allocated: 3000000,  spent: 2100000,  icon: '🔬' },
    { name: 'Library & Resources',  allocated: 2000000,  spent: 1200000,  icon: '📚' },
    { name: 'Events & Activities',  allocated: 1500000,  spent: 350000,   icon: '🎉' },
    { name: 'Research Grants',      allocated: 1500000,  spent: 250000,   icon: '🔬' },
  ],
};

// ── Research Statistics (Management) ────────────────────────────────────────
export const RESEARCH_STATS = {
  totalPublications: 248,
  totalCitations: 3450,
  hIndex: 28,
  patents: 12,
  ongoingProjects: 35,
  totalFunding: 45000000,
  byDepartment: [
    { dept: 'CSE',   publications: 85,  citations: 1200, patents: 5, projects: 12, funding: 18000000 },
    { dept: 'EEE',   publications: 42,  citations: 580,  patents: 3, projects: 8,  funding: 9000000 },
    { dept: 'MATH',  publications: 55,  citations: 890,  patents: 0, projects: 6,  funding: 5000000 },
    { dept: 'PHY',   publications: 38,  citations: 420,  patents: 2, projects: 5,  funding: 7000000 },
    { dept: 'MBA',   publications: 18,  citations: 210,  patents: 0, projects: 2,  funding: 2000000 },
    { dept: 'MECH',  publications: 10,  citations: 150,  patents: 2, projects: 2,  funding: 4000000 },
  ],
  recentPublications: [
    { title: 'Federated Learning for Privacy-Preserving AI', authors: 'Jenkins S., Moon A.', journal: 'IEEE Trans. ML', year: 2026, citations: 12 },
    { title: 'Optimized VLSI Design for IoT Applications', authors: 'Chen R., et al.', journal: 'ACM TODAES', year: 2026, citations: 8 },
    { title: 'Graph Neural Networks for Drug Discovery', authors: 'Moon A., Jenkins S.', journal: 'Nature MI', year: 2025, citations: 45 },
    { title: 'Quantum Error Correction Codes', authors: 'Jenkins S.', journal: 'Physical Review A', year: 2025, citations: 22 },
  ],
};

// ── Risk Alerts (Management) ────────────────────────────────────────────────
export const RISK_ALERTS = [
  { id: 'risk1', severity: 'high',   category: 'Academic',    title: 'Low attendance in EEE department',         description: 'Average attendance in EEE has dropped to 78% — below the 80% institutional target.', date: '2026-07-05', status: 'active' },
  { id: 'risk2', severity: 'medium', category: 'Financial',   title: 'Budget overrun in Lab Equipment',           description: 'Lab equipment spending is at 70% with 5 months remaining in fiscal year.',             date: '2026-07-03', status: 'active' },
  { id: 'risk3', severity: 'low',    category: 'Compliance',  title: 'NAAC self-study report submission due',     description: 'The annual NAAC self-study report is due in 45 days.',                                   date: '2026-07-01', status: 'monitoring' },
  { id: 'risk4', severity: 'high',   category: 'Placement',   title: 'Below-target placement rate in PHY dept',   description: 'Physics department placement rate at 55%, significantly below the 75% target.',          date: '2026-06-28', status: 'active' },
  { id: 'risk5', severity: 'medium', category: 'Academic',    title: 'High failure rate in MATH201',              description: '28% failure rate in Linear Algebra — above 15% acceptable threshold.',                  date: '2026-06-25', status: 'resolved' },
];

// ── Email Broadcast Templates (Admin) ───────────────────────────────────────
export const EMAIL_TEMPLATES = [
  { id: 'tpl1', name: 'Welcome New Student',    subject: 'Welcome to EduSphere University!',    body: 'Dear {{name}}, Welcome to EduSphere...',  lastUsed: '2026-01-10' },
  { id: 'tpl2', name: 'Exam Reminder',          subject: 'Upcoming Exam Reminder',               body: 'Dear {{name}}, This is a reminder...',    lastUsed: '2026-03-08' },
  { id: 'tpl3', name: 'Fee Payment Reminder',   subject: 'Fee Payment Due',                      body: 'Dear {{name}}, Your fee payment...',      lastUsed: '2026-02-15' },
  { id: 'tpl4', name: 'Placement Drive Alert',  subject: 'New Placement Opportunity — {{company}}',body: 'Dear {{name}}, A new placement...',     lastUsed: '2026-07-10' },
  { id: 'tpl5', name: 'System Maintenance',     subject: 'Scheduled System Maintenance',          body: 'Dear User, The system will be...',       lastUsed: '2026-07-12' },
];

// ── Approval Queue (Management) ─────────────────────────────────────────────
export const APPROVAL_QUEUE = [
  { id: 'appr1', type: 'Course Approval',    title: 'CS499 — Quantum Computing Fundamentals', requestedBy: 'Dr. Sarah Jenkins', requestedAt: '2026-06-29', status: 'pending', priority: 'medium', details: 'New elective course for S7 CSE students.' },
  { id: 'appr2', type: 'Budget Request',     title: 'GPU Lab Equipment — CSE Department',     requestedBy: 'HOD CSE',            requestedAt: '2026-07-01', status: 'pending', priority: 'high',   details: '10x NVIDIA RTX 4090 GPUs for ML research lab. Budget: ₹15,00,000.' },
  { id: 'appr3', type: 'Leave Approval',     title: 'Conference Leave — Dr. Sarah Jenkins',   requestedBy: 'Dr. Sarah Jenkins',  requestedAt: '2026-07-05', status: 'pending', priority: 'low',    details: 'IEEE Conference, Mumbai. Aug 10-14.' },
  { id: 'appr4', type: 'Course Modification',title: 'CS450 — Add 1 more credit',              requestedBy: 'Prof. Alice Moon',   requestedAt: '2026-07-06', status: 'pending', priority: 'medium', details: 'Proposing to increase CS450 from 5 to 6 credits due to expanded syllabus.' },
  { id: 'appr5', type: 'New Faculty Hire',    title: 'Assistant Professor — AI/ML Division',   requestedBy: 'HOD CSE',            requestedAt: '2026-06-15', status: 'approved',priority: 'high',   details: 'Approved hire for AI/ML specialist. Start date: Aug 2026.' },
];

// ── Grade Submission Status (Faculty) ───────────────────────────────────────
export const GRADE_SUBMISSIONS = [
  { courseId: 'c1', courseCode: 'CS101', courseName: 'Intro to CS', semester: 'S4 2025-26', totalStudents: 142, gradesSubmitted: 0,   status: 'not_started', deadline: '2026-08-15' },
  { courseId: 'c2', courseCode: 'CS302', courseName: 'Database Systems', semester: 'S4 2025-26', totalStudents: 98,  gradesSubmitted: 98,  status: 'submitted', deadline: '2026-08-15', submittedAt: '2026-07-01' },
  { courseId: 'c3', courseCode: 'CS450', courseName: 'Machine Learning & AI', semester: 'S4 2025-26', totalStudents: 210, gradesSubmitted: 120, status: 'in_progress', deadline: '2026-08-15' },
];

// ── File Manager (Admin) ────────────────────────────────────────────────────
export const FILE_RECORDS = [
  { id: 'file1', name: 'CS101_Syllabus_2026.pdf',       path: '/courses/CS101/',       type: 'pdf',   size: '245 KB',  uploadedBy: 'sarah_j',   uploadedAt: '2026-01-05', downloads: 342 },
  { id: 'file2', name: 'assignment_template.docx',       path: '/templates/',           type: 'docx',  size: '45 KB',   uploadedBy: 'sys_admin',  uploadedAt: '2025-12-15', downloads: 1250 },
  { id: 'file3', name: 'student_photo_batch_2024.zip',   path: '/students/photos/',     type: 'zip',   size: '156 MB',  uploadedBy: 'sys_admin',  uploadedAt: '2024-08-20', downloads: 5 },
  { id: 'file4', name: 'ML_Lab_Manual_v2.pdf',           path: '/courses/CS450/',       type: 'pdf',   size: '3.8 MB',  uploadedBy: 'alice_moon', uploadedAt: '2026-01-15', downloads: 890 },
  { id: 'file5', name: 'campus_map_updated.png',         path: '/general/',             type: 'png',   size: '2.3 MB',  uploadedBy: 'sys_admin',  uploadedAt: '2025-06-01', downloads: 2100 },
  { id: 'file6', name: 'NAAC_Report_2025.pdf',           path: '/accreditation/',       type: 'pdf',   size: '28.5 MB', uploadedBy: 'dean_academic', uploadedAt: '2025-11-30', downloads: 45 },
];

// ── Predictive Insights Mock Data (Management) ──────────────────────────────
export const PREDICTIVE_DATA = {
  dropoutRisk: [
    { studentId: 's4', name: 'Arjun Kumar', department: 'CSE', riskScore: 72, factors: ['Low attendance (68%)', 'Failed 2 assessments', 'No forum activity'] },
    { studentId: 's7', name: 'Rahul Verma', department: 'EEE', riskScore: 65, factors: ['Irregular attendance', 'Fee payment overdue', 'Low GPA (5.8)'] },
    { studentId: 's8', name: 'Meera Shah', department: 'PHY', riskScore: 58, factors: ['Declining grades', 'Missed 3 deadlines'] },
  ],
  placementPrediction: [
    { department: 'CSE',  predicted: 94, current: 92, confidence: 0.88 },
    { department: 'EEE',  predicted: 87, current: 85, confidence: 0.82 },
    { department: 'MATH', predicted: 72, current: 70, confidence: 0.75 },
    { department: 'MBA',  predicted: 96, current: 95, confidence: 0.91 },
    { department: 'MECH', predicted: 84, current: 82, confidence: 0.80 },
  ],
  enrollmentForecast: [
    { year: '2026-27', predicted: 6200, lower: 5800, upper: 6600 },
    { year: '2027-28', predicted: 6800, lower: 6200, upper: 7400 },
    { year: '2028-29', predicted: 7500, lower: 6800, upper: 8200 },
  ],
};

// ── System Settings (Admin) ─────────────────────────────────────────────────
export const SYSTEM_SETTINGS = {
  general: { universityName: 'EduSphere University', tagline: 'Enterprise Learning Management', timezone: 'Asia/Kolkata', language: 'en', dateFormat: 'DD/MM/YYYY', academicYear: '2025-26' },
  security: { sessionTimeout: 30, maxLoginAttempts: 5, passwordMinLength: 8, requireMFA: false, ipWhitelist: false },
  email: { smtpHost: 'smtp.mailtrap.io', smtpPort: 587, fromAddress: 'noreply@edusphere.edu', enabled: true },
  notifications: { emailEnabled: true, pushEnabled: true, smsEnabled: false, digestFrequency: 'daily' },
  storage: { provider: 'MinIO', maxFileSize: '50 MB', allowedTypes: 'pdf,docx,pptx,xlsx,zip,jpg,png,mp4' },
  maintenance: { enabled: false, message: '', scheduledAt: null },
};
