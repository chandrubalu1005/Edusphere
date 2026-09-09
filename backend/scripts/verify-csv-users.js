const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const CSV_FILE = path.join(__dirname, '../../CampusSphere_All_1141_Users(1).csv');

function getMongoUri(dbName) {
  const envKey = `MONGO_URI_${dbName.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey];
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI.replace(/\/edusphere(\?|$)/, `/edusphere_${dbName}$1`);
  }
  return `mongodb://localhost:27017/edusphere_${dbName}`;
}

async function verifyUsers() {
  console.log('--- Starting CSV Verification ---');
  
  const csvText = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const headers = lines[0].split(',');
  
  const csvUsers = lines.slice(1).map(line => {
    const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    let parts = [];
    let isInsideQuote = false;
    let colStr = "";
    for(let i=0; i<line.length; i++) {
        if(line[i] === '"') isInsideQuote = !isInsideQuote;
        else if (line[i] === ',' && !isInsideQuote) {
            parts.push(colStr);
            colStr = "";
        } else {
            colStr += line[i];
        }
    }
    parts.push(colStr);
    while(parts.length < headers.length) parts.push("");
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = parts[i] ? parts[i].trim() : null; });
    return obj;
  });

  const connAuth = await mongoose.createConnection(getMongoUri('auth')).asPromise();
  const UserModel = connAuth.model('User', new mongoose.Schema({}, { strict: false }));

  const verificationRows = [];
  verificationRows.push("userId,username,role,csvExists,dbExists,identityMatch,roleMatch,statusMatch,departmentMatch,academicMatch,overallStatus");

  let matchCount = 0;
  let mismatchCount = 0;

  let csvRoles = {};
  let dbRoles = {};
  let csvDepts = {};
  let dbDepts = {};

  const dbUsers = await UserModel.find({ isActive: true }).lean();
  const dbUsersMap = {};
  dbUsers.forEach(u => {
    dbUsersMap[u.userId] = u;
    dbRoles[u.role] = (dbRoles[u.role] || 0) + 1;
    if (u.departmentId) {
      dbDepts[u.departmentId] = (dbDepts[u.departmentId] || 0) + 1;
    }
  });

  csvUsers.forEach(u => {
    csvRoles[u.role] = (csvRoles[u.role] || 0) + 1;
    if (u.departmentId) {
      csvDepts[u.departmentId] = (csvDepts[u.departmentId] || 0) + 1;
    }

    const dbU = dbUsersMap[u.userId];
    let dbExists = !!dbU;
    let identityMatch = dbExists && dbU.username === u.username && dbU.displayName === u.displayName;
    let roleMatch = dbExists && dbU.role === u.role;
    let statusMatch = dbExists && dbU.status === u.status;
    let departmentMatch = dbExists && (dbU.departmentId || null) === u.departmentId;
    
    // Check academic matches where present
    let academicMatch = true;
    if (dbExists) {
        if (u.program && dbU.program !== u.program) academicMatch = false;
        if (u.batch && dbU.batch !== u.batch) academicMatch = false;
        if (u.yearOfStudy && dbU.yearOfStudy != u.yearOfStudy) academicMatch = false;
        if (u.currentSemester && dbU.currentSemester != u.currentSemester) academicMatch = false;
    } else {
        academicMatch = false;
    }

    let overallStatus = (dbExists && identityMatch && roleMatch && statusMatch && departmentMatch && academicMatch) ? 'PASS' : 'FAIL';
    
    if (overallStatus === 'PASS') matchCount++;
    else mismatchCount++;

    verificationRows.push(`${u.userId},${u.username},${u.role},true,${dbExists},${identityMatch},${roleMatch},${statusMatch},${departmentMatch},${academicMatch},${overallStatus}`);
  });

  fs.writeFileSync(path.join(__dirname, '../../docs/CSV_USER_FULL_VERIFICATION.csv'), verificationRows.join('\n'));

  // Create RECONCILIATION markdown
  let md = `# CSV vs Database Reconciliation\n\n`;
  md += `## Role Distribution\n\n| Role | CSV Count | DB Count | Match |\n|---|---|---|---|\n`;
  for (let role of Object.keys(csvRoles)) {
      let dbC = dbRoles[role] || 0;
      md += `| ${role} | ${csvRoles[role]} | ${dbC} | ${csvRoles[role] === dbC ? '✅' : '❌'} |\n`;
  }
  
  md += `\n## Department Distribution\n\n| Department | CSV Count | DB Count | Match |\n|---|---|---|---|\n`;
  for (let dept of Object.keys(csvDepts)) {
      let dbC = dbDepts[dept] || 0;
      md += `| ${dept} | ${csvDepts[dept]} | ${dbC} | ${csvDepts[dept] === dbC ? '✅' : '❌'} |\n`;
  }

  md += `\n## Summary\n`;
  md += `- CSV Users: ${csvUsers.length}\n`;
  md += `- Matched: ${matchCount}\n`;
  md += `- Mismatched: ${mismatchCount}\n`;

  fs.writeFileSync(path.join(__dirname, '../../docs/CSV_USER_DATABASE_RECONCILIATION.md'), md);
  
  await connAuth.close();
  console.log(`Verification complete. Mismatches: ${mismatchCount}`);
}

verifyUsers().catch(console.error);
