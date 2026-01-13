import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentEnrollments,
  uploadDocument
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

router.get('/profile', authenticate, authorize('student'), getStudentProfile);
router.put('/profile', authenticate, authorize('student'), updateStudentProfile);
router.get('/enrollments', authenticate, authorize('student'), getStudentEnrollments);
router.post('/documents', authenticate, authorize('student'), upload.single('document'), uploadDocument);

export default router;
