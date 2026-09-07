import { Router } from 'express';
import { AssignmentController } from '../controllers/AssignmentController';
import { SubmissionController } from '../controllers/SubmissionController';
import { auth, requireRole } from '../middleware/auth';
import { fileUploadMiddleware } from '../services/FileStorageService';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'assignment-service' }));

// Assignment Routes
router.get('/stats', auth, AssignmentController.getAssignmentStats);
router.get('/', auth, AssignmentController.getAssignments);
router.get('/:id', auth, AssignmentController.getAssignment);
router.post('/', auth, requireRole('faculty', 'admin'), AssignmentController.createAssignment);
router.patch('/:id', auth, requireRole('faculty', 'admin'), AssignmentController.updateAssignment);
router.delete('/:id', auth, requireRole('faculty', 'admin'), AssignmentController.deleteAssignment);

// Submission Routes
router.post('/:id/submit', auth, requireRole('student'), fileUploadMiddleware.single('file'), SubmissionController.submitAssignment);
router.get('/:id/submissions', auth, requireRole('faculty', 'admin'), SubmissionController.getSubmissions);
router.get('/:id/submissions/mine', auth, requireRole('student'), SubmissionController.getMySubmission);

export default router;
