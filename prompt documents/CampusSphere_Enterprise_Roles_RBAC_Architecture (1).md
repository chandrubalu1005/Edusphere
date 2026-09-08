# CampusSphere — Enterprise Roles & RBAC Architecture

## 1. Purpose

This document defines the production-oriented identity, role, scope, and authorization model for CampusSphere/EduSphere.

The system must NOT depend on frontend hiding/showing buttons as its security mechanism. Every protected operation must be validated by the backend through the API Gateway/WGate and the owning service.

---

## 2. College Scale

Initial realistic development dataset:

- 8 departments
- 20 staff/faculty per department
- 5 faculty assigned to each Year of Study by default
- 4 Years of Study
- 30 students per department per year
- 960 students total
- 1 Root Admin
- 4 Admin users initially
- 8 Management users initially
- 8 HOD users
- 160 Faculty users

Departments:

1. CSE — Computer Science & Engineering — B.E.
2. EEE — Electrical & Electronics Engineering — B.E.
3. ECE — Electronics & Communication Engineering — B.E.
4. MECH — Mechanical Engineering — B.E.
5. AGRI — Agricultural Engineering — B.Tech.
6. AIDS — Artificial Intelligence & Data Science — B.Tech.
7. BT — Biotechnology — B.Tech.
8. IT — Information Technology — B.Tech.

---

# 3. Role Hierarchy

```text
ROOT ADMIN
    |
    +-- ADMIN
    |
    +-- MANAGEMENT
    |
    +-- HOD
    |
    +-- FACULTY
    |
    +-- STUDENT
```

This is a privilege hierarchy, but authorization is also scope-based.

A role alone is never sufficient for Faculty, HOD, or Student access.

---

# 4. ROOT_ADMIN

Root Admin is the highest system-management role.

### Global scope

```text
Institution
 ├── All Departments
 ├── All Programs
 ├── All Batches
 ├── All Years
 ├── All Semesters
 ├── All Courses
 ├── All Users
 ├── All Enrollments
 ├── All Library Content
 ├── Audit Logs
 └── Deletion History
```

### Permissions

Root Admin can:

- create Admin accounts
- disable Admin accounts
- delete Admin accounts
- manage Management users
- manage HODs
- manage Faculty
- manage Students
- create/edit/delete departments
- create/edit/delete academic structures
- manage curriculum
- manage courses and course offerings
- manage enrollments
- manage library content
- restore deleted content
- permanently delete eligible data
- view all audit logs
- manage system-level RBAC

### Critical rule

Only Root Admin can remove another Admin.

Admin cannot:

- delete Root Admin
- delete another Admin
- elevate its own privileges
- create another Root Admin

---

# 5. ADMIN

Admin is the global operational administrator.

### Scope

```text
ALL INSTITUTION DATA
```

Admin can operate across:

- all departments
- all years
- all semesters
- all users
- all courses
- all library content
- all enrollments

### Restriction

Admin cannot manage the Root Admin hierarchy.

Admin creation of other Admin accounts is disabled.

Only Root Admin creates/manages Admin accounts.

---

# 6. MANAGEMENT

Management represents institutional-level academic/administrative oversight.

Management has global access to institutional data, but its primary UI should emphasize:

- institutional dashboard
- department performance
- student analytics
- faculty analytics
- course coverage
- academic progress
- reports
- audit monitoring
- academic oversight

Management may also perform authorized global administrative operations.

### Management responsibility assignment

For realistic initial data, Management users receive evenly distributed responsibility metadata:

```text
Management User
 ├── Department
 ├── Years 1–4
 └── Semesters 1–8
```

This metadata describes their normal responsibility/dashboard area.

It does NOT reduce their approved global management authority.

Management can later be reassigned to another department/year/semester.

---

# 7. HOD

HOD is department-scoped.

Example:

```text
CSE HOD
 └── CSE
      ├── Year 1
      │    ├── Semester 1
      │    └── Semester 2
      ├── Year 2
      │    ├── Semester 3
      │    └── Semester 4
      ├── Year 3
      │    ├── Semester 5
      │    └── Semester 6
      └── Year 4
           ├── Semester 7
           └── Semester 8
```

### HOD permissions

HOD can:

- view all students in their department
- view all faculty in their department
- access all semesters in their department
- access all department courses
- add course data
- update course data
- delete course data
- manage department library content
- add/update/delete documents
- manage department academic content

### Boundary

CSE HOD:

- CSE = allowed
- EEE = denied
- ECE = denied
- MECH = denied

Unless Root Admin/Admin/Management performs the operation under their own global authority.

---

# 8. FACULTY

Faculty has the narrowest academic editing scope.

Authorization is:

```text
FACULTY
+
DEPARTMENT
+
YEAR
+
SEMESTER
+
EXPLICIT COURSE ASSIGNMENT
```

Example:

```text
Dr. Arun Kumar
Role: FACULTY
Department: CSE

Assignment:
CSE → Year 2 → Semester 4 → Operating Systems
```

He may:

- view the assigned course
- view Units 1–5
- add documents
- update documents
- delete documents
- manage permitted course material

He may NOT automatically edit:

- another CSE course
- another year
- another department
- an unassigned course

### Server-side rule

```text
if faculty.department != course.department
    DENY

if faculty is not assigned to courseOffering
    DENY

if requested semester/year does not match assignment
    DENY
```

---

# 9. STUDENT

Student access is enrollment-based.

Student identity contains:

- department
- program
- batch
- admission year
- academic year
- year of study
- current semester
- course enrollments

### Student can see

```text
Own academic context
        +
Courses the student is actually entitled/enrolled to access
```

### Student cannot see

- other departments
- unrelated years
- unrelated semester courses
- courses outside their enrollment
- Faculty editing functions
- HOD functions
- Admin functions

Changing a URL manually must not bypass this rule.

---

# 10. Academic Scope Model

CampusSphere must distinguish:

```text
Department
Program
Batch
Academic Year
Year of Study
Semester
Course Offering
Enrollment
```

Example:

```text
Student
├── Program: B.E.
├── Department: CSE
├── Batch: 2026–2030
├── Academic Year: 2027–28
├── Year of Study: 2
└── Semester: 3
```

Do NOT collapse these into one `year` field.

---

# 11. Master Course vs Course Offering

A Master Course is the reusable academic definition.

Example:

```text
MASTER COURSE
22MA101
Engineering Mathematics I
```

A Course Offering is a specific delivery instance:

```text
22MA101
CSE
Year 1
Semester 1
Batch 2026–2030
Faculty: Dr. Priya
```

Another offering can be:

```text
22MA101
EEE
Year 1
Semester 1
Batch 2026–2030
Faculty: Dr. Karthik
```

This avoids duplicate master course definitions while preserving department-specific delivery, faculty assignment, enrollment and content context.

---

# 12. Course Categories

The authorization/enrollment engine must distinguish:

```text
CORE
ELECTIVE
PROFESSIONAL_ELECTIVE
OPEN_ELECTIVE
ADD_ON
HONORS
MINOR
PROJECT
```

## Core

Mandatory and automatically enrolled.

## Elective

Controlled through an Elective Group and required selection count.

## Add-on

Optional.

## Honors/Minor

Prefer an application → eligibility → approval → enrollment pathway.

---

# 13. Five Unit Rule

Every course initially contains exactly five units:

```text
Unit 1
Unit 2
Unit 3
Unit 4
Unit 5
```

Units exist even when no documents have been uploaded.

Course page:

```text
[Unit 1] [Unit 2] [Unit 3] [Unit 4] [Unit 5]
```

The API must prevent unauthorized modification of another course's units.

---

# 14. Library Hierarchy

```text
Department
   ↓
Year of Study
   ↓
Semester
   ↓
Course Offering
   ↓
Unit 1–5
   ↓
Documents
```

Faculty edits only permitted Course Offerings.

HOD edits the entire department.

Admin/Management/Root Admin have global access.

---

# 15. Deletion Architecture

Normal deletion is a soft-delete operation:

```text
ACTIVE
  ↓
DELETE
  ↓
DELETION HISTORY / TRASH
  ├── RESTORE
  └── DELETE PERMANENTLY
```

### Retention

- Deleted data remains recoverable for 90 days.
- After 90 days it is automatically permanently purged.
- Explicit "Delete Permanently" removes the item immediately after confirmation.

Deletion History must record:

- original resource
- deleted by
- deletion time
- deletion reason if supplied
- purge deadline
- restoration history

---

# 16. Audit Architecture

Audit logging is mandatory for sensitive operations.

Examples:

```text
USER_CREATED
USER_UPDATED
USER_DISABLED
LOGIN_SUCCESS
LOGIN_FAILURE
COURSE_CREATED
COURSE_UPDATED
COURSE_DELETED
DOCUMENT_UPLOADED
DOCUMENT_UPDATED
DOCUMENT_DELETED
DOCUMENT_RESTORED
DOCUMENT_PERMANENTLY_DELETED
ENROLLMENT_CREATED
ENROLLMENT_CHANGED
ROLE_CHANGED
PERMISSION_CHANGED
```

Audit record should contain:

- actor user ID
- actor role
- action
- resource type
- resource ID
- department
- academic scope
- timestamp
- result
- request/correlation ID
- source IP where appropriate
- metadata/change summary

---

# 17. Page Activity

Page activity should be tracked separately from audit events.

Example:

```text
PAGE_VIEW
User: FAC-CSE-001
Page: /faculty/courses/operating-systems
Started: 10:42:13

PAGE_EXIT
Ended: 10:58:41
Duration: 16m 28s
```

Do NOT write a database record every second.

Use:

```text
page entry
   ↓
client session tracking
   ↓
heartbeat where necessary
   ↓
page exit/session completion
   ↓
activity event
```

---

# 18. Faculty Portal Login Architecture

When selecting Faculty Portal:

```text
FACULTY PORTAL

Department
[ Select Department ]

Faculty Type
[ Normal Faculty ]
[ HOD ]

Username
[____________]

Password
[____________]

[ Login ]
```

### Security rule

The selected department and faculty type are only login context.

They are NOT trusted authorization claims.

Backend must verify:

```text
Submitted Department
        ↓
matches user's actual department

Submitted Faculty Type
        ↓
matches actual role

Username + Password
        ↓
authentication
```

Then:

```text
Authentication
      ↓
Role validation
      ↓
Department scope validation
      ↓
Authorization
      ↓
Portal/session
```

A normal Faculty user attempting:

```text
Faculty Type = HOD
```

must be rejected.

A CSE faculty user selecting:

```text
Department = ECE
```

must be rejected.

---

# 19. WGate/API Gateway

All browser requests should pass through the gateway.

```text
Browser
   ↓
Nginx / WGate
   ↓
Authentication / token validation
   ↓
Authorization context
   ↓
Target microservice
   ↓
Database
```

Never:

```text
Browser → MongoDB
Browser → internal service directly
Frontend-only authorization
```

The gateway should propagate trusted identity context, while the owning service performs resource-specific authorization.

---

# 20. Final Permission Model

```text
ROOT ADMIN
Global + System Authority

ADMIN
Global Operational Authority

MANAGEMENT
Global Institutional Authority

HOD
Department + All Years/Semesters/Courses

FACULTY
Department + Year + Semester + Explicit Course Assignment

STUDENT
Own Identity + Academic Scope + Enrollment
```

This is the baseline RBAC/ABAC model for implementation.
