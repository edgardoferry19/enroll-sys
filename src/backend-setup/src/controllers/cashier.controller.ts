import { Request, Response } from 'express';
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
      // Also mark enrollment as Enrolled if it's an enrollment transaction
      const tx = await query('SELECT enrollment_id FROM transactions WHERE id = ?', [id]);
      if (tx[0]?.enrollment_id) {
        await run(`UPDATE enrollments SET status = 'Enrolled', updated_at = datetime('now') WHERE id = ?`, [tx[0].enrollment_id]);
      }
    } else if (action === 'reject') {
      await run(`UPDATE transactions SET status = 'Rejected', processed_by = ?, remarks = ?, updated_at = datetime('now') WHERE id = ?`, [userId, remarks || null, id]);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Log activity
    await run('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)', [userId, 'PROCESS_TRANSACTION', 'transaction', id, `Processed transaction ${id} (${action})`]);

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

export default { listPendingTransactions, listTransactions, processTransaction, cashierReport };
