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
const answersJsonPath = path.join(dataDir, 'answers.json');
const runsDir = path.join(dataDir, 'runs');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(runsDir)) {
  fs.mkdirSync(runsDir, { recursive: true });
}

// Generate unique run ID
function generateRunId() {
  return `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

// Answers library - for field normalization and reusable answers
initDataFile('answers.json', {
  fields: [
    {
      normalizedKey: 'work_authorization',
      displayName: 'Work Authorization',
      fieldType: 'select',
      riskLevel: 'high',
      answers: [
        { value: 'eu_citizen', label: 'EU Citizen', text: 'I have unrestricted work authorization in Germany as an EU citizen.' },
        { value: 'blue_card', label: 'EU Blue Card', text: 'I hold an EU Blue Card valid for Germany.' },
        { value: 'work_permit', label: 'Work Permit', text: 'I have a valid German work permit.' }
      ]
    },
    {
      normalizedKey: 'notice_period',
      displayName: 'Notice Period',
      fieldType: 'text',
      riskLevel: 'medium',
      answers: [
        { value: 'immediate', label: 'Immediate', text: 'I am available immediately.' },
        { value: '2_weeks', label: '2 Weeks', text: 'My notice period is 2 weeks.' },
        { value: '1_month', label: '1 Month', text: 'My notice period is 1 month.' },
        { value: '3_months', label: '3 Months', text: 'My notice period is 3 months.' }
      ]
    },
    {
      normalizedKey: 'salary_expectation',
      displayName: 'Salary Expectation',
      fieldType: 'number',
      riskLevel: 'medium',
      defaultTemplate: 'Meine Gehaltserwartung liegt bei {{value}} EUR pro Jahr.'
    },
    {
      normalizedKey: 'relocation',
      displayName: 'Relocation',
      fieldType: 'select',
      riskLevel: 'low',
      answers: [
        { value: 'yes', label: 'Yes', text: 'I am willing to relocate to Germany.' },
        { value: 'no', label: 'No', text: 'I prefer remote or would need visa sponsorship.' }
      ]
    },
    {
      normalizedKey: 'language_level_de',
      displayName: 'German Level',
      fieldType: 'select',
      riskLevel: 'medium',
      answers: [
        { value: 'native', label: 'Native', text: 'German is my native language.' },
        { value: 'c2', label: 'C2', text: 'C2 - Fluent ( Goethe Zertifikat C2 )' },
        { value: 'c1', label: 'C1', text: 'C1 - Advanced' },
        { value: 'b2', label: 'B2', text: 'B2 - Upper Intermediate' },
        { value: 'b1', label: 'B1', text: 'B1 - Intermediate' },
        { value: 'a2', label: 'A2', text: 'A2 - Basic' },
        { value: 'none', label: 'None', text: 'No German knowledge, English only.' }
      ]
    },
    {
      normalizedKey: 'work_type',
      displayName: 'Work Type',
      fieldType: 'select',
      riskLevel: 'low',
      answers: [
        { value: 'remote', label: 'Remote', text: 'I prefer fully remote work.' },
        { value: 'hybrid', label: 'Hybrid', text: 'I am open to hybrid work (2-3 days office).' },
        { value: 'onsite', label: 'On-site', text: 'I am willing to work on-site.' }
      ]
    }
  ],
  pendingQuestions: []
});

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

// ============ Runs API (Action Logging) ============

// Create a new run
app.post('/api/runs', (req, res) => {
  try {
    const { jobId, jobTitle, platform, url } = req.body;
    const runId = generateRunId();
    const run = {
      id: runId,
      jobId,
      jobTitle,
      platform,
      url,
      status: 'running', // running, completed, failed, paused
      createdAt: new Date().toISOString(),
      actions: [],
      screenshotDir: `screenshots/${runId}`
    };
    
    // Save run
    const runPath = path.join(runsDir, `${runId}.json`);
    fs.writeFileSync(runPath, JSON.stringify(run, null, 2));
    
    // Create screenshots directory
    const screenshotsDir = path.join(runsDir, runId);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    res.json({ success: true, runId, run });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create run' });
  }
});

// Get all runs
app.get('/api/runs', (req, res) => {
  try {
    const files = fs.readdirSync(runsDir).filter(f => f.endsWith('.json'));
    const runs = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf-8'));
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
  } catch (e) {
    res.json([]);
  }
});

// Get single run
app.get('/api/runs/:id', (req, res) => {
  try {
    const runPath = path.join(runsDir, `${req.params.id}.json`);
    if (fs.existsSync(runPath)) {
      res.json(JSON.parse(fs.readFileSync(runPath, 'utf-8')));
    } else {
      res.status(404).json({ error: 'Run not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to get run' });
  }
});

// Log action to run
app.post('/api/runs/:id/actions', (req, res) => {
  try {
    const runPath = path.join(runsDir, `${req.params.id}.json`);
    if (!fs.existsSync(runPath)) {
      return res.status(404).json({ error: 'Run not found' });
    }
    
    const run = JSON.parse(fs.readFileSync(runPath, 'utf-8'));
    const action = {
      step: run.actions.length + 1,
      type: req.body.type, // click, type, navigate, wait, screenshot
      selector: req.body.selector,
      value: req.body.value,
      result: req.body.result, // success, failed, pending
      error: req.body.error,
      screenshot: req.body.screenshot, // filename
      timestamp: new Date().toISOString()
    };
    
    run.actions.push(action);
    fs.writeFileSync(runPath, JSON.stringify(run, null, 2));
    
    res.json({ success: true, action });
  } catch (e) {
    res.status(500).json({ error: 'Failed to log action' });
  }
});

// Update run status
app.put('/api/runs/:id', (req, res) => {
  try {
    const runPath = path.join(runsDir, `${req.params.id}.json`);
    if (!fs.existsSync(runPath)) {
      return res.status(404).json({ error: 'Run not found' });
    }
    
    const run = JSON.parse(fs.readFileSync(runPath, 'utf-8'));
    run.status = req.body.status;
    run.completedAt = new Date().toISOString();
    fs.writeFileSync(runPath, JSON.stringify(run, null, 2));
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update run' });
  }
});

// ============ Answers API ============

app.get('/api/answers', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(answersJsonPath, 'utf-8')));
  } catch {
    res.json({ fields: [], pendingQuestions: [] });
  }
});

app.post('/api/answers', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(answersJsonPath, 'utf-8'));
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
        return {
          ...f,
          answers: [...(f.answers || []), answer]
        };
      }
      return f;
    });
    fs.writeFileSync(answersJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true, answer });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// Pending Questions API
app.get('/api/pending-questions', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(answersJsonPath, 'utf-8'));
    res.json(data.pendingQuestions || []);
  } catch {
    res.json([]);
  }
});

app.post('/api/pending-questions', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(answersJsonPath, 'utf-8'));
    const question = {
      id: `q-${Date.now()}`,
      runId: req.body.runId,
      jobId: req.body.jobId,
      platform: req.body.platform,
      fieldName: req.body.fieldName,
      normalizedKey: req.body.normalizedKey,
      riskLevel: req.body.riskLevel || 'medium',
      screenshot: req.body.screenshot,
      suggestedAnswer: req.body.suggestedAnswer,
      status: 'pending', // pending, resolved
      createdAt: new Date().toISOString()
    };
    data.pendingQuestions = [question, ...(data.pendingQuestions || [])];
    fs.writeFileSync(answersJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true, question });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save pending question' });
  }
});

app.put('/api/pending-questions/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(answersJsonPath, 'utf-8'));
    data.pendingQuestions = data.pendingQuestions.map(q => {
      if (q.id === req.params.id) {
        return { ...q, ...req.body, resolvedAt: new Date().toISOString() };
      }
      return q;
    });
    fs.writeFileSync(answersJsonPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update pending question' });
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
