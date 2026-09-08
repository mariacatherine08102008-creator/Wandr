import { Router } from 'express';
import { db } from '../db.js';
import { formatMerchant } from './merchants.js';

export const playerRouter = Router();

/**
 * Award XP to player and handle level ups, thresholds, and titles
 */
export function awardXPToPlayer(playerId = 'althea', amount, reason = 'Explorer Discovery') {
  const player = db.prepare('SELECT * FROM player WHERE id = ?').get(playerId);
  if (!player) return null;

  let leveledUp = false;
  let newLevel = player.level;
  let nextThreshold = player.xpForNextLevel;
  let currThreshold = player.xpForCurrentLevel;
  let newXP = player.xp + amount;
  let newTitle = player.playerTitle;

  while (newXP >= nextThreshold) {
    leveledUp = true;
    newLevel += 1;
    currThreshold = nextThreshold;
    nextThreshold = Math.floor(nextThreshold * 1.4);
  }

  if (newLevel >= 15) newTitle = 'ARCH-MAGE CARTOGRAPHER';
  else if (newLevel >= 12) newTitle = 'REALM EXPLORER MASTER';
  else if (newLevel >= 10) newTitle = 'JOURNEYMAN ARCANIST';

  db.prepare(`
    UPDATE player
    SET xp = ?, level = ?, xpForNextLevel = ?, xpForCurrentLevel = ?, playerTitle = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newXP, newLevel, nextThreshold, currThreshold, newTitle, playerId);

  const updated = db.prepare('SELECT * FROM player WHERE id = ?').get(playerId);
  return {
    ...updated,
    leveledUp,
    reason
  };
}

/**
 * Get full consolidated player state formatted for client GameStateContext
 */
export function getConsolidatedPlayerState(playerId = 'althea') {
  const player = db.prepare('SELECT * FROM player WHERE id = ?').get(playerId);
  if (!player) return null;

  // Discovered merchant IDs
  const discoveries = db.prepare(`
    SELECT merchantId FROM player_discoveries WHERE playerId = ? ORDER BY discoveredAt ASC
  `).all(playerId);
  const discoveredMerchantIds = discoveries.map(d => d.merchantId);

  // Accepted & Completed quests
  const acceptedQuests = db.prepare(`
    SELECT questId FROM player_quests WHERE playerId = ? AND status = 'accepted'
  `).all(playerId);
  const acceptedQuestIds = acceptedQuests.map(q => q.questId);

  const completedQuests = db.prepare(`
    SELECT questId FROM player_quests WHERE playerId = ? AND status = 'completed'
  `).all(playerId);
  const completedQuestIds = completedQuests.map(q => q.questId);

  // Custom registered merchants
  const customMerchantRows = db.prepare(`
    SELECT * FROM merchants WHERE isCustom = 1 ORDER BY createdAt DESC
  `).all();
  const customMerchants = customMerchantRows.map(formatMerchant);

  return {
    playerName: player.playerName,
    playerTitle: player.playerTitle,
    level: player.level,
    xp: player.xp,
    xpForNextLevel: player.xpForNextLevel,
    xpForCurrentLevel: player.xpForCurrentLevel,
    streak: player.streak,
    shards: player.shards,
    discoveredMerchantIds,
    acceptedQuestIds,
    completedQuestIds,
    customMerchants
  };
}

/**
 * GET /api/player
 * Consolidated player profile and state
 */
playerRouter.get('/', (req, res) => {
  try {
    const state = getConsolidatedPlayerState('althea');
    if (!state) {
      return res.status(404).json({ error: 'Player profile not found' });
    }
    res.json(state);
  } catch (err) {
    console.error('Error getting player state:', err);
    res.status(500).json({ error: 'Failed to retrieve player state' });
  }
});

/**
 * PUT /api/player
 * Update player profile (name, title, streak, shards)
 */
playerRouter.put('/', (req, res) => {
  try {
    const { playerName, playerTitle, streak, shards } = req.body;
    const player = db.prepare('SELECT * FROM player WHERE id = ?').get('althea');
    if (!player) return res.status(404).json({ error: 'Player not found' });

    db.prepare(`
      UPDATE player
      SET playerName = COALESCE(?, playerName),
          playerTitle = COALESCE(?, playerTitle),
          streak = COALESCE(?, streak),
          shards = COALESCE(?, shards),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = 'althea'
    `).run(playerName, playerTitle, streak, shards);

    const updated = getConsolidatedPlayerState('althea');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

/**
 * POST /api/player/xp
 * Add XP to player manually
 */
playerRouter.post('/xp', (req, res) => {
  try {
    const { amount = 50, reason = 'Discovery' } = req.body;
    const result = awardXPToPlayer('althea', Number(amount), reason);
    const fullState = getConsolidatedPlayerState('althea');
    res.json({
      playerState: fullState,
      leveledUp: result.leveledUp,
      level: result.level,
      playerTitle: result.playerTitle
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

/**
 * POST /api/player/reset
 * Reset explorer profile to initial state for testing/demo
 */
playerRouter.post('/reset', (req, res) => {
  try {
    db.prepare(`
      UPDATE player
      SET playerName = 'ALTHEA',
          playerTitle = 'APPRENTICE MAGE',
          level = 8,
          xp = 1850,
          xpForNextLevel = 2500,
          xpForCurrentLevel = 1500,
          streak = 7,
          shards = 14,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = 'althea'
    `).run();

    // Reset discoveries to just moonlight-bakery
    db.prepare(`DELETE FROM player_discoveries WHERE playerId = 'althea' AND merchantId != 'moonlight-bakery'`).run();
    db.prepare(`DELETE FROM player_quests WHERE playerId = 'althea'`).run();
    db.prepare(`DELETE FROM event_rsvps WHERE playerId = 'althea'`).run();

    const state = getConsolidatedPlayerState('althea');
    res.json({ message: 'Explorer state reset to initial apprentice levels', state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset player state' });
  }
});
