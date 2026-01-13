import { Response } from 'express';
import { query, run, get } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const createEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { school_year, semester } = req.body;

    // Get student ID
    const students = await query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const studentId = students[0].id;

    // Check if enrollment already exists for this period
    const existingEnrollments = await query(
      `SELECT id FROM enrollments 
       WHERE student_id = ? AND school_year = ? AND semester = ?`,
      [studentId, school_year, semester]
    );

    if (existingEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment already exists for this period'
      });
    }

    // Create enrollment
    const result = await run(
      `INSERT INTO enrollments (student_id, school_year, semester, status) 
       VALUES (?, ?, ?, 'Pending')`,
      [studentId, school_year, semester]
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: {
        id: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
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

    // Get enrollments with subject count
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
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getEnrollmentDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const enrollments = await query(
      'SELECT * FROM enrollments WHERE id = ?',
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Get enrolled subjects
    const subjects = await query(
      `SELECT es.*, s.subject_code, s.subject_name, s.units, s.description
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        enrollment: enrollments[0],
        subjects
      }
    });
  } catch (error) {
    console.error('Get enrollment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const addSubjectToEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subject_id, schedule, room, instructor } = req.body;

    // Check if enrollment exists and is in correct status
    const enrollments = await query(
      'SELECT * FROM enrollments WHERE id = ?',
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only allow adding subjects in Pending or Approved status
    if (!['Pending', 'Approved'].includes(enrollments[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add subjects to this enrollment'
      });
    }

    // Check if subject already added
    const existingSubjects = await query(
      'SELECT id FROM enrollment_subjects WHERE enrollment_id = ? AND subject_id = ?',
      [id, subject_id]
    );

    if (existingSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject already added to enrollment'
      });
    }

    // Add subject
    await run(
      `INSERT INTO enrollment_subjects 
        (enrollment_id, subject_id, schedule, room, instructor) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, subject_id, schedule, room, instructor]
    );

    // Update total units in enrollment
    const subjects = await query(
      `SELECT SUM(s.units) as total_units
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );

    await run(
      'UPDATE enrollments SET total_units = ? WHERE id = ?',
      [subjects[0]?.total_units || 0, id]
    );

    res.json({
      success: true,
      message: 'Subject added successfully'
    });
  } catch (error) {
    console.error('Add subject to enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const removeSubjectFromEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id, subjectId } = req.params;

    // Check enrollment status
    const enrollments = await query(
      'SELECT status FROM enrollments WHERE id = ?',
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only allow removing subjects in Pending or Approved status
    if (!['Pending', 'Approved'].includes(enrollments[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove subjects from this enrollment'
      });
    }

    // Remove subject
    await run(
      'DELETE FROM enrollment_subjects WHERE enrollment_id = ? AND subject_id = ?',
      [id, subjectId]
    );

    // Update total units
    const subjects = await query(
      `SELECT SUM(s.units) as total_units
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );

    await run(
      'UPDATE enrollments SET total_units = ? WHERE id = ?',
      [subjects[0]?.total_units || 0, id]
    );

    res.json({
      success: true,
      message: 'Subject removed successfully'
    });
  } catch (error) {
    console.error('Remove subject from enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const submitForAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if enrollment has subjects
    const subjects = await query(
      'SELECT COUNT(*) as count FROM enrollment_subjects WHERE enrollment_id = ?',
      [id]
    );

    if (subjects[0]?.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit enrollment without subjects'
      });
    }

    // Update status
    await run(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      ['For Assessment', id]
    );

    res.json({
      success: true,
      message: 'Enrollment submitted for assessment'
    });
  } catch (error) {
    console.error('Submit for assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
