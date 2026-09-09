# Phase 2 Duplicate & Dead Code Audit

## Duplicated Architecture
- `backend/services/course-service/src/models/Course.js` (Dead/Legacy approach)
- `backend/services/course-service/src/models/academic/Offering.js` (Correct approach)

## Dead / Orphaned Code
- Empty microservice directories in `backend/services` (`finance-service`, `analytics-service`, `placement-service`) contain a `package.json` but no robust source code.
- Hundreds of `<PagePlaceholder>` references across frontend portal configurations.
