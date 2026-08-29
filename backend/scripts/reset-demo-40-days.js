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
  const conn = await mongoose.createConnection(dbUri).asPromise();
  console.log(`  ✓ Connected to ${label}`);
  return conn;
}

async function resetAll() {
  console.log('══════════════════════════════════════════════════');
  console.log('  EduSphere Enterprise — Demo Data Reset');
  console.log('══════════════════════════════════════════════════\n');

  if (process.env.RESET_DEMO_DATA !== 'true') {
      console.log('⚠️  DANGER: Destructive action requested.');
      console.log('You must set RESET_DEMO_DATA=true to run this script.');
      console.log('Example: $env:RESET_DEMO_DATA="true"; node backend/scripts/reset-demo-40-days.js');
      process.exit(1);
  }

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

  const models = [
    model('auth', 'User'),
    model('users', 'Profile'),
    model('courses', 'Course'),
    model('attendance', 'AttendanceRecord'),
    model('assignments', 'Assignment'),
    model('assignments', 'Submission'),
    model('assessments', 'Assessment'),
    model('assessments', 'Attempt'),
    model('timetable', 'Timetable'),
    model('calendar', 'Event'),
    model('library', 'Book'),
    model('library', 'Issue'),
    model('placements', 'Drive'),
    model('placements', 'Application'),
    model('finance', 'Fee'),
    model('finance', 'Transaction'),
    model('certificates', 'Certificate'),
    model('discussions', 'Thread'),
    model('notifications', 'Notification')
  ];

  console.log('\n🗑️  Purging records matching demoSeed: ' + DEMO_SEED_VERSION + ' ...');
  let totalDeleted = 0;
  
  for (const M of models) {
     const result = await M.deleteMany({ demoSeed: DEMO_SEED_VERSION });
     if (result.deletedCount > 0) {
        console.log(`  ✓ Deleted ${result.deletedCount} from ${M.modelName}`);
        totalDeleted += result.deletedCount;
     }
  }
  
  console.log('\n[Closing connections...]');
  for (const key in dbs) {
     await dbs[key].close();
  }
  
  console.log(`\n✅ Reset Complete. Total records purged: ${totalDeleted}`);
}

resetAll().then(() => process.exit(0)).catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
