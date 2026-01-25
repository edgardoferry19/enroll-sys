import { Response } from 'express';
import { query, run, get } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const createEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { school_year, semester } = req.body;

    // Validate input
    if (!school_year || !semester) {
      return res.status(400).json({ success: false, message: 'school_year and semester are required' });
    }

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

    // Create enrollment with status "Pending Assessment" when documents are submitted
    const result = await run(
      `INSERT INTO enrollments (student_id, school_year, semester, status) 
       VALUES (?, ?, ?, 'Pending Assessment')`,
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
    
    // Get the subject being added to know its units
    const subjectInfo = await query(
      'SELECT units FROM subjects WHERE id = ?',
      [subject_id]
    );
    const addedSubjectUnits = subjectInfo[0]?.units || 0;

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only allow adding subjects in "For Subject Selection" status
    if (enrollments[0].status !== 'For Subject Selection') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add subjects. Enrollment must be in "For Subject Selection" status.'
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

    const totalUnits = subjects[0]?.total_units || 0;
    
    // Get current enrollment to preserve assessment fees
    const currentEnrollment = await query(
      'SELECT total_amount, assessed_at FROM enrollments WHERE id = ?',
      [id]
    );
    
    // Calculate subject fees at 700 PHP per unit
    const subjectFees = totalUnits * 700;
    
    // Determine total amount: assessment fees + subject fees
    let totalAmount = subjectFees;
    
    if (currentEnrollment[0]?.assessed_at) {
      // Enrollment has been assessed
      const currentTotal = currentEnrollment[0].total_amount || 0;
      
      // If this is the first subject being added (totalUnits equals the units of subject just added),
      // then currentTotal contains only assessment fees
      if (totalUnits === addedSubjectUnits) {
        // First subject, currentTotal = assessment fees only
        totalAmount = currentTotal + subjectFees;
      } else {
        // Not first subject, need to extract assessment fees
        // Previous units before this addition
        const prevUnits = totalUnits - addedSubjectUnits;
        const prevSubjectFees = prevUnits * 700;
        const assessmentFees = currentTotal - prevSubjectFees;
        totalAmount = assessmentFees + subjectFees;
      }
    }

    await run(
      'UPDATE enrollments SET total_units = ?, total_amount = ? WHERE id = ?',
      [totalUnits, totalAmount, id]
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

    // Check enrollment status and get subject info
    const enrollments = await query(
      'SELECT * FROM enrollments WHERE id = ?',
      [id]
    );
    
    // Get the subject being removed to know its units
    const subjectInfo = await query(
      'SELECT units FROM subjects WHERE id = ?',
      [subjectId]
    );
    const removedSubjectUnits = subjectInfo[0]?.units || 0;

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only allow removing subjects in "For Subject Selection" status
    if (enrollments[0].status !== 'For Subject Selection') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove subjects. Enrollment must be in "For Subject Selection" status.'
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

    const totalUnits = subjects[0]?.total_units || 0;
    
    // Get current enrollment to preserve assessment fees
    const currentEnrollment = await query(
      'SELECT total_amount, assessed_at FROM enrollments WHERE id = ?',
      [id]
    );
    
    // Calculate subject fees at 700 PHP per unit (after removal)
    const subjectFees = totalUnits * 700;
    
    // Determine total amount: assessment fees + subject fees
    let totalAmount = subjectFees;
    
    if (currentEnrollment[0]?.assessed_at) {
      // Enrollment has been assessed, preserve assessment fees
      const currentTotal = currentEnrollment[0].total_amount || 0;
      
      // Previous units before removal = current units + removed units
      const prevUnits = totalUnits + removedSubjectUnits;
      const prevSubjectFees = prevUnits * 700;
      
      // Extract assessment fees: current_total - previous_subject_fees
      const assessmentFees = currentTotal - prevSubjectFees;
      totalAmount = assessmentFees + subjectFees;
    }

    await run(
      'UPDATE enrollments SET total_units = ?, total_amount = ? WHERE id = ?',
      [totalUnits, totalAmount, id]
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

    // Check if enrollment exists
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

    // Update status to "Pending Assessment" when student submits documents
    await run(
      "UPDATE enrollments SET status = ?, updated_at = datetime('now') WHERE id = ?",
      ['Pending Assessment', id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, 'SUBMIT_FOR_ASSESSMENT', 'enrollment', id, 'Enrollment submitted for assessment']
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

// Registrar: Assess enrollment and set fees
export const assessEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tuition, registration, library, lab, id_fee, others, remarks } = req.body;
    const userId = req.user?.id;

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

    if (enrollments[0].status !== 'Pending Assessment') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in Pending Assessment status'
      });
    }

    // Calculate assessment fees (base fees before subject fees)
    const assessmentFees = (tuition || 0) + (registration || 0) + (library || 0) + 
                          (lab || 0) + (id_fee || 0) + (others || 0);

    // Get current subject fees if any subjects have been added
    const currentSubjects = await query(
      `SELECT SUM(s.units) as total_units
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );
    const currentUnits = currentSubjects[0]?.total_units || 0;
    const currentSubjectFees = currentUnits * 700; // 700 PHP per unit
    
    // Total amount = assessment fees + subject fees (if any)
    const totalAmount = assessmentFees + currentSubjectFees;

    // Update enrollment with assessment and persist breakdown fees
    await run(
      `UPDATE enrollments SET 
        status = 'For Admin Approval',
        total_amount = ?,
        tuition = ?,
        registration = ?,
        library = ?,
        lab = ?,
        id_fee = ?,
        others = ?,
        assessed_by = ?,
        assessed_at = datetime('now'),
        remarks = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [totalAmount, tuition || 0, registration || 0, library || 0, lab || 0, id_fee || 0, others || 0, userId, remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'ASSESS_ENROLLMENT', 'enrollment', id, `Enrollment assessed: ₱${totalAmount.toFixed(2)}`]
    );

    res.json({
      success: true,
      message: 'Enrollment assessed successfully',
      data: {
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Assess enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Approve enrollment assessment (moves to "For Subject Selection")
export const approveEnrollmentAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.id;

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

    if (enrollments[0].status !== 'For Admin Approval') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in For Admin Approval status'
      });
    }

    // Update enrollment status
    await run(
      `UPDATE enrollments SET 
        status = 'For Subject Selection',
        approved_by = ?,
        approved_at = datetime('now'),
        remarks = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [userId, remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_ENROLLMENT_ASSESSMENT', 'enrollment', id, 'Enrollment assessment approved']
    );

    res.json({
      success: true,
      message: 'Enrollment assessment approved. Student can now select subjects.'
    });
  } catch (error) {
    console.error('Approve enrollment assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Student: Submit subjects for Dean approval
export const submitSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

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

    if (enrollments[0].status !== 'For Subject Selection') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in For Subject Selection status'
      });
    }

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

    // Calculate total units and update amount (assessment + subject fees)
    const subjTotals = await query(
      `SELECT SUM(s.units) as total_units
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );

    const totalUnits = subjTotals[0]?.total_units || 0;
    const subjectFees = totalUnits * 700; // 700 PHP per unit
    const totalAmount = (enrollments[0].total_amount || 0) + subjectFees;

    await run(
      `UPDATE enrollments SET 
        status = 'For Dean Approval',
        total_units = ?,
        total_amount = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [totalUnits, totalAmount, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, 'SUBMIT_SUBJECTS', 'enrollment', id, `Subjects submitted: ${totalUnits} units`]
    );

    res.json({
      success: true,
      message: 'Subjects submitted for Dean approval',
      data: {
        total_units: totalUnits,
        subject_fees: subjectFees,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Submit subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Dean: Approve subject selection (moves to "For Payment")
export const approveSubjectSelection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.id;

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

    if (enrollments[0].status !== 'For Dean Approval') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in For Dean Approval status'
      });
    }

    // Update enrollment status
    await run(
      `UPDATE enrollments SET 
        status = 'For Payment',
        remarks = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_SUBJECT_SELECTION', 'enrollment', id, 'Subject selection approved']
    );

    res.json({
      success: true,
      message: 'Subject selection approved. Student can now proceed to payment.'
    });
  } catch (error) {
    console.error('Approve subject selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Student: Submit payment (moves to "Payment Verification")
export const submitPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_method, reference_number, receipt_path, amount } = req.body;

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

    if (enrollments[0].status !== 'For Payment') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in For Payment status'
      });
    }

    // Create transaction record
    const transactionResult = await run(
      `INSERT INTO transactions 
        (enrollment_id, transaction_type, amount, payment_method, reference_number, status, remarks) 
       VALUES (?, 'Enrollment Fee', ?, ?, ?, 'Pending', ?)`,
      [id, amount || enrollments[0].total_amount, payment_method, reference_number, `Receipt: ${receipt_path || 'N/A'}`]
    );

    // Update enrollment status
    await run(
      `UPDATE enrollments SET 
        status = 'Payment Verification',
        updated_at = datetime('now')
       WHERE id = ?`,
      [id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, 'SUBMIT_PAYMENT', 'enrollment', id, `Payment submitted: ${payment_method} - ${reference_number}`]
    );

    res.json({
      success: true,
      message: 'Payment submitted for verification',
      data: {
        transaction_id: transactionResult.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Registrar: Verify payment (moves to "Enrolled")
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { transaction_id, remarks } = req.body;
    const userId = req.user?.id;

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

    if (enrollments[0].status !== 'Payment Verification') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is not in Payment Verification status'
      });
    }

    // Update transaction status
    if (transaction_id) {
      await run(
        `UPDATE transactions SET 
          status = 'Completed',
          processed_by = ?,
          remarks = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
        [userId, remarks || null, transaction_id]
      );
    }

    // Update enrollment status to Enrolled
    await run(
      `UPDATE enrollments SET 
        status = 'Enrolled',
        remarks = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'VERIFY_PAYMENT', 'enrollment', id, 'Payment verified. Enrollment completed.']
    );

    res.json({
      success: true,
      message: 'Payment verified. Student is now enrolled.'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
