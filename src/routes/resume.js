// Resume API Routes
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = express.Router();

const getDataPath = (filename) => path.join(process.cwd(), 'data', filename);
const dataDir = getDataPath('');

// Multer config
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dataDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `resume${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

const readJson = (filepath, defaultValue = {}) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) || defaultValue;
  } catch { return defaultValue; }
};

const writeJson = (filepath, data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// GET resume
router.get('/', (req, res) => {
  res.json(readJson(getDataPath('resume.json')));
});

// POST resume
router.post('/', (req, res) => {
  writeJson(getDataPath('resume.json'), req.body);
  res.json({ success: true });
});

// Upload + parse resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(path.join(dataDir, req.file.filename));
    const data = await pdfParse(dataBuffer);
    
    // Save parsed text
    fs.writeFileSync(getDataPath('resume.txt'), data.text);
    
    // Save metadata
    const meta = {
      sourceFile: req.file.filename,
      parsedAt: new Date().toISOString(),
      textLength: data.text.length
    };
    writeJson(getDataPath('resume-meta.json'), meta);

    res.json({ success: true, file: req.file.filename, textLength: data.text.length });
  } catch (e) {
    res.json({ success: true, file: req.file.filename });
  }
});

// GET resume text
router.get('/text', (req, res) => {
  const textPath = getDataPath('resume.txt');
  if (fs.existsSync(textPath)) {
    res.json({ exists: true, text: fs.readFileSync(textPath, 'utf-8') });
  } else {
    res.json({ exists: false, text: '' });
  }
});

export default router;
