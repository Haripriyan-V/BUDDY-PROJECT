import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import ttsRouter from './routes/tts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BUDDY AI Server Proxy',
    aiConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_api_key_here'),
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

// Serve static frontend assets if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🤖 BUDDY Server Proxy active on http://localhost:${PORT}`);
  console.log(`📡 AI Provider: ${process.env.AI_PROVIDER || 'local fallback only'}`);
});

