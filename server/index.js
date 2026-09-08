import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import './db.js'; // Ensure DB is initialized & seeded
import { merchantsRouter } from './routes/merchants.js';
import { playerRouter } from './routes/player.js';
import { questsRouter } from './routes/quests.js';
import { eventsRouter } from './routes/events.js';
import { leaderboardRouter } from './routes/leaderboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in dev
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[WANDR-API] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    realm: 'WANDR Arcane Realm',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/merchants', merchantsRouter);
app.use('/api/player', playerRouter);
app.use('/api/quests', questsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/telemetry', (req, res) => {
  // Shortcut to /api/leaderboard/telemetry
  res.redirect('/api/leaderboard/telemetry');
});

// Serve frontend build if dist exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[WANDR-API Error]:', err);
  res.status(500).json({ error: 'Internal arcane portal error', message: err.message });
});

// Start listening if run directly as main entrypoint
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`🔮 [WANDR ARCANE BACKEND] Active and listening on http://localhost:${PORT}`);
  });
}
