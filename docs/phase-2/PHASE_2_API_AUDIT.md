# Phase 2 API Forensic Audit

This document traces the connections between the frontend routing and backend service endpoints to verify real API consumption.

## Tracing Results
- **Authentication**: `auth-service` correctly intercepts `/login` endpoints and dispenses JWTs. 
- **Course Discovery**: `course-service` handles `/student/courses`, successfully parsing MongoDB Atlas records.
- **Admin Endpoints**: The Admin APIs are completely disconnected from the UI. The UI attempts to load `healthData` upon mounting, but the `admin-service` does not supply it in the required format, leading to fatal crashes.
- **Management Analytics**: No APIs are connected. All charts are drawn from static or stubbed data.
- **HOD Portal**: No APIs are connected.

## Verdict
The API gateway proxy via Vite is successfully routing requests, but the actual backend endpoints are only ~20% implemented. The majority of the system's endpoints exist in name only (empty controller functions or missing routes entirely).
