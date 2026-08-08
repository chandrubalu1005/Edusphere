#!/usr/bin/env node
/**
 * EduSphere Enterprise — Unified Local Seed Script
 * Seeds all 15 service databases with demo data.
 *
 * Usage:
 *   node backend/scripts/seed.js
 *   npm run seed  (from root, requires .env)
 *
 * Prerequisites:
 *   - MongoDB container must be running (docker compose up mongodb -d)
 *   - MONGO_URI_* env vars must be set, or defaults to localhost:27017
 *
 * Idempotent: safe to re-run. Uses upserts / findOneAndUpdate to avoid
 * creating duplicates. Only auth users are cleared+re-created on each run
 * to guarantee known-good passwords.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ── Config ────────────────────────────────────────────────────────────────
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';

function uri(db) {
  return process.env[`MONGO_URI_${db.toUpperCase()}`]
    || `mongodb://${MONGO_HOST}:${MONGO_PORT}/edusphere_${db}`;
}

// Demo users — must match start.ps1 credentials
const DEMO_PASSWORD = 'demo123';
const DEMO_USERS = [
  { username: 'john_doe',      email: 'john_doe@edusphere.edu',      role: 'student',    department: 'Computer Science', yearLevel: 2 },
  { username: 'jane_smith',    email: 'jane_smith@edusphere.edu',    role: 'student',    department: 'Electronics',     yearLevel: 3 },
  { username: 'sarah_j',       email: 'sarah_j@edusphere.edu',       role: 'faculty',    department: 'Computer Science' },
  { username: 'prof_kumar',    email: 'prof_kumar@edusphere.edu',    role: 'faculty',    department: 'Electronics' },
  { username: 'sys_admin',     email: 'sys_admin@edusphere.edu',     role: 'admin',      department: 'Administration' },
  { username: 'dean_academic', email: 'dean_academic@edusphere.edu', role: 'management', department: 'Management' },
];

// ── Helpers ───────────────────────────────────────────────────────────────
async function connect(dbUri, label) {
  const conn = await mongoose.createConnection(dbUri).asPromise();
  console.log(`  ✓ Connected to ${label}`);
  return conn;
}

function randomDate(daysAgo, daysAhead = 0) {
  const base = Date.now();
  const past = base - daysAgo * 86400000;
  const future = base + daysAhead * 86400000;
  return new Date(past + Math.random() * (future - past));
}

// ── 1. AUTH SERVICE ───────────────────────────────────────────────────────
async function seedAuth() {
  console.log('\n[1/15] Seeding auth-service (edusphere_auth)...');
  const conn = await connect(uri('auth'), 'edusphere_auth');

  const UserSchema = new mongoose.Schema({
    username:  { type: String, required: true, unique: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, required: true, enum: ['student', 'faculty', 'admin', 'management'] },
    isActive:  { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  });

  const User = conn.model('User', UserSchema);
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of DEMO_USERS) {
    await User.findOneAndUpdate(
      { username: u.username },
      { ...u, password: hashedPassword },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`    ✓ User: ${u.username} (${u.role})`);
  }

  await conn.close();
}

// ── 2. USER SERVICE ───────────────────────────────────────────────────────
async function seedUsers() {
  console.log('\n[2/15] Seeding user-service (edusphere_users)...');
  const conn = await connect(uri('users'), 'edusphere_users');

  const ProfileSchema = new mongoose.Schema({
    userId:      String,
    username:    String,
    email:       String,
    role:        String,
    firstName:   String,
    lastName:    String,
    phone:       String,
    department:  String,
    yearLevel:   Number,
    bio:         String,
    avatar:      String,
    createdAt:   { type: Date, default: Date.now },
  });

  const Profile = conn.model('Profile', ProfileSchema);

  const profileData = [
    { userId: 'john_doe',      username: 'john_doe',      email: 'john_doe@edusphere.edu',      role: 'student',    firstName: 'John',  lastName: 'Doe',      department: 'Computer Science', yearLevel: 2, bio: 'CS student passionate about AI and ML' },
    { userId: 'jane_smith',    username: 'jane_smith',    email: 'jane_smith@edusphere.edu',    role: 'student',    firstName: 'Jane',  lastName: 'Smith',    department: 'Electronics', yearLevel: 3, bio: 'Electronics engineering enthusiast' },
    { userId: 'sarah_j',       username: 'sarah_j',       email: 'sarah_j@edusphere.edu',       role: 'faculty',    firstName: 'Sarah', lastName: 'Johnson',  department: 'Computer Science', bio: 'Associate Professor, specializes in Data Structures' },
    { userId: 'prof_kumar',    username: 'prof_kumar',    email: 'prof_kumar@edusphere.edu',    role: 'faculty',    firstName: 'Raj',   lastName: 'Kumar',    department: 'Electronics', bio: 'Professor of VLSI Design' },
    { userId: 'sys_admin',     username: 'sys_admin',     email: 'sys_admin@edusphere.edu',     role: 'admin',      firstName: 'System',lastName: 'Admin',    department: 'Administration', bio: 'System Administrator' },
    { userId: 'dean_academic', username: 'dean_academic', email: 'dean_academic@edusphere.edu', role: 'management', firstName: 'Dean',  lastName: 'Academic', department: 'Management', bio: 'Dean of Academic Affairs' },
  ];

  for (const p of profileData) {
    await Profile.findOneAndUpdate({ userId: p.userId }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Profile: ${p.userId}`);
  }

  await conn.close();
}

// ── 3. COURSE SERVICE ─────────────────────────────────────────────────────
async function seedCourses() {
  console.log('\n[3/15] Seeding course-service (edusphere_courses)...');
  const conn = await connect(uri('courses'), 'edusphere_courses');

  const CourseSchema = new mongoose.Schema({
    courseCode:  { type: String, unique: true },
    title:       String,
    description: String,
    department:  String,
    credits:     Number,
    semester:    String,
    year:        Number,
    instructor:  String,
    status:      { type: String, default: 'active' },
    enrolled:    [String],
    createdAt:   { type: Date, default: Date.now },
  });

  const Course = conn.model('Course', CourseSchema);

  const courses = [
    { courseCode: 'CS301', title: 'Data Structures & Algorithms', description: 'Advanced DSA with practical implementations', department: 'Computer Science', credits: 4, semester: 'Fall', year: 2026, instructor: 'sarah_j', enrolled: ['john_doe', 'jane_smith'] },
    { courseCode: 'CS302', title: 'Database Management Systems', description: 'Relational and NoSQL databases', department: 'Computer Science', credits: 3, semester: 'Fall', year: 2026, instructor: 'sarah_j', enrolled: ['john_doe'] },
    { courseCode: 'EC301', title: 'VLSI Design', description: 'VLSI Circuit Design and Simulation', department: 'Electronics', credits: 4, semester: 'Fall', year: 2026, instructor: 'prof_kumar', enrolled: ['jane_smith'] },
    { courseCode: 'CS401', title: 'Machine Learning', description: 'Fundamentals of Machine Learning', department: 'Computer Science', credits: 4, semester: 'Fall', year: 2026, instructor: 'sarah_j', enrolled: ['john_doe', 'jane_smith'] },
  ];

  for (const c of courses) {
    await Course.findOneAndUpdate({ courseCode: c.courseCode }, c, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Course: ${c.courseCode} — ${c.title}`);
  }

  await conn.close();
}

// ── 4. ATTENDANCE SERVICE ─────────────────────────────────────────────────
async function seedAttendance() {
  console.log('\n[4/15] Seeding attendance-service (edusphere_attendance)...');
  const conn = await connect(uri('attendance'), 'edusphere_attendance');

  const AttendanceSchema = new mongoose.Schema({
    studentId:  { type: String, index: true },
    courseId:   { type: String, index: true },
    date:       { type: Date, index: true },
    status:     { type: String, enum: ['present', 'absent', 'late'] },
    markedBy:   String,
    createdAt:  { type: Date, default: Date.now },
  });
  AttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

  const Attendance = conn.model('Attendance', AttendanceSchema);

  const records = [];
  const students = ['john_doe', 'jane_smith'];
  const courses  = ['CS301', 'CS401'];
  for (let d = 30; d >= 1; d--) {
    const date = new Date(Date.now() - d * 86400000);
    date.setHours(9, 0, 0, 0);
    for (const student of students) {
      for (const course of courses) {
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          records.push({ studentId: student, courseId: course, date, status: Math.random() > 0.15 ? 'present' : 'absent', markedBy: 'sarah_j' });
        }
      }
    }
  }

  for (const r of records) {
    await Attendance.findOneAndUpdate(
      { studentId: r.studentId, courseId: r.courseId, date: r.date },
      r, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`    ✓ Created ${records.length} attendance records`);
  await conn.close();
}

// ── 5. NOTIFICATION SERVICE ───────────────────────────────────────────────
async function seedNotifications() {
  console.log('\n[5/15] Seeding notification-service (edusphere_notifications)...');
  const conn = await connect(uri('notifications'), 'edusphere_notifications');

  const NotificationSchema = new mongoose.Schema({
    userId:      { type: String, index: true },
    title:       String,
    description: String,
    type:        { type: String, enum: ['assignment', 'quiz', 'attendance', 'certificate', 'announcement', 'grade', 'system'] },
    read:        { type: Boolean, default: false, index: true },
    metadata:    mongoose.Schema.Types.Mixed,
    createdAt:   { type: Date, default: Date.now },
  });
  NotificationSchema.index({ userId: 1, read: 1 });

  const Notification = conn.model('Notification', NotificationSchema);

  const notifications = [
    { userId: 'john_doe',  title: 'Assignment Due Soon', description: 'CS301 Assignment due in 2 days', type: 'assignment', read: false },
    { userId: 'john_doe',  title: 'New Course Material', description: 'Prof. Sarah uploaded lecture notes for CS401', type: 'announcement', read: true },
    { userId: 'jane_smith',title: 'Attendance Warning', description: 'Your attendance in EC301 is below 75%', type: 'attendance', read: false },
    { userId: 'sarah_j',   title: 'New Submission', description: 'john_doe submitted CS301 Assignment 1', type: 'assignment', read: false },
  ];

  for (const n of notifications) {
    await Notification.create(n).catch(() => {}); // Skip duplicates
    console.log(`    ✓ Notification for ${n.userId}: ${n.title}`);
  }

  await conn.close();
}

// ── 6. ASSESSMENT SERVICE ─────────────────────────────────────────────────
async function seedAssessments() {
  console.log('\n[6/15] Seeding assessment-service (edusphere_assessments)...');
  const conn = await connect(uri('assessments'), 'edusphere_assessments');

  const AssessmentSchema = new mongoose.Schema({
    title:      String,
    courseId:   String,
    type:       { type: String, enum: ['quiz', 'midterm', 'final', 'practice'] },
    questions:  mongoose.Schema.Types.Mixed,
    duration:   Number,
    totalMarks: Number,
    status:     { type: String, default: 'published' },
    createdBy:  String,
    startTime:  Date,
    endTime:    Date,
    createdAt:  { type: Date, default: Date.now },
  });

  const Assessment = conn.model('Assessment', AssessmentSchema);

  await Assessment.findOneAndUpdate(
    { title: 'CS301 Quiz 1 — Arrays & Linked Lists' },
    {
      title: 'CS301 Quiz 1 — Arrays & Linked Lists',
      courseId: 'CS301',
      type: 'quiz',
      duration: 30,
      totalMarks: 20,
      status: 'published',
      createdBy: 'sarah_j',
      startTime: new Date(Date.now() - 7 * 86400000),
      endTime: new Date(Date.now() - 6 * 86400000),
      questions: [
        { id: '1', text: 'What is the time complexity of binary search?', type: 'mcq', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, marks: 5 },
        { id: '2', text: 'Arrays support O(1) random access', type: 'true_false', options: ['True', 'False'], correct: 0, marks: 5 },
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('    ✓ Assessment: CS301 Quiz 1');
  await conn.close();
}

// ── 7. ASSIGNMENT SERVICE ─────────────────────────────────────────────────
async function seedAssignments() {
  console.log('\n[7/15] Seeding assignment-service (edusphere_assignments)...');
  const conn = await connect(uri('assignments'), 'edusphere_assignments');

  const AssignmentSchema = new mongoose.Schema({
    courseId:     String,
    title:        String,
    description:  String,
    instructions: String,
    totalMarks:   Number,
    passMarks:    Number,
    dueDate:      Date,
    status:       { type: String, default: 'published' },
    createdBy:    String,
    createdAt:    { type: Date, default: Date.now },
  });

  const Assignment = conn.model('Assignment', AssignmentSchema);

  await Assignment.findOneAndUpdate(
    { title: 'CS301 Assignment 1 — Implement a Balanced BST' },
    {
      courseId:     'CS301',
      title:        'CS301 Assignment 1 — Implement a Balanced BST',
      description:  'Implement an AVL tree with insert, delete, and search operations',
      instructions: 'Submit a zip file containing your solution in Java or Python with unit tests.',
      totalMarks:   100,
      passMarks:    50,
      dueDate:      new Date(Date.now() + 7 * 86400000),
      status:       'published',
      createdBy:    'sarah_j',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('    ✓ Assignment: CS301 Assignment 1');
  await conn.close();
}

// ── 8. CERTIFICATE SERVICE ────────────────────────────────────────────────
async function seedCertificates() {
  console.log('\n[8/15] Seeding certificate-service (edusphere_certificates)...');
  const conn = await connect(uri('certificates'), 'edusphere_certificates');

  const CertSchema = new mongoose.Schema({
    certificateNo:    { type: String, unique: true },
    studentId:        String,
    studentName:      String,
    courseId:         String,
    courseName:       String,
    grade:            String,
    issuedDate:       Date,
    verificationHash: { type: String, unique: true },
    isRevoked:        { type: Boolean, default: false },
    createdAt:        { type: Date, default: Date.now },
  });

  const Certificate = conn.model('Certificate', CertSchema);

  const hash = crypto.createHash('sha256').update('CERT-2026-CS301-john_doe').digest('hex');
  await Certificate.findOneAndUpdate(
    { certificateNo: 'CERT-2026-0001' },
    {
      certificateNo:    'CERT-2026-0001',
      studentId:        'john_doe',
      studentName:      'John Doe',
      courseId:         'CS301',
      courseName:       'Data Structures & Algorithms',
      grade:            'A',
      issuedDate:       new Date(),
      verificationHash: hash,
      isRevoked:        false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('    ✓ Certificate: CERT-2026-0001 for john_doe');
  await conn.close();
}

// ── 9. TIMETABLE SERVICE ──────────────────────────────────────────────────
async function seedTimetable() {
  console.log('\n[9/15] Seeding timetable-service (edusphere_timetable)...');
  const conn = await connect(uri('timetable'), 'edusphere_timetable');

  const TimetableSchema = new mongoose.Schema({
    courseId:   String,
    day:        String,
    startTime:  String,
    endTime:    String,
    room:       String,
    instructor: String,
    department: String,
    semester:   String,
  });

  const Timetable = conn.model('Timetable', TimetableSchema);

  const slots = [
    { courseId: 'CS301', day: 'Monday',    startTime: '09:00', endTime: '10:00', room: 'CS-101', instructor: 'sarah_j',    department: 'Computer Science', semester: 'Fall 2026' },
    { courseId: 'CS301', day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'CS-101', instructor: 'sarah_j',    department: 'Computer Science', semester: 'Fall 2026' },
    { courseId: 'CS401', day: 'Tuesday',   startTime: '11:00', endTime: '12:00', room: 'CS-102', instructor: 'sarah_j',    department: 'Computer Science', semester: 'Fall 2026' },
    { courseId: 'EC301', day: 'Monday',    startTime: '14:00', endTime: '15:00', room: 'EC-201', instructor: 'prof_kumar', department: 'Electronics', semester: 'Fall 2026' },
  ];

  for (const s of slots) {
    await Timetable.findOneAndUpdate({ courseId: s.courseId, day: s.day, startTime: s.startTime }, s, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Timetable: ${s.courseId} ${s.day} ${s.startTime}`);
  }

  await conn.close();
}

// ── 10. CALENDAR SERVICE ──────────────────────────────────────────────────
async function seedCalendar() {
  console.log('\n[10/15] Seeding calendar-service (edusphere_calendar)...');
  const conn = await connect(uri('calendar'), 'edusphere_calendar');

  const EventSchema = new mongoose.Schema({
    title:      String,
    description:String,
    type:       String,
    startDate:  Date,
    endDate:    Date,
    department: String,
    createdBy:  String,
  });

  const Event = conn.model('Event', EventSchema);

  const events = [
    { title: 'Mid-Semester Exams', description: 'Mid-semester examination week', type: 'exam', startDate: new Date(Date.now() + 14 * 86400000), endDate: new Date(Date.now() + 21 * 86400000), department: 'All', createdBy: 'sys_admin' },
    { title: 'Fresher Orientation', description: 'Welcome event for new students', type: 'event', startDate: new Date(Date.now() + 3 * 86400000), endDate: new Date(Date.now() + 3 * 86400000), department: 'All', createdBy: 'dean_academic' },
    { title: 'Last Date for Assignment Submission', description: 'CS301 Assignment 1 deadline', type: 'deadline', startDate: new Date(Date.now() + 7 * 86400000), endDate: new Date(Date.now() + 7 * 86400000), department: 'Computer Science', createdBy: 'sarah_j' },
  ];

  for (const e of events) {
    await Event.findOneAndUpdate({ title: e.title }, e, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Event: ${e.title}`);
  }

  await conn.close();
}

// ── 11. LIBRARY SERVICE ───────────────────────────────────────────────────
async function seedLibrary() {
  console.log('\n[11/15] Seeding library-service (edusphere_library)...');
  const conn = await connect(uri('library'), 'edusphere_library');

  const BookSchema = new mongoose.Schema({
    isbn:      { type: String, unique: true },
    title:     String,
    author:    String,
    category:  String,
    available: { type: Boolean, default: true },
    copies:    { type: Number, default: 3 },
  });

  const Book = conn.model('Book', BookSchema);

  const books = [
    { isbn: '978-0-13-110362-7', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', copies: 5 },
    { isbn: '978-0-13-468599-1', title: 'The C Programming Language', author: 'Kernighan & Ritchie', category: 'Programming', copies: 3 },
    { isbn: '978-0-596-51774-8', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Web Development', copies: 4 },
    { isbn: '978-0-13-235088-4', title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', copies: 3 },
  ];

  for (const b of books) {
    await Book.findOneAndUpdate({ isbn: b.isbn }, b, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Book: ${b.title}`);
  }

  await conn.close();
}

// ── 12. PLACEMENT SERVICE ─────────────────────────────────────────────────
async function seedPlacement() {
  console.log('\n[12/15] Seeding placement-service (edusphere_placement)...');
  const conn = await connect(uri('placement'), 'edusphere_placement');

  const JobSchema = new mongoose.Schema({
    company:     String,
    role:        String,
    package:     String,
    deadline:    Date,
    eligibility: String,
    status:      { type: String, default: 'active' },
    postedBy:    String,
    applicants:  [String],
    createdAt:   { type: Date, default: Date.now },
  });

  const Job = conn.model('Job', JobSchema);

  const jobs = [
    { company: 'Infosys', role: 'Software Engineer', package: '6.5 LPA', deadline: new Date(Date.now() + 30 * 86400000), eligibility: 'CSE/IT with CGPA > 7.0', postedBy: 'sys_admin', applicants: ['john_doe'] },
    { company: 'TCS', role: 'Systems Engineer', package: '7 LPA', deadline: new Date(Date.now() + 45 * 86400000), eligibility: 'All branches with CGPA > 6.5', postedBy: 'sys_admin', applicants: [] },
    { company: 'Wipro', role: 'Project Engineer', package: '6 LPA', deadline: new Date(Date.now() + 20 * 86400000), eligibility: 'CSE/ECE with CGPA > 6.0', postedBy: 'sys_admin', applicants: ['john_doe', 'jane_smith'] },
  ];

  for (const j of jobs) {
    await Job.findOneAndUpdate({ company: j.company, role: j.role }, j, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Job: ${j.company} — ${j.role}`);
  }

  await conn.close();
}

// ── 13. DISCUSSION SERVICE ────────────────────────────────────────────────
async function seedDiscussions() {
  console.log('\n[13/15] Seeding discussion-service (edusphere_discussions)...');
  const conn = await connect(uri('discussions'), 'edusphere_discussions');

  const PostSchema = new mongoose.Schema({
    courseId:  String,
    title:     String,
    body:      String,
    author:    String,
    tags:      [String],
    upvotes:   { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  });

  const Post = conn.model('Post', PostSchema);

  await Post.findOneAndUpdate(
    { title: 'Help with AVL Tree Rotations' },
    { courseId: 'CS301', title: 'Help with AVL Tree Rotations', body: 'I am confused about double rotation. Can someone explain?', author: 'john_doe', tags: ['trees', 'algorithms'], upvotes: 3 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Post.findOneAndUpdate(
    { title: 'Resources for Database Normalization' },
    { courseId: 'CS302', title: 'Resources for Database Normalization', body: 'Sharing some good resources I found for 3NF and BCNF.', author: 'jane_smith', tags: ['database', 'normalization'], upvotes: 7 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('    ✓ 2 discussion posts');
  await conn.close();
}

// ── 14. ANALYTICS SERVICE ─────────────────────────────────────────────────
async function seedAnalytics() {
  console.log('\n[14/15] Seeding analytics-service (edusphere_analytics)...');
  const conn = await connect(uri('analytics'), 'edusphere_analytics');

  const AttendanceEventSchema = new mongoose.Schema({
    studentId:   String,
    courseId:    String,
    status:      String,
    date:        Date,
    recordedAt:  { type: Date, default: Date.now },
  });

  const AttendanceEvent = conn.model('AttendanceEvent', AttendanceEventSchema);

  await AttendanceEvent.findOneAndUpdate(
    { studentId: 'john_doe', courseId: 'CS301', date: new Date(Date.now() - 86400000) },
    { studentId: 'john_doe', courseId: 'CS301', status: 'present', date: new Date(Date.now() - 86400000) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('    ✓ Sample analytics event');
  await conn.close();
}

// ── 15. ADMIN SERVICE ─────────────────────────────────────────────────────
async function seedAdmin() {
  console.log('\n[15/15] Seeding admin-service (edusphere_admin)...');
  const conn = await connect(uri('admin'), 'edusphere_admin');

  const DepartmentSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    name: String,
    head: String,
    createdAt: { type: Date, default: Date.now },
  });

  const Department = conn.model('Department', DepartmentSchema);

  const departments = [
    { code: 'CS',   name: 'Computer Science and Engineering',  head: 'sarah_j' },
    { code: 'EC',   name: 'Electronics and Communication',     head: 'prof_kumar' },
    { code: 'MGMT', name: 'Management and Administration',     head: 'dean_academic' },
  ];

  for (const d of departments) {
    await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`    ✓ Department: ${d.code} — ${d.name}`);
  }

  await conn.close();
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — Local Seed Script');
  console.log('══════════════════════════════════════════════════');
  console.log(`\n  MongoDB Host: ${MONGO_HOST}:${MONGO_PORT}`);
  console.log('  Demo credentials: <username> / demo123');
  console.log('  Users: john_doe (student), jane_smith (student),');
  console.log('         sarah_j (faculty), prof_kumar (faculty),');
  console.log('         sys_admin (admin), dean_academic (management)');

  try {
    await seedAuth();
    await seedUsers();
    await seedCourses();
    await seedAttendance();
    await seedNotifications();
    await seedAssessments();
    await seedAssignments();
    await seedCertificates();
    await seedTimetable();
    await seedCalendar();
    await seedLibrary();
    await seedPlacement();
    await seedDiscussions();
    await seedAnalytics();
    await seedAdmin();

    console.log('\n══════════════════════════════════════════════════');
    console.log('  ✅ Seeding complete! All 15 databases populated.');
    console.log('══════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

main();
