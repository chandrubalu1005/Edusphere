import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { OutboxEvent } from '../models/OutboxEvent';
import { DeadlineEngine } from '../services/DeadlineEngine';
import { CourseVerification } from '../services/CourseVerification';
import { FileStorageService } from '../services/FileStorageService';
import { logger } from '../events/rabbitmq';

export class SubmissionController {

  static async submitAssignment(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = (req as any).user;
      const file = req.file;
      if (!file) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
         await session.abortTransaction();
         return res.status(404).json({ error: 'Assignment not found' });
      }
      if (assignment.status !== 'published') {
         await session.abortTransaction();
         return res.status(400).json({ error: 'Assignment is not accepting submissions' });
      }

      const isEnrolled = await CourseVerification.verifyStudentEnrollment(assignment.courseId, user.userId, req.headers.authorization as string);
      if (!isEnrolled) {
         await session.abortTransaction();
         return res.status(403).json({ error: 'Access denied: You are not enrolled in this course' });
      }

      const existingCount = await Submission.countDocuments({ assignmentId: assignment._id, studentId: user.userId }).session(session);
      if (existingCount > 0 && !assignment.allowResubmit) {
         await session.abortTransaction();
         return res.status(400).json({ error: 'Resubmission not allowed for this assignment' });
      }

      // Deadline Engine evaluates penalty
      const deadlineResult = DeadlineEngine.evaluateDeadline(assignment, user.userId, new Date());

      // Mock plagiarism score
      const plagiarismScore = Math.floor(Math.random() * 30);
      const plagiarismFlags = plagiarismScore > 20 ? ['High similarity detected'] : [];

      const submission = new Submission({
        assignmentId: assignment._id,
        studentId:    user.userId,
        fileUrl:      FileStorageService.getFileUrl(assignment._id as any, file.filename),
        fileName:     file.originalname,
        fileSize:     file.size,
        mimeType:     file.mimetype,
        remarks:      req.body.remarks || '',
        isLate:       deadlineResult.isLate,
        lateDays:     deadlineResult.lateDays,
        penaltyApplied: deadlineResult.penaltyApplied,
        attempt:      existingCount + 1,
        plagiarismScore,
        plagiarismFlags,
      });

      await submission.save({ session });

      const outboxEvent = new OutboxEvent({
        eventType: 'submission.submitted',
        payload: {
          submissionId: submission._id,
          assignmentId: assignment._id,
          studentId: user.userId,
          courseId: assignment.courseId,
          isLate: submission.isLate,
          attempt: submission.attempt
        }
      });
      await outboxEvent.save({ session });

      await session.commitTransaction();
      logger.info(`Submission successful: student=${user.userId} assignment=${assignment._id}`);
      res.status(201).json(submission);
    } catch (err: any) {
      await session.abortTransaction();
      if (err.code === 11000) {
         return res.status(409).json({ error: 'A submission for this attempt is already in progress. Please wait.' });
      }
      res.status(500).json({ error: err.message || 'Failed to submit' });
    } finally {
      session.endSession();
    }
  }

  static async getSubmissions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
      
      if (user.role === 'faculty') {
        const isOwner = await CourseVerification.verifyFacultyOwnership(assignment.courseId, user.userId, req.headers.authorization as string);
        if (!isOwner) return res.status(403).json({ error: 'Access denied: You do not own this course' });
      }

      const submissions = await Submission
        .find({ assignmentId: req.params.id })
        .sort({ submittedAt: -1 });

      const stats = {
        total:   submissions.length,
        graded:  submissions.filter(s => s.status === 'graded').length,
        late:    submissions.filter(s => s.isLate).length,
        avgGrade: submissions.filter(s => s.finalGrade !== null).length
          ? Math.round(submissions.reduce((sum, s) => sum + (s.finalGrade || 0), 0) / submissions.filter(s => s.finalGrade !== null).length)
          : null,
      };
      res.json({ submissions, stats });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  static async getMySubmission(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const submission = await Submission.findOne({ assignmentId: req.params.id, studentId: user.userId }).sort({ attempt: -1 });
      res.json(submission);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch submission' });
    }
  }

  static async gradeSubmission(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = (req as any).user;
      const { grade, feedback, rubricGrades } = req.body;
      if (typeof grade !== 'number') {
         await session.abortTransaction();
         return res.status(400).json({ error: 'grade must be a number' });
      }

      const submission = await Submission.findById(req.params.submissionId);
      if (!submission) {
         await session.abortTransaction();
         return res.status(404).json({ error: 'Submission not found' });
      }

      const assignment = await Assignment.findById(submission.assignmentId);
      if (!assignment) {
         await session.abortTransaction();
         return res.status(404).json({ error: 'Assignment not found' });
      }

      if (user.role === 'faculty') {
        const isOwner = await CourseVerification.verifyFacultyOwnership(assignment.courseId, user.userId, req.headers.authorization as string);
        if (!isOwner) {
           await session.abortTransaction();
           return res.status(403).json({ error: 'Access denied: You do not own this course' });
        }
      }

      const finalGrade = DeadlineEngine.calculateFinalGrade(grade, submission.penaltyApplied || 0);
      const passed = finalGrade >= assignment.passMarks;
      const percentage = Math.round((finalGrade / assignment.totalMarks) * 100);

      submission.grade = grade;
      submission.feedback = feedback || '';
      submission.rubricGrades = rubricGrades || [];
      submission.finalGrade = finalGrade;
      submission.status = 'graded';
      submission.gradedBy = user.userId;
      submission.gradedAt = new Date();

      await submission.save({ session });

      const outboxEvent = new OutboxEvent({
        eventType: 'assessment.graded',
        payload: {
          studentId: submission.studentId,
          courseId: assignment.courseId,
          assessmentId: assignment._id,
          score: finalGrade,
          totalMarks: assignment.totalMarks,
          percentage: percentage,
          passed: passed
        }
      });
      await outboxEvent.save({ session });

      await session.commitTransaction();
      res.json(submission);
    } catch (err: any) {
      await session.abortTransaction();
      if (err.name === 'VersionError') {
        return res.status(409).json({ error: 'Conflict: Document was modified by another request' });
      }
      res.status(500).json({ error: 'Failed to grade submission' });
    } finally {
      session.endSession();
    }
  }
}
