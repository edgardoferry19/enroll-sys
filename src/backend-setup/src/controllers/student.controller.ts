import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const students = await query(
      'SELECT * FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      first_name,
      middle_name,
      last_name,
      suffix,
      contact_number,
      address,
      birth_date,
      gender
    } = req.body;

    await run(
      `UPDATE students SET 
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        suffix = ?,
        contact_number = ?,
        address = ?,
        birth_date = ?,
        gender = ?,
        updated_at = datetime('now')
      WHERE user_id = ?`,
      [first_name, middle_name, last_name, suffix, contact_number, address, birth_date, gender, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getStudentEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get student ID
    const students = await query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = students[0].id;

    // Get enrollments
    const enrollments = await query(
      `SELECT e.*, 
        COUNT(es.id) as subject_count,
        SUM(s.units) as total_units
      FROM enrollments e
      LEFT JOIN enrollment_subjects es ON e.id = es.enrollment_id
      LEFT JOIN subjects s ON es.subject_id = s.id
      WHERE e.student_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { document_type, enrollment_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get student ID
    const students = await query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = students[0].id;

    // Insert document record
    const result = await run(
      `INSERT INTO documents 
        (student_id, enrollment_id, document_type, file_name, file_path, file_size) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, enrollment_id || null, document_type, file.originalname, file.path, file.size]
    );

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: result.lastInsertRowid,
        file_name: file.originalname,
        file_path: file.path
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
