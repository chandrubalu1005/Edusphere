# CampusSphere — Enterprise Library Management Portal — Google Antigravity Master Build Prompt

## PURPOSE
Build the CampusSphere Library Management Portal completely from scratch inside the existing repository. This is an enterprise implementation task, not a static UI mockup. The result must be a real, database-backed, RBAC-enforced, LAN-accessible, real-time library platform shared by Student, Faculty, HOD, Management, Admin, and Root Admin portals.

## HOW TO USE THIS PROMPT
1. Open the existing CampusSphere repository as the Antigravity project.
2. Use Planning Mode for the first execution.
3. Attach the four CampusSphere visual-reference images:
   - 01 — CampusSphere Student visual style
   - 02 — CampusSphere Faculty visual style
   - 03 — CampusSphere Admin visual style
   - 04 — CampusSphere HOD/Management visual style
4. Paste this entire prompt into the Antigravity Agent.
5. Tell the Agent to read the entire prompt before executing.
6. Tell it to inspect the repository before changing anything.
7. Require an implementation artifact and gap report before code changes.
8. Approve implementation only after the architecture, database, RBAC, API, UI, real-time, testing, and LAN plan are visible.
9. Let the Agent execute in phases, not as one uncontrolled rewrite.
10. Use browser verification and artifacts at every major gate.
11. Do not accept a build-only success message.
12. Final acceptance requires real database operations, real APIs, real authorization, real-time behavior, browser walkthroughs, and private-LAN verification.

## REFERENCE IMAGE RULE
The supplied screenshots are visual and UX references only. They establish CampusSphere visual language, spacing, navigation patterns, typography hierarchy, card density, tables, filters, status chips, dashboards, and role separation. They do not define database values, permissions, academic relationships, or business rules. Actual repository architecture, authenticated user identity, database records, RBAC rules, and academic relationships remain authoritative.

## PRIMARY PRINCIPLE
One shared library data platform. One shared business domain. One shared authorization model. Different role-specific experiences. Never create a separate database per role. Never implement security only in React. Backend authorization is the security boundary.


## 1. NON-NEGOTIABLE ENGINEERING RULES
0001. Do not build a static mockup.
0002. Do not use hardcoded library records in production UI.
0003. Do not use fake API responses.
0004. Do not create buttons that only show a success toast.
0005. Do not declare completion because the application builds.
0006. Do not declare completion because a page renders.
0007. Do not declare completion because a screenshot looks correct.
0008. Every business action must reach a real API or an explicitly justified local-only interaction.
0009. Every protected operation must be authorized server-side.
0010. Every database mutation must have validation.
0011. Every sensitive mutation must be auditable.
0012. Every major workflow must have automated tests.
0013. Every major workflow must have browser verification.
0014. Private-LAN access must be tested using the configured gateway, not localhost.
0015. Do not expose MongoDB, Redis, RabbitMQ, or MinIO directly to clients.
0016. Do not replace existing authentication with a second authentication system.
0017. Do not duplicate the existing User model.
0018. Do not create a second RBAC hierarchy.
0019. Do not destroy existing project data or existing working modules.
0020. Do not rewrite unrelated features merely for convenience.
0021. Do not weaken security to make development easier.
0022. Do not silently swallow backend errors.
0023. Do not fabricate fallback data after an API failure.
0024. Do not hide unfinished functionality behind disabled-looking controls.
0025. Do not mark a feature complete while a critical dependency is missing.
0026. Document every deliberate limitation.
0027. Prefer reusable components and services over duplicate role-specific implementations.
0028. Keep business logic out of presentation components.
0029. Keep authorization logic out of arbitrary UI components.
0030. Keep policy calculations independently testable.
0031. Keep library functionality modular and maintainable.

## 2. ANTIGRAVITY WORKING METHOD
0032. Start in Planning Mode.
0033. Read the entire repository structure.
0034. Read package manifests.
0035. Read frontend routes.
0036. Read backend routes.
0037. Read existing models.
0038. Read authentication middleware.
0039. Read RBAC middleware.
0040. Read gateway configuration.
0041. Read environment configuration.
0042. Read Docker configuration.
0043. Read existing seed scripts.
0044. Read existing browser tests.
0045. Read existing library-related code.
0046. Read existing design-system components.
0047. Search for mock library data.
0048. Search for duplicate library routes.
0049. Search for TODOs and placeholder handlers.
0050. Search for hardcoded book records.
0051. Search for fake success handlers.
0052. Search for unimplemented APIs.
0053. Search for existing object-storage abstractions.
0054. Search for existing RabbitMQ abstractions.
0055. Search for existing Redis abstractions.
0056. Search for existing Socket.IO abstractions.
0057. Search for existing search abstractions.
0058. Produce a forensic gap report.
0059. Produce a target architecture.
0060. Produce an implementation plan.
0061. Produce a dependency map.
0062. Do not start broad coding until these artifacts are reviewed.

## 3. CAMPUSSPHERE ROLE MODEL
0063. Support ROOT_ADMIN.
0064. Support ADMIN.
0065. Support MANAGEMENT.
0066. Support HOD.
0067. Support FACULTY.
0068. Support STUDENT.
0069. ROOT_ADMIN has global system authority.
0070. ADMIN has institution-wide operational authority within platform rules.
0071. MANAGEMENT has institutional oversight authority.
0072. HOD is department-scoped.
0073. FACULTY is department and explicit assignment scoped.
0074. STUDENT is identity and enrollment scoped.
0075. Never trust role values supplied by the browser.
0076. Never trust department values supplied by the browser.
0077. Never trust year values supplied by the browser.
0078. Never trust semester values supplied by the browser.
0079. Never trust course IDs supplied by the browser.
0080. Never infer faculty authorization from defaultYear alone.
0081. FacultyAssignment is authoritative for faculty course access.
0082. Enrollment is authoritative for student course access.
0083. HOD access is department plus all relevant years and semesters in that department.
0084. Management metadata must not incorrectly remove approved institution-wide oversight.
0085. Admin must not elevate itself to Root Admin.
0086. Student must never read another student's private history.
0087. Faculty must not edit unassigned course offerings.
0088. HOD must not edit another department.
0089. Management must not receive unauthorized destructive operations.
0090. Role-specific UI must reflect backend authorization.
0091. Role-specific UI must not be the security boundary.
0092. Test every sensitive permission with negative cases.

## 4. LIBRARY DOMAIN SCOPE
0093. Model the library as a first-class CampusSphere domain.
0094. Support bibliographic records.
0095. Support editions.
0096. Support authors.
0097. Support publishers.
0098. Support subjects.
0099. Support classifications.
0100. Support identifiers.
0101. Support physical copies.
0102. Support digital resources.
0103. Support library members.
0104. Support service points.
0105. Support loans.
0106. Support reservations.
0107. Support fines.
0108. Support policies.
0109. Support notifications.
0110. Support audit records.
0111. Support document versions.
0112. Support course-linked resources.
0113. Support Unit 1 through Unit 5.
0114. Support department-scoped course libraries.
0115. Support institutional catalog operations.
0116. Support reporting.
0117. Support inventory.
0118. Support circulation.
0119. Support digital access.
0120. Support search.
0121. Support future interoperability.
0122. Keep the model extensible without overengineering the first release.

## 5. ACADEMIC COURSE LIBRARY HIERARCHY
0123. Use Department.
0124. Use Program.
0125. Use Batch.
0126. Use Academic Year.
0127. Use Year of Study.
0128. Use Semester.
0129. Use Curriculum.
0130. Use MasterCourse.
0131. Use CourseOffering.
0132. Use FacultyAssignment.
0133. Use Enrollment.
0134. Use Unit 1.
0135. Use Unit 2.
0136. Use Unit 3.
0137. Use Unit 4.
0138. Use Unit 5.
0139. Every CourseOffering must have exactly five unit containers.
0140. Do not invent Unit 6.
0141. Do not invent Semester 8 curriculum.
0142. Do not invent course codes.
0143. Do not split source slash-codes into invented courses.
0144. CourseOffering is a delivery-context record.
0145. MasterCourse is reusable course identity.
0146. FacultyAssignment controls faculty management access.
0147. Enrollment controls student course access.
0148. Course resources must inherit the correct academic scope.
0149. Search filters must respect academic scope.
0150. Resource access must respect academic scope.
0151. Course-resource audit events must preserve scope.

## 6. STUDENT PORTAL
0152. Create a Student Library Dashboard.
0153. Show current borrowed items.
0154. Show due-soon items.
0155. Show active reservations.
0156. Show fines.
0157. Show digital resources.
0158. Show library announcements.
0159. Show quick actions.
0160. Provide catalog search.
0161. Provide advanced filters.
0162. Provide resource detail pages.
0163. Provide availability.
0164. Provide reservation.
0165. Provide borrow/request where policy permits.
0166. Provide renewal where policy permits.
0167. Provide digital access where authorized.
0168. Provide My Loans.
0169. Provide My Reservations.
0170. Provide My Fines.
0171. Provide notifications.
0172. Provide personal activity history where appropriate.
0173. Never expose another patron's records.
0174. Never expose internal staff-only metadata.
0175. Never expose catalog editing controls.
0176. Never expose inventory mutation controls.
0177. Never expose policy administration.
0178. Show actionable empty states.
0179. Show real loading states.
0180. Show actionable errors.
0181. Use CampusSphere Student visual language.
0182. Keep student workflows simple and mobile-friendly.

## 7. FACULTY PORTAL
0183. Create a Faculty Library Dashboard.
0184. Show assigned course offerings.
0185. Show resource completeness.
0186. Show recent resource activity.
0187. Show resource counts.
0188. Show upload quick action.
0189. Provide My Courses.
0190. Provide Course Resources.
0191. Provide CourseOffering detail.
0192. Provide Unit 1 through Unit 5.
0193. Provide upload resource.
0194. Provide version upload.
0195. Provide version history.
0196. Provide metadata editing.
0197. Provide archive.
0198. Provide restore where authorized.
0199. Provide resource search.
0200. Provide course-resource filtering.
0201. Show ownership.
0202. Show visibility.
0203. Show approval state where configured.
0204. Show authorized usage analytics.
0205. Do not expose private student data.
0206. Do not edit unassigned courses.
0207. Do not edit other departments.
0208. Use Faculty visual language.
0209. Use shared CampusSphere components.
0210. Keep business logic server-side.
0211. Audit faculty resource mutations.
0212. Provide clear unauthorized states.

## 8. HOD PORTAL
0213. Create a department-scoped Library Dashboard.
0214. Show department resource health.
0215. Show resource completeness by course.
0216. Show Unit 1 through Unit 5 completeness.
0217. Show faculty contribution metrics.
0218. Show department circulation metrics.
0219. Show digital resource usage.
0220. Provide year filters.
0221. Provide semester filters.
0222. Provide course filters.
0223. Provide faculty filters.
0224. Provide department resource review.
0225. Provide approval workflow where configured.
0226. Provide department reports.
0227. Provide audit visibility for department resources.
0228. Do not expose another department's editable data.
0229. Do not permit cross-department mutations.
0230. Make department scope visible.
0231. Use HOD visual language.
0232. Keep global catalog controls with Admin or Root Admin.
0233. Support drill-down from metric to authorized records.
0234. Provide empty states when no department data exists.
0235. Provide error recovery.
0236. Provide loading skeletons.
0237. Test negative cross-department access.
0238. Audit department-sensitive mutations.
0239. Keep HOD operations separate from institutional administration.
0240. Use real database metrics.
0241. Do not hardcode department counts.

## 9. MANAGEMENT PORTAL
0242. Create an institutional Library Overview.
0243. Show catalog size.
0244. Show active members.
0245. Show active loans.
0246. Show overdue trend.
0247. Show reservations.
0248. Show digital usage.
0249. Show department comparisons.
0250. Show year and semester utilization.
0251. Show resource demand.
0252. Show high-demand resources.
0253. Show low-utilization resources.
0254. Show inventory health.
0255. Show operational alerts.
0256. Provide aggregate drill-down.
0257. Protect private patron details.
0258. Use privacy-preserving aggregation where appropriate.
0259. Provide report export where authorized.
0260. Do not provide destructive catalog operations by default.
0261. Do not allow policy changes without explicit permission.
0262. Use Management visual language.
0263. Use real analytics.
0264. Do not fake charts.
0265. Every chart must have a data source.
0266. Show date-range context.
0267. Show filter state.
0268. Show empty analytics state.
0269. Show analytics calculation errors clearly.
0270. Audit sensitive report exports.

## 10. ADMIN PORTAL
0271. Create an operational Library Administration portal.
0272. Provide catalog management.
0273. Provide physical inventory.
0274. Provide circulation desk.
0275. Provide check-out.
0276. Provide check-in.
0277. Provide renewals.
0278. Provide reservation queue.
0279. Provide members.
0280. Provide member detail.
0281. Provide fines.
0282. Provide digital resources.
0283. Provide course resources.
0284. Provide service points.
0285. Provide library policies.
0286. Provide loan policies.
0287. Provide reports.
0288. Provide audit.
0289. Provide bulk operations.
0290. Provide barcode workflows.
0291. Provide inventory reconciliation.
0292. Provide lost-item handling.
0293. Provide damaged-item handling.
0294. Provide withdrawn-item handling.
0295. Require confirmation for destructive bulk operations.
0296. Use dense but readable tables.
0297. Provide filters and pagination.
0298. Use Admin visual language.
0299. Keep authorization server-side.
0300. Audit sensitive operations.

## 11. ROOT ADMIN PORTAL
0301. Create a Root Admin Library Control Center.
0302. Show global library health.
0303. Show database health.
0304. Show object storage health.
0305. Show search health.
0306. Show RabbitMQ health.
0307. Show Redis health.
0308. Show Socket.IO health.
0309. Show event processing health.
0310. Show authorization anomalies.
0311. Show configuration versions.
0312. Show institutional statistics.
0313. Provide global policy configuration.
0314. Provide retention configuration.
0315. Provide service-point configuration oversight.
0316. Provide feature flags where the platform already supports them.
0317. Provide audit inspection.
0318. Provide recovery controls where supported.
0319. Require strong confirmation for irreversible changes.
0320. Show impact scope before global changes.
0321. Audit every configuration change.
0322. Never display secrets.
0323. Never expose credentials.
0324. Never bypass security controls.
0325. Use Root Admin visual language.
0326. Separate system controls from normal catalog operations.
0327. Provide health-state semantics.
0328. Provide degraded-state indicators.
0329. Provide operational logs only to authorized users.

## 12. VISUAL ARCHITECTURE
0330. Use CampusSphere branding.
0331. Use the four supplied reference images as visual anchors.
0332. Keep a shared design system across all roles.
0333. Use role-specific navigation.
0334. Use a consistent top header.
0335. Use consistent profile controls.
0336. Use consistent notifications.
0337. Use consistent global search where appropriate.
0338. Use a consistent sidebar pattern.
0339. Use responsive sidebar behavior.
0340. Use consistent card radius.
0341. Use consistent elevation.
0342. Use consistent spacing.
0343. Use consistent typography.
0344. Use consistent iconography.
0345. Use semantic status colors.
0346. Do not rely on color alone.
0347. Use accessible focus states.
0348. Use readable tables.
0349. Use compact but spacious enterprise layouts.
0350. Use breadcrumbs for deep library paths.
0351. Use contextual action bars.
0352. Use filter bars.
0353. Use drawers for quick edits.
0354. Use full pages for complex workflows.
0355. Use confirmation dialogs for destructive actions.
0356. Use skeleton loaders.
0357. Use empty-state illustrations only if consistent with the project.
0358. Use actionable error panels.
0359. Do not copy exact screenshot data.
0360. Do not introduce an unrelated visual theme.

## 13. DATA MODEL
0361. Reuse the existing User model.
0362. Reuse Department.
0363. Reuse Program.
0364. Reuse Batch.
0365. Reuse AcademicYear.
0366. Reuse YearOfStudy.
0367. Reuse Semester.
0368. Reuse Curriculum.
0369. Reuse MasterCourse.
0370. Reuse CourseOffering.
0371. Reuse FacultyAssignment.
0372. Reuse Enrollment.
0373. Define LibraryMember.
0374. Define LibraryBranch or LibraryLocation if required.
0375. Define ServicePoint.
0376. Define BibliographicRecord.
0377. Define BookEdition where needed.
0378. Define Author.
0379. Define Publisher.
0380. Define Subject.
0381. Define Classification.
0382. Define Identifier.
0383. Define PhysicalCopy.
0384. Define DigitalResource.
0385. Define LibraryDocument.
0386. Define DocumentVersion.
0387. Define Loan.
0388. Define Reservation.
0389. Define Fine.
0390. Define FineTransaction.
0391. Define LibraryPolicy.
0392. Define LoanPolicy.
0393. Define LibraryNotification.
0394. Define LibraryAudit.
0395. Define ReadingList if enabled.
0396. Define AcquisitionRequest only if acquisition scope is enabled.
0397. Define Vendor only if acquisition scope is enabled.
0398. Use stable IDs.
0399. Use timestamps.
0400. Use status enums.
0401. Use unique constraints.
0402. Use indexes based on query patterns.
0403. Use soft deletion where lifecycle requires it.
0404. Protect historical transaction integrity.

## 14. BIBLIOGRAPHIC CATALOG
0405. Track title.
0406. Track subtitle.
0407. Track authors.
0408. Track contributors.
0409. Track publisher.
0410. Track publication date.
0411. Track edition.
0412. Track language.
0413. Track ISBN-10.
0414. Track ISBN-13.
0415. Track subjects.
0416. Track classification.
0417. Track call number.
0418. Track description.
0419. Track format.
0420. Track catalog status.
0421. Track source.
0422. Track import provenance.
0423. Track cover metadata where legally appropriate.
0424. Separate bibliographic identity from physical copies.
0425. Support multiple editions.
0426. Support multiple physical copies.
0427. Support digital resources.
0428. Preserve historical transaction references.
0429. Do not hard-delete records needed by historical circulation.
0430. Support catalog review state.
0431. Support catalog quality alerts.
0432. Provide staff-only metadata where appropriate.
0433. Provide public/student-safe metadata.
0434. Use DTOs rather than raw database documents.
0435. Keep metadata extensible.

## 15. PHYSICAL INVENTORY
0436. Give every copy a unique barcode.
0437. Prevent duplicate barcodes.
0438. Track branch.
0439. Track service location.
0440. Track shelf.
0441. Track status.
0442. Track condition.
0443. Track acquisition date.
0444. Track acquisition source where available.
0445. Track purchase price where policy permits.
0446. Track vendor where applicable.
0447. Track last inventory verification.
0448. Track notes.
0449. Support AVAILABLE.
0450. Support ON_LOAN.
0451. Support RESERVED.
0452. Support LOST.
0453. Support DAMAGED.
0454. Support WITHDRAWN.
0455. Support IN_PROCESS.
0456. Support inventory reconciliation.
0457. Support barcode scanning.
0458. Support manual barcode entry.
0459. Support bulk inventory review.
0460. Audit copy status changes.
0461. Audit location changes.
0462. Preserve historical copy references.
0463. Do not delete copies with active or historical transactions.
0464. Provide inventory filters.
0465. Provide inventory pagination.
0466. Provide conflict handling.

## 16. CIRCULATION
0467. Implement real check-out.
0468. Validate authenticated patron.
0469. Validate membership.
0470. Validate membership status.
0471. Validate borrowing limit.
0472. Validate item availability.
0473. Validate item restrictions.
0474. Validate reservation state.
0475. Validate outstanding blocks.
0476. Calculate due date from policy.
0477. Create loan transaction.
0478. Update copy status.
0479. Record service point.
0480. Record staff actor.
0481. Generate domain event.
0482. Generate notification work where configured.
0483. Return deterministic API response.
0484. Make duplicate check-out requests safe.
0485. Prevent double-loan concurrency.
0486. Implement real check-in.
0487. Find active loan.
0488. Close loan.
0489. Update copy status.
0490. Resolve next reservation where applicable.
0491. Generate reservation-ready state.
0492. Calculate overdue state.
0493. Generate audit event.
0494. Implement renewal.
0495. Validate renewal count.
0496. Validate reservation conflict.
0497. Audit renewal.

## 17. RESERVATIONS
0498. Create real reservation records.
0499. Validate patron eligibility.
0500. Validate resource eligibility.
0501. Prevent duplicate active reservation where policy forbids it.
0502. Maintain queue order.
0503. Maintain deterministic priority.
0504. Support cancellation.
0505. Support expiration.
0506. Support pickup window.
0507. Support fulfillment.
0508. Support no-show expiry.
0509. Notify patron when ready.
0510. Notify next patron when reservation expires.
0511. Audit all reservation transitions.
0512. Hide private queue details from unauthorized users.
0513. Provide student reservation history.
0514. Provide staff reservation queue.
0515. Provide reservation filters.
0516. Provide reservation status chips.
0517. Provide reservation conflict errors.
0518. Provide real-time reservation updates.

## 18. FINES
0519. Model fines separately from user records.
0520. Track reason.
0521. Track source loan.
0522. Track assessed amount.
0523. Track paid amount.
0524. Track waived amount.
0525. Track outstanding amount.
0526. Track currency.
0527. Track status.
0528. Track createdBy.
0529. Track updatedBy.
0530. Track timestamps.
0531. Support overdue fines.
0532. Support lost-item charges where policy permits.
0533. Support damage charges where policy permits.
0534. Support manual adjustments only for authorized roles.
0535. Require adjustment reason.
0536. Audit every adjustment.
0537. Show students only their own fine information.
0538. Provide authorized staff fine management.
0539. Do not claim payment gateway integration unless actually connected.
0540. Use explicit payment state.
0541. Use explicit waiver state.
0542. Support fine history.
0543. Support filtering.
0544. Support pagination.
0545. Protect exports.
0546. Protect adjustments.
0547. Test negative authorization.
0548. Test calculation logic.

## 19. DIGITAL RESOURCES
0549. Use MinIO or the existing object-storage abstraction.
0550. Store metadata in MongoDB.
0551. Store object keys, not arbitrary local paths.
0552. Use authorized signed URLs.
0553. Expire signed URLs.
0554. Validate MIME type.
0555. Validate extension.
0556. Validate file size.
0557. Sanitize file names.
0558. Generate safe object keys.
0559. Use malware scanning when the infrastructure supports it.
0560. Record uploader.
0561. Record upload time.
0562. Record checksum.
0563. Record version.
0564. Record object size.
0565. Record visibility.
0566. Support PDF.
0567. Support PPT.
0568. Support PPTX.
0569. Support DOC.
0570. Support DOCX.
0571. Support XLS.
0572. Support XLSX.
0573. Support images.
0574. Support video links.
0575. Support external URLs.
0576. Support preview where safe.
0577. Support download where authorized.
0578. Support archive.
0579. Support restore.
0580. Support retention.
0581. Protect audit records from deletion.

## 20. DOCUMENT VERSIONING
0582. Every replace operation must create a new version.
0583. Do not overwrite a historical version destructively.
0584. Track version number.
0585. Track uploader.
0586. Track timestamp.
0587. Track checksum.
0588. Track size.
0589. Track storage object.
0590. Track change note.
0591. Track status.
0592. Allow authorized restore.
0593. Allow authorized archive.
0594. Keep active version explicit.
0595. Show version history.
0596. Audit version creation.
0597. Audit restore.
0598. Audit archive.
0599. Protect historical versions from unauthorized deletion.
0600. Apply retention policy.
0601. Support 90-day purge only where the existing platform policy requires it.
0602. Never purge protected audit/legal records.
0603. Do not expose storage credentials.
0604. Do not return private object URLs permanently.
0605. Verify version access with RBAC.
0606. Verify course scope.
0607. Verify department scope.
0608. Verify faculty assignment.
0609. Verify student enrollment.
0610. Test concurrent version creation.
0611. Handle checksum conflicts.
0612. Provide clear UI status.

## 21. COURSE RESOURCE MANAGEMENT
0613. Use CourseOffering as the delivery context.
0614. Use MasterCourse as reusable identity.
0615. Use FacultyAssignment as faculty authority.
0616. Use Enrollment as student authority.
0617. Provide course resource dashboard.
0618. Provide unit navigation.
0619. Provide Unit 1.
0620. Provide Unit 2.
0621. Provide Unit 3.
0622. Provide Unit 4.
0623. Provide Unit 5.
0624. Provide resource counts.
0625. Provide completeness indicators.
0626. Provide upload.
0627. Provide versioning.
0628. Provide archive.
0629. Provide restore.
0630. Provide metadata edit.
0631. Provide search.
0632. Provide resource filters.
0633. Provide type filters.
0634. Provide status filters.
0635. Provide faculty filters for authorized HOD/Admin views.
0636. Provide department filters for authorized views.
0637. Prevent unauthorized cross-course access.
0638. Prevent unauthorized cross-department access.
0639. Prevent faculty access to unassigned courses.
0640. Prevent student access to un-enrolled course resources.
0641. Audit course-resource mutations.
0642. Use real-time upload/version events.

## 22. SEARCH
0643. Implement catalog search.
0644. Implement title search.
0645. Implement author search.
0646. Implement ISBN search.
0647. Implement subject search.
0648. Implement course-code search.
0649. Implement course-title search.
0650. Implement department filtering.
0651. Implement year filtering.
0652. Implement semester filtering.
0653. Implement availability filtering.
0654. Implement physical/digital filtering.
0655. Implement format filtering.
0656. Implement language filtering where available.
0657. Implement publisher filtering where available.
0658. Implement classification filtering where available.
0659. Use server-side pagination.
0660. Use indexed queries.
0661. Debounce browser input.
0662. Use Meilisearch only when compatible with existing architecture.
0663. Apply authorization before returning results.
0664. Do not filter unauthorized results only in the browser.
0665. Do not index private patron records.
0666. Provide no-result guidance.
0667. Provide search suggestions only from authorized data.
0668. Preserve stable relevance.
0669. Support advanced search.
0670. Record search telemetry only where privacy policy permits.
0671. Do not retain sensitive searches unnecessarily.
0672. Test search authorization.

## 23. API DESIGN
0673. Define endpoints before UI wiring.
0674. Reuse existing API client.
0675. Use consistent error envelope.
0676. Validate path parameters.
0677. Validate query parameters.
0678. Validate body payloads.
0679. Validate pagination.
0680. Enforce maximum page size.
0681. Use 401 for unauthenticated access.
0682. Use 403 for authenticated but unauthorized access.
0683. Use 404 for missing resources.
0684. Use 409 for state conflicts.
0685. Use 422 for validation where project convention supports it.
0686. Use 429 for rate limiting.
0687. Never return stack traces.
0688. Never return database documents blindly.
0689. Use response DTOs.
0690. Include request IDs.
0691. Include correlation IDs.
0692. Use idempotency for sensitive repeatable operations where useful.
0693. Make circulation concurrency-safe.
0694. Make reservation creation conflict-safe.
0695. Make upload finalization idempotent.
0696. Document endpoint purpose.
0697. Document authorization.
0698. Document request shape.
0699. Document response shape.
0700. Document errors.
0701. Document real-time side effects.
0702. Map every UI action to a contract.

## 24. REAL-TIME ARCHITECTURE
0703. Use RabbitMQ for durable domain events.
0704. Use Socket.IO for client-facing live updates.
0705. Do not send RabbitMQ directly to browsers.
0706. Define versioned event names.
0707. Include event ID.
0708. Include timestamp.
0709. Include actor where appropriate.
0710. Include resource IDs.
0711. Include department scope where appropriate.
0712. Include academic scope where appropriate.
0713. Include correlation ID.
0714. Never include secrets.
0715. Emit LIBRARY_LOAN_CREATED.
0716. Emit LIBRARY_LOAN_RETURNED.
0717. Emit LIBRARY_LOAN_RENEWED.
0718. Emit LIBRARY_RESERVATION_CREATED.
0719. Emit LIBRARY_RESERVATION_READY.
0720. Emit LIBRARY_RESERVATION_CANCELLED.
0721. Emit LIBRARY_RESERVATION_EXPIRED.
0722. Emit LIBRARY_FINE_CREATED.
0723. Emit LIBRARY_FINE_UPDATED.
0724. Emit LIBRARY_DOCUMENT_UPLOADED.
0725. Emit LIBRARY_DOCUMENT_VERSION_CREATED.
0726. Emit LIBRARY_DOCUMENT_ARCHIVED.
0727. Emit LIBRARY_DOCUMENT_RESTORED.
0728. Emit LIBRARY_COPY_STATUS_CHANGED.
0729. Emit LIBRARY_CATALOG_UPDATED.
0730. Emit LIBRARY_NOTIFICATION_CREATED.
0731. Emit LIBRARY_POLICY_UPDATED.
0732. Authorize Socket.IO room membership server-side.
0733. Use user-specific rooms for private notifications.
0734. Use department rooms only for authorized users.
0735. Handle reconnect.
0736. Handle duplicate events.
0737. Invalidate relevant React Query data after events.
0738. Do not trust event payloads for authorization.

## 25. NOTIFICATIONS
0739. Create real notification records.
0740. Support in-app notifications.
0741. Support email only if existing mail infrastructure is configured.
0742. Do not fake email delivery.
0743. Notify due-soon.
0744. Notify overdue.
0745. Notify reservation ready.
0746. Notify reservation expiry.
0747. Notify document processing completion where appropriate.
0748. Notify administrative alerts.
0749. Notify system alerts.
0750. Support mark-read.
0751. Support unread count.
0752. Push authorized real-time notification events.
0753. Do not leak notifications between users.
0754. Audit administrative notification actions.
0755. Provide notification preferences only where the platform supports them.
0756. Keep notification templates centralized.
0757. Keep notification creation out of UI components.
0758. Test duplicate notification prevention.

## 26. AUDIT AND ACTIVITY
0759. Keep Audit and Activity separate.
0760. Audit critical security and business events.
0761. Activity is useful session/page activity, not a write every second.
0762. Audit catalog creation.
0763. Audit catalog edit.
0764. Audit copy creation.
0765. Audit copy status change.
0766. Audit checkout.
0767. Audit check-in.
0768. Audit renewal.
0769. Audit reservation transitions.
0770. Audit fine adjustment.
0771. Audit document upload.
0772. Audit document archive.
0773. Audit document restore.
0774. Audit policy change.
0775. Audit role-sensitive administration.
0776. Record actor user ID.
0777. Record actor role.
0778. Record action.
0779. Record resource type.
0780. Record resource ID.
0781. Record department scope.
0782. Record academic scope.
0783. Record timestamp.
0784. Record result.
0785. Record request ID.
0786. Record correlation ID.
0787. Record source IP where policy permits.
0788. Record user agent where appropriate.
0789. Record concise change summary.
0790. Never store passwords.
0791. Never store access tokens.
0792. Provide authorized audit search.
0793. Provide filters.

## 27. DATABASE ENGINEERING
0794. Use MongoDB/Mongoose conventions already present in the project.
0795. Create schemas with explicit validation.
0796. Create indexes based on real query patterns.
0797. Use compound indexes for common scope filters.
0798. Use unique indexes for barcodes.
0799. Use unique indexes for stable public identifiers where required.
0800. Use unique constraints for active reservation rules where possible.
0801. Use transactions where the deployment supports them and the operation requires atomicity.
0802. Use optimistic concurrency where appropriate.
0803. Use state checks before mutations.
0804. Do not load entire collections for simple counts.
0805. Use aggregation for analytics.
0806. Use projections for list APIs.
0807. Use pagination.
0808. Do not return huge result sets.
0809. Preserve historical references.
0810. Use soft deletion carefully.
0811. Do not use soft deletion as a substitute for authorization.
0812. Index department and course scopes.
0813. Index member and loan state.
0814. Index reservation status.
0815. Index barcode.
0816. Index ISBN.
0817. Index title search support fields.
0818. Index timestamps needed for reports.
0819. Measure slow queries.
0820. Document index rationale.
0821. Test seed idempotency.
0822. Test duplicate prevention.
0823. Test rollback or compensation for multi-step workflows.

## 28. SEED DATA
0824. Use the real CampusSphere database.
0825. Do not create a JSON-only library database.
0826. Do not hardcode library data into React.
0827. Create deterministic library seed scripts.
0828. Make seed scripts idempotent.
0829. Use existing departments.
0830. Use existing courses.
0831. Use existing CourseOfferings.
0832. Use existing FacultyAssignments.
0833. Use existing Enrollments.
0834. Create realistic bibliographic records.
0835. Create realistic authors.
0836. Create realistic publishers.
0837. Create realistic subjects.
0838. Create multiple editions.
0839. Create multiple copies.
0840. Create course resources.
0841. Create Unit 1 through Unit 5 resources.
0842. Create representative digital documents.
0843. Create representative loans.
0844. Create representative reservations.
0845. Create representative overdue records.
0846. Create representative fines.
0847. Create representative notifications.
0848. Create representative audit records through real operations where possible.
0849. Do not duplicate seed data on rerun.
0850. Validate counts after seeding.
0851. Document seed commands.
0852. Document reset commands.
0853. Document demo-only records.

## 29. ERROR AND STATE UX
0854. Every API page must have a loading state.
0855. Every API page must have an error state.
0856. Every collection must have an empty state.
0857. Every mutation must have pending state.
0858. Every destructive action must have confirmation.
0859. Every concurrency conflict must have a clear message.
0860. Never show raw stack traces.
0861. Never show internal URLs.
0862. Never show secrets.
0863. Provide retry.
0864. Provide support request ID when appropriate.
0865. Use consistent error components.
0866. Allow partial dashboard failures without breaking unrelated widgets.
0867. Do not fabricate fallback values.
0868. Show stale data state when correctness requires it.
0869. Show upload progress where supported.
0870. Show download errors.
0871. Show search errors.
0872. Show authorization errors.
0873. Show validation errors field-by-field.

## 30. SECURITY TESTING
0874. Test unauthenticated library access.
0875. Test Student-to-Admin escalation.
0876. Test Student-to-Faculty escalation.
0877. Test Student access to another student's loans.
0878. Test Student access to another student's fines.
0879. Test Student modification of catalog.
0880. Test Faculty access to unassigned CourseOffering.
0881. Test Faculty cross-department access.
0882. Test HOD cross-department access.
0883. Test Management destructive access.
0884. Test Admin Root Admin escalation.
0885. Test manipulated resource IDs.
0886. Test manipulated department IDs.
0887. Test manipulated course IDs.
0888. Test manipulated user IDs.
0889. Test unauthorized downloads.
0890. Test unauthorized uploads.
0891. Test unauthorized exports.
0892. Test unauthorized audit access.
0893. Test unauthorized Socket.IO room joins.
0894. Test unauthorized search results.
0895. Test signed URL expiration.
0896. Test token/session expiry.
0897. Test rate limits on sensitive endpoints.
0898. Test bulk-operation authorization.
0899. Test file validation.
0900. Test path traversal.
0901. Test unsafe object keys.
0902. Test injection-resistant queries.
0903. Test secret leakage in logs.

## 31. PERFORMANCE
0904. Measure catalog search latency.
0905. Measure detail latency.
0906. Measure checkout latency.
0907. Measure check-in latency.
0908. Measure reservation latency.
0909. Measure dashboard latency.
0910. Measure upload finalization.
0911. Measure indexing delay.
0912. Measure real-time notification delay.
0913. Measure database query latency.
0914. Measure slow queries.
0915. Test concurrent checkout.
0916. Test concurrent reservation creation.
0917. Test large catalog pagination.
0918. Test large loan tables.
0919. Test large audit tables.
0920. Use aggregation for analytics.
0921. Do not make one dashboard render hundreds of requests.
0922. Use React Query caching where appropriate.
0923. Invalidate cache from real-time events.
0924. Do not cache private data globally.
0925. Use Redis only where useful.
0926. Do not keep giant in-memory datasets in browser state.
0927. Use virtualized tables where required by realistic scale.
0928. Use object storage for binaries.
0929. Do not load full files into application memory unnecessarily.
0930. Record performance evidence.

## 32. LAN ARCHITECTURE
0931. Use the existing private-LAN server architecture.
0932. Browser must connect through the private server IP or configured hostname.
0933. Do not use localhost for acceptance testing.
0934. Frontend must bind appropriately for LAN access.
0935. Gateway must route library APIs.
0936. Gateway must route Socket.IO.
0937. Gateway must support document access through approved paths.
0938. CORS must allow the actual LAN origin.
0939. Cookies must use the correct LAN-safe configuration.
0940. Authentication must survive browser refresh over LAN.
0941. Socket.IO must reconnect over LAN.
0942. MinIO must not be directly exposed to clients unless the architecture explicitly requires it and secures it.
0943. MongoDB must remain internal.
0944. Redis must remain internal.
0945. RabbitMQ must remain internal.
0946. Service ports must not be exposed unnecessarily.
0947. Test from a second client on the LAN.
0948. Test simultaneous users.
0949. Test uploads from the second client.
0950. Test downloads from the second client.
0951. Test real-time notifications from the second client.
0952. Record exact LAN URL.
0953. Record firewall dependencies.
0954. Record gateway configuration.
0955. Document required environment variables.
0956. Do not hardcode the current private IP into source code.

## 33. UI ROUTE ARCHITECTURE
0957. Create a library route namespace.
0958. Use protected routes.
0959. Use role-aware guards.
0960. Prevent unauthorized content flash.
0961. Support deep links.
0962. Support browser refresh.
0963. Support not-found.
0964. Support forbidden.
0965. Support error boundaries.
0966. Create Library Dashboard.
0967. Create Catalog Search.
0968. Create Catalog Results.
0969. Create Bibliographic Detail.
0970. Create Physical Copy Detail.
0971. Create Digital Resource Detail.
0972. Create My Loans.
0973. Create My Reservations.
0974. Create My Fines.
0975. Create Course Library.
0976. Create Course Detail.
0977. Create Unit Detail.
0978. Create Resource Detail.
0979. Create Upload Resource.
0980. Create Version History.
0981. Create Department Library.
0982. Create Department Analytics.
0983. Create Institutional Analytics.
0984. Create Circulation Desk.
0985. Create Reservation Queue.
0986. Create Members.
0987. Create Member Detail.
0988. Create Fines.
0989. Create Inventory.
0990. Create Catalog Management.
0991. Create Digital Resources.
0992. Create Service Points.
0993. Create Policies.
0994. Create Reports.
0995. Create Audit.
0996. Create Notifications.
0997. Create Library Settings.
0998. Create System Health.

## 34. SHARED UI COMPONENTS
0999. Create LibraryPageShell.
1000. Create LibrarySidebar.
1001. Create LibraryHeader.
1002. Create LibraryBreadcrumbs.
1003. Create LibrarySearchBar.
1004. Create LibraryFilterBar.
1005. Create LibraryDataTable.
1006. Create LibraryStatusChip.
1007. Create LibraryMetricCard.
1008. Create LibraryEmptyState.
1009. Create LibraryErrorState.
1010. Create LibraryLoadingSkeleton.
1011. Create LibraryConfirmDialog.
1012. Create LibraryDrawer.
1013. Create LibraryDetailPanel.
1014. Create LibraryPagination.
1015. Create LibraryBulkActionBar.
1016. Create LibraryFileUploader.
1017. Create LibraryVersionTimeline.
1018. Create LibraryAvailabilityBadge.
1019. Create LibraryPermissionGate.
1020. Create LibraryScopeBadge.
1021. Create LibraryActivityFeed.
1022. Create LibraryNotificationBell.
1023. Create LibraryCommandActions.
1024. Reuse project components when equivalents already exist.
1025. Do not duplicate design-system primitives.
1026. Keep components accessible.
1027. Keep components testable.
1028. Keep components free of domain authorization assumptions that belong to the backend.

## 35. BROWSER ACCEPTANCE
1029. Login as Student.
1030. Open Library.
1031. Search a real title.
1032. Open details.
1033. View availability.
1034. Create reservation when eligible.
1035. Verify reservation appears.
1036. Verify notification if configured.
1037. Open My Loans.
1038. Open My Fines.
1039. Open a permitted digital resource.
1040. Attempt unauthorized resource access.
1041. Verify denial.
1042. Login as Faculty.
1043. Open assigned course.
1044. Open Unit 1.
1045. Upload a document.
1046. Verify metadata.
1047. Upload a second version.
1048. Verify version history.
1049. Attempt unassigned course access.
1050. Verify denial.
1051. Login as HOD.
1052. Open department library.
1053. Filter year.
1054. Filter semester.
1055. Review faculty contribution.
1056. Attempt another department.
1057. Verify denial.
1058. Login as Management.
1059. Open analytics.
1060. Verify real metrics.
1061. Verify private patron details are protected.
1062. Login as Admin.
1063. Open circulation desk.
1064. Check out a copy.
1065. Verify loan.
1066. Check in copy.
1067. Verify copy state.
1068. Open inventory.
1069. Open reservations.
1070. Open fines.
1071. Login as Root Admin.
1072. Open system health.
1073. Open audit.
1074. Verify configuration audit.

## 36. ARTIFACTS
1075. Create docs/library/README.md.
1076. Create docs/library/ARCHITECTURE.md.
1077. Create docs/library/DATA_MODEL.md.
1078. Create docs/library/RBAC_MATRIX.md.
1079. Create docs/library/API_MATRIX.md.
1080. Create docs/library/ROUTE_MATRIX.md.
1081. Create docs/library/UI_ARCHITECTURE.md.
1082. Create docs/library/REALTIME_EVENTS.md.
1083. Create docs/library/STORAGE_ARCHITECTURE.md.
1084. Create docs/library/SEARCH_ARCHITECTURE.md.
1085. Create docs/library/AUDIT_MODEL.md.
1086. Create docs/library/TEST_PLAN.md.
1087. Create docs/library/LAN_VERIFICATION.md.
1088. Create docs/library/SEED_DATA.md.
1089. Create docs/library/OPERATIONS.md.
1090. Create docs/library/KNOWN_LIMITATIONS.md.
1091. Create docs/library/IMPLEMENTATION_STATUS.md.
1092. Create docs/library/ACCEPTANCE_REPORT.md.
1093. Keep artifacts synchronized with code.
1094. Never document functionality that is not implemented.
1095. Include exact test evidence.
1096. Include exact failed tests.
1097. Include screenshots or browser artifacts.
1098. Include database validation evidence.
1099. Include API validation evidence.
1100. Include authorization evidence.
1101. Include real-time evidence.
1102. Include LAN evidence.
1103. Include known limitations.
1104. Include next steps only when necessary.

## 37. FINAL DEFINITION OF DONE
1105. All required library routes exist.
1106. All required role portals exist.
1107. All portal data comes from real backend APIs.
1108. All portal data comes from the shared database.
1109. Backend authorization is enforced.
1110. Student privacy is enforced.
1111. Faculty assignment scope is enforced.
1112. HOD department scope is enforced.
1113. Management oversight scope is enforced.
1114. Admin operational scope is enforced.
1115. Root Admin system scope is enforced.
1116. Catalog is real.
1117. Inventory is real.
1118. Circulation is real.
1119. Reservations are real.
1120. Fines are real.
1121. Digital resources are real.
1122. Document versioning is real.
1123. Search is real.
1124. Notifications are real.
1125. Audit is real.
1126. RabbitMQ events are real where required.
1127. Socket.IO updates are real where required.
1128. Seed scripts are idempotent.
1129. Database indexes exist.
1130. Browser tests pass.
1131. LAN tests pass.
1132. Security tests pass.
1133. Concurrency tests pass.
1134. Documentation exists.
1135. Evidence exists.
1136. Known limitations are documented.
1137. Do not declare PASS until all mandatory acceptance gates pass.

## PAGE CONTRACT — Library Dashboard
1138. Define the business purpose of Library Dashboard.
1139. Define the primary roles allowed to open Library Dashboard.
1140. Define the exact route for Library Dashboard.
1141. Define the API calls used by Library Dashboard.
1142. Define the database entities used by Library Dashboard.
1143. Define the authorization checks for Library Dashboard.
1144. Define the academic scope rules for Library Dashboard.
1145. Define the department scope rules for Library Dashboard.
1146. Define the ownership rules for Library Dashboard.
1147. Define the primary action for Library Dashboard.
1148. Define the secondary actions for Library Dashboard.
1149. Define destructive actions for Library Dashboard.
1150. Define confirmation behavior for Library Dashboard.
1151. Define loading behavior for Library Dashboard.
1152. Define empty-state behavior for Library Dashboard.
1153. Define error behavior for Library Dashboard.
1154. Define retry behavior for Library Dashboard.
1155. Define pagination behavior for Library Dashboard.
1156. Define filtering behavior for Library Dashboard.
1157. Define sorting behavior for Library Dashboard.
1158. Define real-time events affecting Library Dashboard.
1159. Define audit events generated by Library Dashboard.
1160. Define responsive behavior for Library Dashboard.
1161. Define accessibility requirements for Library Dashboard.
1162. Define browser acceptance tests for Library Dashboard.

## PAGE CONTRACT — Catalog Search
1163. Define the business purpose of Catalog Search.
1164. Define the primary roles allowed to open Catalog Search.
1165. Define the exact route for Catalog Search.
1166. Define the API calls used by Catalog Search.
1167. Define the database entities used by Catalog Search.
1168. Define the authorization checks for Catalog Search.
1169. Define the academic scope rules for Catalog Search.
1170. Define the department scope rules for Catalog Search.
1171. Define the ownership rules for Catalog Search.
1172. Define the primary action for Catalog Search.
1173. Define the secondary actions for Catalog Search.
1174. Define destructive actions for Catalog Search.
1175. Define confirmation behavior for Catalog Search.
1176. Define loading behavior for Catalog Search.
1177. Define empty-state behavior for Catalog Search.
1178. Define error behavior for Catalog Search.
1179. Define retry behavior for Catalog Search.
1180. Define pagination behavior for Catalog Search.
1181. Define filtering behavior for Catalog Search.
1182. Define sorting behavior for Catalog Search.
1183. Define real-time events affecting Catalog Search.
1184. Define audit events generated by Catalog Search.
1185. Define responsive behavior for Catalog Search.
1186. Define accessibility requirements for Catalog Search.
1187. Define browser acceptance tests for Catalog Search.

## PAGE CONTRACT — Catalog Results
1188. Define the business purpose of Catalog Results.
1189. Define the primary roles allowed to open Catalog Results.
1190. Define the exact route for Catalog Results.
1191. Define the API calls used by Catalog Results.
1192. Define the database entities used by Catalog Results.
1193. Define the authorization checks for Catalog Results.
1194. Define the academic scope rules for Catalog Results.
1195. Define the department scope rules for Catalog Results.
1196. Define the ownership rules for Catalog Results.
1197. Define the primary action for Catalog Results.
1198. Define the secondary actions for Catalog Results.
1199. Define destructive actions for Catalog Results.
1200. Define confirmation behavior for Catalog Results.
1201. Define loading behavior for Catalog Results.
1202. Define empty-state behavior for Catalog Results.
1203. Define error behavior for Catalog Results.
1204. Define retry behavior for Catalog Results.
1205. Define pagination behavior for Catalog Results.
1206. Define filtering behavior for Catalog Results.
1207. Define sorting behavior for Catalog Results.
1208. Define real-time events affecting Catalog Results.
1209. Define audit events generated by Catalog Results.
1210. Define responsive behavior for Catalog Results.
1211. Define accessibility requirements for Catalog Results.
1212. Define browser acceptance tests for Catalog Results.

## PAGE CONTRACT — Bibliographic Detail
1213. Define the business purpose of Bibliographic Detail.
1214. Define the primary roles allowed to open Bibliographic Detail.
1215. Define the exact route for Bibliographic Detail.
1216. Define the API calls used by Bibliographic Detail.
1217. Define the database entities used by Bibliographic Detail.
1218. Define the authorization checks for Bibliographic Detail.
1219. Define the academic scope rules for Bibliographic Detail.
1220. Define the department scope rules for Bibliographic Detail.
1221. Define the ownership rules for Bibliographic Detail.
1222. Define the primary action for Bibliographic Detail.
1223. Define the secondary actions for Bibliographic Detail.
1224. Define destructive actions for Bibliographic Detail.
1225. Define confirmation behavior for Bibliographic Detail.
1226. Define loading behavior for Bibliographic Detail.
1227. Define empty-state behavior for Bibliographic Detail.
1228. Define error behavior for Bibliographic Detail.
1229. Define retry behavior for Bibliographic Detail.
1230. Define pagination behavior for Bibliographic Detail.
1231. Define filtering behavior for Bibliographic Detail.
1232. Define sorting behavior for Bibliographic Detail.
1233. Define real-time events affecting Bibliographic Detail.
1234. Define audit events generated by Bibliographic Detail.
1235. Define responsive behavior for Bibliographic Detail.
1236. Define accessibility requirements for Bibliographic Detail.
1237. Define browser acceptance tests for Bibliographic Detail.

## PAGE CONTRACT — Edition Detail
1238. Define the business purpose of Edition Detail.
1239. Define the primary roles allowed to open Edition Detail.
1240. Define the exact route for Edition Detail.
1241. Define the API calls used by Edition Detail.
1242. Define the database entities used by Edition Detail.
1243. Define the authorization checks for Edition Detail.
1244. Define the academic scope rules for Edition Detail.
1245. Define the department scope rules for Edition Detail.
1246. Define the ownership rules for Edition Detail.
1247. Define the primary action for Edition Detail.
1248. Define the secondary actions for Edition Detail.
1249. Define destructive actions for Edition Detail.
1250. Define confirmation behavior for Edition Detail.
1251. Define loading behavior for Edition Detail.
1252. Define empty-state behavior for Edition Detail.
1253. Define error behavior for Edition Detail.
1254. Define retry behavior for Edition Detail.
1255. Define pagination behavior for Edition Detail.
1256. Define filtering behavior for Edition Detail.
1257. Define sorting behavior for Edition Detail.
1258. Define real-time events affecting Edition Detail.
1259. Define audit events generated by Edition Detail.
1260. Define responsive behavior for Edition Detail.
1261. Define accessibility requirements for Edition Detail.
1262. Define browser acceptance tests for Edition Detail.

## PAGE CONTRACT — Physical Copy Detail
1263. Define the business purpose of Physical Copy Detail.
1264. Define the primary roles allowed to open Physical Copy Detail.
1265. Define the exact route for Physical Copy Detail.
1266. Define the API calls used by Physical Copy Detail.
1267. Define the database entities used by Physical Copy Detail.
1268. Define the authorization checks for Physical Copy Detail.
1269. Define the academic scope rules for Physical Copy Detail.
1270. Define the department scope rules for Physical Copy Detail.
1271. Define the ownership rules for Physical Copy Detail.
1272. Define the primary action for Physical Copy Detail.
1273. Define the secondary actions for Physical Copy Detail.
1274. Define destructive actions for Physical Copy Detail.
1275. Define confirmation behavior for Physical Copy Detail.
1276. Define loading behavior for Physical Copy Detail.
1277. Define empty-state behavior for Physical Copy Detail.
1278. Define error behavior for Physical Copy Detail.
1279. Define retry behavior for Physical Copy Detail.
1280. Define pagination behavior for Physical Copy Detail.
1281. Define filtering behavior for Physical Copy Detail.
1282. Define sorting behavior for Physical Copy Detail.
1283. Define real-time events affecting Physical Copy Detail.
1284. Define audit events generated by Physical Copy Detail.
1285. Define responsive behavior for Physical Copy Detail.
1286. Define accessibility requirements for Physical Copy Detail.
1287. Define browser acceptance tests for Physical Copy Detail.

## PAGE CONTRACT — Digital Resource Detail
1288. Define the business purpose of Digital Resource Detail.
1289. Define the primary roles allowed to open Digital Resource Detail.
1290. Define the exact route for Digital Resource Detail.
1291. Define the API calls used by Digital Resource Detail.
1292. Define the database entities used by Digital Resource Detail.
1293. Define the authorization checks for Digital Resource Detail.
1294. Define the academic scope rules for Digital Resource Detail.
1295. Define the department scope rules for Digital Resource Detail.
1296. Define the ownership rules for Digital Resource Detail.
1297. Define the primary action for Digital Resource Detail.
1298. Define the secondary actions for Digital Resource Detail.
1299. Define destructive actions for Digital Resource Detail.
1300. Define confirmation behavior for Digital Resource Detail.
1301. Define loading behavior for Digital Resource Detail.
1302. Define empty-state behavior for Digital Resource Detail.
1303. Define error behavior for Digital Resource Detail.
1304. Define retry behavior for Digital Resource Detail.
1305. Define pagination behavior for Digital Resource Detail.
1306. Define filtering behavior for Digital Resource Detail.
1307. Define sorting behavior for Digital Resource Detail.
1308. Define real-time events affecting Digital Resource Detail.
1309. Define audit events generated by Digital Resource Detail.
1310. Define responsive behavior for Digital Resource Detail.
1311. Define accessibility requirements for Digital Resource Detail.
1312. Define browser acceptance tests for Digital Resource Detail.

## PAGE CONTRACT — My Loans
1313. Define the business purpose of My Loans.
1314. Define the primary roles allowed to open My Loans.
1315. Define the exact route for My Loans.
1316. Define the API calls used by My Loans.
1317. Define the database entities used by My Loans.
1318. Define the authorization checks for My Loans.
1319. Define the academic scope rules for My Loans.
1320. Define the department scope rules for My Loans.
1321. Define the ownership rules for My Loans.
1322. Define the primary action for My Loans.
1323. Define the secondary actions for My Loans.
1324. Define destructive actions for My Loans.
1325. Define confirmation behavior for My Loans.
1326. Define loading behavior for My Loans.
1327. Define empty-state behavior for My Loans.
1328. Define error behavior for My Loans.
1329. Define retry behavior for My Loans.
1330. Define pagination behavior for My Loans.
1331. Define filtering behavior for My Loans.
1332. Define sorting behavior for My Loans.
1333. Define real-time events affecting My Loans.
1334. Define audit events generated by My Loans.
1335. Define responsive behavior for My Loans.
1336. Define accessibility requirements for My Loans.
1337. Define browser acceptance tests for My Loans.

## PAGE CONTRACT — My Reservations
1338. Define the business purpose of My Reservations.
1339. Define the primary roles allowed to open My Reservations.
1340. Define the exact route for My Reservations.
1341. Define the API calls used by My Reservations.
1342. Define the database entities used by My Reservations.
1343. Define the authorization checks for My Reservations.
1344. Define the academic scope rules for My Reservations.
1345. Define the department scope rules for My Reservations.
1346. Define the ownership rules for My Reservations.
1347. Define the primary action for My Reservations.
1348. Define the secondary actions for My Reservations.
1349. Define destructive actions for My Reservations.
1350. Define confirmation behavior for My Reservations.
1351. Define loading behavior for My Reservations.
1352. Define empty-state behavior for My Reservations.
1353. Define error behavior for My Reservations.
1354. Define retry behavior for My Reservations.
1355. Define pagination behavior for My Reservations.
1356. Define filtering behavior for My Reservations.
1357. Define sorting behavior for My Reservations.
1358. Define real-time events affecting My Reservations.
1359. Define audit events generated by My Reservations.
1360. Define responsive behavior for My Reservations.
1361. Define accessibility requirements for My Reservations.
1362. Define browser acceptance tests for My Reservations.

## PAGE CONTRACT — My Fines
1363. Define the business purpose of My Fines.
1364. Define the primary roles allowed to open My Fines.
1365. Define the exact route for My Fines.
1366. Define the API calls used by My Fines.
1367. Define the database entities used by My Fines.
1368. Define the authorization checks for My Fines.
1369. Define the academic scope rules for My Fines.
1370. Define the department scope rules for My Fines.
1371. Define the ownership rules for My Fines.
1372. Define the primary action for My Fines.
1373. Define the secondary actions for My Fines.
1374. Define destructive actions for My Fines.
1375. Define confirmation behavior for My Fines.
1376. Define loading behavior for My Fines.
1377. Define empty-state behavior for My Fines.
1378. Define error behavior for My Fines.
1379. Define retry behavior for My Fines.
1380. Define pagination behavior for My Fines.
1381. Define filtering behavior for My Fines.
1382. Define sorting behavior for My Fines.
1383. Define real-time events affecting My Fines.
1384. Define audit events generated by My Fines.
1385. Define responsive behavior for My Fines.
1386. Define accessibility requirements for My Fines.
1387. Define browser acceptance tests for My Fines.

## PAGE CONTRACT — Course Library
1388. Define the business purpose of Course Library.
1389. Define the primary roles allowed to open Course Library.
1390. Define the exact route for Course Library.
1391. Define the API calls used by Course Library.
1392. Define the database entities used by Course Library.
1393. Define the authorization checks for Course Library.
1394. Define the academic scope rules for Course Library.
1395. Define the department scope rules for Course Library.
1396. Define the ownership rules for Course Library.
1397. Define the primary action for Course Library.
1398. Define the secondary actions for Course Library.
1399. Define destructive actions for Course Library.
1400. Define confirmation behavior for Course Library.
1401. Define loading behavior for Course Library.
1402. Define empty-state behavior for Course Library.
1403. Define error behavior for Course Library.
1404. Define retry behavior for Course Library.
1405. Define pagination behavior for Course Library.
1406. Define filtering behavior for Course Library.
1407. Define sorting behavior for Course Library.
1408. Define real-time events affecting Course Library.
1409. Define audit events generated by Course Library.
1410. Define responsive behavior for Course Library.
1411. Define accessibility requirements for Course Library.
1412. Define browser acceptance tests for Course Library.

## PAGE CONTRACT — Course Detail
1413. Define the business purpose of Course Detail.
1414. Define the primary roles allowed to open Course Detail.
1415. Define the exact route for Course Detail.
1416. Define the API calls used by Course Detail.
1417. Define the database entities used by Course Detail.
1418. Define the authorization checks for Course Detail.
1419. Define the academic scope rules for Course Detail.
1420. Define the department scope rules for Course Detail.
1421. Define the ownership rules for Course Detail.
1422. Define the primary action for Course Detail.
1423. Define the secondary actions for Course Detail.
1424. Define destructive actions for Course Detail.
1425. Define confirmation behavior for Course Detail.
1426. Define loading behavior for Course Detail.
1427. Define empty-state behavior for Course Detail.
1428. Define error behavior for Course Detail.
1429. Define retry behavior for Course Detail.
1430. Define pagination behavior for Course Detail.
1431. Define filtering behavior for Course Detail.
1432. Define sorting behavior for Course Detail.
1433. Define real-time events affecting Course Detail.
1434. Define audit events generated by Course Detail.
1435. Define responsive behavior for Course Detail.
1436. Define accessibility requirements for Course Detail.
1437. Define browser acceptance tests for Course Detail.

## PAGE CONTRACT — Unit Detail
1438. Define the business purpose of Unit Detail.
1439. Define the primary roles allowed to open Unit Detail.
1440. Define the exact route for Unit Detail.
1441. Define the API calls used by Unit Detail.
1442. Define the database entities used by Unit Detail.
1443. Define the authorization checks for Unit Detail.
1444. Define the academic scope rules for Unit Detail.
1445. Define the department scope rules for Unit Detail.
1446. Define the ownership rules for Unit Detail.
1447. Define the primary action for Unit Detail.
1448. Define the secondary actions for Unit Detail.
1449. Define destructive actions for Unit Detail.
1450. Define confirmation behavior for Unit Detail.
1451. Define loading behavior for Unit Detail.
1452. Define empty-state behavior for Unit Detail.
1453. Define error behavior for Unit Detail.
1454. Define retry behavior for Unit Detail.
1455. Define pagination behavior for Unit Detail.
1456. Define filtering behavior for Unit Detail.
1457. Define sorting behavior for Unit Detail.
1458. Define real-time events affecting Unit Detail.
1459. Define audit events generated by Unit Detail.
1460. Define responsive behavior for Unit Detail.
1461. Define accessibility requirements for Unit Detail.
1462. Define browser acceptance tests for Unit Detail.

## PAGE CONTRACT — Resource Detail
1463. Define the business purpose of Resource Detail.
1464. Define the primary roles allowed to open Resource Detail.
1465. Define the exact route for Resource Detail.
1466. Define the API calls used by Resource Detail.
1467. Define the database entities used by Resource Detail.
1468. Define the authorization checks for Resource Detail.
1469. Define the academic scope rules for Resource Detail.
1470. Define the department scope rules for Resource Detail.
1471. Define the ownership rules for Resource Detail.
1472. Define the primary action for Resource Detail.
1473. Define the secondary actions for Resource Detail.
1474. Define destructive actions for Resource Detail.
1475. Define confirmation behavior for Resource Detail.
1476. Define loading behavior for Resource Detail.
1477. Define empty-state behavior for Resource Detail.
1478. Define error behavior for Resource Detail.
1479. Define retry behavior for Resource Detail.
1480. Define pagination behavior for Resource Detail.
1481. Define filtering behavior for Resource Detail.
1482. Define sorting behavior for Resource Detail.
1483. Define real-time events affecting Resource Detail.
1484. Define audit events generated by Resource Detail.
1485. Define responsive behavior for Resource Detail.
1486. Define accessibility requirements for Resource Detail.
1487. Define browser acceptance tests for Resource Detail.

## PAGE CONTRACT — Upload Resource
1488. Define the business purpose of Upload Resource.
1489. Define the primary roles allowed to open Upload Resource.
1490. Define the exact route for Upload Resource.
1491. Define the API calls used by Upload Resource.
1492. Define the database entities used by Upload Resource.
1493. Define the authorization checks for Upload Resource.
1494. Define the academic scope rules for Upload Resource.
1495. Define the department scope rules for Upload Resource.
1496. Define the ownership rules for Upload Resource.
1497. Define the primary action for Upload Resource.
1498. Define the secondary actions for Upload Resource.
1499. Define destructive actions for Upload Resource.
1500. Define confirmation behavior for Upload Resource.
1501. Define loading behavior for Upload Resource.
1502. Define empty-state behavior for Upload Resource.
1503. Define error behavior for Upload Resource.
1504. Define retry behavior for Upload Resource.
1505. Define pagination behavior for Upload Resource.
1506. Define filtering behavior for Upload Resource.
1507. Define sorting behavior for Upload Resource.
1508. Define real-time events affecting Upload Resource.
1509. Define audit events generated by Upload Resource.
1510. Define responsive behavior for Upload Resource.
1511. Define accessibility requirements for Upload Resource.
1512. Define browser acceptance tests for Upload Resource.

## PAGE CONTRACT — Version History
1513. Define the business purpose of Version History.
1514. Define the primary roles allowed to open Version History.
1515. Define the exact route for Version History.
1516. Define the API calls used by Version History.
1517. Define the database entities used by Version History.
1518. Define the authorization checks for Version History.
1519. Define the academic scope rules for Version History.
1520. Define the department scope rules for Version History.
1521. Define the ownership rules for Version History.
1522. Define the primary action for Version History.
1523. Define the secondary actions for Version History.
1524. Define destructive actions for Version History.
1525. Define confirmation behavior for Version History.
1526. Define loading behavior for Version History.
1527. Define empty-state behavior for Version History.
1528. Define error behavior for Version History.
1529. Define retry behavior for Version History.
1530. Define pagination behavior for Version History.
1531. Define filtering behavior for Version History.
1532. Define sorting behavior for Version History.
1533. Define real-time events affecting Version History.
1534. Define audit events generated by Version History.
1535. Define responsive behavior for Version History.
1536. Define accessibility requirements for Version History.
1537. Define browser acceptance tests for Version History.

## PAGE CONTRACT — Department Library
1538. Define the business purpose of Department Library.
1539. Define the primary roles allowed to open Department Library.
1540. Define the exact route for Department Library.
1541. Define the API calls used by Department Library.
1542. Define the database entities used by Department Library.
1543. Define the authorization checks for Department Library.
1544. Define the academic scope rules for Department Library.
1545. Define the department scope rules for Department Library.
1546. Define the ownership rules for Department Library.
1547. Define the primary action for Department Library.
1548. Define the secondary actions for Department Library.
1549. Define destructive actions for Department Library.
1550. Define confirmation behavior for Department Library.
1551. Define loading behavior for Department Library.
1552. Define empty-state behavior for Department Library.
1553. Define error behavior for Department Library.
1554. Define retry behavior for Department Library.
1555. Define pagination behavior for Department Library.
1556. Define filtering behavior for Department Library.
1557. Define sorting behavior for Department Library.
1558. Define real-time events affecting Department Library.
1559. Define audit events generated by Department Library.
1560. Define responsive behavior for Department Library.
1561. Define accessibility requirements for Department Library.
1562. Define browser acceptance tests for Department Library.

## PAGE CONTRACT — Department Analytics
1563. Define the business purpose of Department Analytics.
1564. Define the primary roles allowed to open Department Analytics.
1565. Define the exact route for Department Analytics.
1566. Define the API calls used by Department Analytics.
1567. Define the database entities used by Department Analytics.
1568. Define the authorization checks for Department Analytics.
1569. Define the academic scope rules for Department Analytics.
1570. Define the department scope rules for Department Analytics.
1571. Define the ownership rules for Department Analytics.
1572. Define the primary action for Department Analytics.
1573. Define the secondary actions for Department Analytics.
1574. Define destructive actions for Department Analytics.
1575. Define confirmation behavior for Department Analytics.
1576. Define loading behavior for Department Analytics.
1577. Define empty-state behavior for Department Analytics.
1578. Define error behavior for Department Analytics.
1579. Define retry behavior for Department Analytics.
1580. Define pagination behavior for Department Analytics.
1581. Define filtering behavior for Department Analytics.
1582. Define sorting behavior for Department Analytics.
1583. Define real-time events affecting Department Analytics.
1584. Define audit events generated by Department Analytics.
1585. Define responsive behavior for Department Analytics.
1586. Define accessibility requirements for Department Analytics.
1587. Define browser acceptance tests for Department Analytics.

## PAGE CONTRACT — Institutional Analytics
1588. Define the business purpose of Institutional Analytics.
1589. Define the primary roles allowed to open Institutional Analytics.
1590. Define the exact route for Institutional Analytics.
1591. Define the API calls used by Institutional Analytics.
1592. Define the database entities used by Institutional Analytics.
1593. Define the authorization checks for Institutional Analytics.
1594. Define the academic scope rules for Institutional Analytics.
1595. Define the department scope rules for Institutional Analytics.
1596. Define the ownership rules for Institutional Analytics.
1597. Define the primary action for Institutional Analytics.
1598. Define the secondary actions for Institutional Analytics.
1599. Define destructive actions for Institutional Analytics.
1600. Define confirmation behavior for Institutional Analytics.
1601. Define loading behavior for Institutional Analytics.
1602. Define empty-state behavior for Institutional Analytics.
1603. Define error behavior for Institutional Analytics.
1604. Define retry behavior for Institutional Analytics.
1605. Define pagination behavior for Institutional Analytics.
1606. Define filtering behavior for Institutional Analytics.
1607. Define sorting behavior for Institutional Analytics.
1608. Define real-time events affecting Institutional Analytics.
1609. Define audit events generated by Institutional Analytics.
1610. Define responsive behavior for Institutional Analytics.
1611. Define accessibility requirements for Institutional Analytics.
1612. Define browser acceptance tests for Institutional Analytics.

## PAGE CONTRACT — Circulation Desk
1613. Define the business purpose of Circulation Desk.
1614. Define the primary roles allowed to open Circulation Desk.
1615. Define the exact route for Circulation Desk.
1616. Define the API calls used by Circulation Desk.
1617. Define the database entities used by Circulation Desk.
1618. Define the authorization checks for Circulation Desk.
1619. Define the academic scope rules for Circulation Desk.
1620. Define the department scope rules for Circulation Desk.
1621. Define the ownership rules for Circulation Desk.
1622. Define the primary action for Circulation Desk.
1623. Define the secondary actions for Circulation Desk.
1624. Define destructive actions for Circulation Desk.
1625. Define confirmation behavior for Circulation Desk.
1626. Define loading behavior for Circulation Desk.
1627. Define empty-state behavior for Circulation Desk.
1628. Define error behavior for Circulation Desk.
1629. Define retry behavior for Circulation Desk.
1630. Define pagination behavior for Circulation Desk.
1631. Define filtering behavior for Circulation Desk.
1632. Define sorting behavior for Circulation Desk.
1633. Define real-time events affecting Circulation Desk.
1634. Define audit events generated by Circulation Desk.
1635. Define responsive behavior for Circulation Desk.
1636. Define accessibility requirements for Circulation Desk.
1637. Define browser acceptance tests for Circulation Desk.

## PAGE CONTRACT — Checkout
1638. Define the business purpose of Checkout.
1639. Define the primary roles allowed to open Checkout.
1640. Define the exact route for Checkout.
1641. Define the API calls used by Checkout.
1642. Define the database entities used by Checkout.
1643. Define the authorization checks for Checkout.
1644. Define the academic scope rules for Checkout.
1645. Define the department scope rules for Checkout.
1646. Define the ownership rules for Checkout.
1647. Define the primary action for Checkout.
1648. Define the secondary actions for Checkout.
1649. Define destructive actions for Checkout.
1650. Define confirmation behavior for Checkout.
1651. Define loading behavior for Checkout.
1652. Define empty-state behavior for Checkout.
1653. Define error behavior for Checkout.
1654. Define retry behavior for Checkout.
1655. Define pagination behavior for Checkout.
1656. Define filtering behavior for Checkout.
1657. Define sorting behavior for Checkout.
1658. Define real-time events affecting Checkout.
1659. Define audit events generated by Checkout.
1660. Define responsive behavior for Checkout.
1661. Define accessibility requirements for Checkout.
1662. Define browser acceptance tests for Checkout.

## PAGE CONTRACT — Checkin
1663. Define the business purpose of Checkin.
1664. Define the primary roles allowed to open Checkin.
1665. Define the exact route for Checkin.
1666. Define the API calls used by Checkin.
1667. Define the database entities used by Checkin.
1668. Define the authorization checks for Checkin.
1669. Define the academic scope rules for Checkin.
1670. Define the department scope rules for Checkin.
1671. Define the ownership rules for Checkin.
1672. Define the primary action for Checkin.
1673. Define the secondary actions for Checkin.
1674. Define destructive actions for Checkin.
1675. Define confirmation behavior for Checkin.
1676. Define loading behavior for Checkin.
1677. Define empty-state behavior for Checkin.
1678. Define error behavior for Checkin.
1679. Define retry behavior for Checkin.
1680. Define pagination behavior for Checkin.
1681. Define filtering behavior for Checkin.
1682. Define sorting behavior for Checkin.
1683. Define real-time events affecting Checkin.
1684. Define audit events generated by Checkin.
1685. Define responsive behavior for Checkin.
1686. Define accessibility requirements for Checkin.
1687. Define browser acceptance tests for Checkin.

## PAGE CONTRACT — Renewals
1688. Define the business purpose of Renewals.
1689. Define the primary roles allowed to open Renewals.
1690. Define the exact route for Renewals.
1691. Define the API calls used by Renewals.
1692. Define the database entities used by Renewals.
1693. Define the authorization checks for Renewals.
1694. Define the academic scope rules for Renewals.
1695. Define the department scope rules for Renewals.
1696. Define the ownership rules for Renewals.
1697. Define the primary action for Renewals.
1698. Define the secondary actions for Renewals.
1699. Define destructive actions for Renewals.
1700. Define confirmation behavior for Renewals.
1701. Define loading behavior for Renewals.
1702. Define empty-state behavior for Renewals.
1703. Define error behavior for Renewals.
1704. Define retry behavior for Renewals.
1705. Define pagination behavior for Renewals.
1706. Define filtering behavior for Renewals.
1707. Define sorting behavior for Renewals.
1708. Define real-time events affecting Renewals.
1709. Define audit events generated by Renewals.
1710. Define responsive behavior for Renewals.
1711. Define accessibility requirements for Renewals.
1712. Define browser acceptance tests for Renewals.

## PAGE CONTRACT — Reservation Queue
1713. Define the business purpose of Reservation Queue.
1714. Define the primary roles allowed to open Reservation Queue.
1715. Define the exact route for Reservation Queue.
1716. Define the API calls used by Reservation Queue.
1717. Define the database entities used by Reservation Queue.
1718. Define the authorization checks for Reservation Queue.
1719. Define the academic scope rules for Reservation Queue.
1720. Define the department scope rules for Reservation Queue.
1721. Define the ownership rules for Reservation Queue.
1722. Define the primary action for Reservation Queue.
1723. Define the secondary actions for Reservation Queue.
1724. Define destructive actions for Reservation Queue.
1725. Define confirmation behavior for Reservation Queue.
1726. Define loading behavior for Reservation Queue.
1727. Define empty-state behavior for Reservation Queue.
1728. Define error behavior for Reservation Queue.
1729. Define retry behavior for Reservation Queue.
1730. Define pagination behavior for Reservation Queue.
1731. Define filtering behavior for Reservation Queue.
1732. Define sorting behavior for Reservation Queue.
1733. Define real-time events affecting Reservation Queue.
1734. Define audit events generated by Reservation Queue.
1735. Define responsive behavior for Reservation Queue.
1736. Define accessibility requirements for Reservation Queue.
1737. Define browser acceptance tests for Reservation Queue.

## PAGE CONTRACT — Members
1738. Define the business purpose of Members.
1739. Define the primary roles allowed to open Members.
1740. Define the exact route for Members.
1741. Define the API calls used by Members.
1742. Define the database entities used by Members.
1743. Define the authorization checks for Members.
1744. Define the academic scope rules for Members.
1745. Define the department scope rules for Members.
1746. Define the ownership rules for Members.
1747. Define the primary action for Members.
1748. Define the secondary actions for Members.
1749. Define destructive actions for Members.
1750. Define confirmation behavior for Members.
1751. Define loading behavior for Members.
1752. Define empty-state behavior for Members.
1753. Define error behavior for Members.
1754. Define retry behavior for Members.
1755. Define pagination behavior for Members.
1756. Define filtering behavior for Members.
1757. Define sorting behavior for Members.
1758. Define real-time events affecting Members.
1759. Define audit events generated by Members.
1760. Define responsive behavior for Members.
1761. Define accessibility requirements for Members.
1762. Define browser acceptance tests for Members.

## PAGE CONTRACT — Member Detail
1763. Define the business purpose of Member Detail.
1764. Define the primary roles allowed to open Member Detail.
1765. Define the exact route for Member Detail.
1766. Define the API calls used by Member Detail.
1767. Define the database entities used by Member Detail.
1768. Define the authorization checks for Member Detail.
1769. Define the academic scope rules for Member Detail.
1770. Define the department scope rules for Member Detail.
1771. Define the ownership rules for Member Detail.
1772. Define the primary action for Member Detail.
1773. Define the secondary actions for Member Detail.
1774. Define destructive actions for Member Detail.
1775. Define confirmation behavior for Member Detail.
1776. Define loading behavior for Member Detail.
1777. Define empty-state behavior for Member Detail.
1778. Define error behavior for Member Detail.
1779. Define retry behavior for Member Detail.
1780. Define pagination behavior for Member Detail.
1781. Define filtering behavior for Member Detail.
1782. Define sorting behavior for Member Detail.
1783. Define real-time events affecting Member Detail.
1784. Define audit events generated by Member Detail.
1785. Define responsive behavior for Member Detail.
1786. Define accessibility requirements for Member Detail.
1787. Define browser acceptance tests for Member Detail.

## PAGE CONTRACT — Fines
1788. Define the business purpose of Fines.
1789. Define the primary roles allowed to open Fines.
1790. Define the exact route for Fines.
1791. Define the API calls used by Fines.
1792. Define the database entities used by Fines.
1793. Define the authorization checks for Fines.
1794. Define the academic scope rules for Fines.
1795. Define the department scope rules for Fines.
1796. Define the ownership rules for Fines.
1797. Define the primary action for Fines.
1798. Define the secondary actions for Fines.
1799. Define destructive actions for Fines.
1800. Define confirmation behavior for Fines.
1801. Define loading behavior for Fines.
1802. Define empty-state behavior for Fines.
1803. Define error behavior for Fines.
1804. Define retry behavior for Fines.
1805. Define pagination behavior for Fines.
1806. Define filtering behavior for Fines.
1807. Define sorting behavior for Fines.
1808. Define real-time events affecting Fines.
1809. Define audit events generated by Fines.
1810. Define responsive behavior for Fines.
1811. Define accessibility requirements for Fines.
1812. Define browser acceptance tests for Fines.

## PAGE CONTRACT — Fine Detail
1813. Define the business purpose of Fine Detail.
1814. Define the primary roles allowed to open Fine Detail.
1815. Define the exact route for Fine Detail.
1816. Define the API calls used by Fine Detail.
1817. Define the database entities used by Fine Detail.
1818. Define the authorization checks for Fine Detail.
1819. Define the academic scope rules for Fine Detail.
1820. Define the department scope rules for Fine Detail.
1821. Define the ownership rules for Fine Detail.
1822. Define the primary action for Fine Detail.
1823. Define the secondary actions for Fine Detail.
1824. Define destructive actions for Fine Detail.
1825. Define confirmation behavior for Fine Detail.
1826. Define loading behavior for Fine Detail.
1827. Define empty-state behavior for Fine Detail.
1828. Define error behavior for Fine Detail.
1829. Define retry behavior for Fine Detail.
1830. Define pagination behavior for Fine Detail.
1831. Define filtering behavior for Fine Detail.
1832. Define sorting behavior for Fine Detail.
1833. Define real-time events affecting Fine Detail.
1834. Define audit events generated by Fine Detail.
1835. Define responsive behavior for Fine Detail.
1836. Define accessibility requirements for Fine Detail.
1837. Define browser acceptance tests for Fine Detail.

## PAGE CONTRACT — Inventory
1838. Define the business purpose of Inventory.
1839. Define the primary roles allowed to open Inventory.
1840. Define the exact route for Inventory.
1841. Define the API calls used by Inventory.
1842. Define the database entities used by Inventory.
1843. Define the authorization checks for Inventory.
1844. Define the academic scope rules for Inventory.
1845. Define the department scope rules for Inventory.
1846. Define the ownership rules for Inventory.
1847. Define the primary action for Inventory.
1848. Define the secondary actions for Inventory.
1849. Define destructive actions for Inventory.
1850. Define confirmation behavior for Inventory.
1851. Define loading behavior for Inventory.
1852. Define empty-state behavior for Inventory.
1853. Define error behavior for Inventory.
1854. Define retry behavior for Inventory.
1855. Define pagination behavior for Inventory.
1856. Define filtering behavior for Inventory.
1857. Define sorting behavior for Inventory.
1858. Define real-time events affecting Inventory.
1859. Define audit events generated by Inventory.
1860. Define responsive behavior for Inventory.
1861. Define accessibility requirements for Inventory.
1862. Define browser acceptance tests for Inventory.

## PAGE CONTRACT — Inventory Reconciliation
1863. Define the business purpose of Inventory Reconciliation.
1864. Define the primary roles allowed to open Inventory Reconciliation.
1865. Define the exact route for Inventory Reconciliation.
1866. Define the API calls used by Inventory Reconciliation.
1867. Define the database entities used by Inventory Reconciliation.
1868. Define the authorization checks for Inventory Reconciliation.
1869. Define the academic scope rules for Inventory Reconciliation.
1870. Define the department scope rules for Inventory Reconciliation.
1871. Define the ownership rules for Inventory Reconciliation.
1872. Define the primary action for Inventory Reconciliation.
1873. Define the secondary actions for Inventory Reconciliation.
1874. Define destructive actions for Inventory Reconciliation.
1875. Define confirmation behavior for Inventory Reconciliation.
1876. Define loading behavior for Inventory Reconciliation.
1877. Define empty-state behavior for Inventory Reconciliation.
1878. Define error behavior for Inventory Reconciliation.
1879. Define retry behavior for Inventory Reconciliation.
1880. Define pagination behavior for Inventory Reconciliation.
1881. Define filtering behavior for Inventory Reconciliation.
1882. Define sorting behavior for Inventory Reconciliation.
1883. Define real-time events affecting Inventory Reconciliation.
1884. Define audit events generated by Inventory Reconciliation.
1885. Define responsive behavior for Inventory Reconciliation.
1886. Define accessibility requirements for Inventory Reconciliation.
1887. Define browser acceptance tests for Inventory Reconciliation.

## PAGE CONTRACT — Catalog Management
1888. Define the business purpose of Catalog Management.
1889. Define the primary roles allowed to open Catalog Management.
1890. Define the exact route for Catalog Management.
1891. Define the API calls used by Catalog Management.
1892. Define the database entities used by Catalog Management.
1893. Define the authorization checks for Catalog Management.
1894. Define the academic scope rules for Catalog Management.
1895. Define the department scope rules for Catalog Management.
1896. Define the ownership rules for Catalog Management.
1897. Define the primary action for Catalog Management.
1898. Define the secondary actions for Catalog Management.
1899. Define destructive actions for Catalog Management.
1900. Define confirmation behavior for Catalog Management.
1901. Define loading behavior for Catalog Management.
1902. Define empty-state behavior for Catalog Management.
1903. Define error behavior for Catalog Management.
1904. Define retry behavior for Catalog Management.
1905. Define pagination behavior for Catalog Management.
1906. Define filtering behavior for Catalog Management.
1907. Define sorting behavior for Catalog Management.
1908. Define real-time events affecting Catalog Management.
1909. Define audit events generated by Catalog Management.
1910. Define responsive behavior for Catalog Management.
1911. Define accessibility requirements for Catalog Management.
1912. Define browser acceptance tests for Catalog Management.

## PAGE CONTRACT — Create Catalog Record
1913. Define the business purpose of Create Catalog Record.
1914. Define the primary roles allowed to open Create Catalog Record.
1915. Define the exact route for Create Catalog Record.
1916. Define the API calls used by Create Catalog Record.
1917. Define the database entities used by Create Catalog Record.
1918. Define the authorization checks for Create Catalog Record.
1919. Define the academic scope rules for Create Catalog Record.
1920. Define the department scope rules for Create Catalog Record.
1921. Define the ownership rules for Create Catalog Record.
1922. Define the primary action for Create Catalog Record.
1923. Define the secondary actions for Create Catalog Record.
1924. Define destructive actions for Create Catalog Record.
1925. Define confirmation behavior for Create Catalog Record.
1926. Define loading behavior for Create Catalog Record.
1927. Define empty-state behavior for Create Catalog Record.
1928. Define error behavior for Create Catalog Record.
1929. Define retry behavior for Create Catalog Record.
1930. Define pagination behavior for Create Catalog Record.
1931. Define filtering behavior for Create Catalog Record.
1932. Define sorting behavior for Create Catalog Record.
1933. Define real-time events affecting Create Catalog Record.
1934. Define audit events generated by Create Catalog Record.
1935. Define responsive behavior for Create Catalog Record.
1936. Define accessibility requirements for Create Catalog Record.
1937. Define browser acceptance tests for Create Catalog Record.

## PAGE CONTRACT — Edit Catalog Record
1938. Define the business purpose of Edit Catalog Record.
1939. Define the primary roles allowed to open Edit Catalog Record.
1940. Define the exact route for Edit Catalog Record.
1941. Define the API calls used by Edit Catalog Record.
1942. Define the database entities used by Edit Catalog Record.
1943. Define the authorization checks for Edit Catalog Record.
1944. Define the academic scope rules for Edit Catalog Record.
1945. Define the department scope rules for Edit Catalog Record.
1946. Define the ownership rules for Edit Catalog Record.
1947. Define the primary action for Edit Catalog Record.
1948. Define the secondary actions for Edit Catalog Record.
1949. Define destructive actions for Edit Catalog Record.
1950. Define confirmation behavior for Edit Catalog Record.
1951. Define loading behavior for Edit Catalog Record.
1952. Define empty-state behavior for Edit Catalog Record.
1953. Define error behavior for Edit Catalog Record.
1954. Define retry behavior for Edit Catalog Record.
1955. Define pagination behavior for Edit Catalog Record.
1956. Define filtering behavior for Edit Catalog Record.
1957. Define sorting behavior for Edit Catalog Record.
1958. Define real-time events affecting Edit Catalog Record.
1959. Define audit events generated by Edit Catalog Record.
1960. Define responsive behavior for Edit Catalog Record.
1961. Define accessibility requirements for Edit Catalog Record.
1962. Define browser acceptance tests for Edit Catalog Record.

## PAGE CONTRACT — Create Physical Copy
1963. Define the business purpose of Create Physical Copy.
1964. Define the primary roles allowed to open Create Physical Copy.
1965. Define the exact route for Create Physical Copy.
1966. Define the API calls used by Create Physical Copy.
1967. Define the database entities used by Create Physical Copy.
1968. Define the authorization checks for Create Physical Copy.
1969. Define the academic scope rules for Create Physical Copy.
1970. Define the department scope rules for Create Physical Copy.
1971. Define the ownership rules for Create Physical Copy.
1972. Define the primary action for Create Physical Copy.
1973. Define the secondary actions for Create Physical Copy.
1974. Define destructive actions for Create Physical Copy.
1975. Define confirmation behavior for Create Physical Copy.
1976. Define loading behavior for Create Physical Copy.
1977. Define empty-state behavior for Create Physical Copy.
1978. Define error behavior for Create Physical Copy.
1979. Define retry behavior for Create Physical Copy.
1980. Define pagination behavior for Create Physical Copy.
1981. Define filtering behavior for Create Physical Copy.
1982. Define sorting behavior for Create Physical Copy.
1983. Define real-time events affecting Create Physical Copy.
1984. Define audit events generated by Create Physical Copy.
1985. Define responsive behavior for Create Physical Copy.
1986. Define accessibility requirements for Create Physical Copy.
1987. Define browser acceptance tests for Create Physical Copy.

## PAGE CONTRACT — Edit Physical Copy
1988. Define the business purpose of Edit Physical Copy.
1989. Define the primary roles allowed to open Edit Physical Copy.
1990. Define the exact route for Edit Physical Copy.
1991. Define the API calls used by Edit Physical Copy.
1992. Define the database entities used by Edit Physical Copy.
1993. Define the authorization checks for Edit Physical Copy.
1994. Define the academic scope rules for Edit Physical Copy.
1995. Define the department scope rules for Edit Physical Copy.
1996. Define the ownership rules for Edit Physical Copy.
1997. Define the primary action for Edit Physical Copy.
1998. Define the secondary actions for Edit Physical Copy.
1999. Define destructive actions for Edit Physical Copy.
2000. Define confirmation behavior for Edit Physical Copy.
2001. Define loading behavior for Edit Physical Copy.
2002. Define empty-state behavior for Edit Physical Copy.
2003. Define error behavior for Edit Physical Copy.
2004. Define retry behavior for Edit Physical Copy.
2005. Define pagination behavior for Edit Physical Copy.
2006. Define filtering behavior for Edit Physical Copy.
2007. Define sorting behavior for Edit Physical Copy.
2008. Define real-time events affecting Edit Physical Copy.
2009. Define audit events generated by Edit Physical Copy.
2010. Define responsive behavior for Edit Physical Copy.
2011. Define accessibility requirements for Edit Physical Copy.
2012. Define browser acceptance tests for Edit Physical Copy.

## PAGE CONTRACT — Digital Resources
2013. Define the business purpose of Digital Resources.
2014. Define the primary roles allowed to open Digital Resources.
2015. Define the exact route for Digital Resources.
2016. Define the API calls used by Digital Resources.
2017. Define the database entities used by Digital Resources.
2018. Define the authorization checks for Digital Resources.
2019. Define the academic scope rules for Digital Resources.
2020. Define the department scope rules for Digital Resources.
2021. Define the ownership rules for Digital Resources.
2022. Define the primary action for Digital Resources.
2023. Define the secondary actions for Digital Resources.
2024. Define destructive actions for Digital Resources.
2025. Define confirmation behavior for Digital Resources.
2026. Define loading behavior for Digital Resources.
2027. Define empty-state behavior for Digital Resources.
2028. Define error behavior for Digital Resources.
2029. Define retry behavior for Digital Resources.
2030. Define pagination behavior for Digital Resources.
2031. Define filtering behavior for Digital Resources.
2032. Define sorting behavior for Digital Resources.
2033. Define real-time events affecting Digital Resources.
2034. Define audit events generated by Digital Resources.
2035. Define responsive behavior for Digital Resources.
2036. Define accessibility requirements for Digital Resources.
2037. Define browser acceptance tests for Digital Resources.

## PAGE CONTRACT — Service Points
2038. Define the business purpose of Service Points.
2039. Define the primary roles allowed to open Service Points.
2040. Define the exact route for Service Points.
2041. Define the API calls used by Service Points.
2042. Define the database entities used by Service Points.
2043. Define the authorization checks for Service Points.
2044. Define the academic scope rules for Service Points.
2045. Define the department scope rules for Service Points.
2046. Define the ownership rules for Service Points.
2047. Define the primary action for Service Points.
2048. Define the secondary actions for Service Points.
2049. Define destructive actions for Service Points.
2050. Define confirmation behavior for Service Points.
2051. Define loading behavior for Service Points.
2052. Define empty-state behavior for Service Points.
2053. Define error behavior for Service Points.
2054. Define retry behavior for Service Points.
2055. Define pagination behavior for Service Points.
2056. Define filtering behavior for Service Points.
2057. Define sorting behavior for Service Points.
2058. Define real-time events affecting Service Points.
2059. Define audit events generated by Service Points.
2060. Define responsive behavior for Service Points.
2061. Define accessibility requirements for Service Points.
2062. Define browser acceptance tests for Service Points.

## PAGE CONTRACT — Loan Policies
2063. Define the business purpose of Loan Policies.
2064. Define the primary roles allowed to open Loan Policies.
2065. Define the exact route for Loan Policies.
2066. Define the API calls used by Loan Policies.
2067. Define the database entities used by Loan Policies.
2068. Define the authorization checks for Loan Policies.
2069. Define the academic scope rules for Loan Policies.
2070. Define the department scope rules for Loan Policies.
2071. Define the ownership rules for Loan Policies.
2072. Define the primary action for Loan Policies.
2073. Define the secondary actions for Loan Policies.
2074. Define destructive actions for Loan Policies.
2075. Define confirmation behavior for Loan Policies.
2076. Define loading behavior for Loan Policies.
2077. Define empty-state behavior for Loan Policies.
2078. Define error behavior for Loan Policies.
2079. Define retry behavior for Loan Policies.
2080. Define pagination behavior for Loan Policies.
2081. Define filtering behavior for Loan Policies.
2082. Define sorting behavior for Loan Policies.
2083. Define real-time events affecting Loan Policies.
2084. Define audit events generated by Loan Policies.
2085. Define responsive behavior for Loan Policies.
2086. Define accessibility requirements for Loan Policies.
2087. Define browser acceptance tests for Loan Policies.

## PAGE CONTRACT — Library Policies
2088. Define the business purpose of Library Policies.
2089. Define the primary roles allowed to open Library Policies.
2090. Define the exact route for Library Policies.
2091. Define the API calls used by Library Policies.
2092. Define the database entities used by Library Policies.
2093. Define the authorization checks for Library Policies.
2094. Define the academic scope rules for Library Policies.
2095. Define the department scope rules for Library Policies.
2096. Define the ownership rules for Library Policies.
2097. Define the primary action for Library Policies.
2098. Define the secondary actions for Library Policies.
2099. Define destructive actions for Library Policies.
2100. Define confirmation behavior for Library Policies.
2101. Define loading behavior for Library Policies.
2102. Define empty-state behavior for Library Policies.
2103. Define error behavior for Library Policies.
2104. Define retry behavior for Library Policies.
2105. Define pagination behavior for Library Policies.
2106. Define filtering behavior for Library Policies.
2107. Define sorting behavior for Library Policies.
2108. Define real-time events affecting Library Policies.
2109. Define audit events generated by Library Policies.
2110. Define responsive behavior for Library Policies.
2111. Define accessibility requirements for Library Policies.
2112. Define browser acceptance tests for Library Policies.

## PAGE CONTRACT — Reports
2113. Define the business purpose of Reports.
2114. Define the primary roles allowed to open Reports.
2115. Define the exact route for Reports.
2116. Define the API calls used by Reports.
2117. Define the database entities used by Reports.
2118. Define the authorization checks for Reports.
2119. Define the academic scope rules for Reports.
2120. Define the department scope rules for Reports.
2121. Define the ownership rules for Reports.
2122. Define the primary action for Reports.
2123. Define the secondary actions for Reports.
2124. Define destructive actions for Reports.
2125. Define confirmation behavior for Reports.
2126. Define loading behavior for Reports.
2127. Define empty-state behavior for Reports.
2128. Define error behavior for Reports.
2129. Define retry behavior for Reports.
2130. Define pagination behavior for Reports.
2131. Define filtering behavior for Reports.
2132. Define sorting behavior for Reports.
2133. Define real-time events affecting Reports.
2134. Define audit events generated by Reports.
2135. Define responsive behavior for Reports.
2136. Define accessibility requirements for Reports.
2137. Define browser acceptance tests for Reports.

## PAGE CONTRACT — Audit Log
2138. Define the business purpose of Audit Log.
2139. Define the primary roles allowed to open Audit Log.
2140. Define the exact route for Audit Log.
2141. Define the API calls used by Audit Log.
2142. Define the database entities used by Audit Log.
2143. Define the authorization checks for Audit Log.
2144. Define the academic scope rules for Audit Log.
2145. Define the department scope rules for Audit Log.
2146. Define the ownership rules for Audit Log.
2147. Define the primary action for Audit Log.
2148. Define the secondary actions for Audit Log.
2149. Define destructive actions for Audit Log.
2150. Define confirmation behavior for Audit Log.
2151. Define loading behavior for Audit Log.
2152. Define empty-state behavior for Audit Log.
2153. Define error behavior for Audit Log.
2154. Define retry behavior for Audit Log.
2155. Define pagination behavior for Audit Log.
2156. Define filtering behavior for Audit Log.
2157. Define sorting behavior for Audit Log.
2158. Define real-time events affecting Audit Log.
2159. Define audit events generated by Audit Log.
2160. Define responsive behavior for Audit Log.
2161. Define accessibility requirements for Audit Log.
2162. Define browser acceptance tests for Audit Log.

## PAGE CONTRACT — Notifications
2163. Define the business purpose of Notifications.
2164. Define the primary roles allowed to open Notifications.
2165. Define the exact route for Notifications.
2166. Define the API calls used by Notifications.
2167. Define the database entities used by Notifications.
2168. Define the authorization checks for Notifications.
2169. Define the academic scope rules for Notifications.
2170. Define the department scope rules for Notifications.
2171. Define the ownership rules for Notifications.
2172. Define the primary action for Notifications.
2173. Define the secondary actions for Notifications.
2174. Define destructive actions for Notifications.
2175. Define confirmation behavior for Notifications.
2176. Define loading behavior for Notifications.
2177. Define empty-state behavior for Notifications.
2178. Define error behavior for Notifications.
2179. Define retry behavior for Notifications.
2180. Define pagination behavior for Notifications.
2181. Define filtering behavior for Notifications.
2182. Define sorting behavior for Notifications.
2183. Define real-time events affecting Notifications.
2184. Define audit events generated by Notifications.
2185. Define responsive behavior for Notifications.
2186. Define accessibility requirements for Notifications.
2187. Define browser acceptance tests for Notifications.

## PAGE CONTRACT — Library Settings
2188. Define the business purpose of Library Settings.
2189. Define the primary roles allowed to open Library Settings.
2190. Define the exact route for Library Settings.
2191. Define the API calls used by Library Settings.
2192. Define the database entities used by Library Settings.
2193. Define the authorization checks for Library Settings.
2194. Define the academic scope rules for Library Settings.
2195. Define the department scope rules for Library Settings.
2196. Define the ownership rules for Library Settings.
2197. Define the primary action for Library Settings.
2198. Define the secondary actions for Library Settings.
2199. Define destructive actions for Library Settings.
2200. Define confirmation behavior for Library Settings.
2201. Define loading behavior for Library Settings.
2202. Define empty-state behavior for Library Settings.
2203. Define error behavior for Library Settings.
2204. Define retry behavior for Library Settings.
2205. Define pagination behavior for Library Settings.
2206. Define filtering behavior for Library Settings.
2207. Define sorting behavior for Library Settings.
2208. Define real-time events affecting Library Settings.
2209. Define audit events generated by Library Settings.
2210. Define responsive behavior for Library Settings.
2211. Define accessibility requirements for Library Settings.
2212. Define browser acceptance tests for Library Settings.

## PAGE CONTRACT — System Health
2213. Define the business purpose of System Health.
2214. Define the primary roles allowed to open System Health.
2215. Define the exact route for System Health.
2216. Define the API calls used by System Health.
2217. Define the database entities used by System Health.
2218. Define the authorization checks for System Health.
2219. Define the academic scope rules for System Health.
2220. Define the department scope rules for System Health.
2221. Define the ownership rules for System Health.
2222. Define the primary action for System Health.
2223. Define the secondary actions for System Health.
2224. Define destructive actions for System Health.
2225. Define confirmation behavior for System Health.
2226. Define loading behavior for System Health.
2227. Define empty-state behavior for System Health.
2228. Define error behavior for System Health.
2229. Define retry behavior for System Health.
2230. Define pagination behavior for System Health.
2231. Define filtering behavior for System Health.
2232. Define sorting behavior for System Health.
2233. Define real-time events affecting System Health.
2234. Define audit events generated by System Health.
2235. Define responsive behavior for System Health.
2236. Define accessibility requirements for System Health.
2237. Define browser acceptance tests for System Health.

## ENTITY CONTRACT — LibraryMember
2238. Define and validate the identity field for LibraryMember.
2239. Define and validate the membership number field for LibraryMember.
2240. Define and validate the member type field for LibraryMember.
2241. Define and validate the status field for LibraryMember.
2242. Define and validate the department field for LibraryMember.
2243. Define and validate the program field for LibraryMember.
2244. Define and validate the batch field for LibraryMember.
2245. Define and validate the effective date field for LibraryMember.
2246. Define and validate the expiry date field for LibraryMember.
2247. Define and validate the loan policy field for LibraryMember.
2248. Define and validate the reservation policy field for LibraryMember.
2249. Define and validate the block state field for LibraryMember.
2250. Define and validate the fine summary field for LibraryMember.
2251. Define and validate the createdBy field for LibraryMember.
2252. Define and validate the updatedBy field for LibraryMember.
2253. Define lifecycle states for LibraryMember.
2254. Define authorization rules for LibraryMember.
2255. Define indexes for LibraryMember.
2256. Define DTOs for LibraryMember.
2257. Define API endpoints for LibraryMember.
2258. Define audit behavior for LibraryMember.
2259. Define seed behavior for LibraryMember.
2260. Define browser tests for LibraryMember.

## ENTITY CONTRACT — BibliographicRecord
2261. Define and validate the title field for BibliographicRecord.
2262. Define and validate the subtitle field for BibliographicRecord.
2263. Define and validate the authors field for BibliographicRecord.
2264. Define and validate the contributors field for BibliographicRecord.
2265. Define and validate the publisher field for BibliographicRecord.
2266. Define and validate the publication date field for BibliographicRecord.
2267. Define and validate the edition field for BibliographicRecord.
2268. Define and validate the language field for BibliographicRecord.
2269. Define and validate the ISBN field for BibliographicRecord.
2270. Define and validate the subjects field for BibliographicRecord.
2271. Define and validate the classification field for BibliographicRecord.
2272. Define and validate the call number field for BibliographicRecord.
2273. Define and validate the description field for BibliographicRecord.
2274. Define and validate the format field for BibliographicRecord.
2275. Define and validate the catalog status field for BibliographicRecord.
2276. Define and validate the source field for BibliographicRecord.
2277. Define and validate the provenance field for BibliographicRecord.
2278. Define lifecycle states for BibliographicRecord.
2279. Define authorization rules for BibliographicRecord.
2280. Define indexes for BibliographicRecord.
2281. Define DTOs for BibliographicRecord.
2282. Define API endpoints for BibliographicRecord.
2283. Define audit behavior for BibliographicRecord.
2284. Define seed behavior for BibliographicRecord.
2285. Define browser tests for BibliographicRecord.

## ENTITY CONTRACT — PhysicalCopy
2286. Define and validate the barcode field for PhysicalCopy.
2287. Define and validate the bibliographic record field for PhysicalCopy.
2288. Define and validate the edition field for PhysicalCopy.
2289. Define and validate the branch field for PhysicalCopy.
2290. Define and validate the service point field for PhysicalCopy.
2291. Define and validate the shelf field for PhysicalCopy.
2292. Define and validate the status field for PhysicalCopy.
2293. Define and validate the condition field for PhysicalCopy.
2294. Define and validate the acquisition date field for PhysicalCopy.
2295. Define and validate the purchase price field for PhysicalCopy.
2296. Define and validate the vendor field for PhysicalCopy.
2297. Define and validate the inventory verification field for PhysicalCopy.
2298. Define and validate the notes field for PhysicalCopy.
2299. Define lifecycle states for PhysicalCopy.
2300. Define authorization rules for PhysicalCopy.
2301. Define indexes for PhysicalCopy.
2302. Define DTOs for PhysicalCopy.
2303. Define API endpoints for PhysicalCopy.
2304. Define audit behavior for PhysicalCopy.
2305. Define seed behavior for PhysicalCopy.
2306. Define browser tests for PhysicalCopy.

## ENTITY CONTRACT — DigitalResource
2307. Define and validate the title field for DigitalResource.
2308. Define and validate the description field for DigitalResource.
2309. Define and validate the file type field for DigitalResource.
2310. Define and validate the object key field for DigitalResource.
2311. Define and validate the external URL field for DigitalResource.
2312. Define and validate the size field for DigitalResource.
2313. Define and validate the checksum field for DigitalResource.
2314. Define and validate the visibility field for DigitalResource.
2315. Define and validate the course offering field for DigitalResource.
2316. Define and validate the unit field for DigitalResource.
2317. Define and validate the version field for DigitalResource.
2318. Define and validate the access policy field for DigitalResource.
2319. Define and validate the createdBy field for DigitalResource.
2320. Define and validate the updatedBy field for DigitalResource.
2321. Define lifecycle states for DigitalResource.
2322. Define authorization rules for DigitalResource.
2323. Define indexes for DigitalResource.
2324. Define DTOs for DigitalResource.
2325. Define API endpoints for DigitalResource.
2326. Define audit behavior for DigitalResource.
2327. Define seed behavior for DigitalResource.
2328. Define browser tests for DigitalResource.

## ENTITY CONTRACT — Loan
2329. Define and validate the member field for Loan.
2330. Define and validate the copy field for Loan.
2331. Define and validate the loan date field for Loan.
2332. Define and validate the due date field for Loan.
2333. Define and validate the return date field for Loan.
2334. Define and validate the renewal count field for Loan.
2335. Define and validate the service point field for Loan.
2336. Define and validate the issued by field for Loan.
2337. Define and validate the returned by field for Loan.
2338. Define and validate the status field for Loan.
2339. Define and validate the overdue state field for Loan.
2340. Define and validate the fine linkage field for Loan.
2341. Define lifecycle states for Loan.
2342. Define authorization rules for Loan.
2343. Define indexes for Loan.
2344. Define DTOs for Loan.
2345. Define API endpoints for Loan.
2346. Define audit behavior for Loan.
2347. Define seed behavior for Loan.
2348. Define browser tests for Loan.

## ENTITY CONTRACT — Reservation
2349. Define and validate the member field for Reservation.
2350. Define and validate the resource field for Reservation.
2351. Define and validate the queue position field for Reservation.
2352. Define and validate the createdAt field for Reservation.
2353. Define and validate the expiryAt field for Reservation.
2354. Define and validate the pickup service point field for Reservation.
2355. Define and validate the status field for Reservation.
2356. Define and validate the fulfilledAt field for Reservation.
2357. Define and validate the cancelledAt field for Reservation.
2358. Define and validate the reason field for Reservation.
2359. Define lifecycle states for Reservation.
2360. Define authorization rules for Reservation.
2361. Define indexes for Reservation.
2362. Define DTOs for Reservation.
2363. Define API endpoints for Reservation.
2364. Define audit behavior for Reservation.
2365. Define seed behavior for Reservation.
2366. Define browser tests for Reservation.

## ENTITY CONTRACT — Fine
2367. Define and validate the member field for Fine.
2368. Define and validate the loan field for Fine.
2369. Define and validate the reason field for Fine.
2370. Define and validate the assessed amount field for Fine.
2371. Define and validate the paid amount field for Fine.
2372. Define and validate the waived amount field for Fine.
2373. Define and validate the outstanding amount field for Fine.
2374. Define and validate the currency field for Fine.
2375. Define and validate the status field for Fine.
2376. Define and validate the createdBy field for Fine.
2377. Define and validate the updatedBy field for Fine.
2378. Define lifecycle states for Fine.
2379. Define authorization rules for Fine.
2380. Define indexes for Fine.
2381. Define DTOs for Fine.
2382. Define API endpoints for Fine.
2383. Define audit behavior for Fine.
2384. Define seed behavior for Fine.
2385. Define browser tests for Fine.

## ENTITY CONTRACT — LibraryPolicy
2386. Define and validate the policy name field for LibraryPolicy.
2387. Define and validate the member role field for LibraryPolicy.
2388. Define and validate the loan limit field for LibraryPolicy.
2389. Define and validate the loan period field for LibraryPolicy.
2390. Define and validate the renewal limit field for LibraryPolicy.
2391. Define and validate the fine rule field for LibraryPolicy.
2392. Define and validate the reservation limit field for LibraryPolicy.
2393. Define and validate the grace period field for LibraryPolicy.
2394. Define and validate the eligibility field for LibraryPolicy.
2395. Define and validate the effective date field for LibraryPolicy.
2396. Define and validate the version field for LibraryPolicy.
2397. Define and validate the status field for LibraryPolicy.
2398. Define lifecycle states for LibraryPolicy.
2399. Define authorization rules for LibraryPolicy.
2400. Define indexes for LibraryPolicy.
2401. Define DTOs for LibraryPolicy.
2402. Define API endpoints for LibraryPolicy.
2403. Define audit behavior for LibraryPolicy.
2404. Define seed behavior for LibraryPolicy.
2405. Define browser tests for LibraryPolicy.

## ENTITY CONTRACT — ServicePoint
2406. Define and validate the name field for ServicePoint.
2407. Define and validate the branch field for ServicePoint.
2408. Define and validate the location field for ServicePoint.
2409. Define and validate the staff scope field for ServicePoint.
2410. Define and validate the operational status field for ServicePoint.
2411. Define and validate the opening hours field for ServicePoint.
2412. Define and validate the capabilities field for ServicePoint.
2413. Define lifecycle states for ServicePoint.
2414. Define authorization rules for ServicePoint.
2415. Define indexes for ServicePoint.
2416. Define DTOs for ServicePoint.
2417. Define API endpoints for ServicePoint.
2418. Define audit behavior for ServicePoint.
2419. Define seed behavior for ServicePoint.
2420. Define browser tests for ServicePoint.

## ENTITY CONTRACT — AuditRecord
2421. Define and validate the event ID field for AuditRecord.
2422. Define and validate the actor field for AuditRecord.
2423. Define and validate the role field for AuditRecord.
2424. Define and validate the action field for AuditRecord.
2425. Define and validate the resource type field for AuditRecord.
2426. Define and validate the resource ID field for AuditRecord.
2427. Define and validate the department scope field for AuditRecord.
2428. Define and validate the academic scope field for AuditRecord.
2429. Define and validate the timestamp field for AuditRecord.
2430. Define and validate the result field for AuditRecord.
2431. Define and validate the request ID field for AuditRecord.
2432. Define and validate the correlation ID field for AuditRecord.
2433. Define and validate the source IP field for AuditRecord.
2434. Define and validate the user agent field for AuditRecord.
2435. Define and validate the change summary field for AuditRecord.
2436. Define lifecycle states for AuditRecord.
2437. Define authorization rules for AuditRecord.
2438. Define indexes for AuditRecord.
2439. Define DTOs for AuditRecord.
2440. Define API endpoints for AuditRecord.
2441. Define audit behavior for AuditRecord.
2442. Define seed behavior for AuditRecord.
2443. Define browser tests for AuditRecord.

## END-TO-END ACCEPTANCE MATRIX — PASS 1
2444. Execute this workflow end-to-end: Student searches catalog and opens a bibliographic record.
2445. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2446. Execute this workflow end-to-end: Student filters by available physical copies.
2447. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2448. Execute this workflow end-to-end: Student reserves an unavailable resource.
2449. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2450. Execute this workflow end-to-end: Student cancels a reservation.
2451. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2452. Execute this workflow end-to-end: Student renews an eligible loan.
2453. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2454. Execute this workflow end-to-end: Student attempts an ineligible renewal.
2455. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2456. Execute this workflow end-to-end: Student opens a digital resource.
2457. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2458. Execute this workflow end-to-end: Student views a fine.
2459. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2460. Execute this workflow end-to-end: Student attempts to view another user's fine.
2461. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2462. Execute this workflow end-to-end: Faculty opens an assigned CourseOffering.
2463. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2464. Execute this workflow end-to-end: Faculty opens Unit 1.
2465. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2466. Execute this workflow end-to-end: Faculty uploads a PDF resource.
2467. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2468. Execute this workflow end-to-end: Faculty creates a new document version.
2469. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2470. Execute this workflow end-to-end: Faculty restores a previous version where authorized.
2471. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2472. Execute this workflow end-to-end: Faculty archives a resource.
2473. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2474. Execute this workflow end-to-end: Faculty attempts an unassigned CourseOffering.
2475. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2476. Execute this workflow end-to-end: HOD opens department library.
2477. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2478. Execute this workflow end-to-end: HOD filters by year.
2479. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2480. Execute this workflow end-to-end: HOD filters by semester.
2481. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2482. Execute this workflow end-to-end: HOD reviews faculty contribution.
2483. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2484. Execute this workflow end-to-end: HOD attempts another department.
2485. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2486. Execute this workflow end-to-end: Management opens institutional analytics.
2487. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2488. Execute this workflow end-to-end: Management changes a date range.
2489. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2490. Execute this workflow end-to-end: Management drills into an authorized aggregate.
2491. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2492. Execute this workflow end-to-end: Management attempts a private patron record.
2493. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2494. Execute this workflow end-to-end: Admin opens circulation desk.
2495. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2496. Execute this workflow end-to-end: Admin scans a valid barcode.
2497. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2498. Execute this workflow end-to-end: Admin selects an eligible member.
2499. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2500. Execute this workflow end-to-end: Admin completes check-out.
2501. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2502. Execute this workflow end-to-end: Admin verifies the loan.
2503. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2504. Execute this workflow end-to-end: Admin checks the copy in.
2505. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2506. Execute this workflow end-to-end: Admin verifies the copy is available.
2507. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2508. Execute this workflow end-to-end: Admin processes a reservation.
2509. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2510. Execute this workflow end-to-end: Admin opens fine management.
2511. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2512. Execute this workflow end-to-end: Admin performs an authorized adjustment.
2513. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2514. Execute this workflow end-to-end: Root Admin opens system health.
2515. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2516. Execute this workflow end-to-end: Root Admin opens audit.
2517. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2518. Execute this workflow end-to-end: Root Admin changes a safe configuration.
2519. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2520. Execute this workflow end-to-end: Root Admin verifies the configuration audit event.
2521. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2522. Execute this workflow end-to-end: Two clients attempt the same checkout concurrently.
2523. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2524. Execute this workflow end-to-end: Two clients attempt the same reservation concurrently.
2525. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2526. Execute this workflow end-to-end: Two clients receive authorized real-time updates.
2527. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2528. Execute this workflow end-to-end: Unauthorized client attempts a protected Socket.IO room.
2529. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2530. Execute this workflow end-to-end: LAN client uploads a resource.
2531. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2532. Execute this workflow end-to-end: LAN client downloads an authorized resource.
2533. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2534. Execute this workflow end-to-end: LAN client refreshes a protected page.
2535. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.

## END-TO-END ACCEPTANCE MATRIX — PASS 2
2536. Execute this workflow end-to-end: Student searches catalog and opens a bibliographic record.
2537. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2538. Execute this workflow end-to-end: Student filters by available physical copies.
2539. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2540. Execute this workflow end-to-end: Student reserves an unavailable resource.
2541. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2542. Execute this workflow end-to-end: Student cancels a reservation.
2543. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2544. Execute this workflow end-to-end: Student renews an eligible loan.
2545. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2546. Execute this workflow end-to-end: Student attempts an ineligible renewal.
2547. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2548. Execute this workflow end-to-end: Student opens a digital resource.
2549. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2550. Execute this workflow end-to-end: Student views a fine.
2551. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2552. Execute this workflow end-to-end: Student attempts to view another user's fine.
2553. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2554. Execute this workflow end-to-end: Faculty opens an assigned CourseOffering.
2555. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2556. Execute this workflow end-to-end: Faculty opens Unit 1.
2557. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2558. Execute this workflow end-to-end: Faculty uploads a PDF resource.
2559. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2560. Execute this workflow end-to-end: Faculty creates a new document version.
2561. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2562. Execute this workflow end-to-end: Faculty restores a previous version where authorized.
2563. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2564. Execute this workflow end-to-end: Faculty archives a resource.
2565. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2566. Execute this workflow end-to-end: Faculty attempts an unassigned CourseOffering.
2567. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2568. Execute this workflow end-to-end: HOD opens department library.
2569. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2570. Execute this workflow end-to-end: HOD filters by year.
2571. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2572. Execute this workflow end-to-end: HOD filters by semester.
2573. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2574. Execute this workflow end-to-end: HOD reviews faculty contribution.
2575. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2576. Execute this workflow end-to-end: HOD attempts another department.
2577. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2578. Execute this workflow end-to-end: Management opens institutional analytics.
2579. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2580. Execute this workflow end-to-end: Management changes a date range.
2581. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2582. Execute this workflow end-to-end: Management drills into an authorized aggregate.
2583. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2584. Execute this workflow end-to-end: Management attempts a private patron record.
2585. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2586. Execute this workflow end-to-end: Admin opens circulation desk.
2587. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2588. Execute this workflow end-to-end: Admin scans a valid barcode.
2589. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2590. Execute this workflow end-to-end: Admin selects an eligible member.
2591. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2592. Execute this workflow end-to-end: Admin completes check-out.
2593. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2594. Execute this workflow end-to-end: Admin verifies the loan.
2595. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2596. Execute this workflow end-to-end: Admin checks the copy in.
2597. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2598. Execute this workflow end-to-end: Admin verifies the copy is available.
2599. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2600. Execute this workflow end-to-end: Admin processes a reservation.
2601. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2602. Execute this workflow end-to-end: Admin opens fine management.
2603. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2604. Execute this workflow end-to-end: Admin performs an authorized adjustment.
2605. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2606. Execute this workflow end-to-end: Root Admin opens system health.
2607. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2608. Execute this workflow end-to-end: Root Admin opens audit.
2609. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2610. Execute this workflow end-to-end: Root Admin changes a safe configuration.
2611. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2612. Execute this workflow end-to-end: Root Admin verifies the configuration audit event.
2613. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2614. Execute this workflow end-to-end: Two clients attempt the same checkout concurrently.
2615. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2616. Execute this workflow end-to-end: Two clients attempt the same reservation concurrently.
2617. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2618. Execute this workflow end-to-end: Two clients receive authorized real-time updates.
2619. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2620. Execute this workflow end-to-end: Unauthorized client attempts a protected Socket.IO room.
2621. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2622. Execute this workflow end-to-end: LAN client uploads a resource.
2623. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2624. Execute this workflow end-to-end: LAN client downloads an authorized resource.
2625. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2626. Execute this workflow end-to-end: LAN client refreshes a protected page.
2627. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.

## END-TO-END ACCEPTANCE MATRIX — PASS 3
2628. Execute this workflow end-to-end: Student searches catalog and opens a bibliographic record.
2629. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2630. Execute this workflow end-to-end: Student filters by available physical copies.
2631. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2632. Execute this workflow end-to-end: Student reserves an unavailable resource.
2633. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2634. Execute this workflow end-to-end: Student cancels a reservation.
2635. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2636. Execute this workflow end-to-end: Student renews an eligible loan.
2637. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2638. Execute this workflow end-to-end: Student attempts an ineligible renewal.
2639. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2640. Execute this workflow end-to-end: Student opens a digital resource.
2641. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2642. Execute this workflow end-to-end: Student views a fine.
2643. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2644. Execute this workflow end-to-end: Student attempts to view another user's fine.
2645. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2646. Execute this workflow end-to-end: Faculty opens an assigned CourseOffering.
2647. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2648. Execute this workflow end-to-end: Faculty opens Unit 1.
2649. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2650. Execute this workflow end-to-end: Faculty uploads a PDF resource.
2651. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2652. Execute this workflow end-to-end: Faculty creates a new document version.
2653. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2654. Execute this workflow end-to-end: Faculty restores a previous version where authorized.
2655. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2656. Execute this workflow end-to-end: Faculty archives a resource.
2657. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2658. Execute this workflow end-to-end: Faculty attempts an unassigned CourseOffering.
2659. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2660. Execute this workflow end-to-end: HOD opens department library.
2661. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2662. Execute this workflow end-to-end: HOD filters by year.
2663. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2664. Execute this workflow end-to-end: HOD filters by semester.
2665. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2666. Execute this workflow end-to-end: HOD reviews faculty contribution.
2667. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2668. Execute this workflow end-to-end: HOD attempts another department.
2669. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2670. Execute this workflow end-to-end: Management opens institutional analytics.
2671. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2672. Execute this workflow end-to-end: Management changes a date range.
2673. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2674. Execute this workflow end-to-end: Management drills into an authorized aggregate.
2675. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2676. Execute this workflow end-to-end: Management attempts a private patron record.
2677. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2678. Execute this workflow end-to-end: Admin opens circulation desk.
2679. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2680. Execute this workflow end-to-end: Admin scans a valid barcode.
2681. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2682. Execute this workflow end-to-end: Admin selects an eligible member.
2683. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2684. Execute this workflow end-to-end: Admin completes check-out.
2685. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2686. Execute this workflow end-to-end: Admin verifies the loan.
2687. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2688. Execute this workflow end-to-end: Admin checks the copy in.
2689. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2690. Execute this workflow end-to-end: Admin verifies the copy is available.
2691. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2692. Execute this workflow end-to-end: Admin processes a reservation.
2693. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2694. Execute this workflow end-to-end: Admin opens fine management.
2695. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2696. Execute this workflow end-to-end: Admin performs an authorized adjustment.
2697. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2698. Execute this workflow end-to-end: Root Admin opens system health.
2699. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2700. Execute this workflow end-to-end: Root Admin opens audit.
2701. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2702. Execute this workflow end-to-end: Root Admin changes a safe configuration.
2703. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2704. Execute this workflow end-to-end: Root Admin verifies the configuration audit event.
2705. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2706. Execute this workflow end-to-end: Two clients attempt the same checkout concurrently.
2707. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2708. Execute this workflow end-to-end: Two clients attempt the same reservation concurrently.
2709. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2710. Execute this workflow end-to-end: Two clients receive authorized real-time updates.
2711. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2712. Execute this workflow end-to-end: Unauthorized client attempts a protected Socket.IO room.
2713. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2714. Execute this workflow end-to-end: LAN client uploads a resource.
2715. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2716. Execute this workflow end-to-end: LAN client downloads an authorized resource.
2717. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2718. Execute this workflow end-to-end: LAN client refreshes a protected page.
2719. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.

## END-TO-END ACCEPTANCE MATRIX — PASS 4
2720. Execute this workflow end-to-end: Student searches catalog and opens a bibliographic record.
2721. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2722. Execute this workflow end-to-end: Student filters by available physical copies.
2723. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2724. Execute this workflow end-to-end: Student reserves an unavailable resource.
2725. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2726. Execute this workflow end-to-end: Student cancels a reservation.
2727. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2728. Execute this workflow end-to-end: Student renews an eligible loan.
2729. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2730. Execute this workflow end-to-end: Student attempts an ineligible renewal.
2731. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2732. Execute this workflow end-to-end: Student opens a digital resource.
2733. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2734. Execute this workflow end-to-end: Student views a fine.
2735. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2736. Execute this workflow end-to-end: Student attempts to view another user's fine.
2737. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2738. Execute this workflow end-to-end: Faculty opens an assigned CourseOffering.
2739. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2740. Execute this workflow end-to-end: Faculty opens Unit 1.
2741. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2742. Execute this workflow end-to-end: Faculty uploads a PDF resource.
2743. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2744. Execute this workflow end-to-end: Faculty creates a new document version.
2745. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2746. Execute this workflow end-to-end: Faculty restores a previous version where authorized.
2747. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2748. Execute this workflow end-to-end: Faculty archives a resource.
2749. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2750. Execute this workflow end-to-end: Faculty attempts an unassigned CourseOffering.
2751. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2752. Execute this workflow end-to-end: HOD opens department library.
2753. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2754. Execute this workflow end-to-end: HOD filters by year.
2755. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2756. Execute this workflow end-to-end: HOD filters by semester.
2757. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2758. Execute this workflow end-to-end: HOD reviews faculty contribution.
2759. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2760. Execute this workflow end-to-end: HOD attempts another department.
2761. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2762. Execute this workflow end-to-end: Management opens institutional analytics.
2763. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2764. Execute this workflow end-to-end: Management changes a date range.
2765. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2766. Execute this workflow end-to-end: Management drills into an authorized aggregate.
2767. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2768. Execute this workflow end-to-end: Management attempts a private patron record.
2769. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2770. Execute this workflow end-to-end: Admin opens circulation desk.
2771. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2772. Execute this workflow end-to-end: Admin scans a valid barcode.
2773. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2774. Execute this workflow end-to-end: Admin selects an eligible member.
2775. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2776. Execute this workflow end-to-end: Admin completes check-out.
2777. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2778. Execute this workflow end-to-end: Admin verifies the loan.
2779. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2780. Execute this workflow end-to-end: Admin checks the copy in.
2781. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2782. Execute this workflow end-to-end: Admin verifies the copy is available.
2783. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2784. Execute this workflow end-to-end: Admin processes a reservation.
2785. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2786. Execute this workflow end-to-end: Admin opens fine management.
2787. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2788. Execute this workflow end-to-end: Admin performs an authorized adjustment.
2789. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2790. Execute this workflow end-to-end: Root Admin opens system health.
2791. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2792. Execute this workflow end-to-end: Root Admin opens audit.
2793. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2794. Execute this workflow end-to-end: Root Admin changes a safe configuration.
2795. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2796. Execute this workflow end-to-end: Root Admin verifies the configuration audit event.
2797. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2798. Execute this workflow end-to-end: Two clients attempt the same checkout concurrently.
2799. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2800. Execute this workflow end-to-end: Two clients attempt the same reservation concurrently.
2801. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2802. Execute this workflow end-to-end: Two clients receive authorized real-time updates.
2803. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2804. Execute this workflow end-to-end: Unauthorized client attempts a protected Socket.IO room.
2805. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2806. Execute this workflow end-to-end: LAN client uploads a resource.
2807. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2808. Execute this workflow end-to-end: LAN client downloads an authorized resource.
2809. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2810. Execute this workflow end-to-end: LAN client refreshes a protected page.
2811. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.

## END-TO-END ACCEPTANCE MATRIX — PASS 5
2812. Execute this workflow end-to-end: Student searches catalog and opens a bibliographic record.
2813. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2814. Execute this workflow end-to-end: Student filters by available physical copies.
2815. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2816. Execute this workflow end-to-end: Student reserves an unavailable resource.
2817. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2818. Execute this workflow end-to-end: Student cancels a reservation.
2819. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2820. Execute this workflow end-to-end: Student renews an eligible loan.
2821. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2822. Execute this workflow end-to-end: Student attempts an ineligible renewal.
2823. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2824. Execute this workflow end-to-end: Student opens a digital resource.
2825. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2826. Execute this workflow end-to-end: Student views a fine.
2827. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2828. Execute this workflow end-to-end: Student attempts to view another user's fine.
2829. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2830. Execute this workflow end-to-end: Faculty opens an assigned CourseOffering.
2831. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2832. Execute this workflow end-to-end: Faculty opens Unit 1.
2833. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2834. Execute this workflow end-to-end: Faculty uploads a PDF resource.
2835. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2836. Execute this workflow end-to-end: Faculty creates a new document version.
2837. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2838. Execute this workflow end-to-end: Faculty restores a previous version where authorized.
2839. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2840. Execute this workflow end-to-end: Faculty archives a resource.
2841. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2842. Execute this workflow end-to-end: Faculty attempts an unassigned CourseOffering.
2843. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2844. Execute this workflow end-to-end: HOD opens department library.
2845. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2846. Execute this workflow end-to-end: HOD filters by year.
2847. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2848. Execute this workflow end-to-end: HOD filters by semester.
2849. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2850. Execute this workflow end-to-end: HOD reviews faculty contribution.
2851. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2852. Execute this workflow end-to-end: HOD attempts another department.
2853. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2854. Execute this workflow end-to-end: Management opens institutional analytics.
2855. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2856. Execute this workflow end-to-end: Management changes a date range.
2857. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2858. Execute this workflow end-to-end: Management drills into an authorized aggregate.
2859. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2860. Execute this workflow end-to-end: Management attempts a private patron record.
2861. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2862. Execute this workflow end-to-end: Admin opens circulation desk.
2863. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2864. Execute this workflow end-to-end: Admin scans a valid barcode.
2865. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2866. Execute this workflow end-to-end: Admin selects an eligible member.
2867. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2868. Execute this workflow end-to-end: Admin completes check-out.
2869. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2870. Execute this workflow end-to-end: Admin verifies the loan.
2871. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2872. Execute this workflow end-to-end: Admin checks the copy in.
2873. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2874. Execute this workflow end-to-end: Admin verifies the copy is available.
2875. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2876. Execute this workflow end-to-end: Admin processes a reservation.
2877. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2878. Execute this workflow end-to-end: Admin opens fine management.
2879. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2880. Execute this workflow end-to-end: Admin performs an authorized adjustment.
2881. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2882. Execute this workflow end-to-end: Root Admin opens system health.
2883. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2884. Execute this workflow end-to-end: Root Admin opens audit.
2885. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2886. Execute this workflow end-to-end: Root Admin changes a safe configuration.
2887. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2888. Execute this workflow end-to-end: Root Admin verifies the configuration audit event.
2889. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2890. Execute this workflow end-to-end: Two clients attempt the same checkout concurrently.
2891. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2892. Execute this workflow end-to-end: Two clients attempt the same reservation concurrently.
2893. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2894. Execute this workflow end-to-end: Two clients receive authorized real-time updates.
2895. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2896. Execute this workflow end-to-end: Unauthorized client attempts a protected Socket.IO room.
2897. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2898. Execute this workflow end-to-end: LAN client uploads a resource.
2899. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2900. Execute this workflow end-to-end: LAN client downloads an authorized resource.
2901. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.
2902. Execute this workflow end-to-end: LAN client refreshes a protected page.
2903. Verify database state, API response, authorization result, UI state, audit event, and real-time side effect where applicable.

## QUALITY GATE 01
2904. List files changed in this phase.
2905. List database schema changes.
2906. List database indexes.
2907. List API changes.
2908. List UI route changes.
2909. List RBAC changes.
2910. List event changes.
2911. List storage changes.
2912. Run relevant automated tests.
2913. Run relevant browser tests.
2914. Inspect browser console.
2915. Inspect network requests.
2916. Inspect server logs.
2917. Inspect database records.
2918. Verify no mock data was introduced.
2919. Verify no unauthorized route is exposed.
2920. Verify no secrets were committed.
2921. Verify no localhost-only dependency was introduced.
2922. Record PASS or FAIL.

## QUALITY GATE 02
2923. List files changed in this phase.
2924. List database schema changes.
2925. List database indexes.
2926. List API changes.
2927. List UI route changes.
2928. List RBAC changes.
2929. List event changes.
2930. List storage changes.
2931. Run relevant automated tests.
2932. Run relevant browser tests.
2933. Inspect browser console.
2934. Inspect network requests.
2935. Inspect server logs.
2936. Inspect database records.
2937. Verify no mock data was introduced.
2938. Verify no unauthorized route is exposed.
2939. Verify no secrets were committed.
2940. Verify no localhost-only dependency was introduced.
2941. Record PASS or FAIL.

## QUALITY GATE 03
2942. List files changed in this phase.
2943. List database schema changes.
2944. List database indexes.
2945. List API changes.
2946. List UI route changes.
2947. List RBAC changes.
2948. List event changes.
2949. List storage changes.
2950. Run relevant automated tests.
2951. Run relevant browser tests.
2952. Inspect browser console.
2953. Inspect network requests.
2954. Inspect server logs.
2955. Inspect database records.
2956. Verify no mock data was introduced.
2957. Verify no unauthorized route is exposed.
2958. Verify no secrets were committed.
2959. Verify no localhost-only dependency was introduced.
2960. Record PASS or FAIL.

## QUALITY GATE 04
2961. List files changed in this phase.
2962. List database schema changes.
2963. List database indexes.
2964. List API changes.
2965. List UI route changes.
2966. List RBAC changes.
2967. List event changes.
2968. List storage changes.
2969. Run relevant automated tests.
2970. Run relevant browser tests.
2971. Inspect browser console.
2972. Inspect network requests.
2973. Inspect server logs.
2974. Inspect database records.
2975. Verify no mock data was introduced.
2976. Verify no unauthorized route is exposed.
2977. Verify no secrets were committed.
2978. Verify no localhost-only dependency was introduced.
2979. Record PASS or FAIL.

## QUALITY GATE 05
2980. List files changed in this phase.
2981. List database schema changes.
2982. List database indexes.
2983. List API changes.
2984. List UI route changes.
2985. List RBAC changes.
2986. List event changes.
2987. List storage changes.
2988. Run relevant automated tests.
2989. Run relevant browser tests.
2990. Inspect browser console.
2991. Inspect network requests.
2992. Inspect server logs.
2993. Inspect database records.
2994. Verify no mock data was introduced.
2995. Verify no unauthorized route is exposed.
2996. Verify no secrets were committed.
2997. Verify no localhost-only dependency was introduced.
2998. Record PASS or FAIL.

## QUALITY GATE 06
2999. List files changed in this phase.
3000. List database schema changes.
3001. List database indexes.
3002. List API changes.
3003. List UI route changes.
3004. List RBAC changes.
3005. List event changes.
3006. List storage changes.
3007. Run relevant automated tests.
3008. Run relevant browser tests.
3009. Inspect browser console.
3010. Inspect network requests.
3011. Inspect server logs.
3012. Inspect database records.
3013. Verify no mock data was introduced.
3014. Verify no unauthorized route is exposed.
3015. Verify no secrets were committed.
3016. Verify no localhost-only dependency was introduced.
3017. Record PASS or FAIL.

## QUALITY GATE 07
3018. List files changed in this phase.
3019. List database schema changes.
3020. List database indexes.
3021. List API changes.
3022. List UI route changes.
3023. List RBAC changes.
3024. List event changes.
3025. List storage changes.
3026. Run relevant automated tests.
3027. Run relevant browser tests.
3028. Inspect browser console.
3029. Inspect network requests.
3030. Inspect server logs.
3031. Inspect database records.
3032. Verify no mock data was introduced.
3033. Verify no unauthorized route is exposed.
3034. Verify no secrets were committed.
3035. Verify no localhost-only dependency was introduced.
3036. Record PASS or FAIL.

## QUALITY GATE 08
3037. List files changed in this phase.
3038. List database schema changes.
3039. List database indexes.
3040. List API changes.
3041. List UI route changes.
3042. List RBAC changes.
3043. List event changes.
3044. List storage changes.
3045. Run relevant automated tests.
3046. Run relevant browser tests.
3047. Inspect browser console.
3048. Inspect network requests.
3049. Inspect server logs.
3050. Inspect database records.
3051. Verify no mock data was introduced.
3052. Verify no unauthorized route is exposed.
3053. Verify no secrets were committed.
3054. Verify no localhost-only dependency was introduced.
3055. Record PASS or FAIL.

## QUALITY GATE 09
3056. List files changed in this phase.
3057. List database schema changes.
3058. List database indexes.
3059. List API changes.
3060. List UI route changes.
3061. List RBAC changes.
3062. List event changes.
3063. List storage changes.
3064. Run relevant automated tests.
3065. Run relevant browser tests.
3066. Inspect browser console.
3067. Inspect network requests.
3068. Inspect server logs.
3069. Inspect database records.
3070. Verify no mock data was introduced.
3071. Verify no unauthorized route is exposed.
3072. Verify no secrets were committed.
3073. Verify no localhost-only dependency was introduced.
3074. Record PASS or FAIL.

## QUALITY GATE 10
3075. List files changed in this phase.
3076. List database schema changes.
3077. List database indexes.
3078. List API changes.
3079. List UI route changes.
3080. List RBAC changes.
3081. List event changes.
3082. List storage changes.
3083. Run relevant automated tests.
3084. Run relevant browser tests.
3085. Inspect browser console.
3086. Inspect network requests.
3087. Inspect server logs.
3088. Inspect database records.
3089. Verify no mock data was introduced.
3090. Verify no unauthorized route is exposed.
3091. Verify no secrets were committed.
3092. Verify no localhost-only dependency was introduced.
3093. Record PASS or FAIL.

## QUALITY GATE 11
3094. List files changed in this phase.
3095. List database schema changes.
3096. List database indexes.
3097. List API changes.
3098. List UI route changes.
3099. List RBAC changes.
3100. List event changes.
3101. List storage changes.
3102. Run relevant automated tests.
3103. Run relevant browser tests.
3104. Inspect browser console.
3105. Inspect network requests.
3106. Inspect server logs.
3107. Inspect database records.
3108. Verify no mock data was introduced.
3109. Verify no unauthorized route is exposed.
3110. Verify no secrets were committed.
3111. Verify no localhost-only dependency was introduced.
3112. Record PASS or FAIL.

## QUALITY GATE 12
3113. List files changed in this phase.
3114. List database schema changes.
3115. List database indexes.
3116. List API changes.
3117. List UI route changes.
3118. List RBAC changes.
3119. List event changes.
3120. List storage changes.
3121. Run relevant automated tests.
3122. Run relevant browser tests.
3123. Inspect browser console.
3124. Inspect network requests.
3125. Inspect server logs.
3126. Inspect database records.
3127. Verify no mock data was introduced.
3128. Verify no unauthorized route is exposed.
3129. Verify no secrets were committed.
3130. Verify no localhost-only dependency was introduced.
3131. Record PASS or FAIL.

## QUALITY GATE 13
3132. List files changed in this phase.
3133. List database schema changes.
3134. List database indexes.
3135. List API changes.
3136. List UI route changes.
3137. List RBAC changes.
3138. List event changes.
3139. List storage changes.
3140. Run relevant automated tests.
3141. Run relevant browser tests.
3142. Inspect browser console.
3143. Inspect network requests.
3144. Inspect server logs.
3145. Inspect database records.
3146. Verify no mock data was introduced.
3147. Verify no unauthorized route is exposed.
3148. Verify no secrets were committed.
3149. Verify no localhost-only dependency was introduced.
3150. Record PASS or FAIL.

## QUALITY GATE 14
3151. List files changed in this phase.
3152. List database schema changes.
3153. List database indexes.
3154. List API changes.
3155. List UI route changes.
3156. List RBAC changes.
3157. List event changes.
3158. List storage changes.
3159. Run relevant automated tests.
3160. Run relevant browser tests.
3161. Inspect browser console.
3162. Inspect network requests.
3163. Inspect server logs.
3164. Inspect database records.
3165. Verify no mock data was introduced.
3166. Verify no unauthorized route is exposed.
3167. Verify no secrets were committed.
3168. Verify no localhost-only dependency was introduced.
3169. Record PASS or FAIL.

## QUALITY GATE 15
3170. List files changed in this phase.
3171. List database schema changes.
3172. List database indexes.
3173. List API changes.
3174. List UI route changes.
3175. List RBAC changes.
3176. List event changes.
3177. List storage changes.
3178. Run relevant automated tests.
3179. Run relevant browser tests.
3180. Inspect browser console.
3181. Inspect network requests.
3182. Inspect server logs.
3183. Inspect database records.
3184. Verify no mock data was introduced.
3185. Verify no unauthorized route is exposed.
3186. Verify no secrets were committed.
3187. Verify no localhost-only dependency was introduced.
3188. Record PASS or FAIL.

## QUALITY GATE 16
3189. List files changed in this phase.
3190. List database schema changes.
3191. List database indexes.
3192. List API changes.
3193. List UI route changes.
3194. List RBAC changes.
3195. List event changes.
3196. List storage changes.
3197. Run relevant automated tests.
3198. Run relevant browser tests.
3199. Inspect browser console.
3200. Inspect network requests.
3201. Inspect server logs.
3202. Inspect database records.
3203. Verify no mock data was introduced.
3204. Verify no unauthorized route is exposed.
3205. Verify no secrets were committed.
3206. Verify no localhost-only dependency was introduced.
3207. Record PASS or FAIL.

## QUALITY GATE 17
3208. List files changed in this phase.
3209. List database schema changes.
3210. List database indexes.
3211. List API changes.
3212. List UI route changes.
3213. List RBAC changes.
3214. List event changes.
3215. List storage changes.
3216. Run relevant automated tests.
3217. Run relevant browser tests.
3218. Inspect browser console.
3219. Inspect network requests.
3220. Inspect server logs.
3221. Inspect database records.
3222. Verify no mock data was introduced.
3223. Verify no unauthorized route is exposed.
3224. Verify no secrets were committed.
3225. Verify no localhost-only dependency was introduced.
3226. Record PASS or FAIL.

## QUALITY GATE 18
3227. List files changed in this phase.
3228. List database schema changes.
3229. List database indexes.
3230. List API changes.
3231. List UI route changes.
3232. List RBAC changes.
3233. List event changes.
3234. List storage changes.
3235. Run relevant automated tests.
3236. Run relevant browser tests.
3237. Inspect browser console.
3238. Inspect network requests.
3239. Inspect server logs.
3240. Inspect database records.
3241. Verify no mock data was introduced.
3242. Verify no unauthorized route is exposed.
3243. Verify no secrets were committed.
3244. Verify no localhost-only dependency was introduced.
3245. Record PASS or FAIL.

## QUALITY GATE 19
3246. List files changed in this phase.
3247. List database schema changes.
3248. List database indexes.
3249. List API changes.
3250. List UI route changes.
3251. List RBAC changes.
3252. List event changes.
3253. List storage changes.
3254. Run relevant automated tests.
3255. Run relevant browser tests.
3256. Inspect browser console.
3257. Inspect network requests.
3258. Inspect server logs.
3259. Inspect database records.
3260. Verify no mock data was introduced.
3261. Verify no unauthorized route is exposed.
3262. Verify no secrets were committed.
3263. Verify no localhost-only dependency was introduced.
3264. Record PASS or FAIL.

## QUALITY GATE 20
3265. List files changed in this phase.
3266. List database schema changes.
3267. List database indexes.
3268. List API changes.
3269. List UI route changes.
3270. List RBAC changes.
3271. List event changes.
3272. List storage changes.
3273. Run relevant automated tests.
3274. Run relevant browser tests.
3275. Inspect browser console.
3276. Inspect network requests.
3277. Inspect server logs.
3278. Inspect database records.
3279. Verify no mock data was introduced.
3280. Verify no unauthorized route is exposed.
3281. Verify no secrets were committed.
3282. Verify no localhost-only dependency was introduced.
3283. Record PASS or FAIL.

## QUALITY GATE 21
3284. List files changed in this phase.
3285. List database schema changes.
3286. List database indexes.
3287. List API changes.
3288. List UI route changes.
3289. List RBAC changes.
3290. List event changes.
3291. List storage changes.
3292. Run relevant automated tests.
3293. Run relevant browser tests.
3294. Inspect browser console.
3295. Inspect network requests.
3296. Inspect server logs.
3297. Inspect database records.
3298. Verify no mock data was introduced.
3299. Verify no unauthorized route is exposed.
3300. Verify no secrets were committed.
3301. Verify no localhost-only dependency was introduced.
3302. Record PASS or FAIL.

## QUALITY GATE 22
3303. List files changed in this phase.
3304. List database schema changes.
3305. List database indexes.
3306. List API changes.
3307. List UI route changes.
3308. List RBAC changes.
3309. List event changes.
3310. List storage changes.
3311. Run relevant automated tests.
3312. Run relevant browser tests.
3313. Inspect browser console.
3314. Inspect network requests.
3315. Inspect server logs.
3316. Inspect database records.
3317. Verify no mock data was introduced.
3318. Verify no unauthorized route is exposed.
3319. Verify no secrets were committed.
3320. Verify no localhost-only dependency was introduced.
3321. Record PASS or FAIL.

## QUALITY GATE 23
3322. List files changed in this phase.
3323. List database schema changes.
3324. List database indexes.
3325. List API changes.
3326. List UI route changes.
3327. List RBAC changes.
3328. List event changes.
3329. List storage changes.
3330. Run relevant automated tests.
3331. Run relevant browser tests.
3332. Inspect browser console.
3333. Inspect network requests.
3334. Inspect server logs.
3335. Inspect database records.
3336. Verify no mock data was introduced.
3337. Verify no unauthorized route is exposed.
3338. Verify no secrets were committed.
3339. Verify no localhost-only dependency was introduced.
3340. Record PASS or FAIL.

## QUALITY GATE 24
3341. List files changed in this phase.
3342. List database schema changes.
3343. List database indexes.
3344. List API changes.
3345. List UI route changes.
3346. List RBAC changes.
3347. List event changes.
3348. List storage changes.
3349. Run relevant automated tests.
3350. Run relevant browser tests.
3351. Inspect browser console.
3352. Inspect network requests.
3353. Inspect server logs.
3354. Inspect database records.
3355. Verify no mock data was introduced.
3356. Verify no unauthorized route is exposed.
3357. Verify no secrets were committed.
3358. Verify no localhost-only dependency was introduced.
3359. Record PASS or FAIL.

## QUALITY GATE 25
3360. List files changed in this phase.
3361. List database schema changes.
3362. List database indexes.
3363. List API changes.
3364. List UI route changes.
3365. List RBAC changes.
3366. List event changes.
3367. List storage changes.
3368. Run relevant automated tests.
3369. Run relevant browser tests.
3370. Inspect browser console.
3371. Inspect network requests.
3372. Inspect server logs.
3373. Inspect database records.
3374. Verify no mock data was introduced.
3375. Verify no unauthorized route is exposed.
3376. Verify no secrets were committed.
3377. Verify no localhost-only dependency was introduced.
3378. Record PASS or FAIL.

## QUALITY GATE 26
3379. List files changed in this phase.
3380. List database schema changes.
3381. List database indexes.
3382. List API changes.
3383. List UI route changes.
3384. List RBAC changes.
3385. List event changes.
3386. List storage changes.
3387. Run relevant automated tests.
3388. Run relevant browser tests.
3389. Inspect browser console.
3390. Inspect network requests.
3391. Inspect server logs.
3392. Inspect database records.
3393. Verify no mock data was introduced.
3394. Verify no unauthorized route is exposed.
3395. Verify no secrets were committed.
3396. Verify no localhost-only dependency was introduced.
3397. Record PASS or FAIL.

## QUALITY GATE 27
3398. List files changed in this phase.
3399. List database schema changes.
3400. List database indexes.
3401. List API changes.
3402. List UI route changes.
3403. List RBAC changes.
3404. List event changes.
3405. List storage changes.
3406. Run relevant automated tests.
3407. Run relevant browser tests.
3408. Inspect browser console.
3409. Inspect network requests.
3410. Inspect server logs.
3411. Inspect database records.
3412. Verify no mock data was introduced.
3413. Verify no unauthorized route is exposed.
3414. Verify no secrets were committed.
3415. Verify no localhost-only dependency was introduced.
3416. Record PASS or FAIL.

## QUALITY GATE 28
3417. List files changed in this phase.
3418. List database schema changes.
3419. List database indexes.
3420. List API changes.
3421. List UI route changes.
3422. List RBAC changes.
3423. List event changes.
3424. List storage changes.
3425. Run relevant automated tests.
3426. Run relevant browser tests.
3427. Inspect browser console.
3428. Inspect network requests.
3429. Inspect server logs.
3430. Inspect database records.
3431. Verify no mock data was introduced.
3432. Verify no unauthorized route is exposed.
3433. Verify no secrets were committed.
3434. Verify no localhost-only dependency was introduced.
3435. Record PASS or FAIL.

## QUALITY GATE 29
3436. List files changed in this phase.
3437. List database schema changes.
3438. List database indexes.
3439. List API changes.
3440. List UI route changes.
3441. List RBAC changes.
3442. List event changes.
3443. List storage changes.
3444. Run relevant automated tests.
3445. Run relevant browser tests.
3446. Inspect browser console.
3447. Inspect network requests.
3448. Inspect server logs.
3449. Inspect database records.
3450. Verify no mock data was introduced.
3451. Verify no unauthorized route is exposed.
3452. Verify no secrets were committed.
3453. Verify no localhost-only dependency was introduced.
3454. Record PASS or FAIL.

## QUALITY GATE 30
3455. List files changed in this phase.
3456. List database schema changes.
3457. List database indexes.
3458. List API changes.
3459. List UI route changes.
3460. List RBAC changes.
3461. List event changes.
3462. List storage changes.
3463. Run relevant automated tests.
3464. Run relevant browser tests.
3465. Inspect browser console.
3466. Inspect network requests.
3467. Inspect server logs.
3468. Inspect database records.
3469. Verify no mock data was introduced.
3470. Verify no unauthorized route is exposed.
3471. Verify no secrets were committed.
3472. Verify no localhost-only dependency was introduced.
3473. Record PASS or FAIL.

## QUALITY GATE 31
3474. List files changed in this phase.
3475. List database schema changes.
3476. List database indexes.
3477. List API changes.
3478. List UI route changes.
3479. List RBAC changes.
3480. List event changes.
3481. List storage changes.
3482. Run relevant automated tests.
3483. Run relevant browser tests.
3484. Inspect browser console.
3485. Inspect network requests.
3486. Inspect server logs.
3487. Inspect database records.
3488. Verify no mock data was introduced.
3489. Verify no unauthorized route is exposed.
3490. Verify no secrets were committed.
3491. Verify no localhost-only dependency was introduced.
3492. Record PASS or FAIL.

## QUALITY GATE 32
3493. List files changed in this phase.
3494. List database schema changes.
3495. List database indexes.
3496. List API changes.
3497. List UI route changes.
3498. List RBAC changes.
3499. List event changes.
3500. List storage changes.
3501. Run relevant automated tests.
3502. Run relevant browser tests.
3503. Inspect browser console.
3504. Inspect network requests.
3505. Inspect server logs.
3506. Inspect database records.
3507. Verify no mock data was introduced.
3508. Verify no unauthorized route is exposed.
3509. Verify no secrets were committed.
3510. Verify no localhost-only dependency was introduced.
3511. Record PASS or FAIL.

## QUALITY GATE 33
3512. List files changed in this phase.
3513. List database schema changes.
3514. List database indexes.
3515. List API changes.
3516. List UI route changes.
3517. List RBAC changes.
3518. List event changes.
3519. List storage changes.
3520. Run relevant automated tests.
3521. Run relevant browser tests.
3522. Inspect browser console.
3523. Inspect network requests.
3524. Inspect server logs.
3525. Inspect database records.
3526. Verify no mock data was introduced.
3527. Verify no unauthorized route is exposed.
3528. Verify no secrets were committed.
3529. Verify no localhost-only dependency was introduced.
3530. Record PASS or FAIL.

## QUALITY GATE 34
3531. List files changed in this phase.
3532. List database schema changes.
3533. List database indexes.
3534. List API changes.
3535. List UI route changes.
3536. List RBAC changes.
3537. List event changes.
3538. List storage changes.
3539. Run relevant automated tests.
3540. Run relevant browser tests.
3541. Inspect browser console.
3542. Inspect network requests.
3543. Inspect server logs.
3544. Inspect database records.
3545. Verify no mock data was introduced.
3546. Verify no unauthorized route is exposed.
3547. Verify no secrets were committed.
3548. Verify no localhost-only dependency was introduced.
3549. Record PASS or FAIL.

## QUALITY GATE 35
3550. List files changed in this phase.
3551. List database schema changes.
3552. List database indexes.
3553. List API changes.
3554. List UI route changes.
3555. List RBAC changes.
3556. List event changes.
3557. List storage changes.
3558. Run relevant automated tests.
3559. Run relevant browser tests.
3560. Inspect browser console.
3561. Inspect network requests.
3562. Inspect server logs.
3563. Inspect database records.
3564. Verify no mock data was introduced.
3565. Verify no unauthorized route is exposed.
3566. Verify no secrets were committed.
3567. Verify no localhost-only dependency was introduced.
3568. Record PASS or FAIL.

## QUALITY GATE 36
3569. List files changed in this phase.
3570. List database schema changes.
3571. List database indexes.
3572. List API changes.
3573. List UI route changes.
3574. List RBAC changes.
3575. List event changes.
3576. List storage changes.
3577. Run relevant automated tests.
3578. Run relevant browser tests.
3579. Inspect browser console.
3580. Inspect network requests.
3581. Inspect server logs.
3582. Inspect database records.
3583. Verify no mock data was introduced.
3584. Verify no unauthorized route is exposed.
3585. Verify no secrets were committed.
3586. Verify no localhost-only dependency was introduced.
3587. Record PASS or FAIL.

## QUALITY GATE 37
3588. List files changed in this phase.
3589. List database schema changes.
3590. List database indexes.
3591. List API changes.
3592. List UI route changes.
3593. List RBAC changes.
3594. List event changes.
3595. List storage changes.
3596. Run relevant automated tests.
3597. Run relevant browser tests.
3598. Inspect browser console.
3599. Inspect network requests.
3600. Inspect server logs.
3601. Inspect database records.
3602. Verify no mock data was introduced.
3603. Verify no unauthorized route is exposed.
3604. Verify no secrets were committed.
3605. Verify no localhost-only dependency was introduced.
3606. Record PASS or FAIL.

## QUALITY GATE 38
3607. List files changed in this phase.
3608. List database schema changes.
3609. List database indexes.
3610. List API changes.
3611. List UI route changes.
3612. List RBAC changes.
3613. List event changes.
3614. List storage changes.
3615. Run relevant automated tests.
3616. Run relevant browser tests.
3617. Inspect browser console.
3618. Inspect network requests.
3619. Inspect server logs.
3620. Inspect database records.
3621. Verify no mock data was introduced.
3622. Verify no unauthorized route is exposed.
3623. Verify no secrets were committed.
3624. Verify no localhost-only dependency was introduced.
3625. Record PASS or FAIL.

## QUALITY GATE 39
3626. List files changed in this phase.
3627. List database schema changes.
3628. List database indexes.
3629. List API changes.
3630. List UI route changes.
3631. List RBAC changes.
3632. List event changes.
3633. List storage changes.
3634. Run relevant automated tests.
3635. Run relevant browser tests.
3636. Inspect browser console.
3637. Inspect network requests.
3638. Inspect server logs.
3639. Inspect database records.
3640. Verify no mock data was introduced.
3641. Verify no unauthorized route is exposed.
3642. Verify no secrets were committed.
3643. Verify no localhost-only dependency was introduced.
3644. Record PASS or FAIL.

## QUALITY GATE 40
3645. List files changed in this phase.
3646. List database schema changes.
3647. List database indexes.
3648. List API changes.
3649. List UI route changes.
3650. List RBAC changes.
3651. List event changes.
3652. List storage changes.
3653. Run relevant automated tests.
3654. Run relevant browser tests.
3655. Inspect browser console.
3656. Inspect network requests.
3657. Inspect server logs.
3658. Inspect database records.
3659. Verify no mock data was introduced.
3660. Verify no unauthorized route is exposed.
3661. Verify no secrets were committed.
3662. Verify no localhost-only dependency was introduced.
3663. Record PASS or FAIL.

## FINAL ANTIGRAVITY EXECUTION PROTOCOL
3664. Do not execute the whole task as one blind code generation pass.
3665. Use the artifact workflow to expose the plan and evidence.
3666. Pause at architecture, database, RBAC, backend, and portal integration gates.
3667. Use browser tooling for real UI verification.
3668. Use terminal tooling for tests and migrations.
3669. Use the attached screenshots as visual references.
3670. Use existing project documentation as architectural context.
3671. Use existing project code as the implementation source of truth.
3672. Where the repository contradicts this prompt, document the conflict before changing architecture.
3673. Prefer the smallest architecture change that achieves the required library capability.
3674. Do not create parallel duplicate implementations.
3675. Do not leave temporary demo data in production components.
3676. Do not leave debug logging enabled.
3677. Do not leave disabled buttons where a real implementation is required.
3678. Do not call a polling implementation real-time.
3679. Do not call a screenshot a test.
3680. Do not call a successful build an acceptance result.
3681. Do not call a route render an implementation.
3682. Do not call a mocked API an integration.
3683. Do not call frontend hiding RBAC.
3684. Do not call hardcoded records database integration.
3685. Do not call a local file upload a MinIO integration.
3686. Do not call a browser localhost test a LAN test.
3687. Do not mark PASS when a critical workflow is broken.
3688. At the end, produce a precise PASS / PASS WITH REQUIRED FIXES / FAIL / BLOCKED result.
3689. Include evidence for every critical acceptance criterion.
3690. Include unresolved defects with severity.
3691. Include exact commands used for verification.
3692. Include exact LAN URL tested.
3693. Include exact seed commands.
3694. Include exact browser scenarios tested.
3695. Include exact security scenarios tested.
3696. Include exact concurrency scenarios tested.
3697. Only after all critical checks pass should the Library Management Portal be considered complete.

## RESEARCH BASIS TO KEEP IN MIND
Google Antigravity supports planning, agents, browser interaction, terminal execution, artifacts, and parallel agent workflows. Use those capabilities to inspect, implement, and verify rather than relying on a single code-generation pass.
Use Antigravity Planning Mode for this large task and review its implementation artifacts before execution.
Use Antigravity Browser tooling for browser verification and screenshots.
Use Antigravity terminal execution for migrations, seeds, tests, and diagnostics.
Use the repository's existing architecture instead of inventing a disconnected application.
Library-domain design should follow established concepts such as patrons/users, service points, circulation, loans, requests/reservations, fees/fines, inventory, and bibliographic metadata.
Keep bibliographic records separate from physical copies.
Use standards-aware metadata fields and leave room for MARC 21/BIBFRAME interoperability without forcing raw standards into every user screen.

## IMPORTANT ANTIGRAVITY OPERATING NOTE
Paste this prompt as the master instruction, but do not expect one giant response to implement everything safely in one turn.
Let Antigravity produce the plan and artifacts first.
Then execute phase by phase.
After each phase, inspect the artifact, tests, browser result, and diff before allowing the next phase.
Use the four supplied images as visual references.
Do not use screenshot content as fake application data.