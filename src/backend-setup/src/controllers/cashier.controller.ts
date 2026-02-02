import { Request, Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const listPendingTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const txs = await query(
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
        d.file_name as receipt_filename
       FROM transactions t
       JOIN enrollments e ON t.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       LEFT JOIN documents d ON d.enrollment_id = e.id AND d.document_type = 'payment_receipt'
       WHERE t.status = 'Pending'
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: txs });
  } catch (error) {
    console.error('List pending transactions error:', error);
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
    res.json({ success: true, data: { totalCollected: totalCollected[0]?.total || 0, pending: pending[0]?.total || 0 } });
  } catch (error) {
    console.error('Cashier report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { listPendingTransactions, processTransaction, cashierReport };
