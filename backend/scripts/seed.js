#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';

function uri(db) {
  return process.env[`MONGO_URI_${db.toUpperCase()}`] || `mongodb://${MONGO_HOST}:${MONGO_PORT}/edusphere_${db}`;
}

async function connect(dbUri, label) {
  const conn = await mongoose.createConnection(dbUri).asPromise();
  console.log(`  ✓ Connected to ${label}`);
  return conn;
}

const DEMO_PASSWORD = 'demo123';
const SEED_USERS = [
  { username: 'student_1', role: 'student', dept: 'CSE', first: 'Student', last: 'One', email: 'student_1@edusphere.edu' },
  { username: 'student_2', role: 'student', dept: 'CSE', first: 'Student', last: 'Two', email: 'student_2@edusphere.edu' },
  { username: 'student_3', role: 'student', dept: 'ECE', first: 'Student', last: 'Three', email: 'student_3@edusphere.edu' },
  { username: 'faculty_1', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'One', email: 'faculty_1@edusphere.edu' },
  { username: 'faculty_2', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'Two', email: 'faculty_2@edusphere.edu' },
  { username: 'faculty_3', role: 'faculty', dept: 'ECE', first: 'Faculty', last: 'Three', email: 'faculty_3@edusphere.edu' },
  { username: 'admin_1', role: 'admin', dept: 'Administration', first: 'Admin', last: 'One', email: 'admin_1@edusphere.edu' },
  { username: 'admin_2', role: 'admin', dept: 'Administration', first: 'Admin', last: 'Two', email: 'admin_2@edusphere.edu' },
  { username: 'admin_3', role: 'admin', dept: 'Administration', first: 'Admin', last: 'Three', email: 'admin_3@edusphere.edu' },
  { username: 'management_1', role: 'management', dept: 'Management', first: 'Management', last: 'One', email: 'management_1@edusphere.edu' },
  { username: 'management_2', role: 'management', dept: 'Management', first: 'Management', last: 'Two', email: 'management_2@edusphere.edu' },
  { username: 'management_3', role: 'management', dept: 'Management', first: 'Management', last: 'Three', email: 'management_3@edusphere.edu' },
];

function randomDate(daysAgo, daysAhead = 0) {
  const base = Date.now();
  const past = base - daysAgo * 86400000;
  const future = base + daysAhead * 86400000;
  return new Date(past + Math.random() * (future - past));
}

let metrics = {};

async function seedAll() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — Master Data Seed');
  console.log('══════════════════════════════════════════════════\n');

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  
  // 1. AUTH & USERS
  console.log('[1/12] Seeding auth & users...');
  const connAuth = await connect(uri('auth'), 'edusphere_auth');
  const connUsers = await connect(uri('users'), 'edusphere_users');
  
  const User = connAuth.model('User', new mongoose.Schema({ username: String, email: String, password: String, role: String, isActive: {type: Boolean, default: true} }, {strict: false}));
  const Profile = connUsers.model('Profile', new mongoose.Schema({ userId: String, username: String, email: String, role: String, firstName: String, lastName: String, department: String }, {strict: false}));

  let userMap = {};
  for (const u of SEED_USERS) {
    const authUser = await User.findOneAndUpdate(
      { username: u.username },
      { username: u.username, email: u.email, role: u.role, password: hashedPassword },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userMap[u.username] = authUser._id.toString();
    
    await Profile.findOneAndUpdate(
      { username: u.username },
      { userId: authUser._id.toString(), username: u.username, email: u.email, role: u.role, firstName: u.first, lastName: u.last, department: u.dept },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  metrics.users = SEED_USERS.length;
  await connAuth.close(); await connUsers.close();

  // 2. COURSES
  console.log('\n[2/12] Seeding courses & enrollments...');
  const connCourses = await connect(uri('courses'), 'edusphere_courses');
  const Course = connCourses.model('Course', new mongoose.Schema({ title: String, code: String, department: String, facultyOwnerId: String, status: String, credits: Number, capacity: Number, enrolledStudents: [String] }, {strict: false}));

  // Create 10 courses
  const coursesData = [
    { title: 'Intro to Programming', code: 'CS101', dept: 'CSE', fac: 'faculty_1', status: 'published', students: ['student_1', 'student_2'] },
    { title: 'Data Structures', code: 'CS201', dept: 'CSE', fac: 'faculty_1', status: 'published', students: ['student_1', 'student_2'] },
    { title: 'Algorithms', code: 'CS301', dept: 'CSE', fac: 'faculty_2', status: 'published', students: ['student_1'] },
    { title: 'Operating Systems', code: 'CS401', dept: 'CSE', fac: 'faculty_2', status: 'published', students: ['student_2'] },
    { title: 'Machine Learning', code: 'CS501', dept: 'CSE', fac: 'faculty_2', status: 'pending', students: [] }, // Edge case: zero students, pending
    { title: 'Digital Logic', code: 'EC101', dept: 'ECE', fac: 'faculty_3', status: 'published', students: ['student_3'] },
    { title: 'Signals and Systems', code: 'EC201', dept: 'ECE', fac: 'faculty_3', status: 'published', students: ['student_3'] },
    { title: 'Microprocessors', code: 'EC301', dept: 'ECE', fac: 'faculty_3', status: 'published', students: ['student_3'] },
    { title: 'VLSI Design', code: 'EC401', dept: 'ECE', fac: 'faculty_3', status: 'published', students: [] },
    { title: 'Wireless Comms', code: 'EC501', dept: 'ECE', fac: 'faculty_3', status: 'pending', students: [] },
  ];

  let courseMap = {};
  for (const c of coursesData) {
    const studentIds = c.students.map(s => userMap[s]);
    const course = await Course.findOneAndUpdate(
      { code: c.code },
      { title: c.title, code: c.code, department: c.dept, facultyOwnerId: userMap[c.fac], status: c.status, credits: 3, capacity: 60, enrolledStudents: studentIds },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    courseMap[c.code] = { id: course._id.toString(), students: studentIds, title: c.title, facId: userMap[c.fac] };
  }
  metrics.courses = coursesData.length;
  await connCourses.close();

  // 3. ATTENDANCE & LEAVES
  console.log('\n[3/12] Seeding attendance & leaves...');
  const connAtt = await connect(uri('attendance'), 'edusphere_attendance');
  const Attendance = connAtt.model('AttendanceRecord', new mongoose.Schema({ courseId: String, studentId: String, date: Date, status: String }, {strict: false}));
  const Leave = connAtt.model('LeaveRequest', new mongoose.Schema({ userId: String, type: String, startDate: Date, endDate: Date, reason: String, status: String }, {strict: false}));

  let attCount = 0;
  for (const cCode of Object.keys(courseMap)) {
    const cData = courseMap[cCode];
    if (cData.students.length === 0) continue;
    // 10 days of attendance
    for (let i = 0; i < 10; i++) {
      const d = randomDate(10 - i);
      for (const sId of cData.students) {
        const isPresent = Math.random() > 0.2;
        await Attendance.findOneAndUpdate(
          { courseId: cData.id, studentId: sId, date: { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) } },
          { courseId: cData.id, studentId: sId, date: d, status: isPresent ? 'present' : 'absent' },
          { upsert: true }
        );
        attCount++;
      }
    }
  }
  
  // 10 leave requests
  const leaveTypes = ['sick', 'casual', 'academic'];
  const leaveStatuses = ['pending', 'approved', 'rejected'];
  for (let i = 0; i < 10; i++) {
    const sName = ['student_1', 'student_2', 'student_3'][i % 3];
    const sId = userMap[sName];
    const d = randomDate(5, 5); // Some in past, some in future
    await Leave.findOneAndUpdate(
      { userId: sId, reason: `Leave Request ${i}` },
      { userId: sId, type: leaveTypes[i % 3], startDate: d, endDate: new Date(d.getTime() + 86400000), reason: `Leave Request ${i}`, status: leaveStatuses[i % 3] },
      { upsert: true }
    );
  }
  metrics.attendance = attCount;
  metrics.leaves = 10;
  await connAtt.close();

  // 4. ASSIGNMENTS
  console.log('\n[4/12] Seeding assignments...');
  const connAssig = await connect(uri('assignments'), 'edusphere_assignments');
  const Assignment = connAssig.model('Assignment', new mongoose.Schema({ courseId: String, title: String, description: String, dueDate: Date, maxScore: Number }, {strict: false}));
  const Submission = connAssig.model('Submission', new mongoose.Schema({ assignmentId: String, studentId: String, submittedAt: Date, score: Number, status: String }, {strict: false}));

  let assignCount = 0;
  let subCount = 0;
  const activeCourseCodes = ['CS101', 'CS201', 'EC101', 'EC201']; // Spread 10 assignments over these
  for (let i = 0; i < 10; i++) {
    const code = activeCourseCodes[i % activeCourseCodes.length];
    const cData = courseMap[code];
    const dueDate = randomDate(i % 2 === 0 ? 2 : -2); // Some due soon, some overdue
    const assig = await Assignment.findOneAndUpdate(
      { courseId: cData.id, title: `Assignment ${i+1} for ${code}` },
      { courseId: cData.id, title: `Assignment ${i+1} for ${code}`, description: 'Please complete this assignment.', dueDate, maxScore: 100 },
      { upsert: true, new: true }
    );
    assignCount++;
    
    // Create submissions for enrolled students
    // Leave some without submissions for edge cases (e.g. index 9)
    if (i !== 9) {
      for (const sId of cData.students) {
        const isGraded = Math.random() > 0.5;
        await Submission.findOneAndUpdate(
          { assignmentId: assig._id.toString(), studentId: sId },
          { assignmentId: assig._id.toString(), studentId: sId, submittedAt: randomDate(3), score: isGraded ? 85 : null, status: isGraded ? 'graded' : 'submitted' },
          { upsert: true }
        );
        subCount++;
      }
    }
  }
  metrics.assignments = assignCount;
  metrics.submissions = subCount;
  await connAssig.close();

  // 5. ASSESSMENTS
  console.log('\n[5/12] Seeding assessments...');
  const connAssess = await connect(uri('assessments'), 'edusphere_assessments');
  const Assessment = connAssess.model('Assessment', new mongoose.Schema({ courseId: String, title: String, totalMarks: Number }, {strict: false}));
  const Attempt = connAssess.model('Attempt', new mongoose.Schema({ assessmentId: String, studentId: String, score: Number, completedAt: Date }, {strict: false}));

  let quizCount = 0;
  let attemptCount = 0;
  for (let i = 0; i < 10; i++) {
    const code = activeCourseCodes[i % activeCourseCodes.length];
    const cData = courseMap[code];
    const assess = await Assessment.findOneAndUpdate(
      { courseId: cData.id, title: `Quiz ${i+1} - ${code}` },
      { courseId: cData.id, title: `Quiz ${i+1} - ${code}`, totalMarks: 50 },
      { upsert: true, new: true }
    );
    quizCount++;

    if (i !== 9) {
      for (const sId of cData.students) {
        await Attempt.findOneAndUpdate(
          { assessmentId: assess._id.toString(), studentId: sId },
          { assessmentId: assess._id.toString(), studentId: sId, score: Math.floor(Math.random() * 20) + 30, completedAt: randomDate(2) },
          { upsert: true }
        );
        attemptCount++;
      }
    }
  }
  metrics.assessments = quizCount;
  metrics.attempts = attemptCount;
  await connAssess.close();

  // 6. CERTIFICATES
  console.log('\n[6/12] Seeding certificates...');
  const connCert = await connect(uri('certificates'), 'edusphere_certificates');
  const Certificate = connCert.model('Certificate', new mongoose.Schema({ studentId: String, courseId: String, issuedDate: Date, title: String }, {strict: false}));
  
  let certCount = 0;
  for (const sName of ['student_1', 'student_2', 'student_3']) {
    const sId = userMap[sName];
    const code = sName === 'student_3' ? 'EC101' : 'CS101';
    await Certificate.findOneAndUpdate(
      { studentId: sId, courseId: courseMap[code].id },
      { studentId: sId, courseId: courseMap[code].id, issuedDate: randomDate(1), title: `Certificate of Completion - ${code}` },
      { upsert: true }
    );
    certCount++;
  }
  metrics.certificates = certCount;
  await connCert.close();

  // 7. DISCUSSIONS
  console.log('\n[7/12] Seeding discussions...');
  const connDisc = await connect(uri('discussions'), 'edusphere_discussions');
  const Thread = connDisc.model('Thread', new mongoose.Schema({ courseId: String, authorId: String, title: String, content: String, replies: Array }, {strict: false}));

  let threadCount = 0;
  for (let i = 0; i < 10; i++) {
    const code = activeCourseCodes[i % activeCourseCodes.length];
    const cData = courseMap[code];
    const sId = cData.students[0];
    const fId = cData.facId;
    
    if(!sId) continue; // Skip if no students
    
    await Thread.findOneAndUpdate(
      { courseId: cData.id, title: `Discussion Topic ${i+1}` },
      { 
        courseId: cData.id, authorId: sId, title: `Discussion Topic ${i+1}`, content: 'Can someone explain this topic?',
        replies: [
          { authorId: fId, content: 'Sure, here is the explanation.', createdAt: new Date() }
        ]
      },
      { upsert: true }
    );
    threadCount++;
  }
  metrics.discussions = threadCount;
  await connDisc.close();

  // 8. LIBRARY
  console.log('\n[8/12] Seeding library...');
  const connLib = await connect(uri('library'), 'edusphere_library');
  const Book = connLib.model('Book', new mongoose.Schema({ title: String, author: String, isbn: String, available: Number, total: Number }, {strict: false}));
  const Issue = connLib.model('Issue', new mongoose.Schema({ bookId: String, userId: String, issueDate: Date, dueDate: Date, status: String }, {strict: false}));

  let bookCount = 0;
  let issueCount = 0;
  for (let i = 0; i < 10; i++) {
    const book = await Book.findOneAndUpdate(
      { isbn: `978-000000000${i}` },
      { title: `Engineering Textbook ${i+1}`, author: `Author ${i+1}`, isbn: `978-000000000${i}`, available: 4, total: 5 },
      { upsert: true, new: true }
    );
    bookCount++;

    if (i < 3) {
      const sId = userMap[`student_${i+1}`];
      await Issue.findOneAndUpdate(
        { bookId: book._id.toString(), userId: sId, status: 'issued' },
        { bookId: book._id.toString(), userId: sId, issueDate: randomDate(5), dueDate: randomDate(-5), status: 'issued' },
        { upsert: true }
      );
      issueCount++;
    }
  }
  metrics.books = bookCount;
  metrics.issues = issueCount;
  await connLib.close();

  // 9. PLACEMENTS
  console.log('\n[9/12] Seeding placements...');
  const connPlace = await connect(uri('placements'), 'edusphere_placements');
  const Drive = connPlace.model('Drive', new mongoose.Schema({ companyName: String, role: String, eligibility: String, date: Date, status: String }, {strict: false}));
  const App = connPlace.model('Application', new mongoose.Schema({ driveId: String, studentId: String, status: String }, {strict: false}));

  let driveCount = 0;
  let appCount = 0;
  for (let i = 0; i < 10; i++) {
    const drive = await Drive.findOneAndUpdate(
      { companyName: `Tech Corp ${i+1}`, role: 'Software Engineer' },
      { companyName: `Tech Corp ${i+1}`, role: 'Software Engineer', eligibility: '> 7.0 CGPA', date: randomDate(-10), status: 'open' },
      { upsert: true, new: true }
    );
    driveCount++;

    if (i < 5) {
      const sId = userMap['student_1'];
      await App.findOneAndUpdate(
        { driveId: drive._id.toString(), studentId: sId },
        { driveId: drive._id.toString(), studentId: sId, status: 'applied' },
        { upsert: true }
      );
      appCount++;
    }
  }
  metrics.drives = driveCount;
  metrics.jobApps = appCount;
  await connPlace.close();

  // 10. NOTIFICATIONS
  console.log('\n[10/12] Seeding notifications...');
  const connNotif = await connect(uri('notifications'), 'edusphere_notifications');
  const Notification = connNotif.model('Notification', new mongoose.Schema({ userId: String, title: String, message: String, read: Boolean, createdAt: Date }, {strict: false}));

  let notifCount = 0;
  for (const sName of ['student_1', 'faculty_1', 'admin_1', 'management_1']) {
    const sId = userMap[sName];
    for(let i=0; i<5; i++) {
      await Notification.findOneAndUpdate(
        { userId: sId, title: `System Notice ${i+1}` },
        { userId: sId, title: `System Notice ${i+1}`, message: 'This is an important update.', read: i%2===0, createdAt: randomDate(i) },
        { upsert: true }
      );
      notifCount++;
    }
  }
  metrics.notifications = notifCount;
  await connNotif.close();

  // PRINT SUMMARY
  console.log('\n══════════════════════════════════════════════════');
  console.log('                 SEEDING COMPLETE                 ');
  console.log('══════════════════════════════════════════════════');
  
  console.log('\n✅ Records Created/Upserted:');
  console.log(`  - Users: ${metrics.users}`);
  console.log(`  - Courses: ${metrics.courses}`);
  console.log(`  - Attendance Records: ${metrics.attendance}`);
  console.log(`  - Leave Requests: ${metrics.leaves}`);
  console.log(`  - Assignments: ${metrics.assignments} (Submissions: ${metrics.submissions})`);
  console.log(`  - Quizzes: ${metrics.assessments} (Attempts: ${metrics.attempts})`);
  console.log(`  - Certificates: ${metrics.certificates}`);
  console.log(`  - Discussions: ${metrics.discussions}`);
  console.log(`  - Library Books: ${metrics.books} (Issues: ${metrics.issues})`);
  console.log(`  - Placement Drives: ${metrics.drives} (Apps: ${metrics.jobApps})`);
  console.log(`  - Notifications: ${metrics.notifications}`);
  
  console.log('\n🔐 Test Accounts (Password: demo123):');
  console.table(SEED_USERS.map(u => ({ Username: u.username, Role: u.role, Department: u.dept })));
  console.log('\nAll done! You can now log in using these credentials.');
}

seedAll().then(() => process.exit(0)).catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
