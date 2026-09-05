const Course = require('../../services/course-service/src/models/Course');

module.exports = async function seedCourses(ctx) {
  ctx.courses = [];
  
  const courseTemplates = [
    { code: 'CS101', title: 'Introduction to Computer Science', dept: 'CSE' },
    { code: 'CS201', title: 'Data Structures and Algorithms', dept: 'CSE' },
    { code: 'CS301', title: 'Database Management Systems', dept: 'CSE' },
    { code: 'CS401', title: 'Artificial Intelligence', dept: 'CSE' },
    { code: 'CS501', title: 'Cloud Computing', dept: 'CSE' },
    
    { code: 'EC101', title: 'Basic Electronics', dept: 'ECE' },
    { code: 'EC201', title: 'Digital Logic Design', dept: 'ECE' },
    { code: 'EC301', title: 'Microprocessors', dept: 'ECE' },
    { code: 'EC401', title: 'Wireless Communication', dept: 'ECE' },
    
    { code: 'ME101', title: 'Engineering Mechanics', dept: 'MECH' },
    { code: 'ME201', title: 'Thermodynamics', dept: 'MECH' },
    { code: 'ME301', title: 'Fluid Dynamics', dept: 'MECH' },
    { code: 'ME401', title: 'Automobile Engineering', dept: 'MECH' }
  ];

  // Distribute across faculty
  let facultyIndex = 0;
  
  for (const t of courseTemplates) {
    const facultyId = ctx.users.faculty[facultyIndex % ctx.users.faculty.length];
    const profile = ctx.profiles[facultyId];
    
    const course = new Course({
      code: t.code,
      title: t.title,
      description: `Comprehensive study of ${t.title} for ${t.dept} students.`,
      department: t.dept,
      facultyOwnerId: facultyId,
      facultyName: `${profile.firstName} ${profile.lastName}`,
      status: 'published',
      capacity: 60,
      credits: 3,
      enrolledStudents: []
    });
    
    await course.save();
    ctx.courses.push(course._id.toString());
    facultyIndex++;
  }
  
  // Create a pending course for approvals center
  const pendingFacultyId = ctx.users.faculty[0];
  const pendingProfile = ctx.profiles[pendingFacultyId];
  const pendingCourse = new Course({
    code: 'CS999',
    title: 'Advanced Quantum Computing Research',
    description: 'A new elective pending management approval.',
    department: 'CSE',
    facultyOwnerId: pendingFacultyId,
    facultyName: `${pendingProfile.firstName} ${pendingProfile.lastName}`,
    status: 'pending',
    capacity: 30,
    credits: 4,
    enrolledStudents: []
  });
  await pendingCourse.save();

  console.log(`  ✓ Inserted ${ctx.courses.length + 1} Courses (including 1 pending approval)`);
};
