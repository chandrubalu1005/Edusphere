#!/usr/bin/env node
const mongoose = require('mongoose');

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DEMO_SEED_VERSION = 'demo-40-days-v1';

function uri(db) {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  return process.env[`MONGO_URI_${db.toUpperCase()}`] || `mongodb://${MONGO_HOST}:${MONGO_PORT}/edusphere_${db}`;
}

async function connect(dbUri, label) {
  return await mongoose.createConnection(dbUri).asPromise();
}

async function validateAll() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — Demo Data Validation');
  console.log('══════════════════════════════════════════════════\n');

  const dbs = {
    auth: await connect(uri('auth'), 'edusphere_auth'),
    courses: await connect(uri('courses'), 'edusphere_courses'),
    assignments: await connect(uri('assignments'), 'edusphere_assignments'),
    attendance: await connect(uri('attendance'), 'edusphere_attendance'),
    library: await connect(uri('library'), 'edusphere_library')
  };

  const model = (db, name) => dbs[db].model(name, new mongoose.Schema({}, { strict: false }));

  const User = model('auth', 'User');
  const Course = model('courses', 'Course');
  const Assignment = model('assignments', 'Assignment');
  const Submission = model('assignments', 'Submission');
  const Attendance = model('attendance', 'AttendanceRecord');
  const Issue = model('library', 'Issue');
  const Book = model('library', 'Book');

  let errors = 0;
  
  // 1. Basic counts
  const users = await User.countDocuments({ demoSeed: DEMO_SEED_VERSION });
  console.log(`Users ................ ${users > 0 ? 'PASS' : 'FAIL'} (${users})`);
  if (users === 0) errors++;

  const courses = await Course.countDocuments({ demoSeed: DEMO_SEED_VERSION });
  console.log(`Courses .............. ${courses > 0 ? 'PASS' : 'FAIL'} (${courses})`);
  if (courses === 0) errors++;
  
  const assignments = await Assignment.countDocuments({ demoSeed: DEMO_SEED_VERSION });
  console.log(`Assignments .......... ${assignments > 0 ? 'PASS' : 'FAIL'} (${assignments})`);
  if (assignments === 0) errors++;

  // 2. Referential Integrity Check - Orphans
  // Submissions without valid assignments
  const submissions = await Submission.find({ demoSeed: DEMO_SEED_VERSION });
  let orphanSubs = 0;
  for (const s of submissions) {
     const a = await Assignment.findById(s.assignmentId);
     if (!a) orphanSubs++;
  }
  console.log(`Orphan Submissions ... ${orphanSubs === 0 ? 'PASS' : 'FAIL'} (${orphanSubs})`);
  if (orphanSubs > 0) errors++;

  // Attendance without valid courses
  const atts = await Attendance.find({ demoSeed: DEMO_SEED_VERSION }).limit(100); // sample
  let orphanAtts = 0;
  for (const a of atts) {
     const c = await Course.findById(a.courseId);
     if (!c) orphanAtts++;
  }
  console.log(`Orphan Attendance (Sample 100) ... ${orphanAtts === 0 ? 'PASS' : 'FAIL'} (${orphanAtts})`);
  if (orphanAtts > 0) errors++;

  // Library issues without valid books
  const issues = await Issue.find({ demoSeed: DEMO_SEED_VERSION });
  let orphanIssues = 0;
  for (const i of issues) {
     const b = await Book.findById(i.bookId);
     if (!b) orphanIssues++;
  }
  console.log(`Orphan Lib Issues .... ${orphanIssues === 0 ? 'PASS' : 'FAIL'} (${orphanIssues})`);
  if (orphanIssues > 0) errors++;
  
  console.log('\n====================================================');
  console.log(`RESULT: ${errors === 0 ? 'PASS' : 'FAIL'}`);
  console.log('====================================================');

  for (const key in dbs) await dbs[key].close();
  
  process.exit(errors === 0 ? 0 : 1);
}

validateAll().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
