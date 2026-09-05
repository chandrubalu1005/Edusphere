const {
  Institution,
  Campus,
  Department,
  AcademicYear,
  AcademicTerm
} = require('../../services/course-service/src/models/academic/Institution');

const {
  Programme,
  Regulation,
  CurriculumVersion,
  Semester,
  CourseGroup
} = require('../../services/course-service/src/models/academic/Programme');

module.exports = async function seedAcademicFoundation(ctx) {
  // 1. Institution & Campus
  const institution = new Institution({
    code: 'CSU',
    name: 'CampusSphere University',
    establishedYear: 1995,
    status: 'ACTIVE'
  });
  await institution.save();
  ctx.institutionId = institution._id;

  const campus = new Campus({
    institutionId: institution._id,
    code: 'MAIN',
    name: 'Main Campus',
    status: 'ACTIVE'
  });
  await campus.save();
  ctx.campusId = campus._id;

  // 2. Departments
  const depts = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'ECE', name: 'Electronics & Communication' },
    { code: 'MECH', name: 'Mechanical Engineering' }
  ];
  ctx.departments = {};
  
  for (const d of depts) {
    const dept = new Department({
      institutionId: institution._id,
      campusId: campus._id,
      code: d.code,
      name: d.name,
      status: 'ACTIVE'
    });
    await dept.save();
    ctx.departments[d.code] = dept._id;
  }

  // 3. Academic Year & Term
  const year = new AcademicYear({
    institutionId: institution._id,
    code: '2026-2027',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2027-05-31'),
    status: 'ACTIVE'
  });
  await year.save();
  ctx.academicYearId = year._id;

  const term = new AcademicTerm({
    academicYearId: year._id,
    code: 'FALL_2026',
    name: 'Fall Semester 2026',
    type: 'SEMESTER',
    startDate: new Date('2026-08-15'),
    endDate: new Date('2026-12-20'),
    status: 'ACTIVE'
  });
  await term.save();
  ctx.academicTermId = term._id;

  // 4. Programmes & Curriculums
  const programs = [
    { code: 'BTECH-CSE', name: 'Bachelor of Technology in CSE', dept: 'CSE' },
    { code: 'BTECH-ECE', name: 'Bachelor of Technology in ECE', dept: 'ECE' },
    { code: 'BTECH-MECH', name: 'Bachelor of Technology in MECH', dept: 'MECH' }
  ];
  ctx.programmes = {};
  ctx.semesters = {};

  for (const p of programs) {
    const prog = new Programme({
      departmentId: ctx.departments[p.dept],
      code: p.code,
      name: p.name,
      degree: 'B.Tech',
      durationYears: 4,
      totalSemesters: 8,
      academicLevel: 'UG',
      minimumCredits: 160,
      status: 'ACTIVE'
    });
    await prog.save();
    ctx.programmes[p.code] = prog._id;

    const reg = new Regulation({
      programmeId: prog._id,
      code: `R2024-${p.code}`,
      name: `Regulation 2024 for ${p.code}`,
      status: 'ACTIVE'
    });
    await reg.save();
    if (!ctx.regulations) ctx.regulations = {};
    ctx.regulations[p.code] = reg._id;

    const curr = new CurriculumVersion({
      regulationId: reg._id,
      versionNumber: 1.0,
      totalCreditsRequired: 160,
      status: 'ACTIVE'
    });
    await curr.save();
    if (!ctx.curriculums) ctx.curriculums = {};
    ctx.curriculums[p.code] = curr._id;
    
    ctx.semesters[p.code] = [];
    
    // Create Semesters 1 to 8
    for (let i = 1; i <= 8; i++) {
      const sem = new Semester({
        curriculumVersionId: curr._id,
        sequenceNumber: i,
        name: `Semester ${i}`,
        requiredCredits: 20,
        status: 'ACTIVE'
      });
      await sem.save();
      ctx.semesters[p.code].push(sem._id);
    }
  }

  console.log('  ✓ Inserted Academic Hierarchy (Institution, Campus, Depts, Terms, Programmes)');
};
