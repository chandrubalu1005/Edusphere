const Course = require('../../services/course-service/src/models/Course');
const { StudentAcademicPlan } = require('../../services/course-service/src/models/academic/Student');

module.exports = async function seedEnrollments(ctx) {
  // Enroll students into courses
  // To keep it realistic, each student takes ~4-5 courses
  
  for (const studentId of ctx.users.student) {
    // Determine 4 random courses for this student
    const shuffled = [...ctx.courses].sort(() => 0.5 - Math.random());
    const selectedCourses = shuffled.slice(0, 4);
    
    // We will update the Course array directly
    for (const courseId of selectedCourses) {
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: studentId }
      });
    }

    // Optionally create an academic Student record tying them to a program
    const profile = ctx.profiles[studentId];
    if (profile) {
      const progKeys = Object.keys(ctx.programmes);
      const progKey = progKeys[Math.floor(Math.random() * progKeys.length)];
      const randomProg = ctx.programmes[progKey];
      
      const academicStudent = new StudentAcademicPlan({
        studentId: studentId,
        programmeId: randomProg,
        regulationId: ctx.regulations[progKey],
        curriculumVersionId: ctx.curriculums[progKey],
        enrollmentYear: 2024,
        currentSemester: 5,
        status: 'ACTIVE'
      });
      await academicStudent.save();
    }
  }

  // Count total enrollments for log
  const courses = await Course.find({});
  let totalEnrollments = 0;
  courses.forEach(c => totalEnrollments += c.enrolledStudents.length);
  
  console.log(`  ✓ Inserted ${ctx.users.student.length} Academic Student records`);
  console.log(`  ✓ Created ${totalEnrollments} Course Enrollments`);
};
