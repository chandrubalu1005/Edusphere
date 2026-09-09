# Phase 2 Mock & Hardcoded Data Audit

This document lists all discovered instances of hardcoded "fake" data used in the frontend UI to bypass actual database dependencies.

## Discovered Mock Data
1. **Student Dashboard Skills Radar**: The student skills chart relies on a hardcoded JavaScript array (`// Skills radar mock data`) rather than fetching analytical metrics from the `analytics-service`.
2. **Helpdesk Form**: Text inputs use placeholders without actually connecting to a ticketing model.
3. **Admin Dashboard Notifications**: The unread notifications badge calculation is manually bounded by a generic fallback array.
4. **Academic Plan**: Hardcoded UI demonstration for the student portal's Degree Plan page.

## Missing Features Stubs
- Over 30 routes in the application use `const PagePlaceholder = ({ title }) => (...)` to render completely blank pages while claiming they are "features."
- Payment handling logic relies on fake form inputs that do not connect to a real `finance-service` API.

## Verdict
The application is riddled with hardcoded data designed to make the UI look complete for demonstrations. The codebase must be scrubbed of these static arrays, and they must be wired up to actual GraphQL or REST endpoints.
