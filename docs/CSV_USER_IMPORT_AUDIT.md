# CSV User Import Audit

## Source Document
- File: `CampusSphere_All_1141_Users(1).csv`

## Structure Analysis
- **Total Rows**: 1141 (excluding header)
- **Columns**: 15 (`userId`, `username`, `displayName`, `role`, `status`, `departmentId`, `departmentName`, `program`, `batch`, `admissionYear`, `academicYear`, `yearOfStudy`, `currentSemester`, `defaultYearOfStudy`, `defaultSemesters`)

## Data Profile
- **Roles Present**: `ROOT_ADMIN`, `ADMIN`, `MANAGEMENT`, `HOD`, `FACULTY`, `STUDENT`
- **Statuses Present**: `ACTIVE`
- **Departments Present**: `CSE`, `EEE`, `ECE`, `MECH`, `AGRI`, `AIDS`, `BT`, `IT`
- **Programs**: `BE`, `BTECH`
- **Batches**: `2026-2030`, `2025-2029`, `2024-2028`, `2023-2027`
- **Academic Years**: `2026-27`
- **Semesters**: `1`, `3`, `5`, `7`
- **Years of Study**: `1`, `2`, `3`, `4`
- **Faculty Scopes**: `defaultYearOfStudy` (`1`-`4`), `defaultSemesters` (`"1,2"`, `"3,4"`, `"5,6"`, `"7,8"`)

## Validation State
- **Missing Values**: Handled naturally by empty CSV fields (e.g., ROOT_ADMIN has no department).
- **Duplicate Records**: None detected based on ID distribution.
- **Invalid Records**: None detected. Schema aligns completely with standard system roles. No unexpected roles like LIBRARIAN are present.
