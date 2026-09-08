import { Router } from 'express';
import { db } from '../db.js';
import { awardXPToPlayer, getConsolidatedPlayerState } from './player.js';

export const questsRouter = Router();

/**
 * GET /api/quests
 * Returns all quests annotated with player's active and completed status
 */
questsRouter.get('/', (req, res) => {
  try {
    const quests = db.prepare('SELECT * FROM quests ORDER BY id ASC').all();

    const accepted = db.prepare(`
      SELECT questId FROM player_quests WHERE playerId = 'althea' AND status = 'accepted'
    `).all().map(r => r.questId);

    const completed = db.prepare(`
      SELECT questId FROM player_quests WHERE playerId = 'althea' AND status = 'completed'
    `).all().map(r => r.questId);

    const annotated = quests.map(q => ({
      ...q,
      isActive: accepted.includes(q.id) && !completed.includes(q.id),
      isCompleted: completed.includes(q.id)
    }));

    res.json(annotated);
  } catch (err) {
    console.error('Error fetching quests:', err);
    res.status(500).json({ error: 'Failed to retrieve quests' });
  }
});

/**
 * POST /api/quests/:id/accept
 * Accept a quest / bounty
 */
questsRouter.post('/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(id);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if already completed or accepted
    const existing = db.prepare('SELECT * FROM player_quests WHERE playerId = ? AND questId = ?').get('althea', id);
    if (existing && existing.status === 'completed') {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    if (!existing) {
      db.prepare(`
        INSERT INTO player_quests (playerId, questId, status)
        VALUES (?, ?, 'accepted')
      `).run('althea', id);
    }

    const playerState = getConsolidatedPlayerState('althea');
    res.json({
      success: true,
      questId: id,
      message: `Quest "${quest.title}" accepted!`,
      player: playerState
    });
  } catch (err) {
    console.error('Error accepting quest:', err);
    res.status(500).json({ error: 'Failed to accept quest' });
  }
});

/**
 * POST /api/quests/:id/complete
 * Complete quest and claim XP + artifacts
 */
questsRouter.post('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(id);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    const existing = db.prepare('SELECT * FROM player_quests WHERE playerId = ? AND questId = ?').get('althea', id);
    if (existing && existing.status === 'completed') {
      return res.status(200).json({
        alreadyCompleted: true,
        message: 'Quest rewards already claimed'
      });
    }

    if (existing) {
      db.prepare(`
        UPDATE player_quests
        SET status = 'completed', completedAt = CURRENT_TIMESTAMP, rewardClaimed = 1
        WHERE playerId = 'althea' AND questId = ?
      `).run(id);
    } else {
      db.prepare(`
        INSERT INTO player_quests (playerId, questId, status, completedAt, rewardClaimed)
        VALUES ('althea', ?, 'completed', CURRENT_TIMESTAMP, 1)
      `).run(id);
    }

    // Award +2 silver shards
    db.prepare(`UPDATE player SET shards = shards + 2 WHERE id = 'althea'`).run();

    // Award XP
    const rewardXP = quest.rewardXP || 150;
    const playerResult = awardXPToPlayer('althea', rewardXP, `Quest Bounty Claimed: ${quest.title}`);
    const playerState = getConsolidatedPlayerState('althea');

    res.json({
      success: true,
      questId: id,
      rewardXP,
      rewardArtifact: quest.rewardArtifact,
      message: `+${rewardXP} XP and 2 Silver Ward Shards claimed!`,
      player: playerState,
      leveledUp: playerResult.leveledUp
    });
  } catch (err) {
    console.error('Error completing quest:', err);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});
