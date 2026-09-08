import React, { useState, useEffect } from 'react';
import { WardMap } from '../components/WardMap';
import { useGameState } from '../context/GameStateContext';

export function TheWardView() {
  const { allMerchants, openCodex, setIsRegisterOpen, acceptQuest, state } = useGameState();
  const [bountyActive, setBountyActive] = useState(state.acceptedQuestIds.includes('quest-threshold'));
  const [secondsRemaining, setSecondsRemaining] = useState(24139);

  // Sync bounty state
  useEffect(() => {
    setBountyActive(state.acceptedQuestIds.includes('quest-threshold'));
  }, [state.acceptedQuestIds]);

  // Daily spell countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev <= 1 ? 86400 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(secondsRemaining / 3600);
  const m = Math.floor((secondsRemaining % 3600) / 60);
  const s = secondsRemaining % 60;
  const formattedCountdown = `${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}M ${String(s).padStart(2, '0')}S`;

  const handleAcceptBounty = () => {
    acceptQuest('quest-threshold');
    setBountyActive(true);
  };

  const scrollToCartography = () => {
    const el = document.getElementById('cartography-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Top 3 featured merchants
  const featured = allMerchants.slice(0, 3);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* SECTION 1: HERO ARC */}
      <section className="relative w-full py-space-3xl px-grid-gutter-desktop max-w-ward-max-width mx-auto flex flex-col items-center text-center">
        {/* Ambient Arcane Glow Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-electric-violet/15 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute top-12 left-1/4 w-[380px] h-[220px] bg-neon-mint/10 blur-[90px] pointer-events-none rounded-full"></div>

        {/* Telemetry Status Pill */}
        <div className="relative z-10 inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-card shadow-lg mb-space-xl border border-white/5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-mint animate-ping"></span>
          <span className="font-code-pill text-code-pill text-magical-gold tracking-wider uppercase font-bold">⚡ WARD STATUS:</span>
          <span className="font-code-pill text-code-pill text-text-primary hidden sm:inline">REALM ACTIVE • GPS SYNCED</span>
          <span className="font-code-pill text-code-pill text-text-muted">•</span>
          <span className="font-code-pill text-code-pill text-neon-mint">{allMerchants.length} MERCHANTS DETECTED</span>
          <span className="font-code-pill text-code-pill text-text-muted hidden md:inline">•</span>
          <span className="font-code-pill text-code-pill text-electric-violet font-bold hidden md:inline">1 MYSTERY COVEN NEARBY</span>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 font-display-hero text-display-hero uppercase tracking-tight text-text-primary max-w-5xl">
          EVERY STREET HIDES A STORY. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-mint via-magical-gold to-electric-violet">
            EVERY SHOP HIDES A TREASURE.
          </span>
        </h1>
        <p className="relative z-10 font-body-lg text-body-lg text-text-secondary max-w-2xl mt-space-md mb-space-2xl">
          Discover the magic hiding just around the corner — wander local streets, reveal secret merchants, collect rare ward cards, and earn explorer XP with every real-world step.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-space-md w-full max-w-md">
          <button 
            onClick={scrollToCartography}
            className="w-full sm:w-auto px-space-xl py-space-md rounded-xl bg-gradient-to-r from-neon-mint to-neon-lime text-obsidian-deep font-headline-sm text-headline-sm uppercase transition-all duration-200 shadow-[0_0_24px_rgba(0,245,155,0.4)] hover:shadow-[0_0_36px_rgba(0,245,155,0.65)] hover:-translate-y-0.5 flex items-center justify-center gap-space-xs font-bold cursor-pointer"
          >
            <span>⚔️ ENTER THE WARD</span>
            <span className="px-space-xs py-space-xxs rounded bg-obsidian-deep text-neon-mint font-badge-arcade text-badge-arcade">+50 XP</span>
          </button>
          
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="w-full sm:w-auto px-space-lg py-space-md rounded-xl bg-surface-card text-neon-mint font-headline-sm text-headline-sm uppercase transition-all duration-200 hover:bg-surface-card-hover hover:text-magical-gold shadow-md flex items-center justify-center gap-space-xs border border-white/5 cursor-pointer"
          >
            <span>📜 REGISTER YOUR SHOP</span>
          </button>
        </div>

        {/* Floating Telemetry Bar */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-3xl w-full max-w-4xl p-space-sm rounded-xl bg-surface-card/80 backdrop-blur-md shadow-xl border border-white/5">
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-obsidian-deep/60">
            <span className="font-code-pill text-code-pill text-text-muted">ACTIVE WARD GRID</span>
            <span className="font-hud-stat text-hud-stat text-neon-mint">SECTOR-09 EAST</span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-obsidian-deep/60">
            <span className="font-code-pill text-code-pill text-text-muted">MYSTERY PROXIMITY</span>
            <span className="font-hud-stat text-hud-stat text-magical-gold">320M SONAR LOCK</span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-obsidian-deep/60">
            <span className="font-code-pill text-code-pill text-text-muted">TODAY'S WARD POOL</span>
            <span className="font-hud-stat text-hud-stat text-electric-violet">4,250 XP READY</span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-obsidian-deep/60">
            <span className="font-code-pill text-code-pill text-text-muted">REAL-WORLD ACCREDITED</span>
            <span className="font-hud-stat text-hud-stat text-text-primary">100% INDIE SHOPS</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE WARD PULSE LIVE DASHBOARD BAR */}
      <section className="w-full bg-surface-card shadow-xl my-space-lg border-y border-white/5">
        <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-space-xxs rounded bg-neon-mint text-obsidian-deep font-badge-arcade text-badge-arcade uppercase font-bold">ARCADE TELEMETRY</span>
              <span className="font-headline-sm text-headline-sm text-text-primary uppercase tracking-wide">THE WARD PULSE</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md font-code-pill text-code-pill">
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-high border border-white/5">
                <span className="w-2 h-2 rounded-full bg-neon-mint"></span>
                <span className="text-text-primary font-bold">{allMerchants.length}</span>
                <span className="text-text-muted">MERCHANTS NEARBY</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-high border border-white/5">
                <span className="w-2 h-2 rounded-full bg-rarity-rare"></span>
                <span className="text-text-primary font-bold">4</span>
                <span className="text-text-muted">CURRENTLY OPEN</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-high border border-white/5">
                <span className="w-2 h-2 rounded-full bg-neon-lime"></span>
                <span className="text-text-primary font-bold">2</span>
                <span className="text-text-muted">NEW DISCOVERIES</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-high text-magical-gold shadow-[0_0_12px_rgba(255,209,92,0.2)] border border-magical-gold/20">
                <span className="material-symbols-outlined text-code-pill" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                <span className="font-bold">1 MYSTERY SIGNATURE</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-high text-amber-ember border border-amber-ember/20">
                <span>🔥</span>
                <span className="font-bold">{state.streak}D STREAK</span>
                <span className="text-text-secondary">(+15% XP)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE CARTOGRAPHY & RADAR */}
      <section id="cartography-section" className="w-full max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs text-neon-mint font-badge-arcade text-badge-arcade uppercase mb-space-xxs">
              <span className="w-2 h-2 rounded-full bg-neon-mint"></span>
              <span>SONAR RADAR SYSTEM V4.1</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-text-primary uppercase tracking-tight">ENCHANTED WARD CARTOGRAPHY</h2>
          </div>
          <div className="flex items-center gap-space-sm font-code-pill text-code-pill text-text-secondary">
            <span className="px-space-sm py-space-xxs rounded bg-surface-card text-magical-gold border border-white/5">LAT: 37.7749</span>
            <span className="px-space-sm py-space-xxs rounded bg-surface-card text-magical-gold border border-white/5">LON: -122.4194</span>
          </div>
        </div>

        {/* Leaflet Map Component */}
        <WardMap />
      </section>

      {/* SECTION 4: TODAY'S SPELL */}
      <section className="w-full max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-lg">
        <div className="relative w-full rounded-2xl bg-gradient-to-r from-arcane-violet-surface via-surface-card to-obsidian-deep p-space-xl shadow-2xl overflow-hidden border border-electric-violet/30">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-magical-gold/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-xl">
            <div className="flex flex-col max-w-2xl">
              <div className="flex items-center gap-space-sm mb-space-xs">
                <span className="px-space-xs py-space-xxs rounded bg-tertiary-container text-on-tertiary-container font-badge-arcade text-badge-arcade uppercase font-bold">DAILY MAGIC QUEST</span>
                <div className="flex items-center gap-space-xxs font-code-pill text-code-pill text-amber-ember">
                  <span className="material-symbols-outlined text-hud-stat">timer</span>
                  <span>EXPIRES IN {formattedCountdown}</span>
                </div>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">
                TODAY'S SPELL: <span className="text-magical-gold">THE UNKNOWN THRESHOLD</span>
              </h3>
              <p className="font-body-md text-body-md text-text-secondary mt-space-xs">
                Cross into the unfamiliar. Discover a local business within your current ward that you have never stepped foot into before. Purchase an item or log your presence with the merchant sigil.
              </p>
              <div className="flex flex-wrap items-center gap-space-md mt-space-md font-code-pill text-code-pill">
                <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container text-neon-mint font-bold shadow-sm border border-white/5">
                  <span>💎 REWARD:</span>
                  <span>+150 EXPLORER XP</span>
                </div>
                <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container text-magical-gold font-bold shadow-sm border border-white/5">
                  <span>✨ ARTIFACT:</span>
                  <span>SILVER WARD SHARD</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-space-sm shrink-0 w-full sm:w-auto">
              {bountyActive ? (
                <span className="px-space-xl py-space-md rounded-xl bg-neon-mint text-obsidian-deep font-headline-sm text-headline-sm uppercase font-bold shadow-[0_0_20px_rgba(0,245,155,0.4)] text-center cursor-default">
                  BOUNTY ACTIVE! TRACKING...
                </span>
              ) : (
                <button 
                  onClick={handleAcceptBounty}
                  className="px-space-xl py-space-md rounded-xl bg-gradient-to-r from-magical-gold to-amber-ember text-obsidian-deep font-headline-sm text-headline-sm uppercase font-bold shadow-[0_0_20px_rgba(255,209,92,0.4)] hover:shadow-[0_0_30px_rgba(255,209,92,0.6)] transition-all text-center cursor-pointer"
                >
                  ACCEPT BOUNTY
                </button>
              )}
              <span className="font-code-pill text-badge-arcade text-text-muted text-center">3,892 EXPLORERS ON THIS QUEST</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MERCHANTS OF THE REALM */}
      <section className="w-full max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-sm mb-space-xl">
          <div>
            <span className="font-badge-arcade text-badge-arcade text-magical-gold uppercase tracking-widest">CURATED CODEX</span>
            <h2 className="font-headline-xl text-headline-xl text-text-primary uppercase tracking-tight">MERCHANTS OF THE REALM</h2>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary max-w-md">
            Inspect real independent establishments turned into holographic RPG collectibles. Flip any card to view opening spells, keeper lore, and perks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {featured.map(m => {
            const glowColor = m.rarityColor || '#00F59B';
            return (
              <div 
                key={m.id}
                className="group relative rounded-2xl bg-surface-card overflow-hidden shadow-xl hover:shadow-[0_0_28px_rgba(255,209,92,0.3)] transition-all duration-300 flex flex-col border border-white/5"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: glowColor }}></div>
                <div className="relative h-56 w-full overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       src={m.image} alt={m.name}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent"></div>
                  <div className="absolute top-space-sm left-space-sm px-space-xs py-space-xxs rounded bg-obsidian-deep/80 backdrop-blur-sm font-badge-arcade text-badge-arcade uppercase" style={{ color: glowColor }}>
                    {m.covenIcon} {m.coven}
                  </div>
                  <div className="absolute top-space-sm right-space-sm px-space-xs py-space-xxs rounded bg-obsidian-deep/80 backdrop-blur-sm text-text-primary font-code-pill text-code-pill">
                    {m.distanceText}
                  </div>
                  <div className="absolute bottom-space-xs right-space-sm px-space-xs py-space-xxs rounded-full text-obsidian-deep font-code-pill text-code-pill font-bold shadow-md" style={{ backgroundColor: glowColor }}>
                    +{m.xp} XP
                  </div>
                </div>
                <div className="p-space-lg flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-space-xs mb-space-xxs">
                      <span className="font-badge-arcade text-badge-arcade uppercase" style={{ color: glowColor }}>
                        {m.rarity} DISCOVERY
                      </span>
                      <div className="flex items-center text-amber-ember font-code-pill text-code-pill">
                        <span>⭐ {m.rating}</span>
                        <span className="text-text-muted ml-space-xxs">({m.reviews})</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">{m.name}</h3>
                    <p className="font-body-sm text-body-sm text-text-secondary mt-space-xs line-clamp-2">
                      {m.lore}
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-sm bg-surface-container-high/40 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="font-code-pill text-badge-arcade text-neon-mint font-bold uppercase">{m.hours}</span>
                      <span className="font-code-pill text-code-pill text-text-muted">{m.address}</span>
                    </div>
                    <button 
                      onClick={() => openCodex(m.id)}
                      className="px-space-md py-space-xs rounded bg-surface-container text-magical-gold hover:bg-magical-gold hover:text-obsidian-deep transition-colors font-headline-sm text-code-pill uppercase font-bold cursor-pointer"
                    >
                      VIEW CODEX
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: WHY WANDR */}
      <section className="w-full bg-surface-container-lowest py-space-3xl px-grid-gutter-desktop border-t border-white/5">
        <div className="max-w-ward-max-width mx-auto flex flex-col">
          <div className="text-center max-w-3xl mx-auto mb-space-2xl">
            <span className="font-badge-arcade text-badge-arcade text-neon-mint uppercase tracking-widest">WHY THE WARD EXISTS</span>
            <h2 className="font-headline-xl text-headline-xl text-text-primary uppercase tracking-tight mt-space-xxs">
              THE PHYSICAL WORLD IS STILL THE BEST OPEN WORLD GAME.
            </h2>
            <p className="font-body-md text-body-md text-text-secondary mt-space-sm">
              Big-box algorithms turned urban shopping into boring chore loops. WANDR connects mindful neighborhood exploration with real independent artisans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="p-space-xl rounded-2xl bg-surface-card shadow-lg flex flex-col justify-between border border-white/5">
              <div>
                <div className="w-12 h-12 rounded-xl bg-neon-mint/15 text-neon-mint flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-headline-md">verified_user</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">REAL LOCAL SMALL SHOPS</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mt-space-xs">
                  Every merchant on the map is a vetted independent business. True live hours, verified physical addresses, real artisans, zero algorithmic fake listings.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-white/5 font-code-pill text-code-pill text-neon-mint">
                100% LOCALLY ACCREDITED
              </div>
            </div>

            <div className="p-space-xl rounded-2xl bg-surface-card shadow-lg flex flex-col justify-between border border-white/5">
              <div>
                <div className="w-12 h-12 rounded-xl bg-electric-violet/15 text-electric-violet flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-headline-md">explore</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">ADVENTURE &amp; REAL PERKS</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mt-space-xs">
                  Turn casual afternoon walks into high-reward questing. Unlock secret merchant menus, limited physical collector cards, and tangible neighborhood discounts.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-white/5 font-code-pill text-code-pill text-electric-violet">
                DISCOVERY XP → REAL DISCOUNTS
              </div>
            </div>

            <div className="p-space-xl rounded-2xl bg-surface-card shadow-lg flex flex-col justify-between border border-white/5">
              <div>
                <div className="w-12 h-12 rounded-xl bg-magical-gold/15 text-magical-gold flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-headline-md">storefront</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">KEEP NEIGHBORHOODS ALIVE</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mt-space-xs">
                  Keep independent businesses thriving. 93% of revenue generated through WANDR stays inside your local community, funding vibrant walkable districts.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-white/5 font-code-pill text-code-pill text-magical-gold">
                COMMUNITY-FIRST IMPACT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CALL TO ACTION */}
      <section className="relative w-full py-space-3xl px-grid-gutter-desktop text-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest via-obsidian-deep to-obsidian-deep pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="font-badge-arcade text-badge-arcade text-neon-mint uppercase tracking-widest">READY YOUR GEAR, EXPLORER</span>
          <h2 className="font-headline-xl text-headline-xl text-text-primary uppercase tracking-tight mt-space-xxs">
            THE GATES OF THE WARD ARE OPEN.
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-xs mb-space-xl">
            Step outside. Calibrate your arcane compass. Your city is waiting to be rediscovered.
          </p>
          <button 
            onClick={scrollToCartography}
            className="px-space-2xl py-space-md rounded-xl bg-gradient-to-r from-neon-mint via-magical-gold to-electric-violet text-obsidian-deep font-headline-sm text-headline-sm uppercase font-bold shadow-[0_0_32px_rgba(0,245,155,0.45)] hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            LAUNCH WARD MAP NOW
          </button>
        </div>
      </section>
    </div>
  );
}
