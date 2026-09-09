const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'docs', 'library-repair');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const files = {
  '01_CURRENT_STATE_AUDIT.md': `# Current State Audit
The current implementation of the Library Management module is fundamentally flawed and exists primarily as a static frontend shell disconnected from true academic and operational realities.

## Findings
- \`FacultyLibrary\` in \`FacultyPortal.jsx\` uses a static \`EmptyState\`.
- \`HODLibrary\` is a static dashboard with no API integration.
- \`LibraryAnalytics\` in \`ManagementPortal.jsx\` is static.
- Backend models \`DigitalResource\` and \`LibraryBook\` exist but lack mapping to \`CourseResource\`, violating the CourseOffering -> Unit 1-5 requirement.
- Student portal reservation logic is stubbed via \`toast.error('Service unavailable...')\`.
- Admin \`LibraryManagement\` is purely a read-only table. Missing check-in, check-out, barcode workflows, and fine management.
- Complete lack of immutable audit logging in controllers for critical mutations.
- The system violates core real-functionality enterprise requirements.
`,
  '02_FAILURE_MATRIX.md': `# Failure Matrix
| Finding ID | Current component | Current file | Current behavior | Expected behavior | Root cause | Status |
|------------|-------------------|--------------|------------------|-------------------|------------|--------|
| F-001 | FacultyLibrary | \`faculty/features.jsx\` | Static shell | Real data-driven dashboard | Stub implementation | FAILED |
| F-002 | HODLibrary | \`HODPortal.jsx\` | Static shell | Dept-scoped real metrics | Stub implementation | FAILED |
| F-003 | LibraryAnalytics | \`management/features.jsx\`| Static shell | Global real metrics | Stub implementation | FAILED |
| F-004 | CourseResource | Backend Models | Missing | Maps resource to course | Domain model incomplete | FAILED |
| F-005 | Unit 1-5 | Backend Models | Missing | Exact 5-unit enforcement | Domain model incomplete | FAILED |
| F-006 | Student Reservation| \`student/features.jsx\` | Disconnected toast error | Real reservation API call | Unwired frontend hook | FAILED |
| F-007 | Admin Circulation | \`admin/features.jsx\` | Missing | Full Check-in/out UI | Missing implementation | FAILED |
| F-008 | Admin Fines | \`admin/features.jsx\` | Missing | Fine management UI | Missing implementation | FAILED |
| F-009 | Admin Members | \`admin/features.jsx\` | Missing | Member management UI | Missing implementation | FAILED |
| F-010 | Admin Barcode | \`admin/features.jsx\` | Missing | Barcode scanning | Missing implementation | FAILED |
| F-011 | Audit Events | \`digitalResourceController.js\`| Missing | Immutable audit logs | Missing middleware hook | FAILED |
| F-012 | HOD Scope | \`libraryController.js\` | Missing | Dept-scoped API enforcement | Missing API security | FAILED |
| F-013 | Real-time Updates | \`circulationController.js\`| Missing | Socket/RabbitMQ updates | Events not emitted | FAILED |
| F-014 | LAN Verification | System | Missing | LAN accessibility | Testing incomplete | FAILED |
`,
  '03_TARGET_ARCHITECTURE.md': `# Target Architecture
The library must be integrated into the existing CampusSphere architecture.
- **Frontend**: React hooks querying \`library-service\` via the API gateway.
- **Backend**: \`library-service\` managing physical and digital assets, reservations, circulation, and fines.
- **Academic Hierarchy**: \`CourseOffering\` -> \`Unit 1-5\` -> \`CourseResource\`.
- **Database**: Shared \`edusphere_library\` via Mongoose.
- **Real-time**: Socket.IO integrated with RabbitMQ for events like \`LIBRARY_LOAN_CREATED\`.
- **RBAC**: Custom middleware enforcing role boundaries (e.g., HOD sees only their department).
- **Storage**: MinIO for digital object storage with signed URLs.
`,
  '04_DATABASE_REPAIR_PLAN.md': `# Database Repair Plan
1. **CourseResource Model**: Create a new \`CourseResource.js\` model.
   - Fields: \`courseOfferingId\`, \`departmentId\`, \`unitNumber\` (Enum: 1, 2, 3, 4, 5), \`title\`, \`resourceType\`, \`ownerId\`.
2. **DocumentVersion Model**: Track updates to resources immutably.
3. **Audit Tracking**: Ensure all models log mutations to an \`AuditRecord\` or \`AuditLog\` collection.
`,
  '05_API_REPAIR_PLAN.md': `# API Repair Plan
1. Connect \`StudentLibrary\` request buttons to \`reservationController.js\`.
2. Implement circulation endpoints (checkout, check-in, renewal) in \`circulationController.js\`.
3. Create department-scoped analytics endpoints for HOD in \`analyticsController.js\`.
4. Create institutional analytics endpoints for Management.
5. Build course resource upload and versioning APIs for Faculty, strictly enforcing Unit 1-5.
`,
  '06_RBAC_REPAIR_PLAN.md': `# RBAC Repair Plan
1. Enforce HOD endpoints to validate \`req.user.departmentId === resource.departmentId\`.
2. Enforce Faculty resource uploads to validate \`FacultyAssignment\`.
3. Enforce Student resource downloads to validate \`Enrollment\`.
`,
  '07_FRONTEND_REPAIR_PLAN.md': `# Frontend Repair Plan
1. Replace \`EmptyState\` in \`FacultyLibrary\`, \`HODLibrary\`, and \`LibraryAnalytics\` with real React Query driven dashboards.
2. Build the Admin Circulation Desk UI (checkout, check-in, barcode scanning).
3. Connect all interactions to real API hooks (\`useLiveLibrary...\`).
`,
  '08_REALTIME_REPAIR_PLAN.md': `# Real-Time Repair Plan
1. Emit Socket.IO events for checkouts, returns, and reservations.
2. Secure Socket.IO rooms using server-side authorization (e.g., \`user:{id}\`, \`department:{id}\`).
`,
  '09_AUDIT_REPAIR_PLAN.md': `# Audit Repair Plan
1. Hook into controller mutations (upload, checkout, check-in, reserve).
2. Generate server-side immutable audit records containing actor, role, action, and resource ID.
`,
  '10_TEST_PLAN.md': `# Test Plan
1. **Unit/Integration**: Verify Unit 1-5 constraints and RBAC scope blocks.
2. **Database Idempotency**: Ensure seed scripts are repeatable without duplicates.
`,
  '11_LAN_TEST_PLAN.md': `# LAN Test Plan
1. Access the application via private LAN gateway IP.
2. Test concurrent client interactions (e.g., Admin checks out book, Student sees real-time update).
`,
  '12_IMPLEMENTATION_STATUS.md': `# Implementation Status
- Phase A (Audit & Planning): COMPLETE
- Phase B (Database Academic Model): PENDING
- Phase C (CourseResource Integration): PENDING
- Phase D (Faculty Portal): PENDING
- Phase E (HOD Portal): PENDING
- Phase F (Management Portal): PENDING
- Phase G (Student Circulation): PENDING
- Phase H (Admin Circulation): PENDING
- Phase I (Workflows): PENDING
- Phase J (Audit): PENDING
- Phase K (Real-time): PENDING
- Phase L (Security): PENDING
`,
  '13_ACCEPTANCE_REPORT.md': `# Final Acceptance Report
(To be completed upon final execution of the library module repair).
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, filename), content);
}

console.log('All 13 docs/library-repair files generated successfully.');
