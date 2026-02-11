import { Router } from 'express';
import cashier from '../controllers/cashier.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/transactions/pending', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listPendingTransactions);
router.get('/transactions', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listTransactions);
router.put('/transactions/:id/process', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.processTransaction);
router.get('/reports/summary', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.cashierReport);
router.get('/assessments', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listTuitionAssessments);
router.put('/enrollments/:id/approve-assessment', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.approveTuitionAssessment);

export default router;
