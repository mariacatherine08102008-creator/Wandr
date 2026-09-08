import { app } from './index.js';
import http from 'node:http';

async function runTests() {
  console.log('🧪 Starting Wandr Backend API Integration Tests...\n');

  // Start test server on ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  // Reset player state to ensure clean test environment
  await fetch(`${baseUrl}/api/player/reset`, { method: 'POST' });

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') throw new Error(`Status ${res.status}, ${JSON.stringify(data)}`);
  });

  // 2. Merchants List
  await test('GET /api/merchants returns seeded merchants', async () => {
    const res = await fetch(`${baseUrl}/api/merchants`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 8) throw new Error(`Expected at least 8 merchants, got ${data.length}`);
    if (!data.some(m => m.id === 'moonlight-bakery')) throw new Error('moonlight-bakery not found');
  });

  // 3. Filter Merchants
  await test('GET /api/merchants?coven=Bakers\' Coven returns filtered', async () => {
    const res = await fetch(`${baseUrl}/api/merchants?coven=${encodeURIComponent("Bakers' Coven")}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No bakers found');
    if (data.some(m => m.coven !== "Bakers' Coven")) throw new Error('Returned incorrect coven');
  });

  // 4. Merchant Details
  await test('GET /api/merchants/:id returns details and isDiscovered', async () => {
    const res = await fetch(`${baseUrl}/api/merchants/moonlight-bakery`);
    const data = await res.json();
    if (data.id !== 'moonlight-bakery' || !data.name) throw new Error('Invalid merchant details');
    if (data.isDiscovered !== true) throw new Error('Expected moonlight-bakery to be discovered by default');
  });

  // 5. Register Merchant
  let registeredMerchantId = null;
  await test('POST /api/merchants registers a new indie shop', async () => {
    const payload = {
      name: 'The Starlight Astrolabe',
      coven: 'Arcane Goods',
      rarity: 'Rare',
      address: '77 Hayes St, San Francisco',
      hours: 'Open till 10 PM',
      keeperName: 'Astronomer Vesper',
      lore: 'Hand-ground brass celestial globes and ancient stellar charts.',
      secretPerk: 'Complimentary star map with purchase'
    };
    const res = await fetch(`${baseUrl}/api/merchants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status !== 201 || !data.merchant || !data.merchant.id) throw new Error(`Failed to create: ${JSON.stringify(data)}`);
    registeredMerchantId = data.merchant.id;
    if (data.merchant.name !== payload.name) throw new Error('Name mismatch');
  });

  // 6. Check In at Merchant
  await test('POST /api/merchants/:id/checkin stamps sigil and awards XP', async () => {
    const res = await fetch(`${baseUrl}/api/merchants/alchemist-apothecary/checkin`, {
      method: 'POST'
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) throw new Error(`Checkin failed: ${JSON.stringify(data)}`);
    if (data.xpGained !== 120) throw new Error(`Expected 120 XP, got ${data.xpGained}`);
  });

  // 7. Duplicate Check In
  await test('POST /api/merchants/:id/checkin handles duplicate gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/merchants/alchemist-apothecary/checkin`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!data.alreadyDiscovered) throw new Error('Expected alreadyDiscovered flag');
  });

  // 8. Player Profile & State
  await test('GET /api/player returns consolidated player state', async () => {
    const res = await fetch(`${baseUrl}/api/player`);
    const data = await res.json();
    if (data.playerName !== 'ALTHEA') throw new Error('Incorrect player name');
    if (!data.discoveredMerchantIds.includes('alchemist-apothecary')) throw new Error('Missing checked-in merchant in discoveries');
  });

  // 9. Quests: List, Accept, Complete
  await test('GET, POST /api/quests accept and complete workflow', async () => {
    // List
    const listRes = await fetch(`${baseUrl}/api/quests`);
    const quests = await listRes.json();
    if (!Array.isArray(quests) || quests.length === 0) throw new Error('No quests returned');

    // Accept
    const acceptRes = await fetch(`${baseUrl}/api/quests/quest-caffeine/accept`, { method: 'POST' });
    const acceptData = await acceptRes.json();
    if (!acceptData.success) throw new Error('Failed to accept quest');

    // Complete
    const completeRes = await fetch(`${baseUrl}/api/quests/quest-caffeine/complete`, { method: 'POST' });
    const completeData = await completeRes.json();
    if (!completeData.success) throw new Error('Failed to complete quest');
  });

  // 10. Events: List & RSVP
  await test('GET /api/events and POST RSVP', async () => {
    const listRes = await fetch(`${baseUrl}/api/events`);
    const events = await listRes.json();
    if (!Array.isArray(events) || events.length === 0) throw new Error('No events returned');

    const rsvpRes = await fetch(`${baseUrl}/api/events/event-solstice/rsvp`, { method: 'POST' });
    const rsvpData = await rsvpRes.json();
    if (!rsvpData.success) throw new Error('Failed to RSVP');
  });

  // 11. Leaderboard & Telemetry
  await test('GET /api/leaderboard returns ranked explorers with live user', async () => {
    const res = await fetch(`${baseUrl}/api/leaderboard`);
    const data = await res.json();
    if (!Array.isArray(data.leaders) || data.leaders.length === 0) throw new Error('No leaderboard data');
    const user = data.leaders.find(l => l.isUser);
    if (!user) throw new Error('Current player not in leaderboard');
    if (user.name !== 'ALTHEA') throw new Error('User name mismatch');
  });

  await test('GET /api/leaderboard/telemetry returns ward pulse metrics', async () => {
    const res = await fetch(`${baseUrl}/api/leaderboard/telemetry`);
    const data = await res.json();
    if (!data.sector || data.totalMerchants < 8) throw new Error('Invalid telemetry stats');
  });

  // Teardown
  server.close();

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
