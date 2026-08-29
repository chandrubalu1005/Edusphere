#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DEMO_SEED_VERSION = 'demo-40-days-v1';
const DEMO_PASSWORD = 'demo123';

function uri(db) {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  return process.env[`MONGO_URI_${db.toUpperCase()}`] || `mongodb://${MONGO_HOST}:${MONGO_PORT}/edusphere_${db}`;
}

async function connect(dbUri, label) {
  const conn = await mongoose.createConnection(dbUri).asPromise();
  console.log(`  ✓ Connected to ${label}`);
  return conn;
}

// PRNG for determinism (xoshiro128ss or similar simple LCG)
let seed = 123456789;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomDate(daysAgo, daysAhead = 0) {
  const base = Date.now();
  const past = base - daysAgo * 86400000;
  const future = base + daysAhead * 86400000;
  return new Date(past + random() * (future - past));
}

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

const PRESERVED_USERS = [
  { username: 'student_1', role: 'student', dept: 'CSE', first: 'Student', last: 'One', email: 'student_1@edusphere.edu' },
  { username: 'student_2', role: 'student', dept: 'CSE', first: 'Student', last: 'Two', email: 'student_2@edusphere.edu' },
  { username: 'student_3', role: 'student', dept: 'ECE', first: 'Student', last: 'Three', email: 'student_3@edusphere.edu' },
  { username: 'faculty_1', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'One', email: 'faculty_1@edusphere.edu' },
  { username: 'faculty_2', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'Two', email: 'faculty_2@edusphere.edu' },
  { username: 'faculty_3', role: 'faculty', dept: 'ECE', first: 'Faculty', last: 'Three', email: 'faculty_3@edusphere.edu' },
  { username: 'admin_1', role: 'admin', dept: 'Administration', first: 'Admin', last: 'One', email: 'admin_1@edusphere.edu' },
  { username: 'management_1', role: 'management', dept: 'Management', first: 'Management', last: 'One', email: 'management_1@edusphere.edu' }
];

async function seedAll() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — 40-Day Demo Data Seed');
  console.log('══════════════════════════════════════════════════\n');

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  let metrics = {};

  // Connect all DBs
  const dbs = {
    auth: await connect(uri('auth'), 'edusphere_auth'),
    users: await connect(uri('users'), 'edusphere_users'),
    courses: await connect(uri('courses'), 'edusphere_courses'),
    attendance: await connect(uri('attendance'), 'edusphere_attendance'),
    assignments: await connect(uri('assignments'), 'edusphere_assignments'),
    assessments: await connect(uri('assessments'), 'edusphere_assessments'),
    timetable: await connect(uri('timetable'), 'edusphere_timetable'),
    calendar: await connect(uri('calendar'), 'edusphere_calendar'),
    library: await connect(uri('library'), 'edusphere_library'),
    placements: await connect(uri('placements'), 'edusphere_placements'),
    finance: await connect(uri('finance'), 'edusphere_finance'),
    certificates: await connect(uri('certificates'), 'edusphere_certificates'),
    discussions: await connect(uri('discussions'), 'edusphere_discussions'),
    notifications: await connect(uri('notifications'), 'edusphere_notifications')
  };

  const model = (db, name) => dbs[db].model(name, new mongoose.Schema({}, { strict: false }));

  // Models
  const User = model('auth', 'User');
  const Profile = model('users', 'Profile');
  const Course = model('courses', 'Course');
  const Attendance = model('attendance', 'AttendanceRecord');
  const Assignment = model('assignments', 'Assignment');
  const Submission = model('assignments', 'Submission');
  const Assessment = model('assessments', 'Assessment');
  const Attempt = model('assessments', 'Attempt');
  const Timetable = model('timetable', 'Timetable');
  const CalendarEvent = model('calendar', 'Event');
  const Book = model('library', 'Book');
  const Issue = model('library', 'Issue');
  const Drive = model('placements', 'Drive');
  const App = model('placements', 'Application');
  const Fee = model('finance', 'Fee');
  const Transaction = model('finance', 'Transaction');
  const Certificate = model('certificates', 'Certificate');
  const Thread = model('discussions', 'Thread');
  const Notification = model('notifications', 'Notification');

  console.log('\n[1/15] Seeding Users (Auth & Profiles)...');
  let userMap = {};
  let studentsList = [];
  let facultyList = [];

  // Base Users
  for (const u of PRESERVED_USERS) {
    const authUser = await User.findOneAndUpdate(
      { username: u.username },
      { username: u.username, email: u.email, role: u.role, password: hashedPassword, demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userMap[u.username] = authUser._id.toString();
    await Profile.findOneAndUpdate(
      { username: u.username },
      { userId: authUser._id.toString(), username: u.username, email: u.email, role: u.role, firstName: u.first, lastName: u.last, department: u.dept, demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (u.role === 'student') studentsList.push(authUser._id.toString());
    if (u.role === 'faculty') facultyList.push(authUser._id.toString());
  }

  // Generate 50 extra students
  for (let i = 1; i <= 50; i++) {
    const username = `student_gen_${i}`;
    const authUser = await User.findOneAndUpdate(
      { username },
      { username, email: `${username}@edusphere.edu`, role: 'student', password: hashedPassword, demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userMap[username] = authUser._id.toString();
    await Profile.findOneAndUpdate(
      { username },
      { userId: authUser._id.toString(), username, email: `${username}@edusphere.edu`, role: 'student', firstName: 'Student', lastName: `Gen${i}`, department: randomItem(['CSE', 'ECE', 'MECH']), demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    studentsList.push(authUser._id.toString());
  }

  // Generate 10 extra faculty
  for (let i = 1; i <= 10; i++) {
    const username = `faculty_gen_${i}`;
    const authUser = await User.findOneAndUpdate(
      { username },
      { username, email: `${username}@edusphere.edu`, role: 'faculty', password: hashedPassword, demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userMap[username] = authUser._id.toString();
    await Profile.findOneAndUpdate(
      { username },
      { userId: authUser._id.toString(), username, email: `${username}@edusphere.edu`, role: 'faculty', firstName: 'Faculty', lastName: `Gen${i}`, department: randomItem(['CSE', 'ECE', 'MECH']), demoSeed: DEMO_SEED_VERSION },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    facultyList.push(authUser._id.toString());
  }
  metrics.users = PRESERVED_USERS.length + 60;
  console.log(`  ✓ Generated ${metrics.users} users`);

  console.log('\n[2/15] Seeding Courses & Enrollments...');
  const courseData = [
    { title: 'Intro to Programming', code: 'CS101', dept: 'CSE' },
    { title: 'Data Structures', code: 'CS201', dept: 'CSE' },
    { title: 'Algorithms', code: 'CS301', dept: 'CSE' },
    { title: 'Operating Systems', code: 'CS401', dept: 'CSE' },
    { title: 'Database Systems', code: 'CS501', dept: 'CSE' },
    { title: 'Machine Learning', code: 'CS601', dept: 'CSE' },
    { title: 'Digital Logic', code: 'EC101', dept: 'ECE' },
    { title: 'Signals and Systems', code: 'EC201', dept: 'ECE' },
    { title: 'Microprocessors', code: 'EC301', dept: 'ECE' },
    { title: 'VLSI Design', code: 'EC401', dept: 'ECE' },
    { title: 'Thermodynamics', code: 'ME101', dept: 'MECH' },
    { title: 'Fluid Mechanics', code: 'ME201', dept: 'MECH' },
  ];

  let activeCourses = [];
  for (const c of courseData) {
    // Select a random faculty member
    const facId = facultyList[randomInt(0, facultyList.length - 1)];
    
    // Assign a random subset of 30-40 students to each course
    let enrolled = [];
    let studentsCopy = [...studentsList];
    for (let i = studentsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [studentsCopy[i], studentsCopy[j]] = [studentsCopy[j], studentsCopy[i]];
    }
    
    enrolled = studentsCopy.slice(0, randomInt(30, 40));
    // Ensure primary demo students are in CS101, CS201, CS301
    if (['CS101', 'CS201', 'CS301'].includes(c.code)) {
       const s1 = userMap['student_1'];
       if (!enrolled.includes(s1)) enrolled.push(s1);
    }

    const course = await Course.findOneAndUpdate(
      { code: c.code },
      { 
        title: c.title, code: c.code, department: c.dept, 
        facultyOwnerId: facId, status: 'published', credits: 3, capacity: 60, 
        enrolledStudents: enrolled, demoSeed: DEMO_SEED_VERSION 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    activeCourses.push({ id: course._id.toString(), code: c.code, facId, students: enrolled });
  }
  metrics.courses = activeCourses.length;
  console.log(`  ✓ Generated ${metrics.courses} courses and enrollments`);

  console.log('\n[3/15] Seeding Timetable...');
  let timetableEntries = 0;
  for (const c of activeCourses) {
    // 2 classes per week for each course
    const days = [1, 2, 3, 4, 5]; // Mon to Fri
    const d1 = days[randomInt(0, 4)];
    const d2 = days[(randomInt(0, 4) + 2) % 5];
    
    await Timetable.findOneAndUpdate(
      { courseId: c.id, dayOfWeek: d1 },
      { courseId: c.id, facultyId: c.facId, dayOfWeek: d1, startTime: '10:00', endTime: '11:00', room: `Room ${randomInt(100, 300)}`, demoSeed: DEMO_SEED_VERSION },
      { upsert: true }
    );
    await Timetable.findOneAndUpdate(
      { courseId: c.id, dayOfWeek: d2 },
      { courseId: c.id, facultyId: c.facId, dayOfWeek: d2, startTime: '14:00', endTime: '15:00', room: `Room ${randomInt(100, 300)}`, demoSeed: DEMO_SEED_VERSION },
      { upsert: true }
    );
    timetableEntries += 2;
  }
  metrics.timetable = timetableEntries;
  console.log(`  ✓ Generated ${metrics.timetable} timetable slots`);

  console.log('\n[4/15] The 40-Day Loop (Attendance, Assignments, Notifications)...');
  let attCount = 0;
  let notifCount = 0;
  let assignCount = 0;
  let subCount = 0;
  let gradeCount = 0;

  const now = Date.now();
  
  // Create 3 assignments per course spread over 40 days
  for (const c of activeCourses) {
    for (let a = 1; a <= 3; a++) {
      const daysAgoCreated = randomInt(5, 35);
      const daysAgoDue = daysAgoCreated - 7;
      
      const createdDate = new Date(now - daysAgoCreated * 86400000);
      const dueDate = new Date(now - daysAgoDue * 86400000);
      
      const status = daysAgoDue > 0 ? 'closed' : 'published';
      
      const assig = await Assignment.findOneAndUpdate(
        { courseId: c.id, title: `Assignment ${a} - ${c.code}` },
        { 
          courseId: c.id, title: `Assignment ${a} - ${c.code}`, description: 'Complete tasks.', 
          dueDate, maxScore: 100, status, createdAt: createdDate, demoSeed: DEMO_SEED_VERSION 
        },
        { upsert: true, new: true }
      );
      assignCount++;
      
      // Notify students
      for (const sId of c.students) {
         if (random() > 0.9) continue; // 10% miss the notification
         await Notification.findOneAndUpdate(
           { userId: sId, title: `New Assignment: ${c.code}` },
           { userId: sId, title: `New Assignment: ${c.code}`, message: `Assignment ${a} has been published.`, read: daysAgoCreated > 3, createdAt: createdDate, demoSeed: DEMO_SEED_VERSION },
           { upsert: true }
         );
         notifCount++;
      }

      // Submissions
      for (const sId of c.students) {
        const submits = random() > 0.15; // 85% submission rate
        if (submits) {
           const subDate = new Date(dueDate.getTime() - randomInt(1, 48) * 3600000); // 1-48 hours before due
           const isGraded = status === 'closed' && random() > 0.1; // If closed, 90% graded
           const score = isGraded ? randomInt(40, 100) : null;
           
           await Submission.findOneAndUpdate(
             { assignmentId: assig._id.toString(), studentId: sId },
             { assignmentId: assig._id.toString(), studentId: sId, submittedAt: subDate, score, status: isGraded ? 'graded' : 'submitted', demoSeed: DEMO_SEED_VERSION },
             { upsert: true }
           );
           subCount++;
           if (isGraded) gradeCount++;
           
           if (isGraded) {
             await Notification.findOneAndUpdate(
               { userId: sId, title: `Grade Published: ${c.code}` },
               { userId: sId, title: `Grade Published: ${c.code}`, message: `Grade published for Assignment ${a}.`, read: true, createdAt: new Date(dueDate.getTime() + 86400000), demoSeed: DEMO_SEED_VERSION },
               { upsert: true }
             );
             notifCount++;
           }
        }
      }
    }
  }

  // 40 days of attendance
  for (let day = 40; day >= 0; day--) {
    const dDate = new Date(now - day * 86400000);
    const dayOfWeek = dDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
    
    // Find courses with classes today
    // (mocking simple logic, let's just generate attendance for a random subset of courses to represent classes)
    for (const c of activeCourses) {
      if (random() > 0.4) continue; // 60% chance of class today for this course
      
      for (const sId of c.students) {
         // Some students have bad attendance risk
         const sIndex = studentsList.indexOf(sId);
         let riskFactor = 0.9; // 90% present
         if (sIndex % 10 === 0) riskFactor = 0.5; // High risk student
         if (sIndex === 0) riskFactor = 0.95; // Student 1 is excellent
         
         const isPresent = random() < riskFactor;
         
         await Attendance.findOneAndUpdate(
           { courseId: c.id, studentId: sId, date: { $gte: new Date(dDate.setHours(0,0,0,0)), $lt: new Date(dDate.setHours(23,59,59,999)) } },
           { courseId: c.id, studentId: sId, date: dDate, status: isPresent ? 'present' : 'absent', demoSeed: DEMO_SEED_VERSION },
           { upsert: true }
         );
         attCount++;
         
         // Generate attendance warning if absent and random chance
         if (!isPresent && random() > 0.8) {
             await Notification.findOneAndUpdate(
               { userId: sId, title: `Attendance Warning: ${c.code}` },
               { userId: sId, title: `Attendance Warning: ${c.code}`, message: `You were marked absent on ${dDate.toDateString()}.`, read: day > 2, createdAt: dDate, demoSeed: DEMO_SEED_VERSION },
               { upsert: true }
             );
             notifCount++;
         }
      }
    }
  }
  
  metrics.assignments = assignCount;
  metrics.submissions = subCount;
  metrics.grades = gradeCount;
  metrics.attendance = attCount;
  metrics.notifications = notifCount;
  console.log(`  ✓ Generated ${metrics.assignments} assignments, ${metrics.submissions} submissions`);
  console.log(`  ✓ Generated ${metrics.attendance} attendance records`);
  console.log(`  ✓ Generated ${metrics.notifications} domain event notifications`);

  console.log('\n[5/15] Seeding Assessments...');
  let assessCount = 0;
  let attemptCount = 0;
  for (const c of activeCourses) {
     const assess = await Assessment.findOneAndUpdate(
        { courseId: c.id, title: `Midterm Exam - ${c.code}` },
        { courseId: c.id, title: `Midterm Exam - ${c.code}`, totalMarks: 100, demoSeed: DEMO_SEED_VERSION },
        { upsert: true, new: true }
     );
     assessCount++;
     for (const sId of c.students) {
         if (random() > 0.05) {
             const sessionIdStr = new mongoose.Types.ObjectId().toString();
             await Attempt.findOneAndUpdate(
               { assessmentId: assess._id.toString(), studentId: sId },
               { assessmentId: assess._id.toString(), studentId: sId, sessionId: sessionIdStr, score: randomInt(40, 95), completedAt: randomDate(15), demoSeed: DEMO_SEED_VERSION },
               { upsert: true }
             );
             attemptCount++;
         }
     }
  }
  metrics.assessments = assessCount;
  metrics.attempts = attemptCount;
  console.log(`  ✓ Generated ${metrics.assessments} assessments, ${metrics.attempts} attempts`);

  console.log('\n[6/15] Seeding Library...');
  let bookCount = 0;
  let issueCount = 0;
  for (let i = 1; i <= 20; i++) {
     const book = await Book.findOneAndUpdate(
        { isbn: `978-DEMO-${i}` },
        { title: `Reference Book ${i}`, author: `Author ${i}`, isbn: `978-DEMO-${i}`, available: randomInt(1, 5), total: 5, category: 'Engineering', demoSeed: DEMO_SEED_VERSION },
        { upsert: true, new: true }
     );
     bookCount++;
     
     if (i <= 5) {
        // Issue to student 1
        await Issue.findOneAndUpdate(
           { bookId: book._id.toString(), userId: userMap['student_1'] },
           { bookId: book._id.toString(), userId: userMap['student_1'], issueDate: randomDate(10), dueDate: randomDate(-5), status: 'issued', demoSeed: DEMO_SEED_VERSION },
           { upsert: true }
        );
        issueCount++;
     }
  }
  metrics.books = bookCount;
  metrics.libraryIssues = issueCount;
  console.log(`  ✓ Generated ${metrics.books} books, ${metrics.libraryIssues} active issues`);

  console.log('\n[7/15] Seeding Placements...');
  let driveCount = 0;
  let appCount = 0;
  for (let i = 1; i <= 5; i++) {
     const drive = await Drive.findOneAndUpdate(
        { companyName: `Enterprise Tech ${i}` },
        { companyName: `Enterprise Tech ${i}`, role: 'Software Engineer', eligibility: '> 7.0 CGPA', date: randomDate(-20, 20), status: 'open', demoSeed: DEMO_SEED_VERSION },
        { upsert: true, new: true }
     );
     driveCount++;
     
     // Application for student_1
     await App.findOneAndUpdate(
        { driveId: drive._id.toString(), studentId: userMap['student_1'] },
        { driveId: drive._id.toString(), studentId: userMap['student_1'], status: randomItem(['applied', 'interview', 'selected']), demoSeed: DEMO_SEED_VERSION },
        { upsert: true }
     );
     appCount++;
  }
  metrics.drives = driveCount;
  metrics.placementApps = appCount;
  console.log(`  ✓ Generated ${metrics.drives} placement drives, ${metrics.placementApps} applications`);

  console.log('\n[8/15] Seeding Finances...');
  let feeCount = 0;
  for (const sId of studentsList) {
      await Fee.findOneAndUpdate(
         { studentId: sId, title: 'Tuition Fee 2026' },
         { studentId: sId, title: 'Tuition Fee 2026', totalAmount: 50000, paidAmount: random() > 0.5 ? 50000 : 25000, status: random() > 0.5 ? 'paid' : 'partial', dueDate: randomDate(0, 30), demoSeed: DEMO_SEED_VERSION },
         { upsert: true }
      );
      feeCount++;
  }
  metrics.fees = feeCount;
  console.log(`  ✓ Generated ${metrics.fees} fee records`);

  console.log('\n[9/15] Closing connections...');
  for (const key in dbs) {
     await dbs[key].close();
  }
  
  console.log('\n══════════════════════════════════════════════════');
  console.log('                 SEEDING COMPLETE                 ');
  console.log('══════════════════════════════════════════════════\n');
  
  console.table(metrics);
  console.log('\nAll done! Next: restart system and validate data.');
}

seedAll().then(() => process.exit(0)).catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
