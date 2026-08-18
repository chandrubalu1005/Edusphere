const mongoose = require('mongoose');

async function runVerification() {
  await mongoose.connect('mongodb://localhost:27017/edusphere_analytics', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Mock schema for testing the DB logic
  const CourseGradeSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    studentId: { type: String, required: true },
    courseStatus: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    currentGrade: {
      assessments: { 
        type: Map, 
        of: new mongoose.Schema({ score: Number, percentage: Number }, { _id: false })
      }
    },
    finalGrade: { percentage: Number, passed: Boolean }
  });
  
  const CourseGrade = mongoose.model('CourseGradeTest', CourseGradeSchema);
  await CourseGrade.deleteMany({});

  const courseId = 'course_test_101';
  console.log('--- Starting Concurrent Grading Test ---');

  // 1. Simulate 50 concurrent grading events for 50 different students
  const promises = [];
  for (let i = 0; i < 50; i++) {
    const studentId = `student_${i}`;
    const p = CourseGrade.findOneAndUpdate(
      { courseId, studentId },
      {
         $set: {
            [`currentGrade.assessments.a1`]: { score: 100, percentage: 100 }
         },
         $setOnInsert: { courseStatus: 'ongoing' }
      },
      { upsert: true, new: true }
    );
    promises.push(p);
  }
  
  // 2. Simulate 10 duplicate events for the SAME student and assessment
  const targetStudent = 'student_0';
  for (let i = 0; i < 10; i++) {
    const p = CourseGrade.findOneAndUpdate(
      { courseId, studentId: targetStudent },
      {
         $set: {
            [`currentGrade.assessments.a2`]: { score: 80, percentage: 80 }
         },
         $setOnInsert: { courseStatus: 'ongoing' }
      },
      { upsert: true, new: true }
    );
    promises.push(p);
  }

  await Promise.all(promises);

  // Assertions
  const totalGrades = await CourseGrade.countDocuments();
  console.log(`Total Student Records (expected 50): ${totalGrades}`);

  const student0 = await CourseGrade.findOne({ studentId: targetStudent });
  const a1 = student0.currentGrade.assessments.get('a1');
  const a2 = student0.currentGrade.assessments.get('a2');
  console.log(`Student 0 Map keys length (expected 2): ${student0.currentGrade.assessments.size}`);
  console.log(`Student 0 a1 % (expected 100): ${a1.percentage}`);
  console.log(`Student 0 a2 % (expected 80): ${a2.percentage}`);
  console.log(`Student 0 courseStatus (expected ongoing): ${student0.courseStatus}`);
  
  const completedGrades = await CourseGrade.countDocuments({ courseStatus: 'completed' });
  console.log(`Completed courses leaking into aggregates? (expected 0): ${completedGrades}`);

  // 3. Simulate course.completed
  console.log('\n--- Simulating course.completed ---');
  const ongoingGrades = await CourseGrade.find({ courseId, courseStatus: 'ongoing' });
  const bulkOps = ongoingGrades.map(cg => {
     let total = 0, count = 0;
     for (const key of cg.currentGrade.assessments.keys()) {
        total += cg.currentGrade.assessments.get(key).percentage;
        count++;
     }
     const finalPercentage = count > 0 ? total / count : 0;
     return {
        updateOne: {
           filter: { _id: cg._id },
           update: {
              $set: {
                 'finalGrade.percentage': finalPercentage,
                 'finalGrade.passed': finalPercentage >= 50,
                 courseStatus: 'completed'
              }
           }
        }
     };
  });
  
  await CourseGrade.bulkWrite(bulkOps);

  const finalStudent0 = await CourseGrade.findOne({ studentId: targetStudent });
  console.log(`Student 0 final status (expected completed): ${finalStudent0.courseStatus}`);
  console.log(`Student 0 final percentage (expected 90): ${finalStudent0.finalGrade.percentage}`);
  
  const finalCompleted = await CourseGrade.countDocuments({ courseStatus: 'completed' });
  console.log(`Total completed records available for terminal aggregates (expected 50): ${finalCompleted}`);
  
  await mongoose.disconnect();
  console.log('Verification Complete.');
}

runVerification().catch(console.error);
