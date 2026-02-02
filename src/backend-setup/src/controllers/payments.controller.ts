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
  // placeholder: return a sample assessment
  const assessment = { studentId, total: 15000, due: 15000, breakdown: { tuition: 12000, misc: 3000 } };
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
