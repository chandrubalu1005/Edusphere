# Target Architecture
The library must be integrated into the existing CampusSphere architecture.
- **Frontend**: React hooks querying `library-service` via the API gateway.
- **Backend**: `library-service` managing physical and digital assets, reservations, circulation, and fines.
- **Academic Hierarchy**: `CourseOffering` -> `Unit 1-5` -> `CourseResource`.
- **Database**: Shared `edusphere_library` via Mongoose.
- **Real-time**: Socket.IO integrated with RabbitMQ for events like `LIBRARY_LOAN_CREATED`.
- **RBAC**: Custom middleware enforcing role boundaries (e.g., HOD sees only their department).
- **Storage**: MinIO for digital object storage with signed URLs.
