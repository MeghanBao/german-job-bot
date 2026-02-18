// Resume API Routes - Enhanced with better error handling
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = express.Router();

const getDataPath = (filename) => path.join(process.cwd(), 'data', filename);
const dataDir = getDataPath('');

// Multer config with enhanced validation
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dataDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, esume);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

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

// Upload + parse resume with progress tracking
router.post('/upload', upload.single('resume'), handleUploadError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const filePath = path.join(dataDir, req.file.filename);
    
    // Check file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found after upload' });
    }
    
    const dataBuffer = fs.readFileSync(filePath);
    
    // Check file is not empty
    if (dataBuffer.length === 0) {
      fs.unlinkSync(filePath); // Clean up empty file
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }
    
    const data = await pdfParse(dataBuffer);
    
    // Save parsed text
    fs.writeFileSync(getDataPath('resume.txt'), data.text || '');
    
    // Save metadata
    const meta = {
      sourceFile: req.file.filename,
      parsedAt: new Date().toISOString(),
      textLength: data.text?.length || 0,
      pageCount: data.numpages || 0
    };
    writeJson(getDataPath('resume-meta.json'), meta);

    res.json({ 
      success: true, 
      file: req.file.filename, 
      textLength: data.text?.length || 0,
      pageCount: data.numpages || 0
    });
  } catch (e) {
    console.error('PDF parse error:', e);
    // Return success anyway to not block the user - they can enter manually
    res.json({ 
      success: true, 
      file: req.file.filename, 
      textLength: 0,
      warning: 'Could not parse PDF. Please enter resume details manually.'
    });
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
