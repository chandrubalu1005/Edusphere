# MASTER DATABASE MATRIX

The backend comprises independent microservices, each with its own logical MongoDB database (e.g., `edusphere_auth`, `edusphere_users`).

| Service | Model / Collection | Key Fields | Owner | Status |
|---|---|---|---|---|
| `user-service` | `users`, `profiles` | `username`, `role`, `department`, `firstName` | `user-service` | NOT VERIFIED |
| `auth-service` | `passwords`, `tokens` | `hash`, `refreshTokens` (often stored in Redis) | `auth-service` | NOT VERIFIED |
| `course-service` | `courses`, `course_masters`, `student_enrollments`, `course_ratings` | `code`, `credits`, `facultyOwnerId`, `students_enrolled` | `course-service` | NOT VERIFIED |
| `attendance-service` | `attendance_sessions`, `qr_sessions`, `attendance_participants`, `leave_policies` | `courseId`, `status`, `expiresAt`, `studentId`, `checkInTime` | `attendance-service` | NOT VERIFIED |
| `assignment-service` | `assignments`, `submissions`, `submission_files` | `courseId`, `dueDate`, `studentId`, `grade`, `storageKey` | `assignment-service` | NOT VERIFIED |
| `assessment-service` | `assessments`, `questions`, `results` | `courseId`, `type`, `maxScore`, `studentId`, `score` | `assessment-service` | NOT VERIFIED |
| `library-service` | `library_books`, `book_copies`, `book_issues`, `loans`, `reservations`, `fines`, `categories` | `isbn`, `title`, `available`, `studentId`, `dueDate`, `fineAmount` | `library-service` | NOT VERIFIED |
| `placement-service` | `placement_drives`, `placement_applications` | `company`, `eligibility`, `studentId`, `status`, `offerPackage` | `placement-service` | NOT VERIFIED |
| `timetable-service` | `timetables`, `time_slots` | `courseId`, `day`, `startTime`, `endTime`, `room` | `timetable-service` | NOT VERIFIED |
| `calendar-service` | `calendar_events` | `title`, `type`, `date`, `audience` | `calendar-service` | NOT VERIFIED |
| `finance-service` | `invoices`, `payment_transactions`, `fee_structures`, `scholarships` | `studentId`, `amount`, `status`, `dueDate` | `finance-service` | NOT VERIFIED |
| `notification-service` | `notifications` | `userId`, `title`, `message`, `read`, `type` | `notification-service` | NOT VERIFIED |
| `discussion-service` | `discussion_threads`, `discussion_replies` | `courseId`, `authorId`, `content`, `createdAt` | `discussion-service` | NOT VERIFIED |

*Note: Detailed DB schemas, indexes, and write operations require static code analysis of Mongoose models across the services. This matrix will be expanded during Phase 2 (Database Architecture).*
