import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware.js';
import { validateRequest } from './middlewares/validate.middleware.js';
import { generateSchema, batchVariantsSchema } from './schemas/api.schema.js';
import { createGenerationJob, getJobStatus, createBatchVariants } from './controllers/jobController.js';
import { getPresets } from './controllers/presetController.js';

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(process.cwd(), 'public')));

// API Documentation/Readme
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Library UI page
app.get('/library', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'library.html'));
});


// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.post('/api/generate', upload.single('image'), validateRequest(generateSchema), createGenerationJob);
app.get('/api/jobs/:id', getJobStatus);
app.post('/api/batch-variants', upload.single('image'), validateRequest(batchVariantsSchema), createBatchVariants);
app.get('/api/presets', getPresets);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] ChromaDish API running on port ${PORT}`);
});
