import { Router } from 'express';
import { db } from '../db.js';

export const leaderboardRouter = Router();

/**
 * GET /api/leaderboard
 * Computes dynamic real-time rankings with the player's active XP and streak
 */
leaderboardRouter.get('/', (req, res) => {
  try {
    const player = db.prepare('SELECT * FROM player WHERE id = ?').get('althea');
    const npcLeaders = db.prepare('SELECT * FROM leaderboard WHERE isUser = 0').all();

    const userBadge = player.level >= 15 ? '👑 GRAND SIGIL' : (player.level >= 10 ? '⚡ NEON RUNIC' : '⚔️ APPRENTICE');

    const allEntries = [
      ...npcLeaders.map(l => ({
        id: l.id,
        name: l.name,
        title: l.title,
        xp: l.xp,
        streak: l.streak,
        badge: l.badge,
        isUser: false
      })),
      {
        id: 'althea-user',
        name: player.playerName,
        title: player.playerTitle,
        xp: player.xp,
        streak: player.streak,
        badge: userBadge,
        isUser: true
      }
    ];

    // Sort descending by XP, then streak
    allEntries.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.streak - a.streak;
    });

    // Assign dynamic ranks
    const ranked = allEntries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));

    res.json({
      leaders: ranked,
      weeklyReset: "2D 14H REMAINING",
      userRank: ranked.findIndex(r => r.isUser) + 1
    });
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

/**
 * GET /api/telemetry
 * Live ward pulse telemetry
 */
leaderboardRouter.get('/telemetry', (req, res) => {
  try {
    const totalMerchants = db.prepare('SELECT COUNT(*) as count FROM merchants').get().count;
    const openMerchants = db.prepare('SELECT COUNT(*) as count FROM merchants WHERE isOpen = 1').get().count;
    const customMerchants = db.prepare('SELECT COUNT(*) as count FROM merchants WHERE isCustom = 1').get().count;
    const mysteryCount = db.prepare('SELECT COUNT(*) as count FROM merchants WHERE isMystery = 1').get().count;
    
    // Calculate undiscovered merchant XP pool for player
    const discovered = db.prepare(`
      SELECT merchantId FROM player_discoveries WHERE playerId = 'althea'
    `).all().map(d => d.merchantId);

    const allMerchants = db.prepare('SELECT id, xp FROM merchants').all();
    const readyPoolXP = allMerchants
      .filter(m => !discovered.includes(m.id))
      .reduce((sum, m) => sum + (m.xp || 50), 0);

    const player = db.prepare('SELECT streak FROM player WHERE id = ?').get('althea');

    res.json({
      sector: 'SECTOR-09 EAST',
      status: 'REALM ACTIVE • GPS SYNCED',
      totalMerchants,
      openMerchants,
      customMerchants,
      mysteryCount,
      readyPoolXP: readyPoolXP + 3000, // baseline ward grid pool + undiscovered
      playerStreak: player ? player.streak : 7,
      sonarLock: '320M SONAR LOCK'
    });
  } catch (err) {
    console.error('Error fetching telemetry:', err);
    res.status(500).json({ error: 'Failed to retrieve telemetry' });
  }
});
