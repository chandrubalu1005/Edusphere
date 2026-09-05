# MASTER RBAC & SECURITY MATRIX

## 1. Authentication Flow (JWT)
All requests from the frontend pass through the `api` Axios instance (in `client.js`), which attaches `edu_token` from `localStorage` as a Bearer token.
The `authMiddleware` inside each backend service extracts the JWT, verifies it using `JWT_SECRET`, and attaches the decoded payload to `req.user`.

**Payload Structure:**
```json
{
  "userId": "12345",
  "role": "student | faculty | admin | management",
  "iat": 1690000000,
  "exp": 1690086400
}
```

## 2. Role-Based Access Control (RBAC) Pattern
**CRITICAL FINDING:** There is NO unified `requireRole(['admin', 'faculty'])` middleware used consistently across all services.
Instead, RBAC checks are implemented procedurally inside the controller logic. 

Examples found:
- `userController.js:65`: `if (req.user.userId !== req.params.id && req.user.role !== 'admin') { ... }`
- `timetableController.js:23`: `if (req.user.role !== 'admin') return res.status(403).json(...)`
- `courseController.js:159`: `if (course.facultyOwnerId !== req.user.userId && !course.coInstructors.includes(...) && req.user.role !== 'admin')`

## 3. IDOR (Insecure Direct Object Reference) Protection Audit

### Student Role
| Service | Endpoint | IDOR Protection Status | Risk |
|---------|----------|------------------------|------|
| Users | `/users/:id` | Enforced: `userId === params.id` | LOW |
| Attendance | `/attendance/student/:id` | Enforced via Controller | LOW |
| Submissions | `/submissions/:id` | Unverified deeply, rely on `req.user.userId` matching submission owner | MODERATE |
| Assignments | `/assignments/:id/submit`| Checked implicitly by creating submission for `req.user.userId` | LOW |
| Library | `/library/issues/:userId` | `issue.userId === req.user.userId` | LOW |
| Placement | `/placement/applications/:userId` | Needs verification to ensure student cannot read others | MODERATE |

### Faculty Role
| Service | Endpoint | IDOR Protection Status | Risk |
|---------|----------|------------------------|------|
| Courses | `/courses/:id/approve` | Restricts faculty from approving courses (Admins/Management only) | LOW |
| Courses | `/courses/:id/content` | Verifies `facultyOwnerId === req.user.userId` or `coInstructors` | LOW |
| Attendance | `/attendance/mark` | Verifies faculty owns the course session | LOW |
| Submissions | `/submissions/:id/grade` | Needs verification that faculty grading owns the course | MODERATE |

### Admin Role
Admins typically bypass ownership checks (e.g., `req.user.role === 'admin'` overrides ownership conditions). This is standard for administrative accounts.

## 4. Frontend Route Guards
The frontend utilizes a `<ProtectedRoute allowedRoles={['student']}>` component wrapping every portal route in `App.jsx`.
- **Student Portal**: `/student/*` -> `allowedRoles={['student']}`
- **Faculty Portal**: `/faculty/*` -> `allowedRoles={['faculty']}`
- **Admin Portal**: `/admin/*` -> `allowedRoles={['admin']}`
- **Management Portal**: `/management/*` -> `allowedRoles={['management']}`

If a user tampers with `localStorage` to change their role on the frontend to access `/admin`, the API calls on the admin pages will still fail with `403 Forbidden` due to backend controller checks.

## 5. Security Action Items
1. **Consolidate Role Verification**: Refactoring repetitive procedural `if (role !== 'X')` checks into a unified `roleMiddleware(allowedRoles)` would harden the system and prevent future endpoints from missing security checks.
2. **Review Moderate Risks**: We need to ensure that Assignment Submissions, Library Issues, and Placement Applications rigidly verify ownership.
