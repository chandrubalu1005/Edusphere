require('dotenv').config();
const mongoose = require('mongoose');

const seedAuthUsers = require('./01-auth-users');
const seedAcademicFoundation = require('./02-academic-foundation');
const seedCourses = require('./03-courses-offerings');
const seedEnrollments = require('./04-enrollments');
const seedAttendance = require('./05-timetables-attendance');
const seedAssessments = require('./06-assessments-assignments');
const seedPlacements = require('./07-placements-approvals');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere';

async function runSeed() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — Master Data Seed (Relational)');
  console.log('══════════════════════════════════════════════════\n');

  try {
    console.log(`[0/8] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('  ✓ Database connected successfully.');

    // We will drop the database entirely to ensure idempotency and clean state.
    console.log('\n[0/8] Dropping existing database to ensure clean state...');
    await mongoose.connection.db.dropDatabase();
    console.log('  ✓ Database dropped.');

    const ctx = {}; // Context object to pass shared ObjectIds (like institutionId, departmentIds)

    console.log('\n[1/8] Seeding Auth & Users...');
    await seedAuthUsers(ctx);

    console.log('\n[2/8] Seeding Academic Foundation (Institutions, Depts, Programs)...');
    await seedAcademicFoundation(ctx);

    console.log('\n[3/8] Seeding Courses & Offerings...');
    await seedCourses(ctx);

    console.log('\n[4/8] Seeding Enrollments...');
    await seedEnrollments(ctx);

    console.log('\n[5/8] Seeding Timetables & Attendance...');
    await seedAttendance(ctx);

    console.log('\n[6/8] Seeding Assessments & Assignments...');
    await seedAssessments(ctx);

    console.log('\n[7/8] Seeding Placements & Approvals...');
    await seedPlacements(ctx);

    console.log('\n✅ Master seed completed successfully!');

  } catch (error) {
    console.error('\n❌ Master seed failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runSeed();
