import express from 'express';
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  getAllSchoolYears,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  getAllSubjectsByType,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Sections
router.get('/sections', authenticate, authorize('admin', 'superadmin'), getAllSections);
router.post('/sections', authenticate, authorize('admin', 'superadmin'), createSection);
router.put('/sections/:id', authenticate, authorize('admin', 'superadmin'), updateSection);
router.delete('/sections/:id', authenticate, authorize('admin', 'superadmin'), deleteSection);

// School Years
router.get('/school-years', authenticate, authorize('admin', 'superadmin'), getAllSchoolYears);
router.post('/school-years', authenticate, authorize('admin', 'superadmin'), createSchoolYear);
router.put('/school-years/:id', authenticate, authorize('admin', 'superadmin'), updateSchoolYear);
router.delete('/school-years/:id', authenticate, authorize('admin', 'superadmin'), deleteSchoolYear);

// Subjects (SHS and College)
router.get('/subjects', authenticate, authorize('admin', 'superadmin', 'dean'), getAllSubjectsByType);
router.post('/subjects', authenticate, authorize('admin', 'superadmin', 'dean'), createSubject);
router.put('/subjects/:id', authenticate, authorize('admin', 'superadmin', 'dean'), updateSubject);
router.delete('/subjects/:id', authenticate, authorize('admin', 'superadmin'), deleteSubject);

export default router;
