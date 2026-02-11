import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query } from '../database/connection';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const paymentsFile = path.join(dataDir, 'payments.json');

function readPayments() { try { return JSON.parse(fs.readFileSync(paymentsFile, 'utf8') || '[]'); } catch (e) { return []; } }
function writePayments(items: any[]) { fs.writeFileSync(paymentsFile, JSON.stringify(items, null, 2)); }

export const getAssessment = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    // Try to find the latest enrollment for this student (by student.student_id)
    const rows = await query(
      `SELECT e.* FROM enrollments e JOIN students s ON e.student_id = s.id WHERE s.student_id = ? ORDER BY e.created_at DESC LIMIT 1`,
      [studentId]
    );

    const enrollment = rows && rows[0] ? rows[0] : null;

    // Compute assessment from enrollment if available, otherwise fallback to zeros
    let assessmentTotal = 0;
    let breakdown: any = { tuition: 0, misc: 0 };

    if (enrollment) {
      const tuition = Number(enrollment.tuition || 0);
      const registration = Number(enrollment.registration || 0);
      const library = Number(enrollment.library || 0);
      const lab = Number(enrollment.lab || 0);
      const id_fee = Number(enrollment.id_fee || 0);
      const others = Number(enrollment.others || 0);

      assessmentTotal = Number(enrollment.total_amount || tuition + registration + library + lab + id_fee + others);
      breakdown = { tuition, misc: registration + library + lab + id_fee + others };
    }

    const all = readPayments();
    const paymentsForStudent = all.filter((p: any) => p.studentId === studentId);
    const paid = paymentsForStudent.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const due = Math.max(assessmentTotal - paid, 0);
    const assessment = { studentId, total: assessmentTotal, paid, due, breakdown };
    res.json({ success: true, data: assessment });
  } catch (err) {
    console.error('Failed to compute assessment:', err);
    res.status(500).json({ success: false, message: 'Failed to compute assessment' });
  }
};

export const listPayments = (req: Request, res: Response) => {
  const { studentId } = req.params;
  const all = readPayments();
  res.json({ success: true, data: all.filter((p: any) => p.studentId === studentId) });
};

export const addPayment = (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { amount, method, reference } = req.body;
  const payments = readPayments();
  const entry = { id: Date.now().toString(), studentId, amount, method, reference, ts: new Date().toISOString() };
  payments.unshift(entry);
  writePayments(payments);
  res.json({ success: true, data: entry });
};

export default { getAssessment, listPayments, addPayment };
