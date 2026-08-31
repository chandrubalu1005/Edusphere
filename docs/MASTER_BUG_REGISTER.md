# MASTER BUG REGISTER

| ID | Category | Severity | Location | Description | Root Cause | Impact | Fix Required | Status |
|---|---|---|---|---|---|---|---|---|
| BUG-001 | DevOps | P0 | Host Environment | Docker not installed | Host system missing required binaries | Cannot run infrastructure (MongoDB, Redis, RabbitMQ) locally | Install Docker Desktop or run local instances | PARTIAL |
| BUG-002 | Business | P1 | `FacultyPortal.jsx` | QR Attendance uses fake static PIN (`742819`) and fake 5m timer | Hardcoded mock | Student attendance cannot be securely captured live | Implement real QR session with `attendance-service` | LOGGED |
| BUG-003 | Business | P1 | `FacultyPortal.jsx` | Course Analytics uses mock modulo logic `[89,72,95][i % 3]` | Hardcoded mock | Grades and attendance stats are entirely fake | Connect to `analytics-service` | LOGGED |
| BUG-004 | Business | P1 | `FacultyPortal.jsx` | File Upload simulates success without persisting | `toast.success('Simulated upload')` | Faculty materials are not saved | Wire up MinIO/S3 FileStorageService | LOGGED |
| BUG-005 | Business | P1 | `StudentPortal.jsx` | Active session mocked as `{ id: 'dummy', courseId: 'CS301' }` | Hardcoded mock | Student cannot check into real classes | Fetch live session from `attendance-service` | LOGGED |
| BUG-006 | Business | P1 | `StudentPortal.jsx` | Course Rating prompts but fails | `toast.error('Rating API not connected')` | Ratings cannot be captured | Implement rating endpoint in `course-service` | LOGGED |
| BUG-007 | Business | P1 | `StudentPortal.jsx` | Campus drives hardcoded | Static dates and companies | Placements are fake | Connect to `placement-service` | LOGGED |
| BUG-008 | Business | P1 | `AdminPortal.jsx` | System Health hardcoded to "Operational" | Hardcoded string | Admin sees false positive health | Query real system health checks | LOGGED |
| BUG-009 | Business | P1 | `AdminPortal.jsx` | `MONTHLY_ENROLLMENT` and `SUPPORT_TICKETS` fallbacks | `const { data = [] } = { data: [] }` | Charts are empty | Wire to `admin-service` and `analytics-service` | LOGGED |
| BUG-010 | Business | P1 | `ManagementPortal.jsx` | Placement stats hardcoded ($180K highest, 12 Google) | Static mock | Executive dashboards show fake data | Wire to `analytics-service` | LOGGED |
| BUG-011 | Backend | P1 | `library-service` | Meilisearch and catalog missing true implementations or contain TODOs | WIP backend | Library search fails | Implement real Mongoose queries | LOGGED |
| BUG-012 | Backend | P1 | `analytics-service` | Controllers return static analytics | WIP backend | Dashboards get fake data | Implement Mongoose aggregations | LOGGED |
| BUG-013 | Backend | P2 | `assignment-service` | FileStorageService stubbed | Storage not implemented | Assignment submissions fail | Use real local storage or MinIO | LOGGED |
| BUG-014 | Frontend | P2 | `liveData.js` | `useLive...` hooks sometimes fallback to `{ data: [] }` on 500/401 | React Query poor error handling | UI hides errors rather than showing error state | Add proper error boundaries | LOGGED |
