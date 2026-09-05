const mongoose = require('mongoose');

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', new mongoose.Schema({}, { strict: false }));
const Submission = mongoose.models.Submission || mongoose.model('Submission', new mongoose.Schema({}, { strict: false }));
const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', new mongoose.Schema({}, { strict: false }));
const Attempt = mongoose.models.Attempt || mongoose.model('Attempt', new mongoose.Schema({}, { strict: false }));

const Course = require('../../services/course-service/src/models/Course');

module.exports = async function seedAssessments(ctx) {
  const courses = await Course.find({});
  let totalAssignments = 0;
  let totalSubmissions = 0;
  let totalAssessments = 0;
  let totalAttempts = 0;

  const assignmentsToInsert = [];
  const submissionsToInsert = [];
  const assessmentsToInsert = [];
  const attemptsToInsert = [];

  for (const c of courses) {
    if (c.enrolledStudents.length === 0) continue;

    const assignmentId = new mongoose.Types.ObjectId();
    assignmentsToInsert.push({
      _id: assignmentId,
      courseId: c._id.toString(),
      title: `Midterm Project for ${c.code}`,
      description: 'Complete the requirements and submit.',
      dueDate: new Date(Date.now() + 86400000 * 7),
      maxScore: 100
    });
    totalAssignments++;

    for (const studentId of c.enrolledStudents) {
      if (Math.random() > 0.1) {
        submissionsToInsert.push({
          assignmentId: assignmentId.toString(),
          studentId: studentId.toString(),
          submittedAt: new Date(),
          score: Math.floor(Math.random() * 30) + 70,
          status: 'graded'
        });
        totalSubmissions++;
      }
    }

    const assessmentId = new mongoose.Types.ObjectId();
    assessmentsToInsert.push({
      _id: assessmentId,
      courseId: c._id.toString(),
      title: `Final Exam for ${c.code}`,
      totalMarks: 100
    });
    totalAssessments++;

    for (const studentId of c.enrolledStudents) {
      if (Math.random() > 0.05) {
        attemptsToInsert.push({
          assessmentId: assessmentId.toString(),
          studentId: studentId.toString(),
          score: Math.floor(Math.random() * 40) + 60,
          completedAt: new Date()
        });
        totalAttempts++;
      }
    }
  }

  await Assignment.insertMany(assignmentsToInsert);
  await Submission.insertMany(submissionsToInsert);
  await Assessment.insertMany(assessmentsToInsert);
  await Attempt.insertMany(attemptsToInsert);

  console.log(`  ✓ Inserted ${totalAssignments} Assignments`);
  console.log(`  ✓ Inserted ${totalSubmissions} Submissions`);
  console.log(`  ✓ Inserted ${totalAssessments} Assessments`);
  console.log(`  ✓ Inserted ${totalAttempts} Assessment Attempts`);
};
