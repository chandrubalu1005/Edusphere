import { IAssignment } from '../models/Assignment';

export class DeadlineEngine {
  
  /**
   * Evaluates if a given student's submission is late, and calculates the penalty.
   */
  static evaluateDeadline(
    assignment: IAssignment, 
    studentId: string, 
    submittedAt: Date = new Date()
  ): { isLate: boolean; lateDays: number; penaltyApplied: number } {
    
    // Check if the student has a specific deadline override
    let activeDueDate = assignment.dueDate;
    if (assignment.deadlineOverrides && assignment.deadlineOverrides.length > 0) {
      const override = assignment.deadlineOverrides.find((o) => o.studentId === studentId);
      if (override) {
        activeDueDate = new Date(override.dueDate);
      }
    }

    const isLate = submittedAt > activeDueDate;
    let lateDays = 0;
    let penalty = 0;

    if (isLate) {
      // Calculate full days late (ceiling)
      const diffTime = Math.abs(submittedAt.getTime() - activeDueDate.getTime());
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Max penalty is 100%
      penalty = Math.min(lateDays * (assignment.latePenalty || 0), 100);
    }

    return {
      isLate,
      lateDays,
      penaltyApplied: penalty
    };
  }

  /**
   * Applies the calculated penalty to a raw grade.
   */
  static calculateFinalGrade(rawGrade: number, penaltyPercentage: number): number {
    return Math.max(0, Math.round(rawGrade * (1 - (penaltyPercentage / 100))));
  }
}
