const mongoose = require('mongoose');
const PlacementDrive = require('../../services/placement-service/src/models/PlacementDrive');
const PlacementApplication = require('../../services/placement-service/src/models/PlacementApplication');

const Approval = mongoose.models.Approval || mongoose.model('Approval', new mongoose.Schema({}, { strict: false }));
const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

module.exports = async function seedPlacements(ctx) {
  const drivesData = [
    { name: 'Google', title: 'Software Engineer', salary: '25 LPA' },
    { name: 'Microsoft', title: 'SDE-1', salary: '22 LPA' },
    { name: 'Amazon', title: 'SDE', salary: '20 LPA' },
    { name: 'Atlassian', title: 'Backend Engineer', salary: '30 LPA' },
    { name: 'TCS', title: 'System Engineer', salary: '7 LPA' }
  ];

  let totalDrives = 0;
  let totalApps = 0;

  const drivesToInsert = [];
  const appsToInsert = [];

  for (const d of drivesData) {
    const driveId = new mongoose.Types.ObjectId();
    drivesToInsert.push({
      _id: driveId,
      companyName: d.name,
      jobTitle: d.title,
      salaryPackage: d.salary,
      date: new Date(Date.now() + Math.random() * 86400000 * 30),
      eligibilityCriteria: 'Minimum CGPA 7.0',
      description: `Hiring ${d.title} for upcoming batch.`,
      status: 'active'
    });
    totalDrives++;

    const applicantCount = Math.floor(Math.random() * 20) + 5;
    const shuffled = [...ctx.users.student].sort(() => 0.5 - Math.random());
    const applicants = shuffled.slice(0, applicantCount);

    for (const studentId of applicants) {
      const studentProfile = ctx.profiles[studentId];
      if (!studentProfile) continue;
      const rand = Math.random();
      let status = 'applied';
      if (rand > 0.8) status = 'selected';
      else if (rand > 0.5) status = 'shortlisted';
      else if (rand > 0.3) status = 'rejected';

      appsToInsert.push({
        driveId: driveId.toString(),
        companyName: d.name,
        studentId: studentId.toString(),
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        status: status
      });
      totalApps++;
    }
  }

  await PlacementDrive.insertMany(drivesToInsert);
  await PlacementApplication.insertMany(appsToInsert);

  const approvalsToInsert = [];
  let totalApprovals = 0;
  const approvalTypes = ['Budget Request', 'Event Proposal', 'Curriculum Update'];
  
  for (let i = 0; i < 5; i++) {
    approvalsToInsert.push({
      title: approvalTypes[i % approvalTypes.length],
      requesterId: ctx.users.faculty[0],
      requesterName: 'Faculty One',
      approverId: ctx.users.management[0],
      status: i === 0 ? 'approved' : 'pending',
      amount: Math.floor(Math.random() * 50000) + 10000,
      submittedAt: new Date()
    });
    totalApprovals++;
  }
  await Approval.insertMany(approvalsToInsert);

  const notifsToInsert = [];
  let totalNotifications = 0;
  for (let i = 0; i < 15; i++) {
    notifsToInsert.push({
      userId: ctx.users.management[0],
      title: 'New System Update',
      message: 'A new administrative process has been deployed.',
      read: false,
      createdAt: new Date()
    });
    totalNotifications++;
  }
  await Notification.insertMany(notifsToInsert);

  console.log(`  ✓ Inserted ${totalDrives} Placement Drives`);
  console.log(`  ✓ Inserted ${totalApps} Placement Applications`);
  console.log(`  ✓ Inserted ${totalApprovals} Approvals`);
  console.log(`  ✓ Inserted ${totalNotifications} Notifications`);
};
