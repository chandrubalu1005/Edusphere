/**
 * EduSphere Faculty Portal — Fixed Complete Seed Script V2
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

const AUTH_USERS = [
  { id: '6a9c4a10f4eacbcd9a85c475', email: 'student_1@edusphere.edu', role: 'student', username: 'student_1', firstName: 'Arjun', lastName: 'Kumar', department: 'CSE' },
  { id: '6a9c4a10f4eacbcd9a85c477', email: 'student_2@edusphere.edu', role: 'student', username: 'student_2', firstName: 'Priya', lastName: 'Singh', department: 'CSE' },
  { id: '6a9c4a10f4eacbcd9a85c479', email: 'student_3@edusphere.edu', role: 'student', username: 'student_3', firstName: 'Rahul', lastName: 'Sharma', department: 'CSE' },
  { id: '6a8525fceb03d01178e00b2f', email: 'john_doe@edusphere.edu', role: 'student', username: 'john_doe', firstName: 'John', lastName: 'Doe', department: 'ECE' },
  { id: '6a8525fceb03d01178e00b30', email: 'jane_smith@edusphere.edu', role: 'student', username: 'jane_smith', firstName: 'Jane', lastName: 'Smith', department: 'CSE' },
  { id: '6a75b12613e5383fa8cc46ab', email: 'chandru@edusphere.edu', role: 'student', username: 'chandru', firstName: 'Chandru', lastName: 'Balu', department: 'CSE' },
  { id: '6a9c4a10f4eacbcd9a85c47b', email: 'faculty_1@edusphere.edu', role: 'faculty', username: 'faculty_1', firstName: 'Anitha', lastName: 'Ramasamy', department: 'CSE' },
  { id: '6a9c4a10f4eacbcd9a85c47d', email: 'faculty_2@edusphere.edu', role: 'faculty', username: 'faculty_2', firstName: 'Bala', lastName: 'Krishnan', department: 'CSE' },
  { id: '6a9c4a10f4eacbcd9a85c47f', email: 'faculty_3@edusphere.edu', role: 'faculty', username: 'faculty_3', firstName: 'Chitra', lastName: 'Nair', department: 'ECE' },
  { id: '6a8525fceb03d01178e00b31', email: 'sarah_j@edusphere.edu', role: 'faculty', username: 'sarah_j', firstName: 'Sarah', lastName: 'Johnson', department: 'CSE' },
];

const STUDENT_NAMES = {};
AUTH_USERS.filter(u => u.role === 'student').forEach(u => STUDENT_NAMES[u.id] = `${u.firstName} ${u.lastName}`);
const STUDENT_IDS = Object.keys(STUDENT_NAMES);

const COURSES = [
  { id: '6a9c4a12f4eacbcd9a85c48d', code: 'CS101', title: 'Intro to Programming', facultyId: '6a9c4a10f4eacbcd9a85c47b', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c491', code: 'CS201', title: 'Data Structures', facultyId: '6a9c4a10f4eacbcd9a85c47b', dept: 'CSE' },
  { id: '6a9c4a65f4eacbcd9a85c492', code: 'CS301', title: 'Algorithms', facultyId: '6a9c4a10f4eacbcd9a85c47d', dept: 'CSE' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(n) {
  return daysAgo(n).toISOString().slice(0, 10);
}

async function seedAttendance(conn) {
  const col = conn.db.collection('attendances');
  const records = [];
  const facultyCourses = {
    '6a9c4a10f4eacbcd9a85c47b': [COURSES[0].id, COURSES[1].id],
    '6a9c4a10f4eacbcd9a85c47d': [COURSES[2].id],
  };

  for (let daysBack = 14; daysBack >= 0; daysBack--) {
    const d = daysAgo(daysBack);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const [facultyId, courseIds] of Object.entries(facultyCourses)) {
      for (const courseId of courseIds) {
        for (const studentId of STUDENT_IDS) {
          const rand = Math.random();
          const status = rand > 0.15 ? 'present' : 'absent';
          records.push({
            studentId,
            studentName: STUDENT_NAMES[studentId],
            courseId,
            status,
            date: new Date(d.toISOString().slice(0, 10)),
            markedBy: facultyId,
            markMethod: 'manual',
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
  const col = conn.db.collection('leaverequests');
  
  const leaves = [
    {
      requesterId: '6a9c4a10f4eacbcd9a85c47b',
      requesterRole: 'faculty',
      leaveType: 'sick',
      startDate: new Date(dateStr(5)),
      endDate: new Date(dateStr(4)),
      daysCount: 2,
      affectedCourses: [COURSES[0].id, COURSES[1].id],
      reason: 'Fever and cold',
      status: 'approved',
      approverId: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(6),
    },
    {
      requesterId: '6a9c4a10f4eacbcd9a85c47d',
      requesterRole: 'faculty',
      leaveType: 'casual',
      startDate: new Date(dateStr(20)),
      endDate: new Date(dateStr(19)),
      daysCount: 2,
      affectedCourses: [COURSES[2].id],
      reason: 'Personal work',
      status: 'approved',
      approverId: '6a9c4a11f4eacbcd9a85c481',
      createdAt: daysAgo(22),
    }
  ];

  await col.insertMany(leaves, { ordered: false });
  console.log(`  Leaves: seeded ${leaves.length}`);
}

async function seedLeaveBalance(conn) {
  const col = conn.db.collection('leavebalances');
  
  const balances = AUTH_USERS.filter(u => u.role === 'faculty').map(u => ({
    userId: u.id,
    role: 'faculty',
    sick: { total: 10, used: 2, remaining: 8 },
    casual: { total: 12, used: 4, remaining: 8 },
    vacation: { total: 15, used: 0, remaining: 15 },
    academic_year: '2026',
    updatedAt: new Date(),
  }));

  await col.insertMany(balances, { ordered: false });
  console.log(`  LeaveBalance: seeded ${balances.length}`);
}

async function seedCalendar(conn) {
  const col = conn.db.collection('calendarevents');
  
  const events = [
    {
      title: 'Mid-Semester Examination',
      description: 'Mid-semester exams for all CSE courses',
      date: dateStr(-7), // 7 days from now
      type: 'exam',
      targetAudience: 'global',
    },
    {
      title: 'Faculty Meeting',
      description: 'Monthly faculty meeting',
      date: dateStr(-3),
      type: 'event',
      targetAudience: 'faculty',
    }
  ];

  await col.insertMany(events, { ordered: false });
  console.log(`  Calendar: seeded ${events.length}`);
}

async function seedDiscussions(conn) {
  const tCol = conn.db.collection('discussionthreads');
  const rCol = conn.db.collection('discussionreplies');
  
  const threads = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Introduction to Python Programming - Discussion',
      content: 'Welcome to CS101! Please introduce yourselves.',
      courseId: COURSES[0].id,
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      votes: 5,
      upvotedBy: [], downvotedBy: [],
      pinned: true,
      isSpam: false,
      replyCount: 2,
      createdAt: daysAgo(7),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Assignment Doubts - CS201 Data Structures',
      content: 'Please post your questions about Assignment 1 here.',
      courseId: COURSES[1].id,
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      authorName: 'Prof. Anitha Ramasamy',
      votes: 3,
      upvotedBy: [], downvotedBy: [],
      pinned: false,
      isSpam: false,
      replyCount: 1,
      createdAt: daysAgo(4),
    }
  ];

  const replies = [
    {
      threadId: threads[0]._id.toString(),
      content: 'Hi! I have some experience with JavaScript.',
      authorId: STUDENT_IDS[0],
      authorName: STUDENT_NAMES[STUDENT_IDS[0]],
      votes: 2, upvotedBy: [], downvotedBy: [],
      isSpam: false, isAiSuggested: false,
      createdAt: daysAgo(6)
    },
    {
      threadId: threads[0]._id.toString(),
      content: 'I am completely new to programming.',
      authorId: STUDENT_IDS[1],
      authorName: STUDENT_NAMES[STUDENT_IDS[1]],
      votes: 1, upvotedBy: [], downvotedBy: [],
      isSpam: false, isAiSuggested: false,
      createdAt: daysAgo(5)
    },
    {
      threadId: threads[1]._id.toString(),
      content: 'How do we implement a circular linked list?',
      authorId: STUDENT_IDS[2],
      authorName: STUDENT_NAMES[STUDENT_IDS[2]],
      votes: 0, upvotedBy: [], downvotedBy: [],
      isSpam: false, isAiSuggested: false,
      createdAt: daysAgo(3)
    }
  ];

  await tCol.insertMany(threads, { ordered: false });
  await rCol.insertMany(replies, { ordered: false });
  console.log(`  Discussions: seeded ${threads.length} threads, ${replies.length} replies`);
}

async function seedAnnouncements(conn) {
  const col = conn.db.collection('announcements');
  const existing = await col.countDocuments();
  if (existing > 0) return;
  
  const announcements = [
    {
      title: 'Mid-Semester Examination Schedule',
      content: 'The mid-semester examinations for Fall 2026 will be held from September 15-22, 2026.',
      author: 'Prof. Anitha Ramasamy',
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      targetRoles: ['student', 'faculty'],
      targetDept: 'CSE',
      priority: 'high',
      expiresAt: new Date(dateStr(-30)),
      createdAt: daysAgo(3),
    },
    {
      title: 'CS101 - Assignment Submission Guidelines',
      content: 'All assignments must be submitted in PDF format.',
      author: 'Prof. Anitha Ramasamy',
      authorId: '6a9c4a10f4eacbcd9a85c47b',
      targetRoles: ['student'],
      targetDept: 'CSE',
      priority: 'normal',
      expiresAt: new Date(dateStr(-30)),
      createdAt: daysAgo(7),
    }
  ];

  await col.insertMany(announcements, { ordered: false });
  console.log(`  Announcements: seeded ${announcements.length}`);
}

async function main() {
  console.log('🚀 Starting EduSphere Faculty Portal V2 Seeding...\n');
  const conns = {};
  
  try {
    conns.attendance = await mongoose.createConnection(MONGO_URI_ATTENDANCE).asPromise();
    conns.calendar = await mongoose.createConnection(MONGO_URI_CALENDAR).asPromise();
    conns.discussions = await mongoose.createConnection(MONGO_URI_DISCUSSIONS).asPromise();
    conns.notifications = await mongoose.createConnection(MONGO_URI_NOTIFICATIONS).asPromise();
  } catch(e) { console.error('Connection error', e); }

  console.log('\n📦 Seeding data...\n');
  if (conns.attendance) {
    await seedAttendance(conns.attendance);
    await seedLeave(conns.attendance);
    await seedLeaveBalance(conns.attendance);
  }
  if (conns.calendar) await seedCalendar(conns.calendar);
  if (conns.discussions) await seedDiscussions(conns.discussions);
  if (conns.notifications) await seedAnnouncements(conns.notifications);

  for (const conn of Object.values(conns)) if (conn) await conn.close();
  console.log('\n✅ V2 seeding complete!\n');
  process.exit(0);
}

main();
