# CampusSphere — Realistic User Seed Data Specification

## 1. Purpose

This document defines the development seed population for the CampusSphere college environment.

All names are fictional demo identities. The dataset is intended for local/private-network development, RBAC testing, API authorization testing, audit testing and UI walkthroughs.

Default development password:

`demo123`

The plaintext password must NEVER be inserted into the database. The seed process must pass it through the project's password hashing service (Argon2id or bcrypt as configured).

All seeded users should have:

```text
forcePasswordChangeOnFirstLogin = true
status = ACTIVE
```

---

# 2. Population

| Role | Count |
|---|---:|
| Root Admin | 1 |
| Admin | 4 |
| Management | 8 |
| HOD | 8 |
| Faculty | 160 |
| Students | 960 |
| **Total** | **1,141** |

---

# 3. Department Population

| Code | Department | Program | HOD | Faculty | Students |
|---|---|---|---:|---:|---:|
| CSE | Computer Science & Engineering | B.E. | 1 | 20 | 120 |
| EEE | Electrical & Electronics Engineering | B.E. | 1 | 20 | 120 |
| ECE | Electronics & Communication Engineering | B.E. | 1 | 20 | 120 |
| MECH | Mechanical Engineering | B.E. | 1 | 20 | 120 |
| AGRI | Agricultural Engineering | B.Tech. | 1 | 20 | 120 |
| AIDS | Artificial Intelligence & Data Science | B.Tech. | 1 | 20 | 120 |
| BT | Biotechnology | B.Tech. | 1 | 20 | 120 |
| IT | Information Technology | B.Tech. | 1 | 20 | 120 |

---

# 4. Global Accounts

## Root Admin

```text
User ID: ROOT-ADMIN-001
Username: rootadmin
Name: Rajesh Kumar
Role: ROOT_ADMIN
Department: GLOBAL
Password: demo123
```

## Initial Admins

```text
ADMIN-001 | admin01 | Suresh Krishnan
ADMIN-002 | admin02 | Karthikeyan Subramaniam
ADMIN-003 | admin03 | Ramesh Balakrishnan
ADMIN-004 | admin04 | Muruganandam Ravi
```

All are:

```text
Role: ADMIN
Scope: GLOBAL
Password: demo123
```

Only Root Admin can delete these accounts.

---

# 5. Management Accounts

One Management user is initially associated with each department for responsibility/dashboard distribution.

The association is metadata for workload/responsibility distribution; Management retains approved global institutional authority.

```text
MGT-001 | management01 | Department: CSE
MGT-002 | management02 | Department: EEE
MGT-003 | management03 | Department: ECE
MGT-004 | management04 | Department: MECH
MGT-005 | management05 | Department: AGRI
MGT-006 | management06 | Department: AIDS
MGT-007 | management07 | Department: BT
MGT-008 | management08 | Department: IT
```

Each Management user initially has responsibility metadata:

```text
Years: 1,2,3,4
Semesters: 1,2,3,4,5,6,7,8
```

---

# 6. HOD Accounts

Exactly one HOD per department:

```text
CSE-HOD-001 | csehod   | Dr. Arun Kumar
EEE-HOD-001 | eeehod   | Dr. Venkatesh Raman
ECE-HOD-001 | ecehod   | Dr. Meenakshi Suresh
MECH-HOD-001| mechhod  | Dr. Prakash Raj
AGRI-HOD-001| agrihod  | Dr. Senthil Kumar
AIDS-HOD-001| aidshod  | Dr. Kavitha Krishnan
BT-HOD-001  | bthod    | Dr. Muruganandam Ravi
IT-HOD-001  | ithod    | Dr. Deepak Srinivasan
```

HOD scope:

```text
Own Department
+
Years 1–4
+
Semesters 1–8
+
All department courses
+
Department library
```

---

# 7. Faculty Accounts

Exactly 20 Faculty per department.

Default distribution:

```text
Department
├── Year 1 → Faculty 001–005
├── Year 2 → Faculty 006–010
├── Year 3 → Faculty 011–015
└── Year 4 → Faculty 016–020
```

Therefore:

```text
8 departments × 20 faculty = 160 faculty
```

This is an INITIAL assignment scope only. Actual course authorization must later be created through FacultyAssignment records:

```text
Faculty
→ Department
→ Year
→ Semester
→ Course Offering
```

Faculty usernames follow:

```text
csefac001
csefac002
...
eeeefac001
...
```

Recommended normalization:

```text
{departmentCodeLower}fac{sequence}
```

Examples:

```text
csefac001
eeefac001
ecefac001
mechfac001
agrifac001
aidsfac001
btfac001
itfac001
```

---

# 8. Student Accounts

Exactly 30 students per department per year.

```text
8 departments
× 4 years
× 30 students
=
960 students
```

Student ID pattern:

```text
{DEPT}{ADMISSION_YEAR}A{SEQUENCE}
```

Examples:

```text
CSE26A001
CSE26A002
...
CSE26A030
```

Year 1:

```text
Batch: 2026–2030
Admission Year: 2026
Academic Year: 2026–27
Semester: 1
```

Year 2:

```text
Batch: 2025–2029
Admission Year: 2025
Academic Year: 2026–27
Semester: 3
```

Year 3:

```text
Batch: 2024–2028
Admission Year: 2024
Academic Year: 2026–27
Semester: 5
```

Year 4:

```text
Batch: 2023–2027
Admission Year: 2023
Academic Year: 2026–27
Semester: 7
```

This creates a realistic multi-batch college operating simultaneously.

---

# 9. Student Data Fields

Each student should contain:

```text
userId
username
name
role
departmentId
departmentName
program
batch
admissionYear
yearOfStudy
academicYear
currentSemester
status
forcePasswordChange
```

Do not use the student's `yearOfStudy` as a substitute for semester or batch.

---

# 10. Faculty Data Fields

Each faculty should contain:

```text
userId
username
name
role
departmentId
departmentName
program
defaultYear
scope.departmentId
scope.years
scope.semesters
status
forcePasswordChange
```

Actual course access should NOT be inferred solely from these fields.

The later `FacultyAssignment` table/collection is authoritative for course editing.

---

# 11. User Status

Do not destructively delete normal users.

Recommended lifecycle:

```text
ACTIVE
INACTIVE
SUSPENDED
TRANSFERRED
GRADUATED
DROPPED
```

For Faculty:

```text
ACTIVE
INACTIVE
SUSPENDED
```

For Students:

```text
ACTIVE
PROMOTED
GRADUATED
SUSPENDED
TRANSFERRED
DROPPED
```

Historical records remain intact.

---

# 12. Seed Relationships — Important

The user seed should create identities and academic context first.

Do NOT randomly assign courses in the user collection.

Later seed modules should create:

```text
Curriculum
CourseOffering
FacultyAssignment
Enrollment
ElectiveGroup
Honors/Minor Enrollment
```

This separation prevents the user seed from becoming a source of inconsistent academic relationships.

---

# 13. Initial Faculty Distribution

For every department:

```text
Year 1:
5 Faculty

Year 2:
5 Faculty

Year 3:
5 Faculty

Year 4:
5 Faculty
```

A faculty member can later be assigned multiple courses.

Example:

```text
CSE-FAC-006
Year 2
Semester 3
Course: 22CS302 Data Structures I

CSE-FAC-006
Year 2
Semester 4
Course: 22CS402 Data Structures II
```

Course assignment is therefore many-to-many over time.

---

# 14. Password Policy

Development seed password:

```text
demo123
```

Storage:

```text
demo123
   ↓
Password Service
   ↓
Argon2id / bcrypt hash
   ↓
Database
```

Never:

```text
database.password = "demo123"
```

First login:

```text
forcePasswordChange = true
```

Production deployment must replace the development seed password.

---

# 15. Required Seed Validation

After insertion, the seed script must verify:

```text
1 Root Admin
4 Admin
8 Management
8 HOD
160 Faculty
960 Students
```

And:

```text
8 departments
20 faculty per department
5 faculty per year per department
30 students per year per department
120 students per department
960 students total
```

The script should fail rather than silently create an incomplete dataset.

---

# 16. Login Test Matrix

The seeded accounts must support these RBAC tests:

### Root Admin

```text
rootadmin / demo123
```

Expected:

```text
Global access
```

### Admin

```text
admin01 / demo123
```

Expected:

```text
Global operational access
Cannot delete another Admin
```

### HOD

```text
csehod / demo123
```

Expected:

```text
CSE
All years
All semesters
All CSE courses
```

Expected denial:

```text
EEE course
ECE course
```

### Faculty

```text
csefac006 / demo123
```

Expected:

```text
CSE
Year 2
Initial scope
```

Final course editing access must depend on explicit FacultyAssignment.

### Student

```text
cse26a001 / demo123
```

Expected:

```text
CSE
Batch 2026–2030
Year 1
Semester 1
Only authorized/enrolled courses
```

---

# 17. Faculty Portal Login Test

Faculty Portal must request:

```text
Department
Faculty Type
Username
Password
```

Example:

```text
Department: CSE
Faculty Type: Normal Faculty
Username: csefac006
Password: demo123
```

Valid:

```text
Authentication = success
Role = FACULTY
Department = CSE
```

Invalid examples:

```text
Department: ECE
Username: csefac006
→ DENY

Faculty Type: HOD
Username: csefac006
→ DENY

Department: CSE
Faculty Type: HOD
Username: csehod
→ ALLOW

Department: ECE
Faculty Type: HOD
Username: csehod
→ DENY
```

The backend must perform these checks. Frontend selection must never be trusted.

---

# 18. Implementation Order

Use this seed architecture in this order:

```text
1. Roles
2. Permissions
3. Departments
4. Programs
5. Users
6. Batches
7. Academic Years
8. Years of Study
9. Semesters
10. Curriculum
11. Master Courses
12. Course Offerings
13. Faculty Assignments
14. Core Enrollments
15. Elective Groups
16. Student Elective Selections
17. Add-on Enrollment
18. Honors/Minor Enrollment
19. Units 1–5
20. Documents
21. Deletion History
22. Audit Logs
23. Page Activity
24. RBAC integration tests
```

This keeps identity data separate from academic relationship data and allows every stage to be validated independently.
