import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(express.json());
const DIST_DIR = join(__dirname, 'dist');
const PUBLIC_DIR = join(__dirname, 'public');
const CLIENT_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR;
app.use(express.static(CLIENT_DIR));

const DATA_DIR = join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initDataFile = (filename, defaultData) => {
  const filepath = join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
  return filepath;
};

const APPLIED_PATH = initDataFile('applied.json', { jobs: [] });
const FILTERS_PATH = initDataFile('filters.json', {
  keywords: [],
  locations: ['Germany'],
  salaryMin: 0,
  requireVisa: false,
  blacklistCompanies: [],
  whitelistCompanies: []
});
const RESUME_PATH = initDataFile('resume.json', {
  name: '',
  email: '',
  phone: '',
  summary: '',
  skills: [],
  experience: [],
  education: []
});
const LOGS_PATH = initDataFile('logs.json', []);

const readJson = (filepath) => JSON.parse(fs.readFileSync(filepath, 'utf-8'));
const writeJson = (filepath, data) => fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

const addLog = (type, message) => {
  const logs = readJson(LOGS_PATH);
  logs.unshift({ type, message, timestamp: new Date().toISOString() });
  writeJson(LOGS_PATH, logs.slice(0, 100));
};

const MOCK_COMPANIES = ['SAP', 'Siemens', 'Zalando', 'N26', 'Celonis', 'BMW', 'Bosch', 'Delivery Hero'];
const MOCK_PLATFORMS = ['LinkedIn', 'Indeed', 'StepStone', 'Xing'];

const normalizeWords = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

const extractCommandIntent = (commandText) => {
  const text = commandText.toLowerCase();
  if (/\b(help|hilfe|commands|befehle)\b/.test(text)) return 'help';
  if (/\b(status|stats|übersicht|uebersicht|fortschritt)\b/.test(text)) return 'status';
  if (/\b(apply|bewerb|bewerben|apply to)\b/.test(text)) return 'apply';
  if (/\b(search|find|suche|finden|jobs?)\b/.test(text)) return 'search';
  return 'search';
};

const extractLocations = (commandText, fallbackLocations = []) => {
  const known = ['berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'cologne', 'köln', 'stuttgart', 'remote', 'germany'];
  const words = normalizeWords(commandText);
  const found = known
    .filter((item) => words.includes(item))
    .map((item) => {
      if (item === 'munich' || item === 'münchen') return 'München';
      if (item === 'cologne' || item === 'köln') return 'Köln';
      return item.charAt(0).toUpperCase() + item.slice(1);
    });
  return [...new Set(found.length ? found : fallbackLocations.length ? fallbackLocations : ['Germany'])];
};

const generateMockJobs = ({ keywords, locations, salaryMin, requireVisa }) => {
  const now = new Date().toISOString().split('T')[0];
  const safeKeywords = keywords.length ? keywords : ['Software Engineer', 'Data Engineer', 'Backend Developer'];
  const safeLocations = locations.length ? locations : ['Germany'];

  return safeKeywords.slice(0, 4).map((keyword, idx) => {
    const company = MOCK_COMPANIES[(Date.now() + idx) % MOCK_COMPANIES.length];
    const baseSalary = Math.max(Number(salaryMin) || 55000, 55000);
    const salary = baseSalary + idx * 5000;
    return {
      id: `${Date.now()}-${idx}`,
      title: keyword,
      company,
      location: safeLocations[idx % safeLocations.length],
      platform: MOCK_PLATFORMS[idx % MOCK_PLATFORMS.length],
      visaSponsorship: Boolean(requireVisa),
      salary,
      status: 'found',
      appliedAt: now
    };
  });
};

app.get('/api/jobs', (req, res) => res.json(readJson(APPLIED_PATH)));

app.post('/api/jobs', (req, res) => {
  const data = readJson(APPLIED_PATH);
  data.jobs.push({ ...req.body, id: Date.now().toString(), appliedAt: new Date().toISOString().split('T')[0] });
  writeJson(APPLIED_PATH, data);
  res.json({ success: true });
});

app.get('/api/filters', (req, res) => res.json(readJson(FILTERS_PATH)));
app.post('/api/filters', (req, res) => {
  writeJson(FILTERS_PATH, req.body);
  res.json({ success: true });
});

app.get('/api/resume', (req, res) => res.json(readJson(RESUME_PATH)));
app.post('/api/resume', (req, res) => {
  writeJson(RESUME_PATH, req.body);
  res.json({ success: true });
});

app.get('/api/logs', (req, res) => res.json(readJson(LOGS_PATH)));
app.post('/api/logs', (req, res) => {
  addLog(req.body.type || 'system', req.body.message || '');
  res.json({ success: true });
});

app.post('/api/command', (req, res) => {
  const command = (req.body.command || '').trim();
  const lang = req.body.lang === 'en' ? 'en' : 'de';

  if (!command) {
    return res.status(400).json({ success: false, message: lang === 'en' ? 'Command is empty.' : 'Befehl ist leer.' });
  }

  addLog('command', command);
  const intent = extractCommandIntent(command);
  const data = readJson(APPLIED_PATH);
  const filters = readJson(FILTERS_PATH);

  if (intent === 'help') {
    const message =
      lang === 'en'
        ? 'Try: search python jobs in Berlin | apply top 2 jobs | status'
        : 'Versuche: suche python jobs in Berlin | bewirb dich auf 2 jobs | status';
    addLog('bot', message);
    return res.json({ success: true, intent, message });
  }

  if (intent === 'status') {
    const stats = {
      total: data.jobs.length,
      found: data.jobs.filter((j) => j.status === 'found').length,
      applied: data.jobs.filter((j) => j.status === 'applied').length,
      interview: data.jobs.filter((j) => j.status === 'interview').length,
      rejected: data.jobs.filter((j) => j.status === 'rejected').length
    };
    const message =
      lang === 'en'
        ? `Total ${stats.total}: found ${stats.found}, applied ${stats.applied}, interview ${stats.interview}, rejected ${stats.rejected}.`
        : `Insgesamt ${stats.total}: gefunden ${stats.found}, beworben ${stats.applied}, interview ${stats.interview}, abgelehnt ${stats.rejected}.`;
    addLog('bot', message);
    return res.json({ success: true, intent, message, stats });
  }

  if (intent === 'apply') {
    const countMatch = command.match(/(\d+)/);
    const count = countMatch ? Number(countMatch[1]) : 1;
    const foundJobs = data.jobs.filter((job) => job.status === 'found');
    const appliedJobs = foundJobs.slice(0, Math.max(count, 1)).map((job) => ({ ...job, status: 'applied' }));

    if (!appliedJobs.length) {
      const message = lang === 'en' ? 'No pending jobs to apply. Search jobs first.' : 'Keine offenen Jobs zum Bewerben. Bitte zuerst suchen.';
      addLog('bot', message);
      return res.json({ success: true, intent, message, updated: 0 });
    }

    const ids = new Set(appliedJobs.map((j) => j.id));
    data.jobs = data.jobs.map((job) => (ids.has(job.id) ? { ...job, status: 'applied' } : job));
    writeJson(APPLIED_PATH, data);

    const message =
      lang === 'en'
        ? `Applied to ${appliedJobs.length} job(s): ${appliedJobs.map((j) => j.title).join(', ')}.`
        : `Auf ${appliedJobs.length} Job(s) beworben: ${appliedJobs.map((j) => j.title).join(', ')}.`;
    addLog('bot', message);
    return res.json({ success: true, intent, message, updated: appliedJobs.length });
  }

  const commandWords = normalizeWords(command);
  const detectedKeywords = commandWords.filter((w) => w.length > 3 && !['jobs', 'job', 'suche', 'search', 'find', 'finden', 'apply', 'bewerb'].includes(w));
  const keywords = [...new Set([...(detectedKeywords.slice(0, 4)), ...(filters.keywords || [])])].slice(0, 4);
  const locations = extractLocations(command, filters.locations || []);
  const jobs = generateMockJobs({
    keywords,
    locations,
    salaryMin: filters.salaryMin,
    requireVisa: filters.requireVisa
  });

  const existing = new Set(data.jobs.map((job) => `${job.title}:${job.company}:${job.location}`));
  const uniqueJobs = jobs.filter((job) => !existing.has(`${job.title}:${job.company}:${job.location}`));
  data.jobs = [...uniqueJobs, ...data.jobs].slice(0, 200);
  writeJson(APPLIED_PATH, data);

  const message =
    lang === 'en'
      ? `Found ${uniqueJobs.length} new jobs in ${locations.join(', ')}.`
      : `${uniqueJobs.length} neue Jobs in ${locations.join(', ')} gefunden.`;
  addLog('bot', message);

  return res.json({ success: true, intent, message, jobs: uniqueJobs });
});

app.get('*', (req, res) => res.sendFile(join(CLIENT_DIR, 'index.html')));

app.listen(PORT, () => {
  console.log(`🎯 German Job Bot running at http://localhost:${PORT}`);
});
