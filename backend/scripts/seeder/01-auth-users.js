const bcrypt = require('bcryptjs');
const User = require('../../services/auth-service/src/models/User');
const Profile = require('../../services/user-service/src/models/Profile');

const DEMO_PASSWORD = 'demo123';
const DEMO_SEED_VERSION = 'demo-40-days-v1'; // To flag seed users

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

module.exports = async function seedAuthUsers(ctx) {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  
  ctx.users = {
    student: [],
    faculty: [],
    admin: [],
    management: []
  };
  
  ctx.profiles = {};
  
  // 1. Create Core Users
  for (const u of PRESERVED_USERS) {
    const user = new User({
      username: u.username,
      email: u.email,
      password: hashedPassword,
      role: u.role,
      isActive: true, // specific to User model
    });
    await user.save();
    
    const profile = new Profile({
      userId: user._id.toString(),
      username: u.username,
      email: u.email,
      role: u.role,
      firstName: u.first,
      lastName: u.last,
      active: true, // specific to Profile model
    });
    await profile.save();
    
    ctx.users[u.role].push(user._id.toString());
    ctx.profiles[user._id.toString()] = profile;
  }
  
  // 2. Generate 150 extra students
  for (let i = 1; i <= 150; i++) {
    const username = `student_gen_${i}`;
    const user = new User({
      username,
      email: `${username}@edusphere.edu`,
      password: hashedPassword,
      role: 'student',
      isActive: true
    });
    await user.save();
    
    const profile = new Profile({
      userId: user._id.toString(),
      username,
      email: user.email,
      role: 'student',
      firstName: 'Student',
      lastName: `Gen${i}`,
      active: true
    });
    await profile.save();
    
    ctx.users.student.push(user._id.toString());
    ctx.profiles[user._id.toString()] = profile;
  }

  // 3. Generate 10 extra faculty
  for (let i = 1; i <= 10; i++) {
    const username = `faculty_gen_${i}`;
    const user = new User({
      username,
      email: `${username}@edusphere.edu`,
      password: hashedPassword,
      role: 'faculty',
      isActive: true
    });
    await user.save();
    
    const profile = new Profile({
      userId: user._id.toString(),
      username,
      email: user.email,
      role: 'faculty',
      firstName: 'Faculty',
      lastName: `Gen${i}`,
      active: true
    });
    await profile.save();
    
    ctx.users.faculty.push(user._id.toString());
    ctx.profiles[user._id.toString()] = profile;
  }

  console.log(`  ✓ Inserted ${PRESERVED_USERS.length + 160} Users and Profiles`);
};
