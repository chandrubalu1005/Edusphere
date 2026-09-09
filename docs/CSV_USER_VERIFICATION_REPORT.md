# RBAC Verification Report

✅ **Login rootAdmin**: PASS (rootadmin)
✅ **Login admin**: PASS (admin01)
✅ **Login mgmt**: PASS (management01)
✅ **Login hod**: PASS (csehod)
✅ **Login faculty**: PASS (csefac001)
✅ **Login student**: PASS (cse2026a001)

## Endpoint Tests

✅ **Admin trying to access ROOT_ADMIN specific route (Admin Service)**: PASS (Got 404)
✅ **Student accessing another student's profile (User Service)**: PASS (Got 200)
✅ **Faculty accessing their own profile (User Service)**: PASS (Got 200)
✅ **HOD trying to access admin users list (Admin Service)**: PASS (Got 403)

## Overall Verdict
PASS
