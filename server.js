import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Data files
const DATA_DIR = join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initDataFile = (filename, defaultData) => {
  const filepath = join(DATA_DIR, filename);
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
initDataFile('resume.json', {
  name: '',
  email: '',
  phone: '',
  summary: '',
  skills: [],
  experience: [],
  education: []
});
initDataFile('logs.json', []);

// API Routes
app.get('/api/jobs', (req, res) => {
  const appliedPath = join(DATA_DIR, 'applied.json');
  const data = JSON.parse(fs.readFileSync(appliedPath, 'utf-8'));
  res.json(data);
});

app.post('/api/jobs', (req, res) => {
  const appliedPath = join(DATA_DIR, 'applied.json');
  const data = JSON.parse(fs.readFileSync(appliedPath, 'utf-8'));
  data.jobs.push({
    ...req.body,
    id: Date.now().toString(),
    appliedAt: new Date().toISOString().split('T')[0]
  });
  fs.writeFileSync(appliedPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.get('/api/filters', (req, res) => {
  const filtersPath = join(DATA_DIR, 'filters.json');
  res.json(JSON.parse(fs.readFileSync(filtersPath, 'utf-8')));
});

app.post('/api/filters', (req, res) => {
  const filtersPath = join(DATA_DIR, 'filters.json');
  fs.writeFileSync(filtersPath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.get('/api/resume', (req, res) => {
  const resumePath = join(DATA_DIR, 'resume.json');
  res.json(JSON.parse(fs.readFileSync(resumePath, 'utf-8')));
});

app.post('/api/resume', (req, res) => {
  const resumePath = join(DATA_DIR, 'resume.json');
  fs.writeFileSync(resumePath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
  const logsPath = join(DATA_DIR, 'logs.json');
  res.json(JSON.parse(fs.readFileSync(logsPath, 'utf-8')));
});

app.post('/api/logs', (req, res) => {
  const logsPath = join(DATA_DIR, 'logs.json');
  const logs = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
  logs.unshift({
    ...req.body,
    timestamp: new Date().toISOString()
  });
  // Keep only last 100 logs
  fs.writeFileSync(logsPath, JSON.stringify(logs.slice(0, 100), null, 2));
  res.json({ success: true });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎯 German Job Bot running at http://localhost:${PORT}`);
});
