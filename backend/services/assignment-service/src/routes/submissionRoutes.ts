import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/pending', auth, requireRole('faculty', 'admin'), SubmissionController.getPendingSubmissions);
router.patch('/:submissionId/grade', auth, requireRole('faculty', 'admin'), SubmissionController.gradeSubmission);

// Additional routes for dispute logic would go here, following the same pattern

export default router;
