import express from 'express';
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getCurriculumByProgram,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getDeanDashboardStats
} from '../controllers/dean.controller';
import { approveSubjectSelection } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('dean', 'superadmin'), getDeanDashboardStats);

// Enrollment Subject Approval
router.put('/enrollments/:id/approve-subjects', authenticate, authorize('dean', 'superadmin'), approveSubjectSelection);

// Programs
router.get('/programs', authenticate, authorize('dean', 'superadmin'), getAllPrograms);
router.get('/programs/:id', authenticate, authorize('dean', 'superadmin'), getProgramById);
router.post('/programs', authenticate, authorize('dean', 'superadmin'), createProgram);
router.put('/programs/:id', authenticate, authorize('dean', 'superadmin'), updateProgram);
router.delete('/programs/:id', authenticate, authorize('dean', 'superadmin'), deleteProgram);

// Curriculum
router.get('/programs/:programId/curriculum', authenticate, authorize('dean', 'superadmin'), getCurriculumByProgram);
router.post('/curriculum', authenticate, authorize('dean', 'superadmin'), addSubjectToCurriculum);
router.delete('/curriculum/:id', authenticate, authorize('dean', 'superadmin'), removeSubjectFromCurriculum);

export default router;
