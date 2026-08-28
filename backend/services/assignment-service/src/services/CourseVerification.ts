export class CourseVerification {
  static get COURSE_URL() {
    return process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
  }

  /**
   * Returns true if the faculty owns the course or is a co-instructor.
   */
  static async verifyFacultyOwnership(courseId: string, facultyId: string, authHeader: string): Promise<boolean> {
    try {
      const resp = await fetch(`${this.COURSE_URL}/${courseId}`, {
        headers: { Authorization: authHeader }
      });
      if (!resp.ok) return false;
      const data: any = await resp.json();
      if (data.facultyOwnerId === facultyId) return true;
      if (data.coInstructors && data.coInstructors.includes(facultyId)) return true;
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Returns true if the student is enrolled in the course.
   */
  static async verifyStudentEnrollment(courseId: string, studentId: string, authHeader: string): Promise<boolean> {
    try {
      const resp = await fetch(`${this.COURSE_URL}/${courseId}`, {
        headers: { Authorization: authHeader }
      });
      if (!resp.ok) return false;
      const data: any = await resp.json();
      if (data.enrolledStudents && data.enrolledStudents.includes(studentId)) return true;
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Returns list of course IDs the student is enrolled in.
   */
  static async getEnrolledCourseIds(studentId: string, authHeader: string): Promise<string[]> {
    try {
      const resp = await fetch(`${this.COURSE_URL}/?enrolledStudentId=${studentId}&limit=1000`, {
        headers: { Authorization: authHeader }
      });
      if (!resp.ok) return [];
      const data: any = await resp.json();
      return (data.courses || []).map((c: any) => c._id);
    } catch {
      return [];
    }
  }
}
