import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}

function readJSON(name: string) {
  const p = path.join(dataDir, name);
  try { return JSON.parse(fs.readFileSync(p, 'utf8') || 'null'); } catch (e) { return null; }
}

export const getUsage = (req: Request, res: Response) => {
  const usage = readJSON('usage.json') || { activeUsers: 123, apiCallsLast24h: 4567 };
  res.json({ success: true, data: usage });
};

export const getStudentsPerProgram = (req: Request, res: Response) => {
  const sample = readJSON('studentsPerProgram.json') || {
    "BS Computer Science": 240,
    "BS Information Technology": 128,
    "BS Business Administration": 90,
    "Senior High": 320
  };
  res.json({ success: true, data: sample });
};

export const getEnrollmentStats = (req: Request, res: Response) => {
  const stats = readJSON('enrollmentStats.json') || {
    totalEnrolledThisSemester: 847,
    pendingEnrollments: 23,
    perSemester: { '2025-S1': 800, '2025-S2': 650 }
  };
  res.json({ success: true, data: stats });
};

export default { getUsage, getStudentsPerProgram, getEnrollmentStats };
