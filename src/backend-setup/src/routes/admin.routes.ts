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
import {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../controllers/faculty.controller';
import { approveEnrollmentAssessment } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getDashboardStats);

// Students
router.get('/students', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getAllStudents);
router.get('/students/:id', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getStudentById);
router.post('/students', authenticate, authorize('admin', 'superadmin'), createStudent);
router.put('/students/:id', authenticate, authorize('admin', 'superadmin', 'registrar'), updateStudent);
router.delete('/students/:id', authenticate, authorize('superadmin'), deleteStudent);

// Teachers (Faculty)
router.get('/teachers', authenticate, authorize('admin', 'superadmin'), getAllFaculty);
router.get('/teachers/:id', authenticate, authorize('admin', 'superadmin'), getFacultyById);
router.post('/teachers', authenticate, authorize('admin', 'superadmin'), createFaculty);
router.put('/teachers/:id', authenticate, authorize('admin', 'superadmin'), updateFaculty);
router.delete('/teachers/:id', authenticate, authorize('admin', 'superadmin'), deleteFaculty);

// Enrollments
router.get('/enrollments', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getAllEnrollments);
router.get('/enrollments/:id', authenticate, authorize('admin', 'superadmin', 'dean', 'registrar'), getEnrollmentById);
router.put('/enrollments/:id/status', authenticate, authorize('admin', 'superadmin', 'registrar'), updateEnrollmentStatus);
router.put('/enrollments/:id/approve-assessment', authenticate, authorize('admin', 'superadmin'), approveEnrollmentAssessment);

export default router;
