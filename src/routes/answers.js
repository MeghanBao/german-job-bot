// Answers & Questions API Routes
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

// GET all answers
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('answers.json'), { fields: [], pendingQuestions: [] }));
});

// POST new answer
router.post('/', (req, res) => {
  const data = readJson(getDataPath('answers.json'), { fields: [], pendingQuestions: [] });
  
  const answer = {
    id: `ans-${Date.now()}`,
    normalizedKey: req.body.normalizedKey,
    value: req.body.value,
    text: req.body.text,
    label: req.body.label,
    createdAt: new Date().toISOString()
  };
  
  data.fields = data.fields.map(f => {
    if (f.normalizedKey === req.body.normalizedKey) {
      return { ...f, answers: [...(f.answers || []), answer] };
    }
    return f;
  });
  
  writeJson(getDataPath('answers.json'), data);
  res.json({ success: true, answer });
});

// GET pending questions
router.get('/pending-questions', (req, res) => {
  const data = readJson(getDataPath('answers.json'), { pendingQuestions: [] });
  res.json(data.pendingQuestions || []);
});

// POST pending question
router.post('/pending-questions', (req, res) => {
  const data = readJson(getDataPath('answers.json'), { pendingQuestions: [] });
  
  const question = {
    id: `q-${Date.now()}`,
    runId: req.body.runId,
    jobId: req.body.jobId,
    platform: req.body.platform,
    fieldName: req.body.fieldName,
    normalizedKey: req.body.normalizedKey,
    riskLevel: req.body.riskLevel || 'medium',
    suggestedAnswer: req.body.suggestedAnswer,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  data.pendingQuestions = [question, ...data.pendingQuestions];
  writeJson(getDataPath('answers.json'), data);
  res.json({ success: true, question });
});

// PUT update pending question
router.put('/pending-questions/:id', (req, res) => {
  const data = readJson(getDataPath('answers.json'), { pendingQuestions: [] });
  
  data.pendingQuestions = data.pendingQuestions.map(q => {
    if (q.id === req.params.id) {
      return { ...q, ...req.body, resolvedAt: new Date().toISOString() };
    }
    return q;
  });
  
  writeJson(getDataPath('answers.json'), data);
  res.json({ success: true });
});

export default router;
