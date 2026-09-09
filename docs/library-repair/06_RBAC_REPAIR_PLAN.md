# RBAC Repair Plan
1. Enforce HOD endpoints to validate `req.user.departmentId === resource.departmentId`.
2. Enforce Faculty resource uploads to validate `FacultyAssignment`.
3. Enforce Student resource downloads to validate `Enrollment`.
