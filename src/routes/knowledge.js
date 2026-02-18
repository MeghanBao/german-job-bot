// Knowledge API Routes
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

// GET knowledge
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('knowledge.json'), { entries: [] }));
});

// POST knowledge entry
router.post('/', (req, res) => {
  const data = readJson(getDataPath('knowledge.json'), { entries: [] });
  
  const entry = {
    id: `kb-${Date.now()}`,
    question: req.body.question,
    answer: req.body.answer,
    createdAt: new Date().toISOString()
  };
  
  data.entries = [entry, ...(data.entries || [])];
  writeJson(getDataPath('knowledge.json'), data);
  
  res.json({ success: true, entry });
});

export default router;
