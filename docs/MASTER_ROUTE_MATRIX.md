# MASTER ROUTE MATRIX

## 1. Student Portal (`/student/*`)
| Route | Component | Layout | Auth | Role | API Dependency | Status |
|-------|-----------|--------|------|------|----------------|--------|
| `/dashboard` | `StudentDashboard` | `Layout` | YES | `student` | `useLiveCourses`, `useLiveEnrollments`, `useLiveAttendance`, etc. | PASS |
| `/courses` | `StudentCourses` | `Layout` | YES | `student` | `useLiveCourses`, `useLiveEnrollments` | PASS |
| `/attendance` | `StudentAttendance` | `Layout` | YES | `student` | `useLiveAttendance` | PASS |
| `/assessments` | `StudentAssessments` | `Layout` | YES | `student` | `useLiveAssessments` | PASS |
| `/assignments` | `StudentAssignments` | `Layout` | YES | `student` | `useLiveAssignments` | PASS |
| `/certificates` | `StudentCertificates` | `Layout` | YES | `student` | `useLiveCertificates` | PASS |
| `/library` | `StudentLibrary` | `Layout` | YES | `student` | `useLibraryBooks` | PASS |
| `/placement` | `StudentPlacement` | `Layout` | YES | `student` | `useLivePlacementDrives` | PASS |
| `/helpdesk` | `HelpDesk` | `Layout` | YES | `student` | `useSupportTickets` | PASS |
| `/profile` | `StudentProfile` | `Layout` | YES | `student` | `useLiveProfile` | PASS |
| `/notifications` | `StudentNotifications` | `Layout` | YES | `student` | `useLiveNotifications` | PASS |
| `/timetable` | `StudentTimetable` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/acad-calendar` | `AcademicCalendar` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/progress` | `LearningProgress` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/discussions` | `CommunicationHub` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/transcript` | `TranscriptGrades` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/fees` | `FeePayment` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/downloads` | `DownloadCenter` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/activity` | `ActivityTimeline` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/ai-assistant` | `AIAssistant` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/plan` | `AcademicPlan` | `Layout` | YES | `student` | Stub | PARTIAL |
| `/registration` | `CourseRegistration` | `Layout` | YES | `student` | Stub | PARTIAL |

## 2. Faculty Portal (`/faculty/*`)
| Route | Component | Layout | Auth | Role | API Dependency | Status |
|-------|-----------|--------|------|------|----------------|--------|
| `/dashboard` | `FacultyDashboard` | `Layout` | YES | `faculty` | `useLiveCourses` | PASS |
| `/users` | `UserManagement` | `Layout` | YES | `faculty` | `useUsers` | PASS |
| `/courses` | `FacultyCourses` | `Layout` | YES | `faculty` | `useLiveCourses` | PASS |
| `/content` | `ResourceUpload` | `Layout` | YES | `faculty` | `useUploadCourseContent` | PASS (Duplicate Route) |
| `/attendance` | `FacultyAttendance` | `Layout` | YES | `faculty` | `useCourseAttendance` | PASS (Duplicate Route) |
| `/assignments` | `FacultyAssignments` | `Layout` | YES | `faculty` | `useAssignments` | PASS (Duplicate Route) |
| `/assessments` | `FacultyDashboard` | `Layout` | YES | `faculty` | - | PASS (Duplicate Route) |
| `/analytics` | `FacultyAnalytics` | `Layout` | YES | `faculty` | `useCourseAnalytics` | PASS (Duplicate Route) |
| `/profile` | `FacultyProfile` | `Layout` | YES | `faculty` | `useLiveProfile` | PASS (Duplicate Route) |
| `/notifications` | `Notifications` | `Layout` | YES | `faculty` | Static | PARTIAL |
| `/timetable` | `FacultyTimetable` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/performance` | `StudentPerformance` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/leave` | `LeaveManagement` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/announcements` | `AnnouncementMgmt` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/discussions` | `DiscussionModeration` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/grades` | `GradeSubmission` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/completion` | `CourseCompletionTracker`| `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/ai-tools` | `AITools` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/feedback` | `StudentFeedback` | `Layout` | YES | `faculty` | Stub | PARTIAL |
| `/otp-attendance`| `FacultyOtpAttendance` | `Layout` | YES | `faculty` | Stub | PARTIAL |

*(Note: Faculty Portal has duplicate routes injected via a previous `PagePlaceholder` patch script that need to be removed: `content`, `assessments`, `assignments`, `attendance`, `timetable`, `performance`, `grades`, `completion`, `discussions`, `announcements`, `analytics`, `leave`, `ai-tools`, `profile`, `notifications`.)*

## 3. Admin Portal (`/admin/*`)
| Route | Component | Layout | Auth | Role | API Dependency | Status |
|-------|-----------|--------|------|------|----------------|--------|
| `/dashboard` | `AdminDashboard` | `Layout` | YES | `admin` | `useSystemHealth` | PASS |
| `/users` | `UserManagement` | `Layout` | YES | `admin` | `useLiveUsers` | PASS |
| `/courses` | `AdminCourses` | `Layout` | YES | `admin` | `useLiveCourses` | PASS |
| `/departments` | `DepartmentManagement` | `Layout` | YES | `admin` | `useDepartments` | PASS (Duplicate Route) |
| `/semesters` | `SemesterManagement` | `Layout` | YES | `admin` | `useSemesters` | PASS (Duplicate Route) |
| `/enrollments` | `EnrollmentManagement` | `Layout` | YES | `admin` | `useEnrollments` | PASS (Duplicate Route) |
| `/audit` | `AuditLogsCenter` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/settings` | `ConfigurationCenter` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/helpdesk` | `AdminHelpDesk` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/notifications` | `Notifications` | `Layout` | YES | `admin` | Static | PARTIAL (Duplicate Route) |
| `/profile` | `AdminProfile` | `Layout` | YES | `admin` | `useLiveProfile` | PASS (Duplicate Route) |
| `/timetable-mgmt`| `TimetableMgmt` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/cert-approval` | `CertificateApproval` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/roles` | `RolePermissions` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/system-health` | `SystemHealth` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/backup` | `BackupRestore` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/library-mgmt` | `LibraryManagement` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/placement-mgmt`| `PlacementManagement` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/email` | `EmailBroadcast` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/file-mgmt` | `FileManager` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/academic-core` | `AcademicManagement` | `Layout` | YES | `admin` | Stub | PARTIAL (Duplicate Route) |
| `/curriculum` | `CurriculumBuilder` | `Layout` | YES | `admin` | Stub | PARTIAL |
| `/catalog` | `CourseCatalog` | `Layout` | YES | `admin` | Stub | PARTIAL |

*(Note: Admin Portal has duplicate routes injected via a previous `PagePlaceholder` patch script that need to be removed.)*

## 4. Management Portal (`/management/*`)
| Route | Component | Layout | Auth | Role | API Dependency | Status |
|-------|-----------|--------|------|------|----------------|--------|
| `/dashboard` | `ExecutiveDashboard` | `Layout` | YES | `mgmt` | `useMgmtStats` | PASS |
| `/users` | `UserManagement` | `Layout` | YES | `mgmt` | `useUsers` | PASS |
| `/analytics` | `AnalyticsReports` | `Layout` | YES | `mgmt` | `useAnalytics` | PASS |
| `/departments` | `ManagementDepartments` | `Layout` | YES | `mgmt` | `useDepartments` | PASS (Duplicate Route) |
| `/courses` | `CourseApprovals` | `Layout` | YES | `mgmt` | `useLiveCourses` | PASS |
| `/audit` | `ComplianceLogs` | `Layout` | YES | `mgmt` | Stub | PARTIAL (Duplicate Route) |
| `/placement` | `PlacementAnalytics` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/profile` | `ManagementProfile` | `Layout` | YES | `mgmt` | `useLiveProfile` | PASS (Duplicate Route) |
| `/notifications` | `Notifications` | `Layout` | YES | `mgmt` | Static | PARTIAL (Duplicate Route) |
| `/kpis` | `InstitutionalKPIs` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/faculty-perf` | `FacultyPerformance` | `Layout` | YES | `mgmt` | Stub | PARTIAL (Duplicate Route) |
| `/student-perf` | `MgmtStudentPerf` | `Layout` | YES | `mgmt` | Stub | PARTIAL (Duplicate Route) |
| `/placement-analytics`| `PlacementAnalytics`| `Layout`| YES | `mgmt` | Stub | PARTIAL (Duplicate Route) |
| `/research` | `ResearchStats` | `Layout` | YES | `mgmt` | Stub | PARTIAL (Duplicate Route) |
| `/budget` | `BudgetOverview` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/risk-alerts` | `RiskAlerts` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/approvals` | `ApprovalCenter` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/accreditation` | `Accreditation` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/ai-insights` | `AIInsights` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/predictive` | `PredictiveAnalytics` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/executive-reports`| `ExecutiveReports` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/academic-core` | `AcademicManagement` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/curriculum` | `CurriculumBuilder` | `Layout` | YES | `mgmt` | Stub | PARTIAL |
| `/catalog` | `CourseCatalog` | `Layout` | YES | `mgmt` | Stub | PARTIAL |

*(Note: Management Portal has duplicate routes injected via a previous `PagePlaceholder` patch script that need to be removed.)*
