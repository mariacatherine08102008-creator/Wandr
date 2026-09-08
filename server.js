/**
 * WANDR - Main Server Entry Point
 * Runs the Arcane REST API and static fallback handlers
 */
import { app } from './server/index.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[WANDR] Arcane Portal & API active on http://localhost:${PORT}`);
});
