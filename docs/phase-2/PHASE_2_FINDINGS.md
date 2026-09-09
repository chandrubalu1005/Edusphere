# Phase 2 Critical Findings

## CRITICAL
1. **Frontend Placeholders**: Admin, Management, and HOD portals are completely stubbed out.
2. **Database Duplication**: `course-service` models duplicate the course architecture improperly.
3. **Admin Crash**: Live browser testing of the Admin portal crashes on boot due to `healthData`.

## HIGH
1. **Mock Data in Dashboards**: Student dashboard analytics rely on static JS arrays.
2. **Relational Weakness**: Cross-service foreign keys are stored as string arrays instead of strict ObjectIds or normalized event-driven tables.

## MEDIUM
1. **Missing File Storage Integration**: MinIO is not utilized for any file uploads on the frontend.

## RECOMMENDED FIXES
1. Replace all `<PagePlaceholder>` references with actual React components that fetch from respective microservices.
2. Delete `backend/services/course-service/src/models/Course.js` and fully migrate APIs to use `MasterCourse` and `CourseOffering`.
3. Fix the unhandled exception in `AdminPortal.jsx` causing it to crash.
