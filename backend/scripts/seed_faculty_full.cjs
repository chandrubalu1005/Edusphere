/**
 * EduSphere Faculty Portal — Complete Seed & Repair Script
 * 
 * This script:
 * 1. Seeds user profiles for all auth users
 * 2. Seeds timetable for all faculty
 * 3. Seeds assignments linked to courses
 * 4. Seeds attendance records
 * 5. Seeds leave records
 * 6. Seeds calendar events
 * 7. Seeds discussions
 * 8. Seeds notifications
 * 9. Verifies every collection
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const MONGO_URI_USERS      = process.env.MONGO_URI_USERS;
const MONGO_URI_COURSES    = process.env.MONGO_URI_COURSES;
const MONGO_URI_ASSIGNMENTS = process.env.MONGO_URI_ASSIGNMENTS;
const MONGO_URI_ATTENDANCE = process.env.MONGO_URI_ATTENDANCE;
const MONGO_URI_TIMETABLE  = process.env.MONGO_URI_TIMETABLE;
const MONGO_URI_CALENDAR   = process.env.MONGO_URI_CALENDAR;
const MONGO_URI_DISCUSSIONS = process.env.MONGO_URI_DISCUSSIONS;
const MONGO_URI_NOTIFICATIONS = process.env.MONGO_URI_NOTIFICATIONS;
const MONGO_URI_AUTH       = process.env.MONGO_URI_AUTH;

// ─── Auth Users (from DB) ──────────────────────────────────────────────────
const AUTH_USERS = [
  // Students
  { id: '6a9c4a10f4eacbcd9a85c475', email: 'student_1@edusphere.edu', role: 'student', username: 'student_1', firstName: 'Arjun', lastName: 'Kumar', department: 'CSE', regNo: 'CS2023001', year: 3, gpa: 8.7 },
  { id: '6a9c4a10f4eacbcd9a85c477', email: 'student_2@edusphere.edu', role: 'student', username: 'student_2', firstName: 'Priya', lastName: 'Singh', department: 'CSE', regNo: 'CS2023002', year: 3, gpa: 9.1 },
  { id: '6a9c4a10f4eacbcd9a85c479', email: 'student_3@edusphere.edu', role: 'student', username: 'student_3', firstName: 'Rahul', lastName: 'Sharma', department: 'CSE', regNo: 'CS2023003', year: 2, gpa: 7.5 },
  { id: '6a8525fceb03d01178e00b2f', email: 'john_doe@edusphere.edu', role: 'student', username: 'john_doe', firstName: 'John', lastName: 'Doe', department: 'ECE', regNo: 'EC2023010', year: 2, gpa: 8.2 },
  { id: '6a8525fceb03d01178e00b30', email: 'jane_smith@edusphere.edu', role: 'student', username: 'jane_smith', firstName: 'Jane', lastName: 'Smith', department: 'CSE', regNo: 'CS2023015', year: 4, gpa: 9.3 },
  { id: '6a75b12613e5383fa8cc46ab', email: 'chandru@edusphere.edu', role: 'student', username: 'chandru', firstName: 'Chandru', lastName: 'Balu', department: 'CSE', regNo: 'CS2023020', year: 3, gpa: 8.9 },
  // Faculty
  { id: '6a9c4a10f4eacbcd9a85c47b', email: 'faculty_1@edusphere.edu', role: 'faculty', username: 'faculty_1', firstName: 'Anitha', lastName: 'Ramasamy', department: 'CSE', designation: 'Associate Professor', qualification: 'Ph.D', experience: '8 years' },
  { id: '6a9c4a10f4eacbcd9a85c47d', email: 'faculty_2@edusphere.edu', role: 'faculty', username: 'faculty_2', firstName: 'Bala', lastName: 'Krishnan', department: 'CSE', designation: 'Assistant Professor', qualification: 'M.Tech', experience: '5 years' },
  { id: '6a9c4a10f4eacbcd9a85c47f', email: 'faculty_3@edusphere.edu', role: 'faculty', username: 'faculty_3', firstName: 'Chitra', lastName: 'Nair', department: 'ECE', designation: 'Professor', qualification: 'Ph.D', experience: '12 years' },
  { id: '6a8525fceb03d01178e00b31', email: 'sarah_j@edusphere.edu', role: 'faculty', username: 'sarah_j', firstName: 'Sarah', lastName: 'Johnson', department: 'CSE', designation: 'Professor', qualification: 'Ph.D', experience: '10 years' },
  { id: '6a8525fceb03d01178e00b32', email: 'prof_kumar@edusphere.edu', role: 'faculty', username: 'prof_kumar', firstName: 'Suresh', lastName: 'Kumar', department: 'ECE', designation: 'Professor', qualification: 'Ph.D', experience: '15 years' },
  { id: '6a75b12613e5383fa8cc46ad', email: 'chandru_faculty@edusphere.edu', role: 'faculty', username: 'chandru_faculty', firstName: 'Chandru', lastName: 'Faculty', department: 'CSE', designation: 'Lecturer', qualification: 'M.Tech', experience: '3 years' },
  // Admins
  { id: '6a9c4a11f4eacbcd9a85c481', email: 'admin_1@edusphere.edu', role: 'admin', username: 'admin_1', firstName: 'Admin', lastName: 'One', department: 'Admin' },
  { id: '6a9c4a11f4eacbcd9a85c483', email: 'admin_2@edusphere.edu', role: 'admin', username: 'admin_2', firstName: 'Admin', lastName: 'Two', department: 'Admin' },
  { id: '6a8525fceb03d01178e00b33', email: 'sys_admin@edusphere.edu', role: 'admin', username: 'sys_admin', firstName: 'System', lastName: 'Admin', department: 'IT' },
  // Management
  { id: '6a9c4a11f4eacbcd9a85c487', email: 'management_1@edusphere.edu', role: 'management', username: 'management_1', firstName: 'Management', lastName: 'One', department: 'Management' },
  { id: '6a8525fceb03d01178e00b34', email: 'dean_academic@edusphere.edu', role: 'management', username: 'dean_academic', firstName: 'Dean', lastName: 'Academic', department: 'Academics' },
];

// Course IDs from DB (verified from earlier query)
const COURSES = [
  { id: '6a9c4a12f4eacbcd9a85c48d', code: 'CS101', title: 'Intro to Programming', facultyId: '6a9c4a10f4eacbcd9a85c47b', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c491', code: 'CS201', title: 'Data Structures', facultyId: '6a9c4a10f4eacbcd9a85c47b', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c492', code: 'CS301', title: 'Algorithms', facultyId: '6a9c4a10f4eacbcd9a85c47d', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c493', code: 'CS401', title: 'Operating Systems', facultyId: '6a9c4a10f4eacbcd9a85c47d', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c495', code: 'EC101', title: 'Digital Logic', facultyId: '6a9c4a10f4eacbcd9a85c47f', dept: 'ECE' },
  { id: '6a9c4a65f4eacbcd9a85c496', code: 'EC201', title: 'Signals and Systems', facultyId: '6a9c4a10f4eacbcd9a85c47f', dept: 'ECE' },
  { id: '6a8525feeb03d01178e00b3b', code: 'CS301-old', title: 'Data Structures & Algorithms', facultyId: '6a8525fceb03d01178e00b31', dept: 'CSE' },
  { id: '6a8525feeb03d01178e00b3c', code: 'CS302', title: 'Database Management Systems', facultyId: '6a8525fceb03d01178e00b31', dept: 'CSE' },
  { id: '6a8525feeb03d01178e00b3d', code: 'EC301-old', title: 'VLSI Design', facultyId: '6a8525fceb03d01178e00b32', dept: 'ECE' },
  { id: '6a8525feeb03d01178e00b3e', code: 'CS401-old', title: 'Machine Learning', facultyId: '6a8525fceb03d01178e00b31', dept: 'CSE' },
];

const STUDENT_IDS = [
  '6a9c4a10f4eacbcd9a85c475',
  '6a9c4a10f4eacbcd9a85c477',
  '6a9c4a10f4eacbcd9a85c479',
  '6a8525fceb03d01178e00b2f',
  '6a8525fceb03d01178e00b30',
  '6a75b12613e5383fa8cc46ab',
];

function oid(id) {
  return new mongoose.Types.ObjectId(id);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(n) {
  return daysAgo(n).toISOString().slice(0, 10);
}

async function seedProfiles(conn) {
  const col = conn.db.collection('profiles');
  const existing = await col.countDocuments();
  if (existing > 5) {
    console.log(`  Profiles: ${existing} already exist, skipping`);
    return;
  }

  const profiles = AUTH_USERS.map(u => ({
    userId: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    department: u.department,
    regNo: u.regNo || null,
    designation: u.designation || null,
    qualification: u.qualification || null,
    experience: u.experience || null,
    year: u.year || null,
    gpa: u.gpa || null,
    phone: `+91 9${Math.floor(Math.random() * 900000000 + 100000000)}`,
    address: 'Bitsathy Campus, Erode, Tamil Nadu',
    bio: u.role === 'faculty' ? `${u.designation || 'Professor'} in ${u.department} department with expertise in core subjects.` : `${u.year || 3}rd year student pursuing B.Tech in ${u.department}.`,
    active: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await col.insertMany(profiles, { ordered: false });
  console.log(`  Profiles: seeded ${profiles.length}`);
}

async function seedAssignments(conn, courseConn) {
  const col = conn.db.collection('assignments');
  const existing = await col.countDocuments();
  if (existing > 5) {
    console.log(`  Assignments: ${existing} already exist, skipping`);
    return;
  }

  const assignments = [];
  const now = new Date();

  for (const course of COURSES.slice(0, 6)) {
    const dueIn7 = new Date(now); dueIn7.setDate(dueIn7.getDate() + 7);
    const dueIn3 = new Date(now); dueIn3.setDate(dueIn3.getDate() + 3);
    const duePast5 = new Date(now); duePast5.setDate(duePast5.getDate() - 5);

    assignments.push({
      title: `${course.code} - Assignment 1: Fundamentals`,
      description: `Complete the fundamental concepts exercises for ${course.title}. Submit a PDF report.`,
      courseId: course.id,
      createdBy: course.facultyId,
      dueDate: dueIn7,
      maxMarks: 100,
      status: 'published',
      attachments: [],
      submissionsCount: 0,
      createdAt: daysAgo(10),
    });

    assignments.push({
      title: `${course.code} - Assignment 2: Advanced Topics`,
      description: `Advanced problem set covering ${course.title}. This is worth 20% of total marks.`,
      courseId: course.id,
      createdBy: course.facultyId,
      dueDate: dueIn3,
      maxMarks: 50,
      status: 'published',
      attachments: [],
      submissionsCount: 0,
      createdAt: daysAgo(5),
    });

    assignments.push({
      title: `${course.code} - Lab Report: Practical`,
      description: `Submit the completed lab practical report for ${course.title}.`,
      courseId: course.id,
      createdBy: course.facultyId,
      dueDate: duePast5,
      maxMarks: 30,
      status: 'published',
      attachments: [],
      submissionsCount: STUDENT_IDS.length,
      createdAt: daysAgo(15),
    });
  }

  await col.insertMany(assignments, { ordered: false });
  console.log(`  Assignments: seeded ${assignments.length}`);
}

async function seedSubmissions(conn) {
  const col = conn.db.collection('submissions');
  const assignmentCol = conn.db.collection('assignments');
  const existing = await col.countDocuments();
  if (existing > 10) {
    console.log(`  Submissions: ${existing} already exist, skipping`);
    return;
  }

  // Get all assignments
  const assignments = await assignmentCol.find({ dueDate: { $lt: new Date() } }).toArray();
  const submissions = [];

  for (const assignment of assignments) {
    // Some students submitted for past assignments
    const submittingStudents = STUDENT_IDS.slice(0, Math.floor(Math.random() * 3) + 3);
    for (const studentId of submittingStudents) {
      const graded = Math.random() > 0.4;
      submissions.push({
        assignmentId: assignment._id.toString(),
        courseId: assignment.courseId,
        studentId: studentId,
        submittedAt: daysAgo(Math.floor(Math.random() * 4) + 1),
        fileUrl: null,
        content: 'Submitted via portal',
        status: graded ? 'graded' : 'submitted',
        grade: graded ? Math.floor(Math.random() * 30 + 70) : null,
        feedback: graded ? 'Good work! Keep it up.' : null,
        createdAt: daysAgo(3),
      });
    }
  }

  if (submissions.length > 0) {
    await col.insertMany(submissions, { ordered: false });
    console.log(`  Submissions: seeded ${submissions.length}`);
  }
}

async function seedTimetable(conn) {
  const col = conn.db.collection('timetables');
  const existing = await col.countDocuments();
  if (existing > 5) {
    console.log(`  Timetable: ${existing} already exist, skipping`);
    return;
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:15', end: '12:15' },
    { start: '12:15', end: '13:15' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
  ];

  const rooms = ['CSE-101', 'CSE-102', 'CSE-103', 'ECE-201', 'Lab-A', 'Lab-B'];
  const slots = [];

  // Faculty 1 (Anitha Ramasamy) - CS101, CS201
  const f1Courses = [COURSES[0], COURSES[1]]; // CS101, CS201
  let f1Schedule = [
    { day: 'Monday', slot: 0, course: f1Courses[0] },
    { day: 'Monday', slot: 2, course: f1Courses[1] },
    { day: 'Tuesday', slot: 1, course: f1Courses[0] },
    { day: 'Wednesday', slot: 3, course: f1Courses[1] },
    { day: 'Thursday', slot: 0, course: f1Courses[0] },
    { day: 'Friday', slot: 2, course: f1Courses[1] },
  ];

  for (const entry of f1Schedule) {
    slots.push({
      day: entry.day,
      startTime: timeSlots[entry.slot].start,
      endTime: timeSlots[entry.slot].end,
      subject: entry.course.title,
      courseId: entry.course.id,
      instructor: '6a9c4a10f4eacbcd9a85c47b',
      instructorName: 'Prof. Anitha Ramasamy',
      room: rooms[Math.floor(Math.random() * rooms.length)],
      type: 'lecture',
      department: 'CSE',
      semester: 'Fall 2026',
      createdAt: new Date(),
    });
  }

  // Faculty 2 (Bala Krishnan) - CS301, CS401
  const f2Courses = [COURSES[2], COURSES[3]];
  let f2Schedule = [
    { day: 'Monday', slot: 1, course: f2Courses[0] },
    { day: 'Tuesday', slot: 3, course: f2Courses[1] },
    { day: 'Wednesday', slot: 0, course: f2Courses[0] },
    { day: 'Thursday', slot: 2, course: f2Courses[1] },
    { day: 'Friday', slot: 1, course: f2Courses[0] },
  ];

  for (const entry of f2Schedule) {
    slots.push({
      day: entry.day,
      startTime: timeSlots[entry.slot].start,
      endTime: timeSlots[entry.slot].end,
      subject: entry.course.title,
      courseId: entry.course.id,
      instructor: '6a9c4a10f4eacbcd9a85c47d',
      instructorName: 'Prof. Bala Krishnan',
      room: rooms[Math.floor(Math.random() * rooms.length)],
      type: 'lecture',
      department: 'CSE',
      semester: 'Fall 2026',
      createdAt: new Date(),
    });
  }

  // Faculty 3 (Chitra Nair) - EC101, EC201
  const f3Courses = [COURSES[4], COURSES[5]];
  let f3Schedule = [
    { day: 'Monday', slot: 4, course: f3Courses[0] },
    { day: 'Tuesday', slot: 0, course: f3Courses[1] },
    { day: 'Wednesday', slot: 2, course: f3Courses[0] },
    { day: 'Thursday', slot: 4, course: f3Courses[1] },
    { day: 'Friday', slot: 3, course: f3Courses[0] },
  ];

  for (const entry of f3Schedule) {
    slots.push({
      day: entry.day,
      startTime: timeSlots[entry.slot].start,
      endTime: timeSlots[entry.slot].end,
      subject: entry.course.title,
      courseId: entry.course.id,
      instructor: '6a9c4a10f4eacbcd9a85c47f',
      instructorName: 'Prof. Chitra Nair',
      room: rooms[Math.floor(Math.random() * rooms.length)],
      type: 'lecture',
      department: 'ECE',
      semester: 'Fall 2026',
      createdAt: new Date(),
    });
  }

  await col.insertMany(slots, { ordered: false });
  console.log(`  Timetable: seeded ${slots.length} slots`);
}

async function seedAttendance(conn) {
  const col = conn.db.collection('attendances');
  const existing = await col.countDocuments();
  if (existing > 20) {
    console.log(`  Attendance: ${existing} already exist, skipping`);
    return;
  }

  const records = [];
  const facultyCourses = {
    '6a9c4a10f4eacbcd9a85c47b': [COURSES[0].id, COURSES[1].id],
    '6a9c4a10f4eacbcd9a85c47d': [COURSES[2].id, COURSES[3].id],
    '6a9c4a10f4eacbcd9a85c47f': [COURSES[4].id, COURSES[5].id],
  };

  // Generate 2 weeks of attendance
  for (let daysBack = 14; daysBack >= 0; daysBack--) {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const dateStr = d.toISOString().slice(0, 10);

    for (const [facultyId, courseIds] of Object.entries(facultyCourses)) {
      for (const courseId of courseIds) {
        for (const studentId of STUDENT_IDS) {
          const rand = Math.random();
          const status = rand > 0.15 ? 'present' : rand > 0.05 ? 'absent' : 'leave';
          records.push({
            studentId,
            courseId,
            facultyId,
            date: dateStr,
            status,
            method: daysBack < 3 ? 'qr' : 'manual',
            createdAt: d,
          });
        }
      }
    }
  }

  if (records.length > 0) {
    await col.insertMany(records, { ordered: false });
    console.log(`  Attendance: seeded ${records.length} records`);
  }
}

async function seedLeave(conn) {
  const col = conn.db.collection('leaves');
  const existing = await col.countDocuments();
  if (existing > 3) {
    console.log(`  Leaves: ${existing} already exist, skipping`);
    return;
  }

  const leaves = [
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      userRole: 'faculty',
      type: 'sick',
      from: dateStr(5),
      to: dateStr(4),
      days: 2,
      reason: 'Fever and cold',
      status: 'approved',
      approvedBy: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(6),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47d',
      userRole: 'faculty',
      type: 'casual',
      from: dateStr(20),
      to: dateStr(19),
      days: 2,
      reason: 'Personal work',
      status: 'approved',
      approvedBy: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(22),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47f',
      userRole: 'faculty',
      type: 'vacation',
      from: dateStr(30),
      to: dateStr(25),
      days: 6,
      reason: 'Annual vacation',
      status: 'approved',
      approvedBy: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(35),
    },
    // Pending leave request
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      userRole: 'faculty',
      type: 'casual',
      from: dateStr(-5), // future
      to: dateStr(-7),
      days: 3,
      reason: 'Conference attendance - ICSE 2026',
      status: 'pending',
      createdAt: daysAgo(2),
    },
    // Student leave requests for faculty to review
    {
      userId: '6a9c4a10f4eacbcd9a85c475',
      userRole: 'student',
      type: 'sick',
      from: dateStr(3),
      to: dateStr(2),
      days: 2,
      reason: 'Medical appointment',
      status: 'pending',
      createdAt: daysAgo(4),
    },
  ];

  await col.insertMany(leaves, { ordered: false });
  console.log(`  Leaves: seeded ${leaves.length}`);
}

async function seedLeaveBalance(conn) {
  const col = conn.db.collection('leavebalances');
  const existing = await col.countDocuments();
  if (existing > 2) {
    console.log(`  LeaveBalance: ${existing} already exist, skipping`);
    return;
  }

  const facultyUsers = AUTH_USERS.filter(u => u.role === 'faculty');
  const balances = facultyUsers.map(u => ({
    userId: u.id,
    role: 'faculty',
    sick: { total: 10, used: Math.floor(Math.random() * 3), remaining: 0 },
    casual: { total: 12, used: Math.floor(Math.random() * 4), remaining: 0 },
    vacation: { total: 15, used: Math.floor(Math.random() * 5), remaining: 0 },
    academic_year: '2026',
    updatedAt: new Date(),
  }));

  // Fix remaining
  balances.forEach(b => {
    b.sick.remaining = b.sick.total - b.sick.used;
    b.casual.remaining = b.casual.total - b.casual.used;
    b.vacation.remaining = b.vacation.total - b.vacation.used;
  });

  await col.insertMany(balances, { ordered: false });
  console.log(`  LeaveBalance: seeded ${balances.length}`);
}

async function seedCalendar(conn) {
  const col = conn.db.collection('events');
  const existing = await col.countDocuments();
  if (existing > 5) {
    console.log(`  Calendar: ${existing} already exist, skipping`);
    return;
  }

  const events = [
    {
      title: 'Mid-Semester Examination',
      description: 'Mid-semester exams for all CSE courses',
      start: daysAgo(-7), // 7 days from now
      end: daysAgo(-10),
      type: 'exam',
      department: 'CSE',
      createdBy: '6a9c4a10f4eacbcd9a85c47b',
      createdAt: daysAgo(2),
      color: '#EF4444',
    },
    {
      title: 'CS101 - Assignment 1 Due',
      description: 'Deadline for Assignment 1 submission',
      start: daysAgo(-7),
      end: daysAgo(-7),
      type: 'deadline',
      courseId: COURSES[0].id,
      createdBy: '6a9c4a10f4eacbcd9a85c47b',
      createdAt: daysAgo(5),
      color: '#F59E0B',
    },
    {
      title: 'Faculty Meeting',
      description: 'Monthly faculty meeting - Academic council',
      start: daysAgo(-3),
      end: daysAgo(-3),
      type: 'meeting',
      department: 'CSE',
      createdBy: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(7),
      color: '#3B82F6',
    },
    {
      title: 'CS201 Lab Session',
      description: 'Special lab session for Data Structures practical',
      start: daysAgo(-2),
      end: daysAgo(-2),
      type: 'lecture',
      courseId: COURSES[1].id,
      createdBy: '6a9c4a10f4eacbcd9a85c47b',
      createdAt: daysAgo(5),
      color: '#10B981',
    },
    {
      title: 'End Semester Examination',
      description: 'Final exams schedule for Fall 2026',
      start: daysAgo(-30),
      end: daysAgo(-36),
      type: 'exam',
      department: 'ALL',
      createdBy: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(10),
      color: '#8B5CF6',
    },
    {
      title: 'Seminar: Future of AI in Education',
      description: 'Guest lecture by industry experts',
      start: daysAgo(-5),
      end: daysAgo(-5),
      type: 'event',
      department: 'CSE',
      createdBy: '6a9c4a10f4eacbcd9a85c47b',
      createdAt: daysAgo(10),
      color: '#EC4899',
    },
  ];

  await col.insertMany(events, { ordered: false });
  console.log(`  Calendar: seeded ${events.length}`);
}

async function seedDiscussions(conn) {
  const col = conn.db.collection('threads');
  const existing = await col.countDocuments();
  if (existing > 3) {
    console.log(`  Discussions: ${existing} already exist, skipping`);
    return;
  }

  const threads = [
    {
      title: 'Introduction to Python Programming - Discussion',
      content: 'Welcome to CS101! Please introduce yourselves and share your prior programming experience.',
      courseId: COURSES[0].id,
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      authorRole: 'faculty',
      pinned: true,
      tags: ['introduction', 'CS101'],
      replies: [
        { authorId: STUDENT_IDS[0], authorName: 'Arjun Kumar', content: 'Hi! I have some experience with JavaScript.', createdAt: daysAgo(6) },
        { authorId: STUDENT_IDS[1], authorName: 'Priya Singh', content: 'I am completely new to programming. Excited to learn!', createdAt: daysAgo(5) },
      ],
      replyCount: 2,
      viewCount: 45,
      status: 'active',
      createdAt: daysAgo(7),
    },
    {
      title: 'Assignment 1 Doubts - CS201 Data Structures',
      content: 'Please post your questions about Assignment 1 here. I will respond within 24 hours.',
      courseId: COURSES[1].id,
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      authorRole: 'faculty',
      pinned: false,
      tags: ['assignment', 'doubts', 'CS201'],
      replies: [
        { authorId: STUDENT_IDS[2], authorName: 'Rahul Sharma', content: 'How do we implement a circular linked list?', createdAt: daysAgo(3) },
      ],
      replyCount: 1,
      viewCount: 28,
      status: 'active',
      createdAt: daysAgo(4),
    },
    {
      title: 'Resource: Algorithm Complexity Cheat Sheet',
      content: 'I have uploaded a comprehensive cheat sheet for common algorithm complexities. Check the course materials section.',
      courseId: COURSES[2].id,
      authorId: '6a9c4a10f4eacbcd9a85c47d',
      authorName: 'Prof. Bala Krishnan',
      authorRole: 'faculty',
      pinned: true,
      tags: ['resource', 'algorithms', 'CS301'],
      replies: [],
      replyCount: 0,
      viewCount: 67,
      status: 'active',
      createdAt: daysAgo(8),
    },
  ];

  await col.insertMany(threads, { ordered: false });
  console.log(`  Discussions: seeded ${threads.length} threads`);
}

async function seedNotifications(conn) {
  const col = conn.db.collection('notifications');
  
  // Check faculty_1 notifications
  const existing = await col.countDocuments({ userId: '6a9c4a10f4eacbcd9a85c47b' });
  if (existing > 3) {
    console.log(`  Notifications: ${existing} already exist for faculty_1, skipping`);
    return;
  }

  const notifications = [
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      title: 'New Assignment Submission',
      message: 'Arjun Kumar submitted Assignment 1 for CS101.',
      type: 'assignment',
      read: false,
      link: '/faculty/assignments',
      createdAt: daysAgo(1),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      title: 'Leave Request Pending',
      message: 'Student Arjun Kumar has submitted a leave request for 2 days.',
      type: 'leave',
      read: false,
      link: '/faculty/leave',
      createdAt: daysAgo(2),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      title: 'Course Approved',
      message: 'Your course CS101 - Intro to Programming has been approved by Admin.',
      type: 'course',
      read: true,
      link: '/faculty/courses',
      createdAt: daysAgo(5),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47b',
      title: 'Faculty Meeting Tomorrow',
      message: 'Reminder: Faculty meeting scheduled for tomorrow at 2:00 PM in Conference Room A.',
      type: 'announcement',
      read: false,
      link: '/faculty/announcements',
      createdAt: daysAgo(1),
    },
    // For other faculty
    {
      userId: '6a9c4a10f4eacbcd9a85c47d',
      title: 'New Submission',
      message: 'Multiple students submitted the CS301 assignment.',
      type: 'assignment',
      read: false,
      link: '/faculty/assignments',
      createdAt: daysAgo(1),
    },
    {
      userId: '6a9c4a10f4eacbcd9a85c47f',
      title: 'Exam Schedule Published',
      message: 'Mid-semester exam schedule has been published for ECE courses.',
      type: 'announcement',
      read: false,
      link: '/faculty/announcements',
      createdAt: daysAgo(2),
    },
  ];

  await col.insertMany(notifications, { ordered: false });
  console.log(`  Notifications: seeded ${notifications.length}`);
}

async function seedAnnouncements(conn) {
  const col = conn.db.collection('announcements');
  const existing = await col.countDocuments();
  if (existing > 3) {
    console.log(`  Announcements: ${existing} already exist, skipping`);
    return;
  }

  const announcements = [
    {
      title: 'Mid-Semester Examination Schedule',
      content: 'The mid-semester examinations for Fall 2026 will be held from ' + 
        'September 15-22, 2026. Please check your individual timetables.',
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      authorRole: 'faculty',
      targetAudience: ['student'],
      courseId: null,
      department: 'CSE',
      priority: 'high',
      pinned: true,
      status: 'published',
      publishedAt: daysAgo(3),
      createdAt: daysAgo(3),
    },
    {
      title: 'CS101 - Assignment Submission Guidelines',
      content: 'All assignments must be submitted in PDF format. Late submissions will incur a 10% penalty per day. ' +
        'Plagiarism will result in zero marks.',
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      authorRole: 'faculty',
      targetAudience: ['student'],
      courseId: COURSES[0].id,
      department: 'CSE',
      priority: 'medium',
      pinned: false,
      status: 'published',
      publishedAt: daysAgo(7),
      createdAt: daysAgo(7),
    },
    {
      title: 'Guest Lecture: Industry Insights in AI',
      content: 'We are pleased to announce a guest lecture by Dr. Rajesh Menon from IIT Madras on ' +
        '"Practical Applications of AI in Software Engineering". Attendance is mandatory for all CSE students.',
      authorId: '6a9c4a10f4eacbcd9a85c47d',
      authorName: 'Prof. Bala Krishnan',
      authorRole: 'faculty',
      targetAudience: ['student', 'faculty'],
      courseId: null,
      department: 'CSE',
      priority: 'medium',
      pinned: false,
      status: 'published',
      publishedAt: daysAgo(5),
      createdAt: daysAgo(5),
    },
  ];

  await col.insertMany(announcements, { ordered: false });
  console.log(`  Announcements: seeded ${announcements.length}`);
}

async function updateCourseEnrollments(conn) {
  const col = conn.db.collection('courses');
  
  // Update faculty_1 courses to have enrolled students
  const f1Courses = [
    { id: '6a9c4a12f4eacbcd9a85c48d' },
    { id: '6a9c4a65f4eacbcd9a85c491' },
  ];

  for (const c of f1Courses) {
    const result = await col.updateOne(
      { _id: new mongoose.Types.ObjectId(c.id) },
      { $set: { 
        enrolledStudents: STUDENT_IDS,
        students_enrolled: STUDENT_IDS.length,
        enrolled: STUDENT_IDS
      }}
    );
    if (result.modifiedCount > 0) {
      console.log(`  Course ${c.id}: enrolled ${STUDENT_IDS.length} students`);
    }
  }

  // Update other courses too
  for (const course of COURSES.slice(2)) {
    const partial = STUDENT_IDS.slice(0, 4);
    await col.updateOne(
      { _id: new mongoose.Types.ObjectId(course.id) },
      { $set: { 
        enrolledStudents: partial,
        students_enrolled: partial.length
      }}
    );
  }
  console.log(`  Course enrollments updated`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting EduSphere Faculty Portal Seeding...\n');

  // Create connections to each DB
  const conns = {};
  
  try {
    conns.users = await mongoose.createConnection(MONGO_URI_USERS).asPromise();
    console.log('✅ Connected to edusphere_users');
  } catch (e) { console.error('❌ users DB:', e.message); }

  try {
    conns.assignments = await mongoose.createConnection(MONGO_URI_ASSIGNMENTS).asPromise();
    console.log('✅ Connected to edusphere_assignments');
  } catch (e) { console.error('❌ assignments DB:', e.message); }

  try {
    conns.attendance = await mongoose.createConnection(MONGO_URI_ATTENDANCE).asPromise();
    console.log('✅ Connected to edusphere_attendance');
  } catch (e) { console.error('❌ attendance DB:', e.message); }

  try {
    conns.timetable = await mongoose.createConnection(MONGO_URI_TIMETABLE).asPromise();
    console.log('✅ Connected to edusphere_timetable');
  } catch (e) { console.error('❌ timetable DB:', e.message); }

  try {
    conns.calendar = await mongoose.createConnection(MONGO_URI_CALENDAR).asPromise();
    console.log('✅ Connected to edusphere_calendar');
  } catch (e) { console.error('❌ calendar DB:', e.message); }

  try {
    conns.discussions = await mongoose.createConnection(MONGO_URI_DISCUSSIONS).asPromise();
    console.log('✅ Connected to edusphere_discussions');
  } catch (e) { console.error('❌ discussions DB:', e.message); }

  try {
    conns.notifications = await mongoose.createConnection(MONGO_URI_NOTIFICATIONS).asPromise();
    console.log('✅ Connected to edusphere_notifications');
  } catch (e) { console.error('❌ notifications DB:', e.message); }

  try {
    conns.courses = await mongoose.createConnection(MONGO_URI_COURSES).asPromise();
    console.log('✅ Connected to edusphere_courses');
  } catch (e) { console.error('❌ courses DB:', e.message); }

  console.log('\n📦 Seeding data...\n');

  if (conns.users) await seedProfiles(conns.users);
  if (conns.assignments) {
    await seedAssignments(conns.assignments, conns.courses);
    await seedSubmissions(conns.assignments);
  }
  if (conns.attendance) {
    await seedAttendance(conns.attendance);
    await seedLeave(conns.attendance);
    await seedLeaveBalance(conns.attendance);
  }
  if (conns.timetable) await seedTimetable(conns.timetable);
  if (conns.calendar) await seedCalendar(conns.calendar);
  if (conns.discussions) await seedDiscussions(conns.discussions);
  if (conns.notifications) await seedNotifications(conns.notifications);
  if (conns.courses) await updateCourseEnrollments(conns.courses);

  console.log('\n✅ All seeding complete!\n');

  // Close all connections
  for (const conn of Object.values(conns)) {
    if (conn) await conn.close();
  }

  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
