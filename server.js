import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { browserService } from './src/lib/browser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Get paths to JSON files
const dataDir = path.join(__dirname, 'data');
const appliedJsonPath = path.join(dataDir, 'applied.json');
const filtersJsonPath = path.join(dataDir, 'filters.json');
const jobFiltersJsonPath = path.join(dataDir, 'job-filters.json');
const resumeJsonPath = path.join(dataDir, 'resume.json');
const resumeMetaPath = path.join(dataDir, 'resume-meta.json');
const promptsJsonPath = path.join(dataDir, 'prompts.json');
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
  blacklist: { companies: [], keywords: [] },
  whitelist: { companies: ['SAP', 'Bosch', 'Siemens'] },
  salary: { min: 50000, max: 120000 },
  workType: { remote: true, hybrid: true, onsite: true },
  visa: { requiresSponsorship: false }
});
initDataFile('resume.json', { name: '', email: '', phone: '', summary: '', skills: [] });
initDataFile('prompts.json', { prompts: [] });
initDataFile('logs.json', { sessions: [] });

// Multer config for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dataDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `resume${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());

// Landing page route
app.get('/', (req, res) => {
  const landingPath = path.join(__dirname, 'public', 'landing.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
  }
});

// App route (React)
app.get('/app', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

// Serve static files from dist or public
const staticPath = path.join(__dirname, 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// ============ Jobs API ============

app.get('/api/jobs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    res.json(data);
  } catch {
    res.json({ jobs: [] });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    const newJob = {
      ...req.body,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    data.jobs = [newJob, ...(data.jobs || [])];
    fs.writeFileSync(appliedJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true, job: newJob });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    const index = data.jobs.findIndex(j => j.id === req.params.id);
    if (index !== -1) {
      data.jobs[index] = { ...data.jobs[index], ...req.body };
      fs.writeFileSync(appliedJsonPath, JSON.stringify(data, null, 2));
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(appliedJsonPath, 'utf-8'));
    data.jobs = data.jobs.filter(j => j.id !== req.params.id);
    fs.writeFileSync(appliedJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ============ Filters API ============

app.get('/api/filters', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(filtersJsonPath, 'utf-8')));
  } catch {
    res.json({});
  }
});

app.post('/api/filters', (req, res) => {
  try {
    fs.writeFileSync(filtersJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save filters' });
  }
});

// ============ Job Filters API ============

app.get('/api/job-filters', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(jobFiltersJsonPath, 'utf-8')));
  } catch {
    res.json({});
  }
});

app.post('/api/job-filters', (req, res) => {
  try {
    fs.writeFileSync(jobFiltersJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save job filters' });
  }
});

// ============ Resume API ============

app.get('/api/resume', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(resumeJsonPath, 'utf-8')));
  } catch {
    res.json({});
  }
});

app.post('/api/resume', (req, res) => {
  try {
    fs.writeFileSync(resumeJsonPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// ============ Resume Upload API ============

app.post('/api/resume/upload', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ success: true, file: req.file.filename });
});

// ============ Logs API ============

app.get('/api/logs', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8')));
  } catch {
    res.json({ sessions: [] });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8'));
    const log = { ...req.body, timestamp: new Date().toISOString() };
    data.sessions = [log, ...(data.sessions || []).slice(0, 99)];
    fs.writeFileSync(logsJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// ============ Search API (Real browser automation) ============

app.post('/api/search', async (req, res) => {
  const { keywords, location = 'Germany', platform } = req.body;
  
  console.log(`🔍 Searching for "${keywords}" in ${location}...`);
  
  try {
    let jobs = [];
    
    if (platform && platform !== 'all') {
      switch (platform.toLowerCase()) {
        case 'linkedin':
          jobs = await browserService.searchLinkedIn(keywords, location);
          break;
        case 'indeed':
          jobs = await browserService.searchIndeedDE(keywords, location);
          break;
        case 'stepstone':
          jobs = await browserService.searchStepStone(keywords, location);
          break;
        case 'xing':
          jobs = await browserService.searchXing(keywords, location);
          break;
        case 'jobboerse':
          jobs = await browserService.searchJobboerse(keywords, location);
          break;
        default:
          jobs = await browserService.searchAll(keywords, location);
      }
    } else {
      jobs = await browserService.searchAll(keywords, location);
    }
    
    jobs = jobs.map(job => ({ ...job, status: 'found' }));
    
    try {
      const data = JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8'));
      data.sessions = [{
        type: 'search',
        message: `Search: ${keywords} in ${location} - Found ${jobs.length} jobs`,
        timestamp: new Date().toISOString()
      }, ...(data.sessions || []).slice(0, 99)];
      fs.writeFileSync(logsJsonPath, JSON.stringify(data, null, 2));
    } catch {}
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// ============ Apply to Job API ============

app.post('/api/apply', async (req, res) => {
  const { jobUrl, resumePath, platform } = req.body;
  
  console.log(`📤 Applying to ${jobUrl}...`);
  
  try {
    const result = await browserService.autoApply(jobUrl, resumePath, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SPA Fallback ============

app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ============ Start Server ============

app.listen(PORT, () => {
  console.log(`
🎯 German Job Bot 🇩🇪
   
   Local:    http://localhost:${PORT}
   Mode:     ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
   
   ${fs.existsSync(staticPath) ? '📦 Serving from dist folder' : '📁 Serving from public folder'}
  `);
});
