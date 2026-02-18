// Prompts API Routes
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

// GET prompts
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('prompts.json'), { prompts: [] }));
});

// POST new prompt
router.post('/', (req, res) => {
  const { name, content, isDefault } = req.body;
  const data = readJson(getDataPath('prompts.json'), { prompts: [] });
  
  const newPrompt = {
    id: `prompt-${Date.now()}`,
    name,
    content,
    isDefault: isDefault || false,
    createdAt: new Date().toISOString()
  };
  
  if (isDefault) {
    data.prompts = data.prompts.map(p => ({ ...p, isDefault: false }));
  }
  
  data.prompts.push(newPrompt);
  writeJson(getDataPath('prompts.json'), data);
  res.json({ success: true, prompt: newPrompt });
});

// DELETE prompt
router.delete('/:id', (req, res) => {
  const data = readJson(getDataPath('prompts.json'), { prompts: [] });
  data.prompts = data.prompts.filter(p => p.id !== req.params.id);
  writeJson(getDataPath('prompts.json'), data);
  res.json({ success: true });
});

export default router;
