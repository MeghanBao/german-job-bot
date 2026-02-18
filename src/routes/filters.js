// Filters API Routes
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

// GET basic filters
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('filters.json')));
});

// POST basic filters
router.post('/', (req, res) => {
  writeJson(getDataPath('filters.json'), req.body);
  res.json({ success: true });
});

export default router;
