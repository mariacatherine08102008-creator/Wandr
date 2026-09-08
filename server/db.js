import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'wandr.db');
export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys & WAL mode for performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Initialize Database Tables
 */
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      coven TEXT NOT NULL,
      covenIcon TEXT NOT NULL,
      rarity TEXT NOT NULL,
      rarityColor TEXT NOT NULL,
      coords TEXT NOT NULL,
      address TEXT NOT NULL,
      distanceKm REAL,
      distanceText TEXT,
      hours TEXT,
      isOpen INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 50,
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      lore TEXT,
      secretPerk TEXT,
      image TEXT,
      isMystery INTEGER DEFAULT 0,
      keeperName TEXT,
      isCustom INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player (
      id TEXT PRIMARY KEY,
      playerName TEXT NOT NULL,
      playerTitle TEXT NOT NULL,
      level INTEGER DEFAULT 8,
      xp INTEGER DEFAULT 1850,
      xpForNextLevel INTEGER DEFAULT 2500,
      xpForCurrentLevel INTEGER DEFAULT 1500,
      streak INTEGER DEFAULT 7,
      shards INTEGER DEFAULT 14,
      avatar TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_discoveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerId TEXT NOT NULL,
      merchantId TEXT NOT NULL,
      xpAwarded INTEGER DEFAULT 50,
      discoveredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playerId, merchantId)
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      badgeColor TEXT,
      rewardXP INTEGER DEFAULT 100,
      rewardArtifact TEXT,
      description TEXT,
      expiresInSeconds INTEGER,
      difficulty TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS player_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerId TEXT NOT NULL,
      questId TEXT NOT NULL,
      status TEXT NOT NULL,
      acceptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedAt DATETIME,
      rewardClaimed INTEGER DEFAULT 0,
      UNIQUE(playerId, questId)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      coven TEXT NOT NULL,
      description TEXT NOT NULL,
      perk TEXT NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerId TEXT NOT NULL,
      eventId TEXT NOT NULL,
      rsvpedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playerId, eventId)
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      rank INTEGER,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      xp INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      badge TEXT NOT NULL,
      isUser INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchantId TEXT NOT NULL,
      playerId TEXT NOT NULL,
      playerName TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

/**
 * Seed initial realm data if not already populated
 */
function seedData() {
  // Check if player exists
  const playerCheck = db.prepare('SELECT id FROM player WHERE id = ?').get('althea');
  if (!playerCheck) {
    db.prepare(`
      INSERT INTO player (id, playerName, playerTitle, level, xp, xpForNextLevel, xpForCurrentLevel, streak, shards)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('althea', 'ALTHEA', 'APPRENTICE MAGE', 8, 1850, 2500, 1500, 7, 14);

    // Initial discovery
    db.prepare(`
      INSERT OR IGNORE INTO player_discoveries (playerId, merchantId, xpAwarded)
      VALUES (?, ?, ?)
    `).run('althea', 'moonlight-bakery', 75);
  }

  // Seed Merchants if table is empty
  const merchantCount = db.prepare('SELECT COUNT(*) as count FROM merchants').get();
  if (merchantCount.count === 0) {
    const initialMerchants = [
      {
        id: 'moonlight-bakery',
        name: 'Moonlight Bakery',
        coven: "Bakers' Coven",
        covenIcon: '🍞',
        rarity: 'Rare',
        rarityColor: '#38BDF8',
        coords: JSON.stringify([37.7758, -122.4215]),
        address: '422 San Carlos St, Hayes Ward',
        distanceKm: 0.8,
        distanceText: '0.8 KM AWAY',
        hours: 'Open till 4 PM',
        isOpen: 1,
        xp: 75,
        rating: 4.9,
        reviews: 128,
        lore: 'Fresh sourdough baked before sunrise under crescent moons. Ancient stone milling meets naturally leavened doughs and seasonal cardamoms baked in a hearth built in 1912.',
        secretPerk: 'Whisper "Crescent Hearth" at checkout for a complimentary cardamom knot.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZj5dApRgTMYHnOTLT0q08qdINYcrClX70Lwz5rr1tN5JfdSC6hHTq9gMRouK1LtPe6nIht2aornbAQ9Qcommue2nYftyxMcP9SbFgHpRh5Qpgy5X9Adc68xVhsndL3qA3XGyyhpQf7_WErOJHD_lkiqzR0puBQ2pSh3JEZ7efi6NgfCRSCDE5Gu1AJZbtBLPnvTYvk_fLQW6HYph7kYgYAGc_a3MZhBAM7kOmqIy-mn_QTk1BqFg14A',
        isMystery: 0,
        keeperName: 'Baker-Alchemist Soren'
      },
      {
        id: 'alchemist-apothecary',
        name: 'Alchemist Apothecary',
        coven: 'Potions & Elixirs',
        covenIcon: '🧪',
        rarity: 'Epic',
        rarityColor: '#B347FF',
        coords: JSON.stringify([37.7732, -122.4228]),
        address: '185 Valencia Pass, Sector-09',
        distanceKm: 1.2,
        distanceText: '1.2 KM AWAY',
        hours: 'Open till 7 PM',
        isOpen: 1,
        xp: 120,
        rating: 5.0,
        reviews: 94,
        lore: 'Handcrafted herbal elixirs, botanical tinctures, and small-batch skincare distilled from wildcrafted coastal flora and night-blooming botanicals.',
        secretPerk: 'Show your WANDR app to receive a vial of calming blue lotus mist with any tea purchase.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwD_xegWwLkeCkuCJ3JC0-klZbjfkYYl_5uFGpRrOPjUBMkLIxA0lZEwMlOjrNBgUHRKRz5lUd3g-CTEUfnQLgjSkjccx4fSpBRl_NdJYR29Bso7cAHY2BC2Yfx3QzCy1FTa028fc-uvmwinyyxWU8xvgRIjFNrnFO_L5zwVffNsPsvOPPVGkKr0g4XzPC-nKVkSdHMZssqJn9-vcgmzhbGCFQsh2y9ji4smKqXqFWN0LsuZ0PHPqrHg',
        isMystery: 0,
        keeperName: 'Herbalist Marigold'
      },
      {
        id: 'the-neon-loom',
        name: 'The Neon Loom',
        coven: 'Enchanted Threads',
        covenIcon: '🧵',
        rarity: 'Uncommon',
        rarityColor: '#00F59B',
        coords: JSON.stringify([37.7765, -122.4172]),
        address: '89 Hayes Blvd, Atelier 4',
        distanceKm: 0.4,
        distanceText: '0.4 KM AWAY',
        hours: 'Closes in 45m (7:30 PM)',
        isOpen: 1,
        xp: 50,
        rating: 4.8,
        reviews: 205,
        lore: 'Custom streetwear, deadstock Japanese textile restorations, and embroidered arcane sigils hand-stitched by master tailor Jaxen on antique mechanical looms.',
        secretPerk: 'Free luminescent ward patch sewn onto any jacket brought into the workshop.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiRPMQ1asfZ51y2UUsxgZJ_t5ayXWgNyvO9q1lY-mb2llgK5tVRsYfPcheF8GXtdSe0dXA1vBgSA0xtcq3nAUtZGXhoF_oXXrNuf4IDLZJip8yJKdMMEHJlx8-mie1kqoOxRsme_h_g5BY5VKGFSAL5F_QsNrmDhIhkg7owEMUu0nB2qZydJJPxZlfh_BExVQQ0562LvqYNY7XI9UmsNVDIZGGFOe8YRZyLPkUzQ-gak4ZRGFvqNajTg',
        isMystery: 0,
        keeperName: 'Tailor Jaxen'
      },
      {
        id: 'the-obsidian-tome',
        name: 'The Obsidian Tome',
        coven: 'Arcane Goods',
        covenIcon: '🔮',
        rarity: 'Epic',
        rarityColor: '#B347FF',
        coords: JSON.stringify([37.7741, -122.4182]),
        address: 'Secret Alleyway off Octavia St',
        distanceKm: 0.32,
        distanceText: '320M AWAY',
        hours: 'Open till 11 PM',
        isOpen: 1,
        xp: 150,
        rating: 4.95,
        reviews: 77,
        lore: 'A hidden bookstore and oddities sanctum concealed behind an unpretentious espresso hatch. Rare first editions, tarot codices, and obsidian scrying crystals.',
        secretPerk: 'Say "I seek the Fourth Sphere" to the barista for access to the hidden rear library.',
        image: 'https://images.unsplash.com/photo-1507842229451-79b1be8d6293?auto=format&fit=crop&w=800&q=80',
        isMystery: 1,
        keeperName: 'Archivist Thorne'
      },
      {
        id: 'mandrake-elixirs',
        name: 'Mandrake Elixirs & Teas',
        coven: 'Potions & Elixirs',
        covenIcon: '🧪',
        rarity: 'Uncommon',
        rarityColor: '#00F59B',
        coords: JSON.stringify([37.7772, -122.4208]),
        address: '312 Grove Street, Ward Gate',
        distanceKm: 0.18,
        distanceText: '180M AWAY',
        hours: 'Open till 8 PM',
        isOpen: 1,
        xp: 50,
        rating: 4.75,
        reviews: 142,
        lore: 'Herbal tonics brewed over bubbling copper cauldrons with organic reishi, lion’s mane, and hand-foraged yerba herbs from northern misty ridges.',
        secretPerk: '20% off your second infusion refill with an active Wandr daily streak.',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
        isMystery: 0,
        keeperName: 'Apothecary Lyra'
      },
      {
        id: 'solstice-vinyl',
        name: 'Solstice Vinyl & Curios',
        coven: 'Arcane Relics',
        covenIcon: '🎵',
        rarity: 'Rare',
        rarityColor: '#38BDF8',
        coords: JSON.stringify([37.7725, -122.4168]),
        address: '584 Mission Pass, Vault 2',
        distanceKm: 0.65,
        distanceText: '650M AWAY',
        hours: 'Open till 9 PM',
        isOpen: 1,
        xp: 85,
        rating: 4.88,
        reviews: 180,
        lore: 'Analog vinyl rarities from 1968 to present, vintage synthesizers, and vacuum tube amplifiers restored with meticulous mechanical reverence.',
        secretPerk: 'Private 15-minute listening booth session with any purchase above $15.',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
        isMystery: 0,
        keeperName: 'Curator Milo'
      },
      {
        id: 'celestial-roasters',
        name: 'Celestial Roasters',
        coven: 'Coffee Alchemy',
        covenIcon: '☕',
        rarity: 'Uncommon',
        rarityColor: '#00F59B',
        coords: JSON.stringify([37.7752, -122.4241]),
        address: '144 Fell Street',
        distanceKm: 0.5,
        distanceText: '500M AWAY',
        hours: 'Open till 5 PM',
        isOpen: 1,
        xp: 40,
        rating: 4.92,
        reviews: 310,
        lore: 'Single-origin Ethiopian and anaerobic fermented coffees roasted in micro-batches with precision thermal profiling and volcanic mineralized water.',
        secretPerk: 'Free pour-over tasting flight upgrade on first explorer check-in.',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
        isMystery: 0,
        keeperName: 'Roaster Elena'
      },
      {
        id: 'astral-ceramics',
        name: 'Astral Earth Ceramics',
        coven: 'Arcane Goods',
        covenIcon: '🏺',
        rarity: 'Legendary',
        rarityColor: '#FFD15C',
        coords: JSON.stringify([37.7718, -122.4199]),
        address: '920 Folsom Sanctum',
        distanceKm: 0.95,
        distanceText: '950M AWAY',
        hours: 'Open till 6 PM',
        isOpen: 1,
        xp: 200,
        rating: 5.0,
        reviews: 62,
        lore: 'Wood-fired stoneware and crystalline glaze pottery hand-thrown using wild clays harvested from dormant volcanic caldera basins.',
        secretPerk: 'Collect an exclusive ceramic explorer talisman upon completing a 7-day streak.',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        isMystery: 0,
        keeperName: 'Master Potter Kael'
      }
    ];

    const insertMerchant = db.prepare(`
      INSERT INTO merchants (id, name, coven, covenIcon, rarity, rarityColor, coords, address, distanceKm, distanceText, hours, isOpen, xp, rating, reviews, lore, secretPerk, image, isMystery, keeperName, isCustom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    for (const m of initialMerchants) {
      insertMerchant.run(
        m.id, m.name, m.coven, m.covenIcon, m.rarity, m.rarityColor,
        m.coords, m.address, m.distanceKm, m.distanceText, m.hours,
        m.isOpen, m.xp, m.rating, m.reviews, m.lore, m.secretPerk,
        m.image, m.isMystery, m.keeperName
      );
    }
  }

  // Seed Quests if empty
  const questCount = db.prepare('SELECT COUNT(*) as count FROM quests').get();
  if (questCount.count === 0) {
    const initialQuests = [
      {
        id: 'quest-threshold',
        title: "THE UNKNOWN THRESHOLD",
        type: "DAILY SPELL",
        badgeColor: "bg-tertiary-container text-on-tertiary-container",
        rewardXP: 150,
        rewardArtifact: "SILVER WARD SHARD",
        description: "Cross into the unfamiliar. Discover a local business within your current ward that you have never stepped foot into before. Check in with the merchant sigil.",
        expiresInSeconds: 24139,
        difficulty: "Apprentice",
        icon: "radar"
      },
      {
        id: 'quest-caffeine',
        title: "THE ROASTER'S ALCHEMY",
        type: "WEEKLY EXPEDITION",
        badgeColor: "bg-neon-mint/20 text-neon-mint",
        rewardXP: 100,
        rewardArtifact: "OBSIDIAN COFFEE BEAN",
        description: "Sample a single-origin brew from Celestial Roasters or any verified independent coffee sanctum in the active ward grid.",
        expiresInSeconds: 86400 * 3,
        difficulty: "Journeyman",
        icon: "local_cafe"
      },
      {
        id: 'quest-apothecary',
        title: "HERBALIST'S RITE",
        type: "COVEN BOUNTY",
        badgeColor: "bg-electric-violet/20 text-electric-violet",
        rewardXP: 120,
        rewardArtifact: "BLUE LOTUS VIAL",
        description: "Inquire about coastal flora distillation at Alchemist Apothecary or Mandrake Elixirs. Collect their digital codex card.",
        expiresInSeconds: 86400 * 4,
        difficulty: "Adept",
        icon: "vital_signs"
      },
      {
        id: 'quest-mystery-tome',
        title: "THE VEIL OF SECRETS",
        type: "EPIC MYSTERY",
        badgeColor: "bg-magical-gold/20 text-magical-gold",
        rewardXP: 250,
        rewardArtifact: "GOLDEN CODEX KEY",
        description: "Triangulate the sonar lock on Sector-09 and unlock the clandestine entrance to The Obsidian Tome.",
        expiresInSeconds: 86400 * 2,
        difficulty: "Master",
        icon: "auto_awesome"
      }
    ];

    const insertQuest = db.prepare(`
      INSERT INTO quests (id, title, type, badgeColor, rewardXP, rewardArtifact, description, expiresInSeconds, difficulty, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const q of initialQuests) {
      insertQuest.run(
        q.id, q.title, q.type, q.badgeColor, q.rewardXP,
        q.rewardArtifact, q.description, q.expiresInSeconds,
        q.difficulty, q.icon
      );
    }
  }

  // Seed Events if empty
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
  if (eventCount.count === 0) {
    const initialEvents = [
      {
        id: 'event-solstice',
        title: "Arcane Solstice Night Market",
        date: "THIS FRIDAY • 7:00 PM - 11:00 PM",
        location: "Octavia Courtyard & Sector-09 Alleys",
        coven: "Artisans & Bakers Guild",
        description: "Twilight gathering of 18 independent makers. Featuring warm spiced cider, torchlit sourdough tastings, live ambient modular synths, and limited-edition holographic cards.",
        perk: "+200 Discovery XP & Event Badge",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 'event-tea-ceremony',
        title: "Nocturnal Herbal Infusion Circle",
        date: "SATURDAY • 6:30 PM",
        location: "Alchemist Apothecary Greenhouse",
        coven: "Potions & Elixirs",
        description: "Intimate wildcrafted botanicals masterclass led by Herbalist Marigold. Taste coastal sage and blue lotus preparations brewed in glass alembics.",
        perk: "Vial of Arcane Mist + 100 XP",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 'event-loom-workshop',
        title: "Arcane Sigil Embroidery Atelier",
        date: "SUNDAY • 2:00 PM",
        location: "The Neon Loom Workspace",
        coven: "Enchanted Threads",
        description: "Bring a vintage denim or canvas piece to customize with reflective and luminescent protective ward sigils hand-guided by master Jaxen.",
        perk: "Sigil Card Unlock + 120 XP",
        image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80"
      }
    ];

    const insertEvent = db.prepare(`
      INSERT INTO events (id, title, date, location, coven, description, perk, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ev of initialEvents) {
      insertEvent.run(ev.id, ev.title, ev.date, ev.location, ev.coven, ev.description, ev.perk, ev.image);
    }
  }

  // Seed Leaderboard baseline champions
  const leaderCount = db.prepare('SELECT COUNT(*) as count FROM leaderboard').get();
  if (leaderCount.count === 0) {
    const initialLeaders = [
      { id: 'lead-1', rank: 1, name: "KAI_VALEN", title: "GRAND ARCH-MAGE", xp: 14280, streak: 42, badge: "👑 GOLD SIGIL", isUser: 0 },
      { id: 'lead-2', rank: 2, name: "ROWAN_GREY", title: "SECTOR PIONEER", xp: 11450, streak: 31, badge: "⚡ NEON CODEX", isUser: 0 },
      { id: 'lead-3', rank: 3, name: "NYX_CYPHER", title: "MASTER CARTOGRAPHER", xp: 9820, streak: 26, badge: "🔮 OBSIDIAN KEY", isUser: 0 },
      { id: 'lead-4', rank: 4, name: "SOLARIS_B", title: "COVEN VANGUARD", xp: 6240, streak: 18, badge: "🍞 HEARTH MASTER", isUser: 0 },
      { id: 'lead-6', rank: 6, name: "TESSA_W", title: "WARD SCOUT", xp: 1620, streak: 6, badge: "🧵 NEEDLE RUNIC", isUser: 0 },
      { id: 'lead-7', rank: 7, name: "DARIEN_K", title: "WAYFINDER", xp: 1390, streak: 4, badge: "🧭 COMPASS BEACON", isUser: 0 }
    ];

    const insertLeader = db.prepare(`
      INSERT INTO leaderboard (id, rank, name, title, xp, streak, badge, isUser)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const l of initialLeaders) {
      insertLeader.run(l.id, l.rank, l.name, l.title, l.xp, l.streak, l.badge, l.isUser);
    }
  }
}

// Auto-initialize when imported
initDB();
