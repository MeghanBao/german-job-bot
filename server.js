import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { browserService } from './src/lib/browser.js';
import {
  jobsRouter,
  filtersRouter,
  jobFiltersRouter,
  resumeRouter,
  promptsRouter,
  answersRouter,
  logsRouter,
  runsRouter,
  knowledgeRouter
} from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Data directory
const dataDir = path.join(__dirname, 'data');
const jobFiltersJsonPath = path.join(dataDir, 'job-filters.json');
const logsJsonPath = path.join(dataDir, 'logs.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files with enhanced filters
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
  salaryMin: 50000,
  requireVisa: false,
  blacklistCompanies: [],
  whitelistCompanies: ['SAP', 'Bosch', 'Siemens', 'Volkswagen', 'BMW', 'Mercedes']
});
initDataFile('job-filters.json', {
  blacklist: { companies: [], keywords: ['unpaid internship', 'commission only'] },
  whitelist: { companies: ['SAP', 'Bosch', 'Siemens', 'Volkswagen', 'BMW'], keywords: ['remote-first', 'flexible hours'] },
  salary: { min: 50000, max: 120000, currency: 'EUR' },
  workType: { remote: true, hybrid: true, onsite: true },
  jobRequirements: { levels: ['Mid-level', 'Senior', 'Staff'] },
  techStack: { mustHave: ['Python', 'JavaScript', 'TypeScript', 'React'], niceToHave: ['Node.js', 'AWS', 'Docker'] },
  companyPreferences: { sizes: ['Medium', 'Large'], types: ['Product Company', 'SaaS'] },
  autoRules: { autoApply: { enabled: false }, autoSkip: { enabled: true } },
  benefits: { mustHave: ['Health insurance', 'Pension'], preferred: ['Stock options', 'Bonus'] },
  visa: { requiresSponsorship: false }
});
initDataFile('resume.json', { name: '', email: '', phone: '', summary: '', skills: [] });
initDataFile('prompts.json', {
  prompts: [
    { id: 'prompt-default-search', name: 'Job Search', content: 'You are a German job search assistant...', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'prompt-default-apply', name: 'Apply to Job', content: 'Help the user apply for a job...', isDefault: false, createdAt: new Date().toISOString() }
  ]
});
initDataFile('logs.json', { sessions: [] });
initDataFile('knowledge.json', { entries: [] });
initDataFile('answers.json', {
  fields: [
    { normalizedKey: 'work_authorization', displayName: 'Work Authorization', fieldType: 'select', riskLevel: 'high', answers: [
      { value: 'eu_citizen', label: 'EU Citizen', text: 'I have unrestricted work authorization in Germany as an EU citizen.' }
    ]},
    { normalizedKey: 'notice_period', displayName: 'Notice Period', fieldType: 'text', riskLevel: 'medium', answers: [
      { value: 'immediate', label: 'Immediate', text: 'I am available immediately.' }
    ]},
    { normalizedKey: 'salary_expectation', displayName: 'Salary Expectation', fieldType: 'number', riskLevel: 'medium' },
    { normalizedKey: 'relocation', displayName: 'Relocation', fieldType: 'select', riskLevel: 'low', answers: [
      { value: 'yes', label: 'Yes', text: 'I am willing to relocate to Germany.' }
    ]},
    { normalizedKey: 'language_level_de', displayName: 'German Level', fieldType: 'select', riskLevel: 'medium', answers: [
      { value: 'b2', label: 'B2', text: 'B2 - Upper Intermediate' },
      { value: 'c1', label: 'C1', text: 'C1 - Fluent' }
    ]},
    { normalizedKey: 'work_type', displayName: 'Work Type', fieldType: 'select', riskLevel: 'low', answers: [
      { value: 'remote', label: 'Remote', text: 'I prefer fully remote work.' },
      { value: 'hybrid', label: 'Hybrid', text: 'I am open to hybrid work.' }
    ]}
  ],
  pendingQuestions: []
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Landing page
app.get('/', (req, res) => {
  const landingPath = path.join(__dirname, 'public', 'landing.html');
  res.sendFile(fs.existsSync(landingPath) ? landingPath : path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files
const staticPath = path.join(__dirname, 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Use routes
app.use('/api/jobs', jobsRouter);
app.use('/api/filters', filtersRouter);
app.use('/api/job-filters', jobFiltersRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/logs', logsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/knowledge', knowledgeRouter);

// Search API
app.post('/api/search', async (req, res) => {
  const { keywords, location = 'Germany', platform } = req.body;
  
  console.log(`🔍 Searching for "${keywords}" in ${location}...`);
  
  try {
    let jobs = [];
    
    if (platform && platform !== 'all') {
      switch (platform.toLowerCase()) {
        case 'linkedin': jobs = await browserService.searchLinkedIn(keywords, location); break;
        case 'indeed': jobs = await browserService.searchIndeedDE(keywords, location); break;
        case 'stepstone': jobs = await browserService.searchStepStone(keywords, location); break;
        case 'xing': jobs = await browserService.searchXing(keywords, location); break;
        case 'jobboerse': jobs = await browserService.searchJobboerse(keywords, location); break;
        default: jobs = await browserService.searchAll(keywords, location);
      }
    } else {
      jobs = await browserService.searchAll(keywords, location);
    }
    
    jobs = jobs.map(job => ({ ...job, status: 'found' }));
    
    // Apply filters
    try {
      const filters = JSON.parse(fs.readFileSync(jobFiltersJsonPath, 'utf-8'));
      jobs = applyFilters(jobs, filters);
    } catch {}
    
    // Log search
    try {
      const logs = JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8'));
      const log = { type: 'search', message: `Search: ${keywords} in ${location} - Found ${jobs.length} jobs`, timestamp: new Date().toISOString() };
      logs.sessions = [log, ...(logs.sessions || [])].slice(0, 100);
      fs.writeFileSync(logsJsonPath, JSON.stringify(logs, null, 2));
    } catch {}
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Apply API
app.post('/api/apply', async (req, res) => {
  const { jobUrl, resumePath, platform } = req.body;
  
  try {
    const result = await browserService.autoApply(jobUrl, resumePath, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply filters helper
function applyFilters(jobs, filters) {
  return jobs.filter(job => {
    if (filters.blacklist?.companies?.includes(job.company)) return false;
    if (filters.salary?.min && job.salary) {
      const salaryNum = parseSalary(job.salary);
      if (salaryNum && salaryNum < filters.salary.min) return false;
    }
    return true;
  });
}

function parseSalary(salaryStr) {
  if (!salaryStr) return null;
  const match = salaryStr.match(/(\d{1,3}(?:\.\d{3})*)/);
  return match ? parseInt(match[1].replace(/\./g, '')) : null;
}

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
🎯 German Job Bot 🇩🇪
   
   Local:    http://localhost:${PORT}
   Mode:     ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
   
   ${fs.existsSync(staticPath) ? '📦 Serving from dist folder' : '📁 Serving from public folder'}
  `);
});
