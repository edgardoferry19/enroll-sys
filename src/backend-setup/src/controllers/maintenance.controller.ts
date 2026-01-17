import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// Sections Management
export const getAllSections = async (req: AuthRequest, res: Response) => {
  try {
    const { course, year_level, school_year, semester, status } = req.query;

    let sql = `
      SELECT s.*, f.first_name || ' ' || f.last_name as adviser_name
      FROM sections s
      LEFT JOIN faculty f ON s.adviser_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (course) {
      sql += ' AND s.course = ?';
      params.push(course);
    }
    if (year_level) {
      sql += ' AND s.year_level = ?';
      params.push(year_level);
    }
    if (school_year) {
      sql += ' AND s.school_year = ?';
      params.push(school_year);
    }
    if (semester) {
      sql += ' AND s.semester = ?';
      params.push(semester);
    }
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.section_code';

    const sections = await query(sql, params);

    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Get all sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createSection = async (req: AuthRequest, res: Response) => {
  try {
    const {
      section_code,
      section_name,
      course,
      year_level,
      school_year,
      semester,
      capacity,
      adviser_id
    } = req.body;

    const result = await run(
      `INSERT INTO sections 
        (section_code, section_name, course, year_level, school_year, semester, capacity, adviser_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [section_code, section_name, course, year_level, school_year, semester, capacity || 50, adviser_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'Section code already exists' : 'Server error'
    });
  }
};

export const updateSection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      section_code,
      section_name,
      course,
      year_level,
      school_year,
      semester,
      capacity,
      adviser_id,
      status
    } = req.body;

    await run(
      `UPDATE sections SET 
        section_code = ?, section_name = ?, course = ?, year_level = ?,
        school_year = ?, semester = ?, capacity = ?, adviser_id = ?, status = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [section_code, section_name, course, year_level, school_year, semester, capacity, adviser_id, status, id]
    );

    res.json({
      success: true,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteSection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM sections WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// School Years Management
export const getAllSchoolYears = async (req: AuthRequest, res: Response) => {
  try {
    const schoolYears = await query(
      'SELECT * FROM school_years ORDER BY school_year DESC'
    );

    res.json({
      success: true,
      data: schoolYears
    });
  } catch (error) {
    console.error('Get all school years error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createSchoolYear = async (req: AuthRequest, res: Response) => {
  try {
    const {
      school_year,
      start_date,
      end_date,
      enrollment_start,
      enrollment_end,
      is_active
    } = req.body;

    // If setting as active, deactivate others
    if (is_active) {
      await run('UPDATE school_years SET is_active = 0');
    }

    const result = await run(
      `INSERT INTO school_years 
        (school_year, start_date, end_date, enrollment_start, enrollment_end, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [school_year, start_date, end_date, enrollment_start, enrollment_end, is_active ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'School year created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create school year error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'School year already exists' : 'Server error'
    });
  }
};

export const updateSchoolYear = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      school_year,
      start_date,
      end_date,
      enrollment_start,
      enrollment_end,
      is_active
    } = req.body;

    // If setting as active, deactivate others
    if (is_active) {
      await run('UPDATE school_years SET is_active = 0 WHERE id != ?', [id]);
    }

    await run(
      `UPDATE school_years SET 
        school_year = ?, start_date = ?, end_date = ?,
        enrollment_start = ?, enrollment_end = ?, is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [school_year, start_date, end_date, enrollment_start, enrollment_end, is_active ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: 'School year updated successfully'
    });
  } catch (error) {
    console.error('Update school year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteSchoolYear = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM school_years WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'School year deleted successfully'
    });
  } catch (error) {
    console.error('Delete school year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Subjects Management (SHS and College)
export const getAllSubjectsByType = async (req: AuthRequest, res: Response) => {
  try {
    const { subject_type, course, year_level, semester } = req.query;

    let sql = 'SELECT * FROM subjects WHERE 1=1';
    const params: any[] = [];

    if (subject_type) {
      sql += ' AND subject_type = ?';
      params.push(subject_type);
    }
    if (course) {
      sql += ' AND course = ?';
      params.push(course);
    }
    if (year_level) {
      sql += ' AND year_level = ?';
      params.push(year_level);
    }
    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }

    sql += ' ORDER BY subject_code';

    const subjects = await query(sql, params);

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      subject_code,
      subject_name,
      description,
      units,
      course,
      year_level,
      semester,
      subject_type
    } = req.body;

    const result = await run(
      `INSERT INTO subjects 
        (subject_code, subject_name, description, units, course, year_level, semester, subject_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_code, subject_name, description || null, units, course || null, year_level || null, semester || null, subject_type || 'College']
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'Subject code already exists' : 'Server error'
    });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      subject_code,
      subject_name,
      description,
      units,
      course,
      year_level,
      semester,
      subject_type,
      is_active
    } = req.body;

    await run(
      `UPDATE subjects SET 
        subject_code = ?, subject_name = ?, description = ?, units = ?,
        course = ?, year_level = ?, semester = ?, subject_type = ?, is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [subject_code, subject_name, description, units, course, year_level, semester, subject_type, is_active ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM subjects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
