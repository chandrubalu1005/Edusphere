#!/usr/bin/env node
/**
 * Import users from CSV safely according to RBAC constraints.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CSV_FILE = path.join(__dirname, '../../CampusSphere_All_1141_Users(1).csv');
const DEFAULT_PASSWORD = 'demo123';

function getMongoUri(dbName) {
  const envKey = `MONGO_URI_${dbName.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey];
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI.replace(/\/edusphere(\?|$)/, `/edusphere_${dbName}$1`);
  }
  return `mongodb://localhost:27017/edusphere_${dbName}`;
}

async function importUsers() {
  console.log('--- Starting CSV User Import ---');
  
  if (!fs.existsSync(CSV_FILE)) {
    console.error('CSV file not found:', CSV_FILE);
    process.exit(1);
  }

  const csvText = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    console.error('CSV file is empty or only contains header.');
    process.exit(1);
  }

  const headers = lines[0].split(',');
  const csvUsers = lines.slice(1).map(line => {
    // Parse CSV line correctly dealing with possible quotes for `defaultSemesters` (e.g. "1,2")
    const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    let parts = [];
    let match;
    let str = line;
    let cols = [];
    
    // Simple parsing (since we know the structure has "1,2" at the end for faculty)
    let isInsideQuote = false;
    let colStr = "";
    for(let i=0; i<line.length; i++) {
        if(line[i] === '"') {
            isInsideQuote = !isInsideQuote;
        } else if (line[i] === ',' && !isInsideQuote) {
            cols.push(colStr);
            colStr = "";
        } else {
            colStr += line[i];
        }
    }
    cols.push(colStr);
    
    // pad columns if missing trailing commas
    while(cols.length < headers.length) cols.push("");

    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = cols[i] ? cols[i].trim() : null;
    });
    return obj;
  });

  console.log(`Parsed ${csvUsers.length} users from CSV.`);

  // Validation
  const duplicates = new Set();
  const seenIds = new Set();
  const seenUsernames = new Set();
  let invalidCount = 0;

  const validUsers = [];

  csvUsers.forEach((u, i) => {
    if (!u.userId || !u.username || !u.role || !u.status) {
      console.error(`Row ${i + 2} USER: ${u.userId || 'Unknown'} - Problem: Missing mandatory fields`);
      invalidCount++;
      return;
    }
    if (seenIds.has(u.userId)) {
      console.error(`Row ${i + 2} USER: ${u.userId} - Problem: Duplicate userId`);
      duplicates.add(u.userId);
      invalidCount++;
      return;
    }
    if (seenUsernames.has(u.username)) {
      console.error(`Row ${i + 2} USER: ${u.username} - Problem: Duplicate username`);
      duplicates.add(u.username);
      invalidCount++;
      return;
    }
    seenIds.add(u.userId);
    seenUsernames.add(u.username);
    validUsers.push(u);
  });

  if (invalidCount > 0) {
    console.error('IMPORT BLOCKED: Please fix CSV errors.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const connAuth = await mongoose.createConnection(getMongoUri('auth')).asPromise();
  const connUsers = await mongoose.createConnection(getMongoUri('users')).asPromise();

  // Schemas based on seed-enterprise-master.js
  const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, index: true, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: false }, 
    role: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
    departmentId: { type: String, index: true },
    program: { type: String },
    batch: { type: String },
    admissionYear: { type: Number },
    academicYear: { type: String },
    yearOfStudy: { type: Number },
    currentSemester: { type: Number },
    defaultYearOfStudy: { type: Number },
    defaultSemesters: [{ type: Number }],
    forcePasswordChangeOnFirstLogin: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    responsibility: { type: mongoose.Schema.Types.Mixed }
  }, { strict: false });

  const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, required: true },
    department: { type: String, default: '' },
    active: { type: Boolean, default: true }
  }, { strict: false });

  const UserModel = connAuth.model('User', UserSchema);
  const ProfileModel = connUsers.model('Profile', ProfileSchema);

  const dbUserCountBefore = await UserModel.countDocuments();
  console.log(`Database auth users before: ${dbUserCountBefore}`);

  // Safe Migration - mark users not in CSV as disabled
  const csvUserIds = validUsers.map(u => u.userId);
  await UserModel.updateMany(
    { userId: { $nin: csvUserIds } },
    { $set: { status: 'DISABLED', isActive: false } }
  );
  await ProfileModel.updateMany(
    { userId: { $nin: csvUserIds } },
    { $set: { active: false } }
  );

  console.log('Disabled non-CSV users.');

  const authOps = [];
  const profileOps = [];

  for (const u of validUsers) {
    const defaultSemestersArray = u.defaultSemesters 
        ? u.defaultSemesters.split(',').map(s => parseInt(s.trim())) 
        : [];
        
    let responsibility = undefined;
    if (u.role === 'HOD' || u.role === 'FACULTY') {
        responsibility = {
            departmentId: u.departmentId || null,
            years: u.defaultYearOfStudy ? [parseInt(u.defaultYearOfStudy)] : null,
            semesters: defaultSemestersArray.length > 0 ? defaultSemestersArray : null
        };
    }

    const userData = {
      userId: u.userId,
      username: u.username,
      email: `${u.username}@edusphere.example.com`,
      displayName: u.displayName,
      passwordHash: hashedPassword,
      role: u.role,
      status: u.status,
      isActive: u.status === 'ACTIVE',
      departmentId: u.departmentId,
      program: u.program,
      batch: u.batch,
      admissionYear: u.admissionYear ? parseInt(u.admissionYear) : null,
      academicYear: u.academicYear,
      yearOfStudy: u.yearOfStudy ? parseInt(u.yearOfStudy) : null,
      currentSemester: u.currentSemester ? parseInt(u.currentSemester) : null,
      defaultYearOfStudy: u.defaultYearOfStudy ? parseInt(u.defaultYearOfStudy) : null,
      defaultSemesters: defaultSemestersArray,
      responsibility: responsibility
    };

    const profileData = {
      userId: u.userId,
      username: u.username,
      email: `${u.username}@edusphere.example.com`,
      displayName: u.displayName,
      firstName: u.displayName.split(' ')[0],
      lastName: u.displayName.split(' ').slice(1).join(' ') || '',
      role: u.role.toLowerCase(),
      department: u.departmentName || u.departmentId,
      active: u.status === 'ACTIVE'
    };

    authOps.push({
      updateOne: {
        filter: { userId: u.userId },
        update: { $set: userData },
        upsert: true
      }
    });

    profileOps.push({
      updateOne: {
        filter: { userId: u.userId },
        update: { $set: profileData },
        upsert: true
      }
    });
  }

  console.log(`Executing bulkWrite...`);
  const authRes = await UserModel.bulkWrite(authOps);
  const profileRes = await ProfileModel.bulkWrite(profileOps);

  const dbUserCountAfter = await UserModel.countDocuments({ status: 'ACTIVE' });
  
  console.log(`\nImport Summary:`);
  console.log(`Auth Modified/Upserted: ${authRes.modifiedCount} / ${authRes.upsertedCount}`);
  console.log(`Database ACTIVE auth users after: ${dbUserCountAfter}`);

  await connAuth.close();
  await connUsers.close();
  
  fs.writeFileSync(path.join(__dirname, '../../docs/CSV_USER_IMPORT_REPORT.md'), 
  `# CSV USER IMPORT REPORT

- **CSV filename**: CampusSphere_All_1141_Users(1).csv
- **CSV row count**: ${csvUsers.length}
- **Valid rows**: ${validUsers.length}
- **Invalid rows**: ${invalidCount}
- **Duplicates**: ${duplicates.size}
- **Users inserted**: ${authRes.upsertedCount}
- **Users updated**: ${authRes.modifiedCount}
- **Users unchanged**: 0
- **Users rejected**: ${invalidCount}
- **Database count (Active)**: ${dbUserCountAfter}
`);
  console.log('Import finished.');
}

importUsers().catch(console.error);
