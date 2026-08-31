# MASTER API MATRIX

All API requests flow through the Nginx Gateway (Port 5000 in production, or matched locally in dev).

| Service | Method | Route Pattern | Authentication | Authorization | Status |
|---|---|---|---|---|---|
| `auth-service` | `POST` | `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh` | None (for login/register) | None | NOT VERIFIED |
| `user-service` | `GET`, `PUT` | `/api/users/*`, `/api/profile/*` | JWT Bearer | User / Admin | NOT VERIFIED |
| `course-service` | `GET`, `POST`, `PUT` | `/api/courses/*`, `/api/enrollments/*` | JWT Bearer | Student / Faculty / Admin | NOT VERIFIED |
| `attendance-service` | `POST`, `GET` | `/api/attendance/*`, `/api/sessions/*` | JWT Bearer | Student / Faculty | NOT VERIFIED |
| `assignment-service` | `GET`, `POST` | `/api/assignments/*`, `/api/submissions/*` | JWT Bearer | Student / Faculty | NOT VERIFIED |
| `assessment-service` | `GET`, `POST` | `/api/assessments/*`, `/api/results/*` | JWT Bearer | Student / Faculty | NOT VERIFIED |
| `library-service` | `GET`, `POST` | `/api/library/*` | JWT Bearer | Student / Admin | NOT VERIFIED |
| `placement-service` | `GET`, `POST` | `/api/placements/*`, `/api/drives/*` | JWT Bearer | Student / Admin / Management | NOT VERIFIED |
| `analytics-service` | `GET` | `/api/analytics/*` | JWT Bearer | Admin / Management | NOT VERIFIED |
| `admin-service` | `GET`, `POST`, `PUT` | `/api/admin/*` | JWT Bearer | Admin | NOT VERIFIED |

*Note: Detailed API discovery mapping all endpoints to exact controllers requires static code analysis of all 16 service route controllers, which will be populated in Phase 4 (API Contracts).*
