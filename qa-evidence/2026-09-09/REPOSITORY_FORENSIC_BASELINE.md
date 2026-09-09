# Repository Forensic Baseline
**Date:** 2026-09-09

## 1. Environment & Infrastructure
- **Private LAN IP:** 10.130.16.178
- **Frontend Port:** 5173
- **Gateway:** Handled natively by frontend API calls to microservice ports directly.
- **Microservices Running:** 15 out of 16 defined services are healthy and running.

## 2. Microservices Status (Port 3001-3016)
- **auth-service** (3001) - HEALTHY
- **user-service** (3002) - HEALTHY
- **course-service** (3003) - HEALTHY
- **notification-service** (3004) - HEALTHY
- **assessment-service** (3005) - HEALTHY
- **assignment-service** (3006) - HEALTHY
- **certificate-service** (3007) - HEALTHY
- **attendance-service** (3008) - HEALTHY
- **timetable-service** (3009) - HEALTHY
- **calendar-service** (3010) - HEALTHY
- **library-service** (3011) - **DOWN** (Exists in repository `backend/services/library-service` but is completely missing from `start.ps1`).
- **placement-service** (3012) - HEALTHY
- **discussion-service** (3013) - HEALTHY
- **analytics-service** (3014) - HEALTHY
- **admin-service** (3015) - HEALTHY
- **finance-service** (3016) - HEALTHY

## 3. Frontend Portals Audit
Based on `App.jsx`, there are five routed portals (contradicting the 4-portal architectural rule):
1. **StudentPortal** (`/student/*`)
2. **FacultyPortal** (`/faculty/*`)
3. **HODPortal** (`/hod/*`) - *DEFECT: HOD was specified to be a context inside the Faculty portal, not a separate routed portal.*
4. **AdminPortal** (`/admin/*`)
5. **ManagementPortal** (`/management/*`)

## 4. Frontend Route & Mock Implementation Audit
Searches across the frontend portals revealed heavy usage of a `PagePlaceholder` component in place of actual implementations.

### ManagementPortal (`/management`)
- **REAL/PARTIAL:** Dashboard, Users
- **PLACEHOLDER:** Departments, Faculty Performance, Student Performance, Placement Analytics, Research, Certificate Approval, Audit, Reports, Finance Overview, Fee Collection, Budgeting, Scholarships, Profile, Notifications.

### AdminPortal (`/admin`)
- **REAL/PARTIAL:** Dashboard, Users, Courses
- **PLACEHOLDER:** Departments, Semesters, Enrollments, Timetable Management, Academic Core, Certificate Approval, Roles & Permissions, Announcements, Placement Management, Academic Calendar, System Health, Audit & Logs, File Management, Email Broadcast, Backup & Restore, Settings, Reports, Profile, Notifications.

### FacultyPortal (`/faculty`)
- Contains a defined `PagePlaceholder` component, but it appears to not be explicitly wired to main routes based on initial text search, suggesting either missing routes or better implementation coverage. (Requires deep browser verification).

### StudentPortal (`/student`)
- No explicit `PagePlaceholder` usage found in text search. Requires browser verification to confirm if routes are completely functional or just missing from the router.

## 5. Security & Browser Automation Status
- A browser testing suite exists in `browser_tests/` (`realtime_audit.js`, `run_all_routes.js`, `walkthrough.js`, `diagnose_dashboard.js`).
- **Next Step:** Execute live browser workflows over the private LAN IP `10.130.16.178` to capture screenshots and verify RBAC.
