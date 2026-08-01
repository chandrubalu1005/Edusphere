# Software Design Document (SDD) - EduSphere Enterprise

## 1. System Architecture Diagram

```mermaid
graph TD
    Client[React Frontend] -->|HTTP/Websocket| Gateway[Nginx API Gateway]
    
    Gateway -->|/api/auth| AuthService[Auth Service :3001]
    Gateway -->|/api/users| UserService[User Service :3002]
    Gateway -->|/api/courses| CourseService[Course Service :3003]
    Gateway -->|/api/attendance| AttendanceService[Attendance Service :3008]
    Gateway -->|/api/timetable| TimetableService[Timetable Service :3009]
    Gateway -->|/api/calendar| CalendarService[Calendar Service :3010]
    Gateway -->|/api/library| LibraryService[Library Service :3011]
    Gateway -->|/api/placement| PlacementService[Placement Service :3012]
    Gateway -->|/api/discussion| DiscussionService[Discussion Service :3013]
    Gateway -->|/api/analytics| AnalyticsService[Analytics Service :3014]
    Gateway -->|/api/admin| AdminService[Admin Service :3015]

    AuthService -->|MongoDB| AuthDB[(Auth DB)]
    UserService -->|MongoDB| UserDB[(User DB)]
    CourseService -->|MongoDB| CourseDB[(Course DB)]
    AttendanceService -->|MongoDB| AttendanceDB[(Attendance DB)]
    TimetableService -->|MongoDB| TimetableDB[(Timetable DB)]
    CalendarService -->|MongoDB| CalendarDB[(Calendar DB)]
    LibraryService -->|MongoDB| LibraryDB[(Library DB)]
    PlacementService -->|MongoDB| PlacementDB[(Placement DB)]
    DiscussionService -->|MongoDB| DiscussionDB[(Discussion DB)]
    AnalyticsService -->|MongoDB| AnalyticsDB[(Analytics DB)]
    AdminService -->|MongoDB| AdminDB[(Admin DB)]

    AttendanceService -->|Cache| RedisCache[(Redis Cache)]
    CourseService -->|Search Index| MeiliSearch[(Meilisearch)]
    
    Prometheus[Prometheus Pull Metrics] -->|Scrape| AuthService
    Prometheus -->|Scrape| UserService
    Prometheus -->|Scrape| CourseService
    Prometheus -->|Scrape| AttendanceService
    
    Grafana[Grafana Dashboard] -->|Read Metrics| Prometheus

    AuthService -.->|Publish Event| MQ[RabbitMQ Event Broker]
    CourseService -.->|Publish Event| MQ
    AttendanceService -.->|Publish Event| MQ

    MQ -.->|Consume user.registered| UserService
```

---

## 2. Microservice MVC Folder Structure

Every microservice in the EduSphere ecosystem adheres to a strict MVC (Model-View-Controller) architecture layout for high code readability, separation of concerns, and ease of maintainability:

```
services/<service-name>/
  ├── src/
  │   ├── config/       # Databases, Redis caches, and RabbitMQ connection configurations
  │   ├── models/       # Mongoose Schemas & entities definitions
  │   ├── routes/       # Express route handlers definition
  │   ├── controllers/  # Core request handling and data mutation logic
  │   ├── middleware/    # Auth middleware (JWT + RBAC role verification)
  │   └── server.js     # Express server setup and routing registrations
  ├── Dockerfile        # Container image packing configuration
  ├── package.json      # Dependencies configuration
  └── server.js         # Entrypoint redirect to src/server.js
```

---

## 3. Database Schema ERD

```mermaid
erDiagram
    USER {
        string id PK
        string username
        string email
        string password
        string role
    }
    PROFILE {
        string id PK
        string userId FK
        string firstName
        string lastName
        string bio
        object preferences
        boolean active
    }
    COURSE {
        string id PK
        string code
        string title
        string description
        string department
        string facultyOwnerId FK
        string status
        array content
    }
    ATTENDANCE {
        string id PK
        string studentId FK
        string courseId FK
        string status
        string date
        string markedBy
    }
    TIMETABLE {
        string id PK
        string courseId FK
        string code
        string title
        string room
        string day
        string timeStart
        string timeEnd
    }
    CALENDAR_EVENT {
        string id PK
        string title
        string description
        string date
        string type
        string targetAudience
    }

    USER ||--|| PROFILE : "has"
    USER ||--o{ COURSE : "teaches"
    USER ||--o{ ATTENDANCE : "attends"
    COURSE ||--o{ ATTENDANCE : "tracked in"
    COURSE ||--o{ TIMETABLE : "scheduled in"
```

---

## 4. Event Topologies & Eventual Consistency

1. **`user.registered` event:**
   - **Producer:** Auth Service upon registering a new student.
   - **Routing Key:** `user.registered`
   - **Consumers:** User Service initializes profile record; Notification Service sends confirmation email.
2. **`attendance.marked` event:**
   - **Producer:** Attendance Service when faculty saves a marking.
   - **Routing Key:** `attendance.marked`
   - **Consumers:** Cache invalidation; Audit logs.
3. **`course.created` event:**
   - **Producer:** Course Service when a course proposal is registered.
   - **Consumers:** Academic Calendar (future) marks course review periods.
