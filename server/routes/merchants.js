import { Router } from 'express';
import { db } from '../db.js';
import { awardXPToPlayer } from './player.js';

export const merchantsRouter = Router();

/**
 * Format raw SQLite merchant row into JSON response format expected by client
 */
export function formatMerchant(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    coven: row.coven,
    covenIcon: row.covenIcon,
    rarity: row.rarity,
    rarityColor: row.rarityColor,
    coords: typeof row.coords === 'string' ? JSON.parse(row.coords) : row.coords,
    address: row.address,
    distanceKm: row.distanceKm,
    distanceText: row.distanceText,
    hours: row.hours,
    isOpen: Boolean(row.isOpen),
    xp: row.xp,
    rating: row.rating,
    reviews: row.reviews,
    lore: row.lore,
    secretPerk: row.secretPerk,
    image: row.image,
    isMystery: Boolean(row.isMystery),
    keeperName: row.keeperName,
    isCustom: Boolean(row.isCustom),
    createdAt: row.createdAt
  };
}

/**
 * GET /api/merchants
 * Query params: coven, q
 */
merchantsRouter.get('/', (req, res) => {
  try {
    const { coven, q } = req.query;
    let query = 'SELECT * FROM merchants WHERE 1=1';
    const params = [];

    if (coven && coven !== 'ALL') {
      query += ' AND coven = ?';
      params.push(coven);
    }

    if (q) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(coven) LIKE ? OR LOWER(lore) LIKE ? OR LOWER(address) LIKE ?)';
      const search = `%${q.toLowerCase()}%`;
      params.push(search, search, search, search);
    }

    query += ' ORDER BY isCustom DESC, name ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatMerchant));
  } catch (err) {
    console.error('Error fetching merchants:', err);
    res.status(500).json({ error: 'Failed to retrieve merchants' });
  }
});

/**
 * GET /api/merchants/:id
 */
merchantsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM merchants WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Check if discovered by current player (althea)
    const discovery = db.prepare('SELECT * FROM player_discoveries WHERE playerId = ? AND merchantId = ?').get('althea', id);
    const merchant = formatMerchant(row);
    merchant.isDiscovered = Boolean(discovery);

    // Fetch reviews
    const reviews = db.prepare('SELECT * FROM reviews WHERE merchantId = ? ORDER BY createdAt DESC').all(id);
    merchant.communityReviews = reviews;

    res.json(merchant);
  } catch (err) {
    console.error('Error fetching merchant details:', err);
    res.status(500).json({ error: 'Failed to retrieve merchant details' });
  }
});

/**
 * POST /api/merchants
 * Register a new indie shop into the Ward Radar
 */
merchantsRouter.post('/', (req, res) => {
  try {
    const {
      name,
      coven = "Arcane Goods",
      covenIcon = "✨",
      rarity = "Uncommon",
      address = "Hayes Valley Sanctuary",
      hours = "Open till 8 PM",
      keeperName = "Sanctuary Guardian",
      lore = "A newly consecrated independent establishment pledged to the Wandr local realm.",
      secretPerk = "Welcome perk: 10% off your first community exploration visit.",
      image = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
      coords
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Merchant name is required' });
    }

    const newId = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const rarityColor = rarity === 'Rare' ? '#38BDF8' : (rarity === 'Epic' ? '#B347FF' : '#00F59B');
    const finalCoords = coords && Array.isArray(coords) ? coords : [
      37.7749 + (Math.random() - 0.5) * 0.008,
      -122.4194 + (Math.random() - 0.5) * 0.008
    ];

    const insert = db.prepare(`
      INSERT INTO merchants (
        id, name, coven, covenIcon, rarity, rarityColor, coords, address,
        distanceKm, distanceText, hours, isOpen, xp, rating, reviews,
        lore, secretPerk, image, isMystery, keeperName, isCustom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insert.run(
      newId, name.trim(), coven, covenIcon, rarity, rarityColor,
      JSON.stringify(finalCoords), address.trim(), 0.3, '300M AWAY',
      hours.trim(), 1, 75, 5.0, 1, lore.trim(), secretPerk.trim(),
      image.trim() || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      0, keeperName.trim()
    );

    // Auto-discover for creator
    db.prepare(`
      INSERT OR IGNORE INTO player_discoveries (playerId, merchantId, xpAwarded)
      VALUES (?, ?, ?)
    `).run('althea', newId, 100);

    // Award XP to player for registration
    const updatedPlayer = awardXPToPlayer('althea', 100, `Merchant Guild Charter: ${name}`);

    const createdRow = db.prepare('SELECT * FROM merchants WHERE id = ?').get(newId);
    res.status(201).json({
      merchant: formatMerchant(createdRow),
      player: updatedPlayer,
      xpAwarded: 100,
      message: `${name} registered on Ward radar!`
    });
  } catch (err) {
    console.error('Error registering merchant:', err);
    res.status(500).json({ error: 'Failed to consecrate merchant' });
  }
});

/**
 * POST /api/merchants/:id/checkin
 * Check in and stamp sigil at a physical merchant
 */
merchantsRouter.post('/:id/checkin', (req, res) => {
  try {
    const { id } = req.params;
    const merchantRow = db.prepare('SELECT * FROM merchants WHERE id = ?').get(id);
    if (!merchantRow) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const merchant = formatMerchant(merchantRow);

    // Check if already discovered
    const existing = db.prepare('SELECT * FROM player_discoveries WHERE playerId = ? AND merchantId = ?').get('althea', id);
    if (existing) {
      return res.status(200).json({
        alreadyDiscovered: true,
        message: `${merchant.name} is already stamped in your Arcane Codex!`,
        merchant
      });
    }

    const xpGained = merchant.xp || 50;

    // Record discovery
    db.prepare(`
      INSERT INTO player_discoveries (playerId, merchantId, xpAwarded)
      VALUES (?, ?, ?)
    `).run('althea', id, xpGained);

    // Award +1 shard to player
    db.prepare(`UPDATE player SET shards = shards + 1 WHERE id = 'althea'`).run();

    // Check daily quest "quest-threshold"
    const activeThresholdQuest = db.prepare(`
      SELECT * FROM player_quests WHERE playerId = 'althea' AND questId = 'quest-threshold' AND status = 'accepted'
    `).get();

    if (activeThresholdQuest) {
      db.prepare(`
        UPDATE player_quests SET status = 'completed', completedAt = CURRENT_TIMESTAMP, rewardClaimed = 1
        WHERE playerId = 'althea' AND questId = 'quest-threshold'
      `).run();
      // Daily quest reward: +150 XP & +1 shard
      db.prepare(`UPDATE player SET shards = shards + 1 WHERE id = 'althea'`).run();
      awardXPToPlayer('althea', 150, 'Completed Daily Magic Quest: The Unknown Threshold');
    }

    // Award discovery XP
    const updatedPlayer = awardXPToPlayer('althea', xpGained, `Check-in: ${merchant.name}`);

    res.json({
      success: true,
      xpGained,
      merchant,
      player: updatedPlayer,
      thresholdQuestCompleted: Boolean(activeThresholdQuest),
      message: `Sigil stamped for ${merchant.name}! Added to compendium.`
    });
  } catch (err) {
    console.error('Error during merchant check-in:', err);
    res.status(500).json({ error: 'Failed to stamp merchant sigil' });
  }
});

/**
 * GET /api/merchants/:id/reviews
 */
merchantsRouter.get('/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const reviews = db.prepare('SELECT * FROM reviews WHERE merchantId = ? ORDER BY createdAt DESC').all(id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

/**
 * POST /api/merchants/:id/reviews
 */
merchantsRouter.post('/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const { rating = 5.0, comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Review comment is required' });
    }

    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const player = db.prepare('SELECT * FROM player WHERE id = ?').get('althea');

    db.prepare(`
      INSERT INTO reviews (merchantId, playerId, playerName, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, 'althea', player ? player.playerName : 'Explorer', Number(rating), comment.trim());

    // Recalculate average rating
    const stats = db.prepare(`
      SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE merchantId = ?
    `).get(id);

    db.prepare(`
      UPDATE merchants SET rating = ROUND(?, 2), reviews = ? WHERE id = ?
    `).run(stats.avgRating || rating, stats.count, id);

    res.status(201).json({ success: true, message: 'Review recorded in archives' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record review' });
  }
});
