# Phase 2 Database Audit & Domain Integrity

This document audits the underlying database schema and structural purity of the backend models against the intended CampusSphere domain.

## Major Findings

### 1. Course Architecture Duplication (CRITICAL DEFECT)
The repository contains two completely disconnected approaches to modeling courses:
- `backend/services/course-service/src/models/Course.js`: A monolithic legacy model that merges course definitions (credits, syllabus) with runtime offering data (enrolled students, faculty owner, term).
- `backend/services/course-service/src/models/academic/Offering.js`: A newly introduced, correct hierarchical model containing `CourseOffering`, `Section`, and `FacultyAssignment`.

**Impact:** The API routes and frontend are currently hopelessly entangled in this architectural rift. The system cannot reliably know whether it is querying a flat `Course` or a structured `CourseOffering`.

### 2. User & Roles Integration
The seed scripts successfully map users (`ROOT_ADMIN`, `ADMIN`, `MANAGEMENT`, `HOD`, `FACULTY`, `STUDENT`), but there are no strict database-level constraints linking a `STUDENT` document in the `user-service` directly to their `CourseOffering` enrollment in the `course-service` via a normalized reference table. This is currently managed via weak array references (`enrolledStudents: [String]`) in the monolithic `Course` model, which violates relational integrity principles for a microservice architecture.

### 3. Missing Observability Collections
While Prometheus and Grafana are referenced in Phase 1 documentation, the `audit-service` / `activity` models are extremely underdeveloped. True real-time websocket updates rely on ephemeral memory rather than a robust RabbitMQ event sourcing pattern connecting to MongoDB logs.

## Conclusion
The MongoDB models do not faithfully represent the complex Enterprise LMS domain outlined in the documentation. The discrepancy between `MasterCourse` and `CourseOffering` must be resolved, and the monolithic `Course.js` file must be deprecated and deleted.
