import express from 'express';
import {
  getAllCORs,
  generateCOR,
  approveCOR,
  getAllClearances,
  createClearance,
  resolveClearance,
  getRegistrarDashboardStats
} from '../controllers/registrar.controller';
import { assessEnrollment, verifyPayment } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('registrar', 'superadmin'), getRegistrarDashboardStats);

// Enrollment Assessment & Payment Verification
router.put('/enrollments/:id/assess', authenticate, authorize('registrar', 'superadmin'), assessEnrollment);
router.put('/enrollments/:id/verify-payment', authenticate, authorize('registrar', 'superadmin'), verifyPayment);

// CORs
router.get('/cors', authenticate, authorize('registrar', 'superadmin'), getAllCORs);
router.post('/cors/generate', authenticate, authorize('registrar', 'superadmin'), generateCOR);
router.put('/cors/:id/approve', authenticate, authorize('registrar', 'superadmin'), approveCOR);

// Clearances
router.get('/clearances', authenticate, authorize('registrar', 'superadmin'), getAllClearances);
router.post('/clearances', authenticate, authorize('registrar', 'superadmin'), createClearance);
router.put('/clearances/:id/resolve', authenticate, authorize('registrar', 'superadmin'), resolveClearance);

// Section assignment
import { assignStudentToSection, getEnrollmentReport } from '../controllers/registrar.controller';
router.post('/sections/assign', authenticate, authorize('registrar', 'admin', 'superadmin'), assignStudentToSection);

// Reports
router.get('/reports/enrollments', authenticate, authorize('registrar', 'admin', 'superadmin'), getEnrollmentReport);

export default router;
