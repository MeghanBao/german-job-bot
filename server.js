import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = 3001;

// Get paths to JSON files
const dataDir = path.join(__dirname, 'data');
const appliedJsonPath = path.join(dataDir, 'applied.json');
const filtersJsonPath = path.join(dataDir, 'filters.json');
const jobFiltersJsonPath = path.join(dataDir, 'job-filters.json');
const resumeJsonPath = path.join(dataDir, 'resume.json');
const resumeTxtPath = path.join(dataDir, 'resume.txt');
const resumeMetaPath = path.join(dataDir, 'resume-meta.json');
const promptsJsonPath = path.join(dataDir, 'prompts.json');
const knowledgeJsonPath = path.join(dataDir, 'knowledge.json');
const logsJsonPath = path.join(dataDir, 'logs.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
const initDataFile = (filename, defaultData) => {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
  return filepath;
};

initDataFile('applied.json', { jobs: [] });
initDataFile('filters.json', {
  keywords: [],
  locations: ['Germany'],
  salaryMin: 0,
  requireVisa: false,
  blacklistCompanies: [],
  whitelistCompanies: []
});
initDataFile('job-filters.json', {
  blacklist: { companies: [], keywords: [], locations: [], industries: [] },
  whitelist: { companies: [], keywords: [], locations: [] },
  salary: { min: 50000, max: 120000, currency: 'EUR' },
  workType: { remote: true, hybrid: true, onsite: true },
  visa: { requiresSponsorship: false }
});
initDataFile('resume.json', { name: '', email: '', phone: '', summary: '', skills: [] });
initDataFile('prompts.json', { prompts: [] });
initDataFile('knowledge.json', []);
initDataFile('logs.json', { sessions: [] });

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dataDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${name}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ============ Applied Jobs API ============

app.get('/api/applied', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    res.json(data);
  } catch (error) {
    res.json({ jobs: [] });
  }
});

app.post('/api/applied', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(appliedJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    data.jobs = data.jobs || [];
    data.jobs.push({
      ...req.body,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString().split('T')[0]
    });
    fs.writeFileSync(appliedJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// ============ Filters API ============

app.get('/api/filters', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(filtersJsonPath, 'utf-8')));
  } catch (error) {
    res.json({});
  }
});

app.post('/api/filters', (req, res) => {
  try {
    fs.writeFileSync(filtersJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save filters' });
  }
});

// ============ Job Filters API (Advanced) ============

app.get('/api/job-filters', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(jobFiltersJsonPath, 'utf-8')));
  } catch (error) {
    res.json({ filters: [] });
  }
});

app.post('/api/job-filters', (req, res) => {
  try {
    fs.writeFileSync(jobFiltersJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save job filters' });
  }
});

// ============ Resume API ============

app.get('/api/resume', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(resumeJsonPath, 'utf-8')));
  } catch (error) {
    res.json({});
  }
});

app.post('/api/resume', (req, res) => {
  try {
    fs.writeFileSync(resumeJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// ============ Resume Upload API ============

app.get('/api/resumes', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const resumeFiles = files
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(f => {
        const stats = fs.statSync(path.join(dataDir, f));
        return { name: f, size: stats.size, uploadedAt: stats.mtime.toISOString() };
      });
    res.json(resumeFiles);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/resumes/upload', (req, res) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ success: true, file: req.file });
  });
});

app.post('/api/resumes/parse/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(dataDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    fs.writeFileSync(resumeTxtPath, text, 'utf-8');
    
    const meta = { sourceFile: filename, parsedAt: new Date().toISOString(), textLength: text.length };
    fs.writeFileSync(resumeMetaPath, JSON.stringify(meta, null, 2));

    res.json({ success: true, textLength: text.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resume-parse-status', (req, res) => {
  try {
    if (!fs.existsSync(resumeMetaPath)) {
      return res.json({ exists: false });
    }
    res.json(JSON.parse(fs.readFileSync(resumeMetaPath, 'utf-8')));
  } catch (error) {
    res.json({ exists: false });
  }
});

// ============ Prompts API ============

app.get('/api/prompts', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8')));
  } catch (error) {
    res.json({ prompts: [] });
  }
});

app.post('/api/prompts', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
    data.prompts = data.prompts || [];
    data.prompts.push({ ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() });
    fs.writeFileSync(promptsJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save prompt' });
  }
});

// ============ Knowledge API ============

app.get('/api/knowledge', (req, res) => {
  try {
    const data = fs.readFileSync(knowledgeJsonPath, 'utf-8');
    res.json(data.trim() ? JSON.parse(data) : []);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/knowledge', (req, res) => {
  try {
    fs.writeFileSync(knowledgeJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save knowledge' });
  }
});

// ============ Logs API ============

app.get('/api/logs', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8')));
  } catch (error) {
    res.json({ sessions: [] });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8'));
    data.sessions = data.sessions || [];
    data.sessions.unshift({ ...req.body, id: Date.now().toString(), timestamp: new Date().toISOString() });
    if (data.sessions.length > 50) data.sessions = data.sessions.slice(0, 50);
    fs.writeFileSync(logsJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// ============ SPA Fallback ============

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============ Start Server ============

app.listen(DEFAULT_PORT, () => {
  console.log(`🎯 German Job Bot running at http://localhost:${DEFAULT_PORT}`);
});
