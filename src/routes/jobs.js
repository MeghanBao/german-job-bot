// Jobs API Routes
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const getDataPath = (filename) => path.join(process.cwd(), 'data', filename);

const readJson = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch { return null; }
};

const writeJson = (filepath, data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// GET all jobs
router.get('/', (req, res) => {
  const data = readJson(getDataPath('applied.json')) || { jobs: [] };
  res.json(data);
});

// POST new job
router.post('/', (req, res) => {
  const filepath = getDataPath('applied.json');
  const data = readJson(filepath) || { jobs: [] };
  
  const newJob = {
    ...req.body,
    id: Date.now().toString(),
    appliedAt: new Date().toISOString().split('T')[0],
    status: req.body.status || 'found'
  };
  
  data.jobs = [newJob, ...data.jobs];
  writeJson(filepath, data);
  res.json({ success: true, job: newJob });
});

// PUT update job
router.put('/:id', (req, res) => {
  const filepath = getDataPath('applied.json');
  const data = readJson(filepath) || { jobs: [] };
  
  const index = data.jobs.findIndex(j => j.id === req.params.id);
  if (index !== -1) {
    data.jobs[index] = { ...data.jobs[index], ...req.body };
    writeJson(filepath, data);
  }
  res.json({ success: true });
});

// DELETE job
router.delete('/:id', (req, res) => {
  const filepath = getDataPath('applied.json');
  const data = readJson(filepath) || { jobs: [] };
  
  data.jobs = data.jobs.filter(j => j.id !== req.params.id);
  writeJson(filepath, data);
  res.json({ success: true });
});

export default router;
