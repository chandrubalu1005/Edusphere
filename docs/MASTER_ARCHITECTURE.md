# MASTER ARCHITECTURE

## Overview
EduSphere / CampusSphere is designed as an Enterprise-grade Learning Management and Academic Administration Platform. The system utilizes a microservices architecture for the backend and a single-page application (React + Vite) for the frontend.

## 1. Frontend Architecture
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query (TanStack Query)
- **Routing**: React Router DOM (v7)
- **API Communication**: Axios, Socket.IO Client for real-time features.
- **Portals**: Expected to support Student, Faculty, Admin, and Management views.

## 2. API Gateway
- **Technology**: Nginx (configured via `backend/gateway/nginx.conf`)
- **Role**: Acts as the single entry point for the frontend, routing requests to the appropriate backend microservices and handling static assets if needed.

## 3. Backend Microservices
The backend is split into 15 independent Node.js microservices:
1. `auth-service` (Port 3001)
2. `user-service` (Port 3002)
3. `course-service` (Port 3003)
4. `notification-service` (Port 3004)
5. `assessment-service` (Port 3005)
6. `assignment-service` (Port 3006)
7. `certificate-service` (Port 3007)
8. `attendance-service` (Port 3008)
9. `timetable-service` (Port 3009)
10. `calendar-service` (Port 3010)
11. `library-service` (Port 3011)
12. `placement-service` (Port 3012)
13. `discussion-service` (Port 3013)
14. `analytics-service` (Port 3014)
15. `admin-service` (Port 3015)

## 4. Infrastructure & Databases
- **Primary Database**: MongoDB (7.0) - Each service connects to a separate logical database (e.g., `edusphere_auth`, `edusphere_users`).
- **Caching & Sessions**: Redis (7.2) - Used by auth, assessment, and attendance services.
- **Message Broker**: RabbitMQ (3.12) - Used for asynchronous communication between services (e.g., users, courses, notifications).
- **Search Engine**: Meilisearch (v1.4) - Used by user and course services for advanced search capabilities.
- **Object Storage**: MinIO - S3 compatible storage for files.

## 5. Containerization & Network
- **Docker Compose**: The `infra/docker-compose.yml` defines the entire stack, mapping out networks (`edusphere_net`) and volumes for persistence.
- **Monitoring**: Prometheus and Grafana are included for observability.

## Note on Architecture Drift
This represents the *intended* architecture based on the `docker-compose.yml` and `package.json` files. Actual implementation drift (e.g., direct DB access across services, synchronous instead of asynchronous calls) will be documented as the forensic audit progresses.
