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
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('registrar', 'superadmin'), getRegistrarDashboardStats);

// CORs
router.get('/cors', authenticate, authorize('registrar', 'superadmin'), getAllCORs);
router.post('/cors/generate', authenticate, authorize('registrar', 'superadmin'), generateCOR);
router.put('/cors/:id/approve', authenticate, authorize('registrar', 'superadmin'), approveCOR);

// Clearances
router.get('/clearances', authenticate, authorize('registrar', 'superadmin'), getAllClearances);
router.post('/clearances', authenticate, authorize('registrar', 'superadmin'), createClearance);
router.put('/clearances/:id/resolve', authenticate, authorize('registrar', 'superadmin'), resolveClearance);

export default router;
