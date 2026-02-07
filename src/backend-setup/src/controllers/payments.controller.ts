import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const paymentsFile = path.join(dataDir, 'payments.json');

function readPayments() { try { return JSON.parse(fs.readFileSync(paymentsFile, 'utf8') || '[]'); } catch (e) { return []; } }
function writePayments(items: any[]) { fs.writeFileSync(paymentsFile, JSON.stringify(items, null, 2)); }

export const getAssessment = (req: Request, res: Response) => {
  const { studentId } = req.params;
  // Compute assessment and include paid/due based on stored payments (dev placeholder)
  const assessmentTotal = 15000; // placeholder total - replace with real calculation later
  const all = readPayments();
  const paymentsForStudent = all.filter((p: any) => p.studentId === studentId);
  const paid = paymentsForStudent.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const due = Math.max(assessmentTotal - paid, 0);
  const assessment = { studentId, total: assessmentTotal, paid, due, breakdown: { tuition: 12000, misc: 3000 } };
  res.json({ success: true, data: assessment });
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
