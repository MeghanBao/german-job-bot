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
const resumeTxtPath = path.join(dataDir, 'resume.txt');
const promptsJsonPath = path.join(dataDir, 'prompts.json');
const logsJsonPath = path.join(dataDir, 'logs.json');
const knowledgeJsonPath = path.join(dataDir, 'knowledge.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files with enhanced filters (like apply-bot)
const initDataFile = (filename, defaultData) => {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
  return filepath;
};

initDataFile('applied.json', { jobs: [] });

// Enhanced filters - inspired by apply-bot
initDataFile('filters.json', {
  keywords: [],
  locations: ['Germany'],
  salaryMin: 50000,
  requireVisa: false,
  blacklistCompanies: [],
  whitelistCompanies: ['SAP', 'Bosch', 'Siemens', 'Volkswagen', 'BMW', 'Mercedes']
});

// Detailed job filters - like apply-bot
initDataFile('job-filters.json', {
  blacklist: {
    companies: [],
    keywords: ['unpaid internship', 'commission only', 'must work weekends'],
    locations: [],
    industries: []
  },
  whitelist: {
    companies: ['SAP', 'Bosch', 'Siemens', 'Volkswagen', 'BMW', 'Mercedes', 'Allianz', 'Deutsche Telekom'],
    keywords: ['remote-first', 'flexible hours', 'work-life balance'],
    locations: ['Germany', 'Berlin', 'München', 'Remote']
  },
  salary: {
    min: 50000,
    max: 120000,
    target: 70000,
    currency: 'EUR'
  },
  workType: {
    remote: true,
    hybrid: true,
    onsite: true
  },
  jobRequirements: {
    levels: ['Mid-level', 'Senior', 'Staff', 'Principal'],
    excludeLevels: ['Intern', 'Entry-level', 'Junior']
  },
  techStack: {
    mustHave: ['Python', 'JavaScript', 'TypeScript', 'React'],
    niceToHave: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    dealBreakers: []
  },
  companyPreferences: {
    sizes: ['Medium (100-500)', 'Large (500+)'],
    types: ['Product Company', 'SaaS', 'Tech Startup']
  },
  autoRules: {
    autoApply: { enabled: false },
    autoSkip: { enabled: true }
  },
  benefits: {
    mustHave: ['Health insurance', ' Pension', 'Paid time off'],
    preferred: ['Stock options', 'Annual bonus', 'Home office stipend']
  },
  visa: {
    requiresSponsorship: false,
    currentStatus: 'EU Citizen / Work Permit'
  }
});

initDataFile('resume.json', { name: '', email: '', phone: '', summary: '', skills: [] });

// Default prompts
initDataFile('prompts.json', {
  prompts: [
    {
      id: 'prompt-default-search',
      name: 'Job Search',
      content: 'You are a German job search assistant. Search for jobs matching the user\'s criteria on LinkedIn DE, Indeed DE, and other German job platforms. Present results clearly.',
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prompt-default-apply',
      name: 'Apply to Job',
      content: 'You are helping the user apply for a job. Review the job description, tailor the resume if needed, and prepare a personalized cover letter in German or English.',
      isDefault: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prompt-default-evaluate',
      name: 'Evaluate Job',
      content: 'Evaluate this job posting based on: Salary, Company reputation, Tech stack, Work-life balance, Benefits. Give a score 1-10 and explain pros/cons.',
      isDefault: false,
      createdAt: new Date().toISOString()
    }
  ]
});
initDataFile('logs.json', { sessions: [] });
initDataFile('knowledge.json', { entries: [] });

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
      status: req.body.status || 'found'
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

// ============ Job Filters API (Enhanced) ============

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

// ============ Resume Upload + Parse API ============

app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Parse PDF
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(path.join(dataDir, req.file.filename));
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Save parsed text
    fs.writeFileSync(resumeTxtPath, text);

    // Save metadata
    const meta = {
      sourceFile: req.file.filename,
      parsedAt: new Date().toISOString(),
      textLength: text.length
    };
    fs.writeFileSync(resumeMetaPath, JSON.stringify(meta, null, 2));

    res.json({ 
      success: true, 
      file: req.file.filename,
      textLength: text.length
    });
  } catch (e) {
    console.error('PDF parse error:', e);
    res.json({ success: true, file: req.file.filename });
  }
});

// Get resume text
app.get('/api/resume/text', (req, res) => {
  try {
    if (fs.existsSync(resumeTxtPath)) {
      const text = fs.readFileSync(resumeTxtPath, 'utf-8');
      res.json({ exists: true, text });
    } else {
      res.json({ exists: false, text: '' });
    }
  } catch (e) {
    res.json({ exists: false, text: '' });
  }
});

// ============ Prompts API ============

app.get('/api/prompts', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
    res.json(data);
  } catch {
    res.json({ prompts: [] });
  }
});

app.post('/api/prompts', (req, res) => {
  try {
    const { name, content, isDefault } = req.body;
    const data = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
    
    const newPrompt = {
      id: `prompt-${Date.now()}`,
      name,
      content,
      isDefault: isDefault || false,
      createdAt: new Date().toISOString()
    };
    
    // If setting as default, unset others
    if (isDefault) {
      data.prompts = data.prompts.map(p => ({ ...p, isDefault: false }));
    }
    
    data.prompts.push(newPrompt);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true, prompt: newPrompt });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save prompt' });
  }
});

app.delete('/api/prompts/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
    data.prompts = data.prompts.filter(p => p.id !== req.params.id);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// ============ Knowledge API ============

app.get('/api/knowledge', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(knowledgeJsonPath, 'utf-8'));
    res.json(data);
  } catch {
    res.json({ entries: [] });
  }
});

app.post('/api/knowledge', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(knowledgeJsonPath, 'utf-8'));
    const entry = {
      id: `kb-${Date.now()}`,
      question: req.body.question,
      answer: req.body.answer,
      createdAt: new Date().toISOString()
    };
    data.entries = [entry, ...(data.entries || [])];
    fs.writeFileSync(knowledgeJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true, entry });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save knowledge' });
  }
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
    const existingSessions = data.sessions || [];
    data.sessions = [log, ...existingSessions].slice(0, 100);
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
    
    // Apply filters
    const filters = JSON.parse(fs.readFileSync(jobFiltersJsonPath, 'utf-8'));
    jobs = applyFilters(jobs, filters);
    
    try {
      const data = JSON.parse(fs.readFileSync(logsJsonPath, 'utf-8'));
      const newLog = {
        type: 'search',
        message: `Search: ${keywords} in ${location} - Found ${jobs.length} jobs`,
        timestamp: new Date().toISOString()
      };
      const existingSessions = data.sessions || [];
      data.sessions = [newLog, ...existingSessions].slice(0, 100);
      fs.writeFileSync(logsJsonPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to write logs:', e);
    }
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Apply filters to jobs
function applyFilters(jobs, filters) {
  return jobs.filter(job => {
    // Blacklist companies
    if (filters.blacklist?.companies?.includes(job.company)) return false;
    
    // Whitelist companies (if set)
    if (filters.whitelist?.companies?.length > 0) {
      if (!filters.whitelist.companies.some(c => job.company.toLowerCase().includes(c.toLowerCase()))) {
        // Not in whitelist, but don't filter if whitelist is just suggestions
      }
    }
    
    // Salary filter
    if (filters.salary?.min && job.salary) {
      const salaryNum = parseSalary(job.salary);
      if (salaryNum && salaryNum < filters.salary.min) return false;
    }
    
    return true;
  });
}

// Parse salary string to number (EUR)
function parseSalary(salaryStr) {
  if (!salaryStr) return null;
  const match = salaryStr.match(/(\d{1,3}(?:\.\d{3})*)/);
  if (match) {
    return parseInt(match[1].replace(/\./g, ''));
  }
  return null;
}

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
