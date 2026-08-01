# Software Requirement Specification (SRS) - EduSphere Enterprise

## 1. Introduction

EduSphere is a highly available, microservice-based University ERP and Learning Management System (LMS) designed for scale targets of 100,000+ students, 10,000+ faculty, and 5,000+ courses.

---

## 2. Functional Requirements

### 2.1 User Roles & Persona Scenarios

1. **Student:** Enrolls in courses, tracks learning timelines, takes assessments, marks attendance sessions via QR code scans, and monitors peer comparison data.
2. **Faculty:** Creates course content, publishes materials, marks student attendance, configures quizzes, grades assignments, and receives alert notifications for struggling students.
3. **Admin:** Configures departments/semesters, manages user accounts, updates system configurations, and monitors microservices health dashboards.
4. **Management:** Read-only access to strategic statistics, student heatmaps, department KPIs, and holds course publication approvals.

### 2.2 System Use Cases (Role-Based)

```mermaid
usecaseDiagram
  actor Student
  actor Faculty
  actor Management
  actor Admin

  Student --> (Enroll in Course)
  Student --> (Scan QR for Attendance)
  Student --> (View Learning Metrics)

  Faculty --> (Create Course Content)
  Faculty --> (Mark Attendance Sessions)
  Faculty --> (Receive Low Attendance Alerts)

  Management --> (Approve/Reject Course Publication)
  Management --> (View Executive KPI Dashboard)

  Admin --> (Create/Deactivate User Accounts)
  Admin --> (Monitor Microservices Health)
```

---

## 3. Non-Functional Requirements

- **Scalability:** System handles 10,000+ concurrent requests using Nginx API Gateway routing and Redis cache layer.
- **Latency:** Core endpoint responses (e.g. course list, profile, attendance stats) returned under 150ms.
- **Observability:** Centralized JSON logging (Winston) with Loki, Grafana, and Prometheus monitoring.
- **High Availability:** Multiple service pod replicas orchestrating dynamic failovers.
