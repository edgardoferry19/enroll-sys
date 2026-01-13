import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  getDashboardStats
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getDashboardStats);

// Students
router.get('/students', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getAllStudents);
router.get('/students/:id', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getStudentById);
router.post('/students', authenticate, authorize('admin', 'superadmin'), createStudent);
router.put('/students/:id', authenticate, authorize('admin', 'superadmin'), updateStudent);
router.delete('/students/:id', authenticate, authorize('superadmin'), deleteStudent);

// Enrollments
router.get('/enrollments', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getAllEnrollments);
router.get('/enrollments/:id', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getEnrollmentById);
router.put('/enrollments/:id/status', authenticate, authorize('admin', 'superadmin', 'registrar'), updateEnrollmentStatus);

export default router;
