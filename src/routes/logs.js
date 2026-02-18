// Logs API Routes - Enhanced with chat persistence
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

// GET all logs
router.get('/', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { sessions: [], chatMessages: [] });
  res.json(data);
});

// GET chat messages only
router.get('/chat', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { chatMessages: [] });
  res.json(data.chatMessages || []);
});

// POST chat message
router.post('/chat', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { sessions: [], chatMessages: [] });
  
  const message = {
    id: msg-,
    role: req.body.role || 'user', // 'user' or 'assistant'
    content: req.body.content || '',
    timestamp: new Date().toISOString()
  };
  
  const messages = data.chatMessages || [];
  data.chatMessages = [message, ...messages].slice(0, 200); // Keep last 200 messages
  
  writeJson(getDataPath('logs.json'), data);
  res.json({ success: true, message });
});

// POST log (general)
router.post('/', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { sessions: [], chatMessages: [] });
  const log = { ...req.body, timestamp: new Date().toISOString() };
  
  const existingSessions = data.sessions || [];
  data.sessions = [log, ...existingSessions].slice(0, 100);
  
  writeJson(getDataPath('logs.json'), data);
  res.json({ success: true });
});

// DELETE chat messages
router.delete('/chat', (req, res) => {
  const data = readJson(getDataPath('logs.json'), { sessions: [], chatMessages: [] });
  data.chatMessages = [];
  writeJson(getDataPath('logs.json'), data);
  res.json({ success: true });
});

export default router;
