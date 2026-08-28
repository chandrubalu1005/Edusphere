// infra/mongo/init.js
// Initialize isolated MongoDB users for EduSphere LAN deployment

// Wait for the admin DB to be available
db = db.getSiblingDB('admin');

db.auth(
  process.env.MONGO_INITDB_ROOT_USERNAME,
  process.env.MONGO_INITDB_ROOT_PASSWORD
);

print('🚀 Initializing EduSphere LAN MongoDB isolation...');

const services = [
  { dbName: 'edusphere_auth', user: 'auth_user', passEnv: 'MONGO_AUTH_PASS' },
  { dbName: 'edusphere_users', user: 'users_user', passEnv: 'MONGO_USER_PASS' },
  { dbName: 'edusphere_courses', user: 'course_user', passEnv: 'MONGO_COURSE_PASS' },
  { dbName: 'edusphere_notifications', user: 'notif_user', passEnv: 'MONGO_NOTIF_PASS' },
  { dbName: 'edusphere_attendance', user: 'attendance_user', passEnv: 'MONGO_ATTENDANCE_PASS' },
  { dbName: 'edusphere_library', user: 'library_user', passEnv: 'MONGO_LIBRARY_PASS' },
  { dbName: 'edusphere_calendar', user: 'calendar_user', passEnv: 'MONGO_CALENDAR_PASS' },
  { dbName: 'edusphere_timetable', user: 'timetable_user', passEnv: 'MONGO_TIMETABLE_PASS' },
  { dbName: 'edusphere_finance', user: 'finance_user', passEnv: 'MONGO_FINANCE_PASS' },
  { dbName: 'edusphere_assignments', user: 'assignment_user', passEnv: 'MONGO_ASSIGNMENT_PASS' },
  { dbName: 'edusphere_assessments', user: 'assessment_user', passEnv: 'MONGO_ASSESSMENT_PASS' },
  { dbName: 'edusphere_certificates', user: 'certificate_user', passEnv: 'MONGO_CERTIFICATE_PASS' },
  { dbName: 'edusphere_placement', user: 'placement_user', passEnv: 'MONGO_PLACEMENT_PASS' },
  { dbName: 'edusphere_discussions', user: 'discussion_user', passEnv: 'MONGO_DISCUSSION_PASS' },
  { dbName: 'edusphere_analytics', user: 'analytics_user', passEnv: 'MONGO_ANALYTICS_PASS' },
  { dbName: 'edusphere_admin', user: 'admin_svc_user', passEnv: 'MONGO_ADMIN_PASS' }
];

services.forEach(svc => {
  const password = process.env[svc.passEnv];
  if (!password) {
    print(`⚠️ Warning: Missing password environment variable ${svc.passEnv} for ${svc.dbName}. Skipping user creation.`);
    return;
  }
  
  print(`✅ Creating restricted user ${svc.user} for database ${svc.dbName}...`);
  const targetDb = db.getSiblingDB(svc.dbName);
  targetDb.createUser({
    user: svc.user,
    pwd: password,
    roles: [{ role: 'readWrite', db: svc.dbName }]
  });
});

print('🎯 MongoDB initialization complete. Service databases are now isolated.');
