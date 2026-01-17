import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// COR Management
export const getAllCORs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, studentId } = req.query;

    let sql = `
      SELECT 
        c.*,
        s.student_id,
        s.first_name || ' ' || s.last_name as student_name,
        s.course,
        e.school_year,
        e.semester
      FROM cors c
      JOIN students s ON c.student_id = s.id
      JOIN enrollments e ON c.enrollment_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (studentId) {
      sql += ' AND s.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const cors = await query(sql, params);

    res.json({
      success: true,
      data: cors
    });
  } catch (error) {
    console.error('Get all CORs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const generateCOR = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.body;
    const userId = req.user?.id;

    // Get enrollment details
    const enrollments = await query(
      `SELECT e.*, s.id as student_id, s.student_id as student_number
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.id = ?`,
      [enrollmentId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    // Generate COR number
    const corNumber = `COR-${enrollment.student_number}-${enrollment.school_year.replace('-', '')}-${Date.now()}`;

    // Check if COR already exists
    const existing = await query('SELECT * FROM cors WHERE enrollment_id = ?', [enrollmentId]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'COR already exists for this enrollment'
      });
    }

    const result = await run(
      `INSERT INTO cors 
        (student_id, enrollment_id, cor_number, status, generated_at, generated_by)
       VALUES (?, ?, ?, 'Generated', datetime('now'), ?)`,
      [enrollment.student_id, enrollmentId, corNumber, userId]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'GENERATE_COR', 'cor', result.lastInsertRowid, `Generated COR ${corNumber}`]
    );

    res.status(201).json({
      success: true,
      message: 'COR generated successfully',
      data: { id: result.lastInsertRowid, cor_number: corNumber }
    });
  } catch (error) {
    console.error('Generate COR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const approveCOR = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await run(
      `UPDATE cors SET 
        status = 'Approved',
        updated_at = datetime('now')
      WHERE id = ?`,
      [id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_COR', 'cor', id, 'Approved COR']
    );

    res.json({
      success: true,
      message: 'COR approved successfully'
    });
  } catch (error) {
    console.error('Approve COR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Clearances Management
export const getAllClearances = async (req: AuthRequest, res: Response) => {
  try {
    const { status, clearance_type, studentId } = req.query;

    let sql = `
      SELECT 
        c.*,
        s.student_id,
        s.first_name || ' ' || s.last_name as student_name,
        s.course,
        u.username as resolved_by_name
      FROM clearances c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN users u ON c.resolved_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (clearance_type) {
      sql += ' AND c.clearance_type = ?';
      params.push(clearance_type);
    }
    if (studentId) {
      sql += ' AND s.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const clearances = await query(sql, params);

    res.json({
      success: true,
      data: clearances
    });
  } catch (error) {
    console.error('Get all clearances error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createClearance = async (req: AuthRequest, res: Response) => {
  try {
    const { student_id, clearance_type, issue_description } = req.body;

    const result = await run(
      `INSERT INTO clearances 
        (student_id, clearance_type, issue_description, status)
       VALUES (?, ?, ?, 'Pending')`,
      [student_id, clearance_type, issue_description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Clearance created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('Create clearance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const resolveClearance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.id;

    await run(
      `UPDATE clearances SET 
        status = 'Cleared',
        resolved_at = datetime('now'),
        resolved_by = ?,
        remarks = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [userId, remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'RESOLVE_CLEARANCE', 'clearance', id, 'Resolved clearance']
    );

    res.json({
      success: true,
      message: 'Clearance resolved successfully'
    });
  } catch (error) {
    console.error('Resolve clearance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get registrar dashboard stats
export const getRegistrarDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Total student records
    const totalRecords = await query('SELECT COUNT(*) as count FROM students WHERE status = ?', ['Active']);

    // Pending grades (enrollment_subjects without grades)
    const pendingGrades = await query(
      `SELECT COUNT(*) as count 
       FROM enrollment_subjects es
       JOIN enrollments e ON es.enrollment_id = e.id
       WHERE es.grade IS NULL OR es.grade = ''
       AND e.status = 'Approved'`
    );

    // COR requests
    const corRequests = await query(
      "SELECT COUNT(*) as count FROM cors WHERE status = 'Pending'"
    );

    // Clearances
    const clearances = await query(
      "SELECT COUNT(*) as count FROM clearances WHERE status = 'Pending'"
    );

    res.json({
      success: true,
      data: {
        totalRecords: totalRecords[0]?.count || 0,
        pendingGrades: pendingGrades[0]?.count || 0,
        corRequests: corRequests[0]?.count || 0,
        clearances: clearances[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get registrar dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
