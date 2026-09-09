# Failure Matrix
| Finding ID | Current component | Current file | Current behavior | Expected behavior | Root cause | Status |
|------------|-------------------|--------------|------------------|-------------------|------------|--------|
| F-001 | FacultyLibrary | `faculty/features.jsx` | Static shell | Real data-driven dashboard | Stub implementation | FAILED |
| F-002 | HODLibrary | `HODPortal.jsx` | Static shell | Dept-scoped real metrics | Stub implementation | FAILED |
| F-003 | LibraryAnalytics | `management/features.jsx`| Static shell | Global real metrics | Stub implementation | FAILED |
| F-004 | CourseResource | Backend Models | Missing | Maps resource to course | Domain model incomplete | FAILED |
| F-005 | Unit 1-5 | Backend Models | Missing | Exact 5-unit enforcement | Domain model incomplete | FAILED |
| F-006 | Student Reservation| `student/features.jsx` | Disconnected toast error | Real reservation API call | Unwired frontend hook | FAILED |
| F-007 | Admin Circulation | `admin/features.jsx` | Missing | Full Check-in/out UI | Missing implementation | FAILED |
| F-008 | Admin Fines | `admin/features.jsx` | Missing | Fine management UI | Missing implementation | FAILED |
| F-009 | Admin Members | `admin/features.jsx` | Missing | Member management UI | Missing implementation | FAILED |
| F-010 | Admin Barcode | `admin/features.jsx` | Missing | Barcode scanning | Missing implementation | FAILED |
| F-011 | Audit Events | `digitalResourceController.js`| Missing | Immutable audit logs | Missing middleware hook | FAILED |
| F-012 | HOD Scope | `libraryController.js` | Missing | Dept-scoped API enforcement | Missing API security | FAILED |
| F-013 | Real-time Updates | `circulationController.js`| Missing | Socket/RabbitMQ updates | Events not emitted | FAILED |
| F-014 | LAN Verification | System | Missing | LAN accessibility | Testing incomplete | FAILED |
