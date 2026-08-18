const axios = require('axios');
const CourseGrade = require('../models/CourseGrade');
const AttendanceEvent = require('../models/AttendanceEvent');
const Settings = require('../models/Settings');

const COURSE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

exports.getFacultyStudents = async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const authHeader = req.headers.authorization;

    // 1. Fetch courses taught by this faculty
    const coursesRes = await axios.get(`${COURSE_URL}/?facultyOwnerId=${facultyId}`, {
      headers: { Authorization: authHeader }
    });
    const courses = coursesRes.data.courses || [];
    
    if (courses.length === 0) {
      return res.json({ students: [], summary: { totalGuided: 0, avgGPA: 0 } });
    }

    // 2. Extract unique students and their associated courses
    const studentMap = new Map();
    for (const c of courses) {
      for (const sid of (c.enrolledStudents || [])) {
        if (!studentMap.has(sid)) {
          studentMap.set(sid, { courses: [] });
        }
        studentMap.get(sid).courses.push({ courseId: c._id, courseName: c.title });
      }
    }

    const uniqueStudentIds = Array.from(studentMap.keys());
    if (uniqueStudentIds.length === 0) {
       return res.json({ students: [], summary: { totalGuided: 0, avgGPA: 0 } });
    }

    // 3. Fetch Student Details
    const studentDetails = await Promise.all(uniqueStudentIds.map(async id => {
       try {
          const profileRes = await axios.get(`${USER_URL}/${id}`, { headers: { Authorization: authHeader } }).catch(() => null);
          return { id, profile: profileRes ? profileRes.data : null };
       } catch (e) { return { id, profile: null }; }
    }));

    // 4. Fetch CGPAs and Attendance
    // We fetch all grades for these students, both ongoing and completed
    const cgpAs = await CourseGrade.find({ studentId: { $in: uniqueStudentIds } });
    const attendanceEvents = await AttendanceEvent.find({ studentId: { $in: uniqueStudentIds } });

    // 5. Configurable Settings
    const cgpaThresholdSetting = await Settings.findOne({ key: 'cgpaThreshold' });
    const attendanceThresholdSetting = await Settings.findOne({ key: 'attendanceThreshold' });
    const cgpaThreshold = cgpaThresholdSetting ? Number(cgpaThresholdSetting.value) : 50; 
    const attendanceThreshold = attendanceThresholdSetting ? Number(attendanceThresholdSetting.value) : 75;

    // 6. Aggregate student data
    let totalGPA = 0;
    const studentsData = studentDetails.map(sd => {
       const sid = sd.id;
       const profile = sd.profile || {};
       
       const studentGrades = cgpAs.filter(g => g.studentId === sid);
       
       // Terminal CGPA is based ONLY on completed courses
       const completedGrades = studentGrades.filter(g => g.courseStatus === 'completed');
       let cgpa = 0;
       if (completedGrades.length > 0) {
          cgpa = completedGrades.reduce((sum, g) => sum + (g.finalGrade?.percentage || 0), 0) / completedGrades.length;
       }
       totalGPA += cgpa;

       // Current progress calculations for ongoing courses
       const ongoingGrades = studentGrades.filter(g => g.courseStatus === 'ongoing');
       let currentProgressWarning = false;
       ongoingGrades.forEach(og => {
          if (og.currentGrade && og.currentGrade.assessments) {
             let total = 0, count = 0;
             for (const key of og.currentGrade.assessments.keys()) {
                total += og.currentGrade.assessments.get(key).percentage;
                count++;
             }
             const ongoingPercentage = count > 0 ? total / count : 100;
             // E.g., struggling if ongoing percentage drops below threshold early on
             if (ongoingPercentage < cgpaThreshold) currentProgressWarning = true;
          }
       });

       const studentAtt = attendanceEvents.filter(a => a.studentId === sid);
       let attendancePercent = 100;
       if (studentAtt.length > 0) {
          const present = studentAtt.filter(a => a.status === 'present').length;
          attendancePercent = Math.round((present / studentAtt.length) * 100);
       }

       const riskReasons = [];
       if (cgpa < cgpaThreshold && completedGrades.length > 0) riskReasons.push('Low CGPA');
       if (attendancePercent < attendanceThreshold) riskReasons.push('Low Attendance');
       if (currentProgressWarning) riskReasons.push('Live Warning: struggling in progress');
       
       const atRisk = riskReasons.length > 0;

       return {
          registerNumber: sid,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
          email: profile.email || 'Unknown',
          department: profile.department || 'Unknown',
          cgpa: Math.round(cgpa * 10) / 10,
          attendancePercent,
          atRisk,
          riskReasons,
          coursesWithThisFaculty: studentMap.get(sid).courses
       };
    });

    res.json({
       students: studentsData,
       summary: {
          totalGuided: uniqueStudentIds.length,
          avgGPA: uniqueStudentIds.length > 0 ? Math.round((totalGPA / uniqueStudentIds.length) * 10) / 10 : 0
       }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const ExcelJS = require('exceljs');

exports.exportCourseReport = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const authHeader = req.headers.authorization;

    // Verify course ownership
    const courseRes = await axios.get(`${COURSE_URL}/${courseId}`, { headers: { Authorization: authHeader } });
    const course = courseRes.data;
    
    if (course.facultyOwnerId !== req.user.userId && (!course.coInstructors || !course.coInstructors.includes(req.user.userId)) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Only the course owner or co-instructor can export data.' });
    }

    const students = course.enrolledStudents || [];
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Course Performance');
    
    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 20 },
      { header: 'Attendance %', key: 'attendance', width: 15 },
      { header: 'CGPA Contribution %', key: 'cgpa', width: 20 },
    ];

    if (students.length > 0) {
       const attendanceEvents = await AttendanceEvent.find({ courseId, studentId: { $in: students } });
       const courseGrades = await CourseGrade.find({ courseId, studentId: { $in: students } });

       for (const sid of students) {
          const studentAtt = attendanceEvents.filter(a => a.studentId === sid);
          let attPct = 0;
          if (studentAtt.length > 0) {
             const present = studentAtt.filter(a => a.status === 'present').length;
             attPct = Math.round((present / studentAtt.length) * 100);
          }

          const grade = courseGrades.find(g => g.studentId === sid);
          const cgpaContrib = grade && grade.finalGrade ? grade.finalGrade.percentage : 0;

          worksheet.addRow({ studentId: sid, attendance: attPct, cgpa: cgpaContrib });
       }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Course_${course.code}_Report.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
