import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const listPendingTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, school_year, semester } = req.query;

    let sql =
      `SELECT t.*, 
        e.student_id as enrollment_student_id, 
        e.school_year,
        e.semester,
        e.total_amount,
        e.tuition,
        e.registration,
        e.library,
        e.lab,
        e.id_fee,
        e.others,
        e.remarks as enrollment_remarks,
        s.student_id, 
        s.first_name || ' ' || s.last_name as student_name,
        s.course,
        s.year_level,
        d.file_path as receipt_path,
        d.file_name as receipt_filename,
        (e.total_amount - IFNULL((SELECT SUM(amount) FROM transactions WHERE enrollment_id = e.id AND status = 'Completed'),0)) as outstanding_balance
       FROM transactions t
       JOIN enrollments e ON t.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       LEFT JOIN documents d ON d.enrollment_id = e.id AND d.document_type = 'payment_receipt'
       WHERE 1=1`;
    const params: any[] = [];

    sql += ' AND t.status = ?';
    params.push(status || 'Pending');

    if (search) {
      sql += ' AND (s.student_id LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (school_year) {
      sql += ' AND e.school_year = ?';
      params.push(school_year);
    }
    if (semester) {
      sql += ' AND e.semester = ?';
      params.push(semester);
    }

    sql += ' ORDER BY t.created_at DESC';

    const txs = await query(sql, params);
    res.json({ success: true, data: txs });
  } catch (error) {
    console.error('List pending transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// All transactions with filters for logs/history
export const listTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, school_year, semester } = req.query;

    let sql =
      `SELECT t.*, e.school_year, e.semester, e.total_amount,
              s.student_id, s.first_name || ' ' || s.last_name as student_name,
              s.course, s.year_level,
              (SELECT username FROM users WHERE id = t.processed_by) as processed_by_name
       FROM transactions t
       JOIN enrollments e ON t.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       WHERE 1=1`;
    const params: any[] = [];

    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (s.student_id LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR t.reference_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (school_year) { sql += ' AND e.school_year = ?'; params.push(school_year); }
    if (semester) { sql += ' AND e.semester = ?'; params.push(semester); }

    sql += ' ORDER BY t.created_at DESC';

    const rows = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const processTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // transaction id
    const { action, remarks } = req.body; // action: 'complete' | 'reject'
    const userId = req.user?.id;

    if (!id) return res.status(400).json({ success: false, message: 'Transaction id required' });

    if (action === 'complete') {
      await run(`UPDATE transactions SET status = 'Completed', processed_by = ?, remarks = ?, updated_at = datetime('now') WHERE id = ?`, [userId, remarks || null, id]);

      // Fetch transaction + enrollment + student info
      const txRows = await query(
        `SELECT t.*, e.id as enrollment_id, e.student_id as student_db_id, s.user_id as student_user_id, s.student_id as student_code, s.first_name, s.last_name
         FROM transactions t
         JOIN enrollments e ON t.enrollment_id = e.id
         JOIN students s ON e.student_id = s.id
         WHERE t.id = ?`,
        [id]
      );

      const txInfo = txRows[0] || null;

      // Mark enrollment as Enrolled if it's an enrollment transaction
      if (txInfo?.enrollment_id) {
        await run(`UPDATE enrollments SET status = 'Enrolled', updated_at = datetime('now') WHERE id = ?`, [txInfo.enrollment_id]);
      }

      // Generate a simple official receipt file and save to uploads/documents
      try {
        const documentsDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
        fs.mkdirSync(documentsDir, { recursive: true });
        const fileName = `official_receipt_tx_${id}.txt`;
        const filePath = path.join(documentsDir, fileName);
        const fileUrl = `/uploads/documents/${encodeURIComponent(fileName)}`;
        const content = [] as string[];
        content.push('OFFICIAL RECEIPT');
        content.push(`Transaction ID: ${id}`);
        if (txInfo) {
          content.push(`Student: ${txInfo.first_name} ${txInfo.last_name} (${txInfo.student_code})`);
          content.push(`Enrollment ID: ${txInfo.enrollment_id}`);
          content.push(`Amount: ₱${(txInfo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
          content.push(`Payment Method: ${txInfo.payment_method || 'N/A'}`);
          content.push(`Reference: ${txInfo.reference_number || 'N/A'}`);
        }
        content.push(`Processed By (user id): ${userId}`);
        content.push(`Date: ${new Date().toLocaleString()}`);

        fs.writeFileSync(filePath, content.join('\n'), 'utf-8');
        const stats = fs.statSync(filePath);

        // Insert document record
        try {
          await run(
            `INSERT INTO documents (student_id, enrollment_id, document_type, file_name, file_path, file_size, status, verified_by, verified_at)
             VALUES (?, ?, ?, ?, ?, ?, 'Verified', ?, datetime('now'))`,
            [txInfo?.student_db_id || null, txInfo?.enrollment_id || null, 'official_receipt', fileName, fileUrl, stats.size, userId]
          );
        } catch (docErr) {
          console.warn('Failed to insert official receipt document record:', docErr);
        }
      } catch (fsErr) {
        console.warn('Failed generating official receipt file:', fsErr);
      }

      // Log activity
      const logRes = await run('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)', [userId, 'PAYMENT_APPROVED', 'transaction', id, `Payment approved for transaction ${id}`]);
      const logId = logRes.lastInsertRowid;

      // Notify student if possible
      try {
        const studentUserId = txInfo?.student_user_id;
        if (studentUserId) {
          await run('INSERT INTO notifications (user_id, activity_log_id, is_read) VALUES (?, ?, 0)', [studentUserId, logId]);
        }
      } catch (notifErr) {
        console.warn('Failed to create notification for student after payment approval:', notifErr);
      }

    } else if (action === 'reject') {
      await run(`UPDATE transactions SET status = 'Rejected', processed_by = ?, remarks = ?, updated_at = datetime('now') WHERE id = ?`, [userId, remarks || null, id]);

      // Fetch transaction + student info for notification
      const txRows = await query(
        `SELECT t.*, e.student_id as student_db_id, s.user_id as student_user_id
         FROM transactions t
         JOIN enrollments e ON t.enrollment_id = e.id
         JOIN students s ON e.student_id = s.id
         WHERE t.id = ?`,
        [id]
      );
      const txInfo = txRows[0] || null;

      // Log activity
      const logRes = await run('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)', [userId, 'PAYMENT_REJECTED', 'transaction', id, `Payment rejected for transaction ${id}`]);
      const logId = logRes.lastInsertRowid;

      // Notify student if possible
      try {
        const studentUserId = txInfo?.student_user_id;
        if (studentUserId) {
          await run('INSERT INTO notifications (user_id, activity_log_id, is_read) VALUES (?, ?, 0)', [studentUserId, logId]);
        }
      } catch (notifErr) {
        console.warn('Failed to create notification for student after payment rejection:', notifErr);
      }

    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    res.json({ success: true, message: 'Transaction processed' });
  } catch (error) {
    console.error('Process transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cashierReport = async (req: AuthRequest, res: Response) => {
  try {
    const totalCollected = await query(`SELECT SUM(amount) as total FROM transactions WHERE status = 'Completed'`);
    const pending = await query(`SELECT COUNT(*) as total FROM transactions WHERE status = 'Pending'`);
    const outstanding = await query(
      `SELECT SUM(e.total_amount - IFNULL(p.paid,0)) as balance
       FROM enrollments e
       LEFT JOIN (
         SELECT enrollment_id, SUM(amount) as paid
         FROM transactions
         WHERE status = 'Completed'
         GROUP BY enrollment_id
       ) p ON p.enrollment_id = e.id
       WHERE e.status != 'Rejected'`
    );
    res.json({ success: true, data: { totalCollected: totalCollected[0]?.total || 0, pending: pending[0]?.total || 0, outstanding: outstanding[0]?.balance || 0 } });
  } catch (error) {
    console.error('Cashier report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// List enrollments ready for cashier assessment review (status = 'For Payment')
export const listTuitionAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query(
      `SELECT e.*, s.student_id, s.first_name || ' ' || s.last_name as student_name,
         s.course, s.year_level
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.status = 'For Payment'
       ORDER BY e.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('List tuition assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cashier: Approve assessment -> lock and mark Ready for Payment
export const approveTuitionAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const enrollments = await query('SELECT * FROM enrollments WHERE id = ?', [id]);
    if (enrollments.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollments[0].status !== 'For Payment') {
      return res.status(400).json({ success: false, message: 'Enrollment is not in For Payment status' });
    }

    await run(
      `UPDATE enrollments SET status = 'Ready for Payment', approved_by = ?, approved_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [userId, id]
    );

    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'CASHIER_APPROVE_ASSESSMENT', 'enrollment', id, 'Cashier approved tuition assessment']
    );

    res.json({ success: true, message: 'Tuition assessment approved and marked Ready for Payment' });
  } catch (error) {
    console.error('Approve tuition assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { listPendingTransactions, listTransactions, processTransaction, cashierReport, listTuitionAssessments, approveTuitionAssessment };
