const Attendance = require('../../services/attendance-service/src/models/Attendance');
const ClassSession = require('../../services/attendance-service/src/models/ClassSession');
const Course = require('../../services/course-service/src/models/Course');
const Timetable = require('../../services/timetable-service/src/models/Timetable');
const TimeSlot = require('../../services/timetable-service/src/models/TimeSlot');

module.exports = async function seedAttendance(ctx) {
  // 1. TimeSlots
  const slots = [
    { code: 'SLOT-A', name: 'Period 1', startTime: '09:00', endTime: '10:00', displayOrder: 1 },
    { code: 'SLOT-B', name: 'Period 2', startTime: '10:00', endTime: '11:00', displayOrder: 2 },
    { code: 'SLOT-C', name: 'Period 3', startTime: '11:00', endTime: '12:00', displayOrder: 3 }
  ];
  
  const savedSlots = await TimeSlot.insertMany(slots);

  // Generate sessions and attendance for each course
  const courses = await Course.find({});
  let totalSessions = 0;
  let totalAttendances = 0;
  
  const today = new Date();

  const sessionsToInsert = [];
  const attendanceToInsert = [];
  const timetablesToInsert = [];

  for (const c of courses) {
    timetablesToInsert.push({
      courseId: c._id.toString(),
      code: c.code,
      title: c.title,
      instructorId: c.facultyOwnerId,
      instructorName: c.facultyName,
      room: 'Room 101',
      day: 'Monday',
      timeStart: '09:00',
      timeEnd: '10:00',
      department: c.department,
      semester: '5'
    });

    for (let i = 1; i <= 20; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - (40 - (i * 2)));

      sessionsToInsert.push({
        date: pastDate,
        courseId: c._id,
        facultyId: c.facultyOwnerId,
        slotId: savedSlots[0]._id.toString(),
        room: 'Room 101',
        status: 'completed'
      });
      totalSessions++;

      for (const studentId of c.enrolledStudents) {
        const studentProfile = ctx.profiles[studentId];
        if (!studentProfile) continue; // edge case check
        const rand = Math.random();
        let status = 'present';
        if (rand < 0.1) status = 'absent';
        else if (rand < 0.15) status = 'excused';

        attendanceToInsert.push({
          studentId: studentId.toString(),
          studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
          courseId: c._id.toString(),
          status,
          date: pastDate,
          markedBy: c.facultyOwnerId,
          markMethod: 'manual'
        });
        totalAttendances++;
      }
    }
  }

  await Timetable.insertMany(timetablesToInsert);
  await ClassSession.insertMany(sessionsToInsert);
  
  // Batch insert attendance (limit batches to 5000 to avoid BSON doc limits)
  const batchSize = 5000;
  for (let i = 0; i < attendanceToInsert.length; i += batchSize) {
    await Attendance.insertMany(attendanceToInsert.slice(i, i + batchSize));
  }

  console.log(`  ✓ Inserted ${totalSessions} ClassSessions`);
  console.log(`  ✓ Inserted ${totalAttendances} Attendance Records`);
};
