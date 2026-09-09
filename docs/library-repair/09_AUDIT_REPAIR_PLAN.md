# Audit Repair Plan
1. Hook into controller mutations (upload, checkout, check-in, reserve).
2. Generate server-side immutable audit records containing actor, role, action, and resource ID.
