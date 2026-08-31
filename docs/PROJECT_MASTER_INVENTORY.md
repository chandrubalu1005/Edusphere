# PROJECT MASTER INVENTORY

## 1. Frontend Application
- **Path**: `frontend/`
- **Portals**: 
  - Student (`StudentPortal.jsx` & `student/features.jsx`)
  - Faculty (`FacultyPortal.jsx` & `faculty/features.jsx`)
  - Admin (`AdminPortal.jsx` & `admin/features.jsx`)
  - Management (`ManagementPortal.jsx` & `management/features.jsx`)
- **Key Routing / Components**: Uses React Router DOM v7
- **State**: Zustand, TanStack React Query (`api/liveData.js` and `api/hooks.js`)
- **Styles**: Tailwind CSS
- **Network**: Axios, Socket.IO Client

## 2. API Gateway
- **Path**: `backend/gateway/`
- **Config**: `nginx.conf`
- **Purpose**: Reverse proxy for the 15 microservices

## 3. Backend Services
1. `auth-service` (Port 3001) - Authentication, session management, token issuance.
2. `user-service` (Port 3002) - User profiles, roles.
3. `course-service` (Port 3003) - Courses, enrollments.
4. `notification-service` (Port 3004) - System notifications.
5. `assessment-service` (Port 3005) - Assessments, results.
6. `assignment-service` (Port 3006) - Assignments, submissions, file storage.
7. `certificate-service` (Port 3007) - Credentials.
8. `attendance-service` (Port 3008) - Attendance sessions (QR).
9. `timetable-service` (Port 3009) - Scheduling.
10. `calendar-service` (Port 3010) - Academic events.
11. `library-service` (Port 3011) - Books, reservations.
12. `placement-service` (Port 3012) - Drives, applications.
13. `discussion-service` (Port 3013) - Forums.
14. `analytics-service` (Port 3014) - Aggregated institutional analytics.
15. `admin-service` (Port 3015) - System config.

## 4. Databases and Collections
- **MongoDB**: Used across services. Each service defines its own `edusphere_*` database.
- **Redis**: Caching (Auth, Assessment, Attendance).
- **RabbitMQ**: Async event broker.
- **Meilisearch**: Used in `library-service` and `course-service`.

## 5. Scripts and Automation
- `backend/scripts/seed.js`: Database seeding script
- `backend/scripts/smoke-test.js`: Validates service and infra health
- `start.ps1`, `stop.ps1`: Automation wrappers for Windows environments
- `package.json`: Main workspace orchestrator (`npm run dev:backend`)

## 6. Infrastructure (`infra/`)
- `docker-compose.yml`: Production/Core infrastructure definitions.
- `compose.lan.yml`: LAN specific deployment configuration.
- `mongo/`, `monitoring/`, `k8s/`: Infrastructure configs.
