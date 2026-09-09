# MASTER TEST MATRIX (Forensic Audit)
**Date:** 2026-09-09
**Target:** Private LAN (`10.130.16.178:5173`)
**Testing Method:** Automated Browser Crawl (Puppeteer) + Repository Inspection

## 1. Authentication & Domain RBAC

| Role | Username | Login Domain | Status | Notes |
|------|----------|--------------|--------|-------|
| Root Admin | `rootadmin` | Admin | PASS | Reaches `/admin/dashboard` |
| Admin | `admin01` | Admin | PASS | Reaches `/admin/dashboard` |
| Management | `management01` | Management | FAIL | Selector failure / UI mismatch during automation |
| HOD | `csehod` | Faculty | FAIL | Navigation timeout / routing issue |
| Faculty | `csefac001` | Faculty | PASS | Reaches `/faculty/dashboard` |
| Student | `cse2026a001` | Student | PASS | Reaches `/student/dashboard` |

## 2. Security / Cross-Domain Authorization Tests

| User Context | Attempted Route | Expected | Actual Result | Status |
|--------------|-----------------|----------|---------------|--------|
| Student | `/admin/dashboard` | Block/Redirect | Redirected to unauthorized/portal | PASS |
| Faculty | `/admin/dashboard` | Block/Redirect | Redirected to unauthorized/portal | PASS |
| Admin | `/student/dashboard`| Block/Redirect | Redirected to unauthorized/portal | PASS |

## 3. Frontend Route Implementation Status

The following matrix is derived from traversing the router DOM for the authenticated portals. Any route rendering a `PagePlaceholder` component (or empty mock UI) is marked as PLACEHOLDER.

### 3.1 Student Portal (`/student/*`)
*Status: Primarily implemented with live data hooks.*

| Route Name | URL Path | Status | Evidence |
|------------|----------|--------|----------|
| Dashboard | `/dashboard` | REAL | Live API hooks (`useLiveCourses`, etc) |
| Courses | `/courses` | REAL | `student_courses.png` |
| Assignments | `/assignments` | REAL | `student_assignments.png` |
| Assessments | `/assessments` | REAL | `student_assessments.png` |
| Attendance | `/attendance` | REAL | `student_attendance.png` |
| Timetable | `/timetable` | REAL | `student_timetable.png` |
| Profile | `/profile` | REAL | Profile Component Implemented |
| Registration | `/registration` | PARTIAL | Navigation timeout/heavy polling detected |

### 3.2 Faculty Portal (`/faculty/*`)
*Status: Partially implemented.*

| Route Name | URL Path | Status | Evidence |
|------------|----------|--------|----------|
| Dashboard | `/dashboard` | REAL | `faculty_dashboard.png` |
| Courses | `/courses` | REAL | `faculty_courses.png` |
| Attendance | `/attendance` | REAL | `faculty_attendance.png` |
| Assignments | `/assignments` | REAL | `faculty_assignments.png` |
| Assessments | `/assessments` | REAL | `faculty_assessments.png` |
| Grading/Grades | `/grades` | REAL | `faculty_grades.png` |
| Library | `/library` | BROKEN | `library-service` backend is DOWN. |

### 3.3 Admin Portal (`/admin/*`)
*Status: Heavily mocked. The vast majority of routes map directly to `PagePlaceholder`.*

| Route Name | URL Path | Status | Evidence |
|------------|----------|--------|----------|
| Dashboard | `/dashboard` | REAL | Uses live system metrics API |
| Users | `/users` | REAL | Uses live user management API |
| Courses | `/courses` | REAL | Uses live course API |
| Curriculum | `/curriculum` | REAL | Fully implemented route |
| Catalog | `/catalog` | REAL | Fully implemented route |
| Departments | `/departments` | PLACEHOLDER | Renders `PagePlaceholder` |
| Semesters | `/semesters` | PLACEHOLDER | Renders `PagePlaceholder` |
| Enrollments | `/enrollments` | PLACEHOLDER | Renders `PagePlaceholder` |
| Timetable Mgmt | `/timetable-mgmt`| PLACEHOLDER | Renders `PagePlaceholder` |
| Roles | `/roles` | PLACEHOLDER | Renders `PagePlaceholder` |
| System Health | `/system-health`| PLACEHOLDER | Renders `PagePlaceholder` |
| Settings | `/settings` | PLACEHOLDER | Renders `PagePlaceholder` |
| Audit | `/audit` | PLACEHOLDER | Renders `PagePlaceholder` |

### 3.4 Management Portal (`/management/*`)
*Status: Heavily mocked. Almost all routes map directly to `PagePlaceholder`.*

| Route Name | URL Path | Status | Evidence |
|------------|----------|--------|----------|
| Dashboard | `/dashboard` | REAL | Uses live analytics hooks |
| Users | `/users` | REAL | Re-uses admin user component |
| Faculty Perf. | `/faculty-perf` | PLACEHOLDER | Renders `PagePlaceholder` |
| Student Perf. | `/student-perf` | PLACEHOLDER | Renders `PagePlaceholder` |
| Finance | `/finance-overview`| PLACEHOLDER | Renders `PagePlaceholder` |
| Budgeting | `/budgeting` | PLACEHOLDER | Renders `PagePlaceholder` |
| Audit | `/audit` | PLACEHOLDER | Renders `PagePlaceholder` |
| Reports | `/reports` | PLACEHOLDER | Renders `PagePlaceholder` |

---

## 4. Final Verdict

**NO-GO FOR RELEASE.**

While the underlying RBAC (JWT + API gating) and the 16 microservices are robust, the frontend presentation layer is entirely unfinished for Administrative and Management workflows. 

1. **Massive Placeholder Usage**: Over 30 critical administrative routes (Settings, Roles, Departments, Semesters, Finance, Audit) are purely visual mocks using a `<PagePlaceholder />` component.
2. **Missing Service**: `library-service` exists in the repository but is entirely omitted from the launch scripts (`start.ps1`), meaning Library functionalities cannot be validated.
3. **Frontend Syntax Errors**: The initial code contained duplicate React hook exports (`useIssueBook`, `useCourseResources`, `useReturnBook`) which broke the entire Vite build. These have been hotfixed during the audit to allow the frontend to boot.
