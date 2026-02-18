// Logs API Routes
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const getDataPath = (filename) => path.join(process.cwd(), 'data', filename);

const readJson = (filepath, defaultValue = {}) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) || defaultValue;
  } catch { return defaultValue; }
};

const writeJson = (filepath, data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// GET logs
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('logs.json'), { sessions: [] }));
});

// POST log
router.post('/', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { sessions: [] });
  const log = { ...req.body, timestamp: new Date().toISOString() };
  
  const existingSessions = data.sessions || [];
  data.sessions = [log, ...existingSessions].slice(0, 100);
  
  writeJson(getDataPath('logs.json'), data);
  res.json({ success: true });
});

export default router;
