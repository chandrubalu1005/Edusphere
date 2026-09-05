# MASTER API ROUTE MATRIX

## 1. Auth & User Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/users` | GET | Fetch users by role | `useUsers` |
| `/users/:userId` | GET | Fetch user profile | `useProfile` |
| `/users/:userId` | PUT | Update user profile | `useUpdateProfile` |
| `/auth/roles` | GET | Fetch roles and permissions | `useRoles` |
| `/auth/roles/:role` | PUT | Update role permissions | `useUpdateRolePermissions` |

## 2. Academic Core / Course Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/academic/programmes` | GET | List programmes | `useAcademicProgrammes` |
| `/academic/curricula` | GET | List curricula | `useAcademicCurricula` |
| `/academic/courses` | GET | Course master list | `useAcademicCourseMaster` |
| `/academic/offerings` | GET | List offerings | `useAcademicOfferings` |
| `/academic/sections` | GET | List sections | `useAcademicSections` |
| `/academic/enrollments` | POST | Register enrollment | `useRegisterEnrollment` |
| `/courses` | GET | List/Filter courses | `useCourses` |
| `/courses/search` | GET | Search courses | `useSearchCourses` |
| `/courses` | POST | Create course | `useCreateCourse` |
| `/courses/:id` | PUT | Update course | `useUpdateCourse` |
| `/courses/:id/approve` | POST | Approve course | `useApproveCourse` |
| `/courses/:id/reject` | POST | Reject course | `useRejectCourse` |
| `/courses/:id/content` | GET | Fetch course content | `useCourseContent` |
| `/courses/:id/content` | POST | Upload course content | `useUploadCourseContent` |
| `/courses/resources/all` | GET | Fetch all resources | `useAllResources` |
| `/courses/:id/rate` | POST | Rate course | `useRateCourse` |
| `/courses/:id/enrollments/bulk` | POST | Bulk enroll | `useBulkEnroll` |
| `/courses/:id/prerequisites` | PATCH | Update prerequisites | `useUpdatePrerequisites` |
| `/courses/feedback` | GET | Fetch course feedback | `useCourseFeedback` |
| `/courses/feedback` | POST | Submit course feedback | `useSubmitCourseFeedback` |

## 3. Admin & Configuration Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/admin/departments` | GET | List departments | `useDepartments` |
| `/admin/departments` | POST | Create department | `useCreateDepartment` |
| `/admin/semesters` | GET | List semesters | `useSemesters` |
| `/admin/semesters` | POST | Create semester | `useCreateSemester` |
| `/admin/semesters/:id/activate` | PATCH | Activate semester | `useActivateSemester` |
| `/admin/semesters/:id/close` | POST | Close semester | `useCloseSemester` |
| `/admin/users` | GET | Admin user list | `useAdminUsers` |
| `/admin/users` | POST | Create user | `useCreateUser` |
| `/admin/users/bulk` | PATCH | Bulk update users | `useBulkUpdateUsers` |
| `/admin/audit-logs` | GET | Fetch audit logs | `useAuditLogs` |
| `/admin/helpdesk/tickets` | GET | Fetch tickets | `useHelpdeskTickets` |
| `/admin/helpdesk/tickets` | POST | Create ticket | `useCreateTicket` |
| `/admin/helpdesk/tickets/:id` | PATCH | Update ticket | `useUpdateTicket` |
| `/admin/health` | GET | System health basic | `useSystemHealth` |
| `/admin/health/all` | GET | System health full | `useSystemHealthAll` |
| `/admin/backups` | GET | List backups | `useBackups` |
| `/admin/backup` | POST | Trigger backup | `useCreateBackup` |
| `/leave/requests` | GET | List leave requests | `useLeaveRecords` |
| `/leave/requests` | POST | Submit leave request | `useSubmitLeave` |
| `/leave/quota/:userId` | GET | Leave balance | `useLeaveBalance` |
| `/leave/requests/:id/approve`| PATCH | Approve leave | `useApproveLeave` |
| `/leave/requests/:id/reject` | PATCH | Reject leave | `useRejectLeave` |
| `/leave/requests/:id/withdraw`| PATCH | Withdraw leave | `useWithdrawLeave` |

## 4. Attendance Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/attendance/course/:id` | GET | Course attendance | `useCourseAttendance` |
| `/attendance/student/:id` | GET | Student attendance | `useStudentAttendanceStats` |
| `/attendance/leaderboard/:id` | GET | Attendance leaderboard | `useAttendanceLeaderboard` |
| `/attendance/mark` | POST | Mark attendance | `useMarkAttendance` |
| `/attendance/mark-all` | POST | Bulk mark | `useMarkAllAttendance` |
| `/attendance/sessions` | POST | Create QR session | `useCreateQRSession` |
| `/attendance/sessions/:id/scan`| POST | Scan QR/PIN | `useScanQRSession` |
| `/attendance/weekly-summary` | GET | Weekly summary | `useWeeklySummary` |

## 5. Assessment & Assignment Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/assessments` | GET | List assessments | `useAssessments` |
| `/assessments/:id/start` | POST | Start assessment | `useStartAssessment` |
| `/assessments/:id/submit` | POST | Submit assessment | `useSubmitAssessment` |
| `/assignments` | GET | List assignments | `useAssignments` |
| `/assignments` | POST | Create assignment | `useCreateAssignment` |
| `/assignments/stats` | GET | Assignment stats | `useAssignmentStats` |
| `/assignments/:id/submissions` | GET | Assignment submissions | `useAssignmentSubmissions` |
| `/assignments/:id/submit` | POST | Submit assignment | `useSubmitAssignment` |
| `/assignments/:id/bulk-grade` | POST | Bulk grade | `useBulkGrade` |
| `/students/:id/submissions` | GET | Student submissions | `useMySubmissions` |
| `/submissions/:id/dispute` | POST | Dispute grade | `useDisputeGrade` |
| `/submissions/:id/resolve-dispute`| PATCH | Resolve dispute | `useResolveDispute` |
| `/submissions/:id/grade` | PATCH | Grade submission | `useGradeSubmission` |
| `/assignments/disputes` | GET | List disputes | `useDisputes` |

## 6. Library Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/library/books` | GET | List books | `useLibraryBooks` |
| `/library/issues/:userId` | GET | My issues | `useLibraryIssues` |
| `/library/issues` | POST | Issue book | `useIssueBook` |
| `/library/issues/:id/return` | PATCH | Return book | `useReturnBook` |
| `/library/circulation/loans` | GET | Loan records | `useLibraryLoans` |
| `/library/circulation/issue` | POST | Enterprise issue | `useIssueLoan` |
| `/library/circulation/loans/:id/return`| PATCH | Enterprise return | `useReturnLoan` |
| `/library/circulation/loans/:id/renew` | PATCH | Renew loan | `useRenewLoan` |
| `/library/catalog/search` | GET | Search catalog | `useSearchCatalog` |
| `/library/digital-resources` | GET | List digital resources | `useDigitalResources` |
| `/library/digital-resources/:id/access`| POST | Access resource | `useAccessResource` |

## 7. Placement Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/placement/drives` | GET | List placement drives | `usePlacementDrives` |
| `/placement/applications/:id` | GET | My applications | `usePlacementApplications` |
| `/placement/applications` | POST | Apply to drive | `useApplyToDrive` |
| `/placement/drives/:id/applicants`| GET | View drive applicants | `useDriveApplicants` |

## 8. Discussion Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/discussion/threads/:courseId` | GET | List course threads | `useDiscussionThreads` |
| `/discussion/thread/:threadId` | GET | Thread details | `useThreadDetails` |
| `/discussion/threads` | POST | Create thread | `useCreateDiscussionThread` |
| `/discussion/threads/:id/reply` | POST | Post reply | `useCreateReply` |

## 9. Analytics Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/analytics/kpis` | GET | Dashboard KPIs | `useAnalyticsKPIs` |
| `/analytics/budgets` | GET | Budget reports | `useAnalyticsBudgets` |
| `/analytics/heatmap/:userId` | GET | Activity heatmap | `useStudentHeatmap` |
| `/analytics/peer-comparison/:userId`| GET | Peer comparison | `usePeerComparison` |
| `/analytics/department/:id/kpis`| GET | Department KPIs | `useDepartmentKPIs` |
| `/analytics/grades/:userId` | GET | Grade analytics | `useGradeAnalytics` |
| `/analytics/risk/:userId` | GET | Risk analysis | `useRiskAnalysis` |
| `/analytics/ai/rubric-templates` | GET | AI Rubrics | `useRubrics` |
| `/analytics/ai/kpi-forecast` | GET | KPI Forecast | `useKPIForecast` |
| `/analytics/management/faculty-performance`| GET | Faculty performance | `useFacultyPerformance` |
| `/analytics/management/placement-stats`| GET | Placement stats | `usePlacementStats` |
| `/analytics/management/department-performance`| GET | Dept performance | `useDepartmentPerformance` |

## 10. Notifications & Certs
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/certificates` | GET | List certificates | `useCertificates` |
| `/notifications` | GET | List notifications | `useNotifications` |
| `/notifications/:id/read` | PATCH | Mark read | `useMarkNotificationRead` |
| `/notifications/read-all` | PATCH | Mark all read | `useMarkAllNotificationsRead` |
| `/notifications/announcements` | GET | Announcements list | `useAnnouncements` |
| `/notifications/announcements` | POST | Post announcement | `usePostAnnouncement` |

## 11. Timetable & Calendar Service
| Endpoint | Method | Purpose | Frontend Hook |
|----------|--------|---------|---------------|
| `/timetable` | GET | Fetch timetable | `useTimetable` |
| `/timetable` | POST | Add slot | `useCreateTimetableSlot` |
| `/calendar` | GET | Fetch calendar | `useAcademicCalendar` |
| `/calendar` | POST | Add event | `useCreateCalendarEvent` |
