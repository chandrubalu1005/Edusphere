# MASTER DATABASE MATRIX

This matrix outlines the database collections and models used across the EduSphere microservices.

## 1. Admin Service
*Database: MongoDB (`admin-service` database or shared `edusphere` depending on setup)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `AuditLog` | `auditlogs` | System-wide compliance and action tracking |
| `Department` | `departments` | Academic department records |
| `Semester` | `semesters` | Academic terms and sessions |
| `SupportTicket`| `supporttickets`| Helpdesk and IT ticketing |

## 2. Analytics Service
*Database: MongoDB (`analytics-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `AssessmentEvent` | `assessmentevent` | Telemetry for quizzes and exams |
| `AttendanceEvent` | `attendanceevent` | Telemetry for attendance tracking |
| `CourseGrade` | `coursegrades` | Aggregated grade metrics |
| `CourseRatingEvent`| `courseratingevent`| Faculty and course feedback telemetry |
| `DepartmentSnapshot`| `departmentsnapshot`| KPI rollups for management portal |
| `Settings` | `settings` | Analytics configuration |

## 3. Attendance Service
*Database: MongoDB (`attendance-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `Attendance` | `attendances` | Core attendance records per student |
| `AttendanceEvent`| `attendanceevents`| Raw check-in logs |
| `AttendanceParticipant`| `attendanceparticipants`| Roster state per session |
| `AttendancePolicy`| `attendancepolicies`| Rules for check-in windows |
| `AttendanceSession`| `attendancesessions`| Instance of a class occurring |
| `ClassSession` | `classsessions` | Master schedule block |
| `LeavePolicy` | `leavepolicies` | Institutional leave configurations |
| `LeaveRequest` | `leaverequests` | Student/Staff leave tracking |
| `OtpAttendanceSession`| `otpattendancesessions`| Dynamic PIN state |
| `OtpSubmission`| `otpsubmissions`| Verification logs for OTPs |
| `QRSession` | `qrsessions` | QR based attendance active sessions |

## 4. Auth Service
*Database: MongoDB (`auth-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `User` | `users` | Core identities, passwords (hashed), roles |

## 5. Calendar Service
*Database: MongoDB (`calendar-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `CalendarEvent`| `calendarevents`| Academic calendar and schedules |

## 6. Course Service
*Database: MongoDB (`course-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `Course` | `courses` | Academic course master records |
| `CourseRating` | `courseratings` | Faculty/Course feedback scores |
| `FeedbackSurvey`| `feedbacksurveys`| Detailed surveys |

## 7. Discussion Service
*Database: MongoDB (`discussion-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `DiscussionThread`| `discussionthreads`| Forum main topics |
| `DiscussionReply` | `discussionreplies`| Forum replies and comments |

## 8. Finance Service
*Database: MongoDB (`finance-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `FeeStructure` | `feestructures` | Institutional fee definitions |
| `Invoice` | `invoices` | Student billing |
| `PaymentTransaction`| `paymenttransactions`| Payment receipts and logs |
| `Scholarship` | `scholarships` | Financial aid tracking |

## 9. Library Service (Enterprise Module)
*Database: MongoDB (`library-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `BookTitle` / `LibraryBook`| `booktitles`| Master catalog record |
| `BookCopy` | `bookcopies` | Individual physical inventory instances |
| `Author` | `authors` | Catalog metadata |
| `Category` | `categories` | Catalog metadata |
| `Publisher` | `publishers` | Catalog metadata |
| `Location` / `LibraryBranch`| `locations` | Physical mapping |
| `LibraryMember`| `librarymembers`| Patrons |
| `BorrowingPolicy`| `borrowingpolicies`| Circulation rules |
| `Loan` / `BookIssue` | `loans` | Active circulation |
| `LoanEvent` | `loanevents` | Historical log |
| `Reservation` | `reservations` | Holds and queues |
| `Fine` / `FineTransaction`| `fines` | Overdue accounting |
| `AcquisitionRequest`| `acquisitionrequests`| Procurement |
| `PurchaseOrder`| `purchaseorders`| Procurement |
| `ReceivingRecord`| `receivingrecords`| Procurement |
| `Vendor` | `vendors` | Procurement |
| `DigitalResource`| `digitalresources`| E-Books / PDF storage links |
| `DigitalAccessLog`| `digitalaccesslogs`| DRM / viewing metrics |
| `InventorySession`| `inventorysessions`| Physical audit |
| `InventoryScan`| `inventoryscans`| Physical audit logs |
| `InventoryDiscrepancy`| `inventorydiscrepancies`| Audit findings |

## 10. Placement Service
*Database: MongoDB (`placement-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `PlacementDrive`| `placementdrives`| Campus recruiting events |
| `PlacementApplication`| `placementapplications`| Student job applications |

## 11. Timetable Service
*Database: MongoDB (`timetable-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `TimeSlot` | `timeslots` | Basic grid mapping |
| `Timetable` | `timetables` | Finalized weekly schedule |

## 12. User Service
*Database: MongoDB (`user-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `Profile` | `profiles` | Extended user data (avatar, bio, address) |

## 13. Assignment Service (TypeScript)
*Database: MongoDB (`assignment-service`)*
| Model | Collection/Entity | Purpose |
|-------|-------------------|---------|
| `Assignment` | `assignments` | Faculty posted assignments |
| `Submission` | `submissions` | Student submitted works |
| `OutboxEvent` | `outboxevents`| Distributed transaction/event logs |
