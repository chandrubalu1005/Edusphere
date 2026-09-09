# Database Repair Plan
1. **CourseResource Model**: Create a new `CourseResource.js` model.
   - Fields: `courseOfferingId`, `departmentId`, `unitNumber` (Enum: 1, 2, 3, 4, 5), `title`, `resourceType`, `ownerId`.
2. **DocumentVersion Model**: Track updates to resources immutably.
3. **Audit Tracking**: Ensure all models log mutations to an `AuditRecord` or `AuditLog` collection.
