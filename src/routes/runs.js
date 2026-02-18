// Runs API Routes (Action logging)
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const dataDir = path.join(process.cwd(), 'data');
const runsDir = path.join(dataDir, 'runs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const generateRunId = () => `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const readJson = (filepath, defaultValue = {}) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) || defaultValue;
  } catch { return defaultValue; }
};

const writeJson = (filepath, data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// Initialize runs directory
ensureDir(runsDir);

// POST create new run
router.post('/', (req, res) => {
  const { jobId, jobTitle, platform, url } = req.body;
  const runId = generateRunId();
  
  const run = {
    id: runId,
    jobId,
    jobTitle,
    platform,
    url,
    status: 'running',
    createdAt: new Date().toISOString(),
    actions: []
  };
  
  const runPath = path.join(runsDir, `${runId}.json`);
  writeJson(runPath, run);
  
  ensureDir(path.join(runsDir, runId));
  
  res.json({ success: true, runId, run });
});

// GET all runs
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(runsDir).filter(f => f.endsWith('.json'));
    const runs = files.map(f => {
      const data = readJson(path.join(runsDir, f));
      return {
        id: data.id,
        jobTitle: data.jobTitle,
        platform: data.platform,
        status: data.status,
        createdAt: data.createdAt,
        actionCount: data.actions?.length || 0
      };
    });
    res.json(runs);
  } catch { res.json([]); }
});

// GET single run
router.get('/:id', (req, res) => {
  const runPath = path.join(runsDir, `${req.params.id}.json`);
  if (fs.existsSync(runPath)) {
    res.json(readJson(runPath));
  } else {
    res.status(404).json({ error: 'Run not found' });
  }
});

// POST log action to run
router.post('/:id/actions', (req, res) => {
  const runPath = path.join(runsDir, `${req.params.id}.json`);
  if (!fs.existsSync(runPath)) {
    return res.status(404).json({ error: 'Run not found' });
  }
  
  const run = readJson(runPath);
  const action = {
    step: run.actions.length + 1,
    type: req.body.type,
    selector: req.body.selector,
    value: req.body.value,
    result: req.body.result,
    error: req.body.error,
    timestamp: new Date().toISOString()
  };
  
  run.actions.push(action);
  writeJson(runPath, run);
  
  res.json({ success: true, action });
});

// PUT update run status
router.put('/:id', (req, res) => {
  const runPath = path.join(runsDir, `${req.params.id}.json`);
  if (!fs.existsSync(runPath)) {
    return res.status(404).json({ error: 'Run not found' });
  }
  
  const run = readJson(runPath);
  run.status = req.body.status;
  run.completedAt = new Date().toISOString();
  writeJson(runPath, run);
  
  res.json({ success: true });
});

export default router;
