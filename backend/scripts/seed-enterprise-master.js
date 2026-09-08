#!/usr/bin/env node
/**
 * CampusSphere / EduSphere — Enterprise Master Data Seeder
 * 
 * Sources:
 * - CampusSphere_Enterprise_All_Users.json (1,141 users across 8 departments)
 * - CampusSphere_Enterprise_All_Courses.json (485 course offerings across Semesters 1-7)
 * 
 * Target Databases (MongoDB Atlas):
 * - edusphere_auth (User)
 * - edusphere_users (Profile)
 * - edusphere_courses (Academic Foundation, Master Courses, Offerings, Units, Assignments, Enrollments)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usersDataset = require('../../prompt documents/CampusSphere_Enterprise_All_Users.json');
const coursesDataset = require('../../prompt documents/CampusSphere_Enterprise_All_Courses.json');

const DEMO_PASSWORD = 'demo123';

function getMongoUri(dbName) {
  const envKey = `MONGO_URI_${dbName.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey];
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI.replace(/\/edusphere(\?|$)/, `/edusphere_${dbName}$1`);
  }
  return `mongodb://localhost:27017/edusphere_${dbName}`;
}

// Five standard units for every course
function generateCourseUnits(courseTitle) {
  return [
    {
      unitNumber: 1,
      title: `Unit 1: Fundamentals & Core Concepts of ${courseTitle}`,
      description: 'Foundational principles, mathematical basics, and introductory concepts.',
      documents: [
        { title: 'Lecture Notes - Introduction & Syllabus Overview', type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/syllabus_overview.pdf', addedAt: new Date() }
      ]
    },
    {
      unitNumber: 2,
      title: `Unit 2: Architectural Design & Theoretical Frameworks`,
      description: 'Detailed analysis, systematic modeling, and structural frameworks.',
      documents: [
        { title: 'Unit 2 Lecture Slides & Analytical Models', type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/unit2_slides.pdf', addedAt: new Date() }
      ]
    },
    {
      unitNumber: 3,
      title: `Unit 3: Applied Systems, Algorithms & Implementation`,
      description: 'Practical implementations, algorithms, and applied techniques.',
      documents: [
        { title: 'Unit 3 Practical Laboratory & Implementation Guide', type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/unit3_lab.pdf', addedAt: new Date() }
      ]
    },
    {
      unitNumber: 4,
      title: `Unit 4: Advanced Paradigms & Industry Case Studies`,
      description: 'Contemporary methodologies, real-world case studies, and optimization.',
      documents: [
        { title: 'Unit 4 Case Study Portfolio & Reference Papers', type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/unit4_case_study.pdf', addedAt: new Date() }
      ]
    },
    {
      unitNumber: 5,
      title: `Unit 5: Integration, Synthesis & Emerging Frontiers`,
      description: 'Emerging research directions, synthesis, and capstone review.',
      documents: [
        { title: 'Unit 5 Emerging Frontiers & Comprehensive Review', type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/unit5_review.pdf', addedAt: new Date() }
      ]
    }
  ];
}

async function seedEnterpriseData() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CampusSphere / EduSphere — Enterprise Master Seeder          ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('1. Loading seed data from prompt documents:');
  console.log(`   - Users dataset:   ${usersDataset.users.length} users across 8 departments`);
  console.log(`   - Courses dataset: ${coursesDataset.courses.length} course offerings`);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  console.log('   - Password demo123 hashed with bcrypt successfully.\n');

  // =========================================================================
  // STEP 1: AUTH & USERS (Ensure both edusphere_auth and edusphere_users)
  // =========================================================================
  console.log('[1/3] Ensuring edusphere_auth and edusphere_users...');
  const connAuth = await mongoose.createConnection(getMongoUri('auth')).asPromise();
  const connUsers = await mongoose.createConnection(getMongoUri('users')).asPromise();

  const UserSchema = new mongoose.Schema({
    userId: { type: String, sparse: true, index: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    password: { type: String },
    role: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
    forcePasswordChangeOnFirstLogin: { type: Boolean, default: true },
    organizationScope: { type: mongoose.Schema.Types.Mixed },
    academicScope: { type: mongoose.Schema.Types.Mixed },
    responsibilityScope: { type: mongoose.Schema.Types.Mixed },
    permissionsProfile: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }, { strict: false });

  const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, required: true, default: 'student' },
    department: { type: String, default: '' },
    organizationScope: { type: mongoose.Schema.Types.Mixed },
    academicScope: { type: mongoose.Schema.Types.Mixed },
    responsibilityScope: { type: mongoose.Schema.Types.Mixed },
    permissionsProfile: { type: String },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }, { strict: false });

  const UserModel = connAuth.model('User', UserSchema);
  const ProfileModel = connUsers.model('Profile', ProfileSchema);

  const existingAuthCount = await UserModel.countDocuments();
  console.log(`   - Existing auth users count: ${existingAuthCount}`);

  let userMap = {};
  const facultyByDeptAndYear = {};
  const studentsByDeptAndYear = {};

  if (existingAuthCount < 1140) {
    console.log('   - Re-seeding users and profiles...');
    await UserModel.deleteMany({});
    await ProfileModel.deleteMany({});

    const authDocs = [];
    const profileDocs = [];

    const PRESERVED_DEMO_USERS = [
      { username: 'student_1', role: 'student', dept: 'CSE', first: 'Student', last: 'One', email: 'student_1@edusphere.edu' },
      { username: 'student_2', role: 'student', dept: 'CSE', first: 'Student', last: 'Two', email: 'student_2@edusphere.edu' },
      { username: 'student_3', role: 'student', dept: 'ECE', first: 'Student', last: 'Three', email: 'student_3@edusphere.edu' },
      { username: 'faculty_1', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'One', email: 'faculty_1@edusphere.edu' },
      { username: 'faculty_2', role: 'faculty', dept: 'CSE', first: 'Faculty', last: 'Two', email: 'faculty_2@edusphere.edu' },
      { username: 'faculty_3', role: 'faculty', dept: 'ECE', first: 'Faculty', last: 'Three', email: 'faculty_3@edusphere.edu' },
      { username: 'admin_1', role: 'admin', dept: 'Administration', first: 'Admin', last: 'One', email: 'admin_1@edusphere.edu' },
      { username: 'management_1', role: 'management', dept: 'Management', first: 'Management', last: 'One', email: 'management_1@edusphere.edu' }
    ];

    for (const p of PRESERVED_DEMO_USERS) {
      const userObjId = new mongoose.Types.ObjectId();
      authDocs.push({
        _id: userObjId,
        userId: p.username.toUpperCase(),
        username: p.username,
        email: p.email,
        displayName: `${p.first} ${p.last}`,
        password: hashedPassword,
        role: p.role,
        status: 'ACTIVE',
        forcePasswordChangeOnFirstLogin: false,
        organizationScope: { departmentId: p.dept, departmentName: p.dept },
        academicScope: { scope: 'GLOBAL' },
        isActive: true,
        createdAt: new Date()
      });

      profileDocs.push({
        userId: userObjId.toString(),
        username: p.username,
        email: p.email,
        displayName: `${p.first} ${p.last}`,
        firstName: p.first,
        lastName: p.last,
        role: p.role,
        department: p.dept,
        active: true,
        createdAt: new Date()
      });
    }

    for (const u of usersDataset.users) {
      const userObjId = new mongoose.Types.ObjectId();
      const uname = u.username.toLowerCase();
      const email = `${uname}@edusphere.edu`;
      const nameParts = (u.displayName || uname).trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'CampusSphere';
      const dept = u.organizationScope?.departmentId || (u.responsibilityScope?.departmentId || null);

      authDocs.push({
        _id: userObjId,
        userId: u.userId,
        username: uname,
        email: email,
        displayName: u.displayName || uname,
        password: hashedPassword,
        role: u.role,
        status: u.status || 'ACTIVE',
        forcePasswordChangeOnFirstLogin: true,
        organizationScope: u.organizationScope || {},
        academicScope: u.academicScope || {},
        responsibilityScope: u.responsibilityScope || {},
        permissionsProfile: u.permissionsProfile || u.role,
        isActive: true,
        createdAt: new Date()
      });

      profileDocs.push({
        userId: userObjId.toString(),
        username: uname,
        email: email,
        displayName: u.displayName || uname,
        firstName: firstName,
        lastName: lastName,
        role: u.role,
        department: dept || '',
        organizationScope: u.organizationScope || {},
        academicScope: u.academicScope || {},
        responsibilityScope: u.responsibilityScope || {},
        permissionsProfile: u.permissionsProfile || u.role,
        active: true,
        createdAt: new Date()
      });
    }

    const batchSize = 500;
    for (let i = 0; i < authDocs.length; i += batchSize) {
      await UserModel.insertMany(authDocs.slice(i, i + batchSize));
      await ProfileModel.insertMany(profileDocs.slice(i, i + batchSize));
    }
    console.log(`  ✓ Inserted ${authDocs.length} users and profiles`);
  }

  // Fetch all users to construct our mapping
  const allDbUsers = await UserModel.find({}, { _id: 1, userId: 1, username: 1, role: 1, displayName: 1, organizationScope: 1, academicScope: 1 }).lean();
  for (const u of allDbUsers) {
    const uname = u.username.toLowerCase();
    const dept = u.organizationScope?.departmentId || null;
    userMap[uname] = {
      _id: u._id.toString(),
      userId: u.userId,
      displayName: u.displayName,
      role: u.role,
      dept: dept,
      academicScope: u.academicScope
    };

    if (u.role === 'FACULTY' && dept) {
      const year = u.academicScope?.defaultYearOfStudy || 1;
      if (!facultyByDeptAndYear[dept]) facultyByDeptAndYear[dept] = {};
      if (!facultyByDeptAndYear[dept][year]) facultyByDeptAndYear[dept][year] = [];
      facultyByDeptAndYear[dept][year].push({
        _id: u._id.toString(),
        userId: u.userId,
        username: uname,
        displayName: u.displayName
      });
    }

    if (u.role === 'STUDENT' && dept) {
      const year = u.academicScope?.yearOfStudy || 1;
      if (!studentsByDeptAndYear[dept]) studentsByDeptAndYear[dept] = {};
      if (!studentsByDeptAndYear[dept][year]) studentsByDeptAndYear[dept][year] = [];
      studentsByDeptAndYear[dept][year].push({
        _id: u._id.toString(),
        userId: u.userId,
        username: uname,
        displayName: u.displayName,
        currentSemester: u.academicScope?.currentSemester || (year * 2 - 1)
      });
    }
  }

  console.log(`  ✓ Cached user mapping for ${Object.keys(userMap).length} users`);
  await connAuth.close();
  await connUsers.close();

  // =========================================================================
  // STEP 2: CONNECT DEFAULT MONGOOSE TO EDUSPHERE_COURSES
  // =========================================================================
  console.log('\n[2/3] Connecting to edusphere_courses...');
  await mongoose.connect(getMongoUri('courses'));
  console.log('  ✓ Connected to edusphere_courses');

  const { Institution, Campus, Department, AcademicYear, AcademicTerm } = 
    require('../services/course-service/src/models/academic/Institution');
  const { Programme, Regulation, CurriculumVersion, Semester, CourseGroup } = 
    require('../services/course-service/src/models/academic/Programme');
  const { CourseMaster } = 
    require('../services/course-service/src/models/academic/CourseMaster');
  const { CourseOffering, Section, FacultyAssignment } = 
    require('../services/course-service/src/models/academic/Offering');
  const { StudentAcademicPlan, Enrollment } = 
    require('../services/course-service/src/models/academic/Student');
  const CourseModel = 
    require('../services/course-service/src/models/Course');

  console.log('   - Cleaning existing course & academic data...');
  await Promise.all([
    Institution.deleteMany({}),
    Campus.deleteMany({}),
    Department.deleteMany({}),
    AcademicYear.deleteMany({}),
    AcademicTerm.deleteMany({}),
    Programme.deleteMany({}),
    Regulation.deleteMany({}),
    CurriculumVersion.deleteMany({}),
    Semester.deleteMany({}),
    CourseGroup.deleteMany({}),
    CourseMaster.deleteMany({}),
    CourseOffering.deleteMany({}),
    Section.deleteMany({}),
    FacultyAssignment.deleteMany({}),
    StudentAcademicPlan.deleteMany({}),
    Enrollment.deleteMany({}),
    CourseModel.deleteMany({})
  ]);

  // 1. Institution & Campus
  const institution = await Institution.create({
    code: 'CSU',
    name: 'CampusSphere University',
    establishedYear: 1995,
    status: 'ACTIVE',
    metadata: { systemVersion: '2.0.0', type: 'Autonomous College' }
  });

  const campus = await Campus.create({
    institutionId: institution._id,
    code: 'MAIN',
    name: 'Main Campus',
    address: 'CampusSphere Tech Corridor, Knowledge City',
    status: 'ACTIVE'
  });

  // 2. Departments
  const departmentsData = [
    { code: 'CSE', name: 'Computer Science & Engineering', degree: 'B.E.', hodUser: 'csehod' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', degree: 'B.E.', hodUser: 'eeehod' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', degree: 'B.E.', hodUser: 'ecehod' },
    { code: 'MECH', name: 'Mechanical Engineering', degree: 'B.E.', hodUser: 'mechhod' },
    { code: 'AGRI', name: 'Agricultural Engineering', degree: 'B.Tech.', hodUser: 'agrihod' },
    { code: 'AIDS', name: 'Artificial Intelligence & Data Science', degree: 'B.Tech.', hodUser: 'aidshod' },
    { code: 'BT', name: 'Biotechnology', degree: 'B.Tech.', hodUser: 'bthod' },
    { code: 'IT', name: 'Information Technology', degree: 'B.Tech.', hodUser: 'ithod' }
  ];

  const deptMap = {};
  for (const d of departmentsData) {
    const hod = userMap[d.hodUser];
    const deptDoc = await Department.create({
      institutionId: institution._id,
      campusId: campus._id,
      code: d.code,
      name: d.name,
      hodId: hod ? hod._id : null,
      status: 'ACTIVE'
    });
    deptMap[d.code] = deptDoc;
  }
  console.log(`  ✓ Inserted 8 Departments (CSE, EEE, ECE, MECH, AGRI, AIDS, BT, IT)`);

  // 3. Academic Years & Terms
  const academicYearsData = [
    { code: '2026-2027', startDate: new Date('2026-07-01'), endDate: new Date('2027-06-30'), status: 'ACTIVE' },
    { code: '2025-2026', startDate: new Date('2025-07-01'), endDate: new Date('2026-06-30'), status: 'COMPLETED' },
    { code: '2024-2025', startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), status: 'COMPLETED' },
    { code: '2023-2024', startDate: new Date('2023-07-01'), endDate: new Date('2024-06-30'), status: 'COMPLETED' }
  ];

  const yearMap = {};
  for (const y of academicYearsData) {
    const yrDoc = await AcademicYear.create({
      institutionId: institution._id,
      code: y.code,
      startDate: y.startDate,
      endDate: y.endDate,
      status: y.status
    });
    yearMap[y.code] = yrDoc;
  }

  const currentAcademicYear = yearMap['2026-2027'];
  const termOdd2026 = await AcademicTerm.create({
    academicYearId: currentAcademicYear._id,
    code: 'ODD_SEM_2026',
    name: 'Odd Semester 2026 (Sem 1, 3, 5, 7)',
    type: 'SEMESTER',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-12-15'),
    status: 'ACTIVE'
  });

  const termEven2027 = await AcademicTerm.create({
    academicYearId: currentAcademicYear._id,
    code: 'EVEN_SEM_2027',
    name: 'Even Semester 2027 (Sem 2, 4, 6, 8)',
    type: 'SEMESTER',
    startDate: new Date('2027-01-05'),
    endDate: new Date('2027-05-30'),
    status: 'UPCOMING'
  });

  // 4. Programmes & Semesters
  const progMap = {};
  const semMap = {};

  for (const d of departmentsData) {
    const deptDoc = deptMap[d.code];
    const isBE = d.degree === 'B.E.';
    const progDoc = await Programme.create({
      departmentId: deptDoc._id,
      code: `${isBE ? 'BE' : 'BTECH'}-${d.code}`,
      name: `${d.degree} in ${d.name}`,
      degree: d.degree,
      durationYears: 4,
      totalSemesters: 8,
      academicLevel: 'UG',
      minimumCredits: 160,
      status: 'ACTIVE'
    });
    progMap[d.code] = progDoc;

    const regulation = await Regulation.create({
      programmeId: progDoc._id,
      code: `R2026-${d.code}`,
      name: `Regulation 2026 (${d.code})`,
      effectiveFromYear: currentAcademicYear._id,
      status: 'ACTIVE'
    });

    const curriculum = await CurriculumVersion.create({
      regulationId: regulation._id,
      versionNumber: 1,
      effectiveTermId: termOdd2026._id,
      totalCreditsRequired: 160,
      status: 'ACTIVE'
    });

    for (let s = 1; s <= 8; s++) {
      const semDoc = await Semester.create({
        curriculumVersionId: curriculum._id,
        sequenceNumber: s,
        name: `Semester ${s}`,
        requiredCredits: 20,
        status: 'ACTIVE'
      });
      semMap[`${d.code}_sem_${s}`] = {
        semester: semDoc,
        programme: progDoc,
        regulation: regulation,
        curriculum: curriculum
      };
    }
  }
  console.log(`  ✓ Inserted Programmes, Regulations, Curriculums, and Semesters 1-8 for all 8 departments`);

  // =========================================================================
  // STEP 3: MASTER COURSES, COURSE OFFERINGS, AND 5 UNITS
  // =========================================================================
  console.log('\n[3/3] Seeding 485 enterprise courses with 5-Unit structure & enrollments...');

  const masterCourseDocsMap = {};
  for (const c of coursesDataset.courses) {
    const deptDoc = deptMap[c.departmentId];
    if (!masterCourseDocsMap[c.masterCourseId]) {
      masterCourseDocsMap[c.masterCourseId] = {
        departmentId: deptDoc._id,
        code: c.courseCode,
        title: c.courseName,
        shortName: c.courseCode,
        description: `Comprehensive academic curriculum for ${c.courseName} (${c.courseCode})`,
        level: 'UG',
        type: c.courseName.toLowerCase().includes('laboratory') || c.courseName.toLowerCase().includes('lab') ? 'LAB' : 'THEORY',
        credits: 3,
        status: 'ACTIVE'
      };
    }
  }

  const masterCourseInserted = {};
  for (const mId of Object.keys(masterCourseDocsMap)) {
    try {
      const mDoc = await CourseMaster.create(masterCourseDocsMap[mId]);
      masterCourseInserted[mId] = mDoc;
    } catch (e) {
      const existing = await CourseMaster.findOne({ code: masterCourseDocsMap[mId].code });
      masterCourseInserted[mId] = existing;
    }
  }
  console.log(`  ✓ Inserted ${Object.keys(masterCourseInserted).length} unique Master Courses`);

  // Group courses by department and semester for enrollment matching
  const coursesByDeptAndSem = {};
  for (const c of coursesDataset.courses) {
    if (!coursesByDeptAndSem[c.departmentId]) coursesByDeptAndSem[c.departmentId] = {};
    if (!coursesByDeptAndSem[c.departmentId][c.semester]) coursesByDeptAndSem[c.departmentId][c.semester] = [];
    coursesByDeptAndSem[c.departmentId][c.semester].push(c.courseId);
  }

  // Pre-calculate which students belong to which course
  const studentsForCourse = {}; // courseId -> array of studentIds
  for (const deptCode of Object.keys(studentsByDeptAndYear)) {
    const deptStudents = studentsByDeptAndYear[deptCode];
    for (const yearStr of Object.keys(deptStudents)) {
      const yearNum = parseInt(yearStr, 10);
      const activeSem = yearNum * 2 - 1; // Sem 1, 3, 5, 7
      const courseIds = coursesByDeptAndSem[deptCode]?.[activeSem] || [];
      const studentsList = deptStudents[yearNum] || [];
      const studentIds = studentsList.map(s => s._id);

      for (const cId of courseIds) {
        if (!studentsForCourse[cId]) studentsForCourse[cId] = [];
        studentsForCourse[cId].push(...studentIds);
      }
    }
  }

  // Build Course models and relational offerings
  const courseDocs = [];
  const offeringDocs = [];
  const sectionDocs = [];
  const facultyAssignmentDocs = [];

  for (let idx = 0; idx < coursesDataset.courses.length; idx++) {
    const c = coursesDataset.courses[idx];
    const deptDoc = deptMap[c.departmentId];
    const semContext = semMap[`${c.departmentId}_sem_${c.semester}`];
    const masterDoc = masterCourseInserted[c.masterCourseId];

    // Pick faculty member
    const deptFacultyForYear = facultyByDeptAndYear[c.departmentId]?.[c.yearOfStudy] || [];
    let assignedFaculty = null;
    if (deptFacultyForYear.length > 0) {
      assignedFaculty = deptFacultyForYear[idx % deptFacultyForYear.length];
    } else {
      const hod = userMap[`${c.departmentId.toLowerCase()}hod`];
      assignedFaculty = hod || { _id: 'unassigned', displayName: 'Department Faculty' };
    }

    const units = generateCourseUnits(c.courseName);
    const enrolledStudentIds = studentsForCourse[c.courseId] || [];

    courseDocs.push({
      courseId: c.courseId,
      masterCourseId: c.masterCourseId,
      code: c.courseCode,
      title: c.courseName,
      description: `Comprehensive study of ${c.courseName} for ${c.departmentId} students (Semester ${c.semester}).`,
      department: c.departmentId,
      program: c.program,
      yearOfStudy: c.yearOfStudy,
      semester: c.semester,
      category: c.category || 'CORE',
      categorySource: c.categorySource || 'Core',
      facultyOwnerId: assignedFaculty ? assignedFaculty._id : null,
      facultyName: assignedFaculty ? assignedFaculty.displayName : 'Faculty In-Charge',
      status: 'published',
      capacity: 60,
      credits: 3,
      units: units,
      content: [
        { title: `${c.courseName} Course Syllabus & Objectives`, type: 'document', url: 'https://edusphere-assets.s3.amazonaws.com/syllabus.pdf', addedAt: new Date() }
      ],
      enrolledStudents: enrolledStudentIds
    });

    if (semContext && masterDoc) {
      const isOddSem = c.semester % 2 !== 0;
      const termId = isOddSem ? termOdd2026._id : termEven2027._id;
      const offeringObjId = new mongoose.Types.ObjectId();
      const sectionObjId = new mongoose.Types.ObjectId();

      offeringDocs.push({
        _id: offeringObjId,
        courseId: masterDoc._id,
        academicYearId: currentAcademicYear._id,
        academicTermId: termId,
        programmeId: semContext.programme._id,
        curriculumVersionId: semContext.curriculum._id,
        semesterId: semContext.semester._id,
        capacity: 60,
        status: 'ACTIVE'
      });

      sectionDocs.push({
        _id: sectionObjId,
        courseOfferingId: offeringObjId,
        code: 'A',
        capacity: 60,
        room: `Hall-${c.departmentId}-${c.semester}01`,
        status: 'ACTIVE'
      });

      if (assignedFaculty && assignedFaculty._id !== 'unassigned') {
        facultyAssignmentDocs.push({
          sectionId: sectionObjId,
          facultyId: assignedFaculty._id,
          role: 'PRIMARY',
          status: 'ACTIVE'
        });
      }
    }
  }

  // Insert all courses in batches
  const batchSize = 250;
  for (let i = 0; i < courseDocs.length; i += batchSize) {
    await CourseModel.insertMany(courseDocs.slice(i, i + batchSize));
  }
  console.log(`  ✓ Inserted ${courseDocs.length} Course documents with 5 Units and enrollments`);

  // Insert Offerings, Sections, and Faculty Assignments
  await CourseOffering.insertMany(offeringDocs);
  await Section.insertMany(sectionDocs);
  await FacultyAssignment.insertMany(facultyAssignmentDocs);
  console.log(`  ✓ Inserted ${offeringDocs.length} Course Offerings, Sections, and Faculty Assignments`);

  // Create StudentAcademicPlans
  const academicPlans = [];
  for (const deptCode of Object.keys(studentsByDeptAndYear)) {
    const deptStudents = studentsByDeptAndYear[deptCode];
    const semContext1 = semMap[`${deptCode}_sem_1`];
    if (!semContext1) continue;

    for (const yearStr of Object.keys(deptStudents)) {
      for (const student of deptStudents[yearStr]) {
        academicPlans.push({
          studentId: student._id,
          programmeId: semContext1.programme._id,
          regulationId: semContext1.regulation._id,
          curriculumVersionId: semContext1.curriculum._id,
          academicStatus: 'ACTIVE'
        });
      }
    }
  }

  for (let i = 0; i < academicPlans.length; i += batchSize) {
    await StudentAcademicPlan.insertMany(academicPlans.slice(i, i + batchSize));
  }
  console.log(`  ✓ Inserted ${academicPlans.length} Student Academic Plans`);

  let totalStudentEnrollments = 0;
  for (const s of Object.values(studentsForCourse)) {
    totalStudentEnrollments += s.length;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                 ENTERPRISE SEEDING COMPLETE                   ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✓ Users (edusphere_auth):           ${allDbUsers.length}`);
  console.log(`  ✓ Profiles (edusphere_users):        ${allDbUsers.length}`);
  console.log(`  ✓ Departments:                      8 (CSE, EEE, ECE, MECH, AGRI, AIDS, BT, IT)`);
  console.log(`  ✓ Programmes & Regulations:         8`);
  console.log(`  ✓ Master Courses (CourseMaster):    ${Object.keys(masterCourseInserted).length}`);
  console.log(`  ✓ Course Offerings with 5 Units:    ${courseDocs.length}`);
  console.log(`  ✓ Faculty Section Assignments:      ${facultyAssignmentDocs.length}`);
  console.log(`  ✓ Student Academic Plans:           ${academicPlans.length}`);
  console.log(`  ✓ Active Course Enrollments:        ${totalStudentEnrollments}`);
  console.log('\n  All users password: demo123 (hashed with bcrypt)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seedEnterpriseData().then(() => {
  console.log('Enterprise seed successfully completed.');
  process.exit(0);
}).catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
