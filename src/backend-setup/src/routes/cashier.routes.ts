import { Router } from 'express';
import cashier from '../controllers/cashier.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/transactions/pending', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.listPendingTransactions);
router.put('/transactions/:id/process', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.processTransaction);
router.get('/reports/summary', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.cashierReport);

export default router;
