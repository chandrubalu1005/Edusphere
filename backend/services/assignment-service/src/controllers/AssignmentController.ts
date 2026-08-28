import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment';
import { OutboxEvent } from '../models/OutboxEvent';
import { CourseVerification } from '../services/CourseVerification';
import { logger } from '../events/rabbitmq';

export class AssignmentController {
  
  static async getAssignments(req: Request, res: Response) {
    try {
      const { courseId, status, page = 1, limit = 20 } = req.query;
      const user = (req as any).user;
      const filter: any = {};
      
      if (courseId) filter.courseId = courseId;
      if (status)   filter.status = status;
      if (user.role === 'faculty') filter.createdBy = user.userId;

      if (user.role === 'student') {
        const enrolledIds = await CourseVerification.getEnrolledCourseIds(user.userId, req.headers.authorization as string);
        if (courseId) {
           if (!enrolledIds.includes(String(courseId))) {
              filter.courseId = null; // Deny
           }
        } else {
           filter.courseId = { $in: enrolledIds };
        }
      }
      
      const assignments = await Assignment.find(filter)
        .sort({ dueDate: 1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Math.min(Number(limit), 1000));
        
      const total = await Assignment.countDocuments(filter);
      res.json({ assignments, total });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  }

  static async getAssignment(req: Request, res: Response) {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ error: 'Not found' });
      res.json(assignment);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  }

  static async createAssignment(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = (req as any).user;
      
      if (user.role === 'faculty' && req.body.courseId) {
        const isOwner = await CourseVerification.verifyFacultyOwnership(req.body.courseId, user.userId, req.headers.authorization as string);
        if (!isOwner) {
          await session.abortTransaction();
          return res.status(403).json({ error: 'Access denied: You do not own this course' });
        }
      }

      const assignment = new Assignment({ ...req.body, createdBy: user.userId });
      await assignment.save({ session });

      if (assignment.status === 'published') {
        const outboxEvent = new OutboxEvent({
          eventType: 'assignment.published',
          payload: {
            assignmentId: assignment._id,
            courseId: assignment.courseId,
            title: assignment.title,
            dueDate: assignment.dueDate
          }
        });
        await outboxEvent.save({ session });
      }

      await session.commitTransaction();
      logger.info(`Assignment created: ${assignment._id}`);
      res.status(201).json(assignment);
    } catch (err: any) {
      await session.abortTransaction();
      if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
      res.status(500).json({ error: 'Failed to create assignment' });
    } finally {
      session.endSession();
    }
  }

  static async updateAssignment(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = (req as any).user;
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Not found' });
      }

      if (user.role === 'faculty') {
        const isOwner = await CourseVerification.verifyFacultyOwnership(assignment.courseId, user.userId, req.headers.authorization as string);
        if (!isOwner) {
           await session.abortTransaction();
           return res.status(403).json({ error: 'Access denied' });
        }
      }

      const wasDraft = assignment.status === 'draft';
      
      Object.assign(assignment, req.body);
      // increment version explicitly or rely on mongoose optimistic concurrency if enabled
      
      await assignment.save({ session });

      // If it transitioned from draft to published, dispatch event
      if (wasDraft && assignment.status === 'published') {
        const outboxEvent = new OutboxEvent({
          eventType: 'assignment.published',
          payload: {
            assignmentId: assignment._id,
            courseId: assignment.courseId,
            title: assignment.title,
            dueDate: assignment.dueDate
          }
        });
        await outboxEvent.save({ session });
      }

      await session.commitTransaction();
      res.json(assignment);
    } catch (err: any) {
      await session.abortTransaction();
      const isVersionConflict = err.name === 'VersionError'
        || err.message?.includes('No matching document')
        || err.message?.includes('version')
        || (err.codeName === 'WriteConflict')
        || (err.errorLabels?.includes('TransientTransactionError'));
      if (isVersionConflict) {
        return res.status(409).json({ error: 'Conflict: Document was modified by another request. Please refresh and retry.' });
      }
      res.status(500).json({ error: 'Failed to update assignment', detail: err.message });
    } finally {
      session.endSession();
    }
  }

  static async deleteAssignment(req: Request, res: Response) {
    try {
      await Assignment.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  }
}
