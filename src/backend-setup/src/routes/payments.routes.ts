import { Router } from 'express';
import payments from '../controllers/payments.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Assessment and payment history - authenticated users and appropriate roles
router.get('/assessment/:studentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.getAssessment);
router.get('/student/:studentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.listPayments);

// Add a payment (students can submit, cashier/admin can also add)
router.post('/student/:studentId', authenticate, authorize('student', 'cashier', 'admin', 'superadmin'), payments.addPayment);

export default router;
