import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const logsFile = path.join(dataDir, 'activityLogs.json');

function readLogs() {
  try { return JSON.parse(fs.readFileSync(logsFile, 'utf8') || '[]'); } catch (e) { return []; }
}

function writeLogs(items: any[]) {
  fs.writeFileSync(logsFile, JSON.stringify(items, null, 2));
}

export const listLogs = (req: Request, res: Response) => {
  const logs = readLogs();
  res.json({ success: true, data: logs });
};

export const addLog = (req: Request, res: Response) => {
  const { user, action, meta } = req.body;
  const logs = readLogs();
  const entry = {
    id: Date.now(),
    user: user || 'system',
    action: action || 'unknown',
    meta: meta || null,
    ts: new Date().toISOString()
  };
  logs.unshift(entry);
  writeLogs(logs);
  res.json({ success: true, data: entry });
};

export default { listLogs, addLog };
