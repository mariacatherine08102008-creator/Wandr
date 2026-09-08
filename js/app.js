/**
 * WANDR - Core Application Controller & Single Page Router
 */
class WandrApplication {
  constructor() {
    this.currentTab = 'the-ward';
    this.selectedCovenFilter = 'ALL';
    this.searchQuery = '';
    this.activeCodexMerchantId = null;
    this.timerInterval = null;
  }

  init() {
    this.bindEvents();
    this.initRouter();
    this.initStateSync();
    this.startCountdownTimer();
    this.updateSoundButtons();

    // Initialize Map if on The Ward
    setTimeout(() => {
      if (window.WandrMap) {
        window.WandrMap.init('interactive-ward-map');
      }
    }, 150);
  }

  // --- Router & Navigation ---
  initRouter() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'the-ward';
      this.switchTab(hash);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  switchTab(tabId) {
    if (!tabId) tabId = 'the-ward';

    // Check if special route (like register modal)
    if (tabId === 'merchant-registration') {
      this.openRegisterModal();
      return;
    }

    const validTabs = ['the-ward', 'discover', 'quests', 'events', 'leaderboard', 'collection'];
    if (!validTabs.includes(tabId)) {
      tabId = 'the-ward';
    }

    this.currentTab = tabId;

    // Update Nav links
    document.querySelectorAll('nav a, header a[data-path]').forEach(link => {
      const path = link.getAttribute('data-path');
      if (path === tabId) {
        link.className = "px-space-md py-space-xs uppercase transition-all duration-200 bg-primary-container text-on-primary-container font-bold rounded-lg shadow-[0_0_16px_rgba(0,245,155,0.35)]";
        link.setAttribute('aria-current', 'page');
      } else if (validTabs.includes(path)) {
        link.className = "px-space-md py-space-xs rounded-lg font-headline-sm text-code-pill uppercase transition-all duration-200 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";
        link.removeAttribute('aria-current');
      }
    });

    // Toggle Tab Views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Refresh view content
    if (tabId === 'the-ward') {
      setTimeout(() => {
        if (window.WandrMap && window.WandrMap.map) {
          window.WandrMap.map.invalidateSize();
        }
      }, 100);
    } else if (tabId === 'discover') {
      this.renderDiscoverView();
    } else if (tabId === 'quests') {
      this.renderQuestsView();
    } else if (tabId === 'events') {
      this.renderEventsView();
    } else if (tabId === 'leaderboard') {
      this.renderLeaderboardView();
    } else if (tabId === 'collection') {
      this.renderCollectionView();
    }

    if (window.WandrAudio) window.WandrAudio.playClick();
  }

  // --- State Synchronization with UI ---
  initStateSync() {
    window.WandrState.subscribe(state => {
      // Header XP & Level
      const lvlEl = document.getElementById('hud-player-level');
      if (lvlEl) lvlEl.textContent = `LVL ${String(state.level).padStart(2, '0')}`;

      const xpTextEl = document.getElementById('hud-player-xp-text');
      if (xpTextEl) xpTextEl.textContent = `${state.xp.toLocaleString()} / ${state.xpForNextLevel.toLocaleString()}`;

      const xpBarEl = document.getElementById('hud-player-xp-bar');
      if (xpBarEl) {
        const range = state.xpForNextLevel - state.xpForCurrentLevel;
        const progress = Math.max(0, Math.min(100, ((state.xp - state.xpForCurrentLevel) / (range || 1)) * 100));
        xpBarEl.style.width = `${progress}%`;
      }

      const streakEl = document.getElementById('hud-player-streak');
      if (streakEl) streakEl.textContent = `${state.streak}D STREAK`;

      const titleEl = document.getElementById('hud-player-title');
      if (titleEl) titleEl.textContent = state.playerTitle;

      // Map HUD overlay Level & XP
      const mapLvlEl = document.getElementById('map-hud-level');
      if (mapLvlEl) mapLvlEl.textContent = `LEVEL ${String(state.level).padStart(2, '0')}: ${state.playerTitle.split(' ')[0]}`;

      const mapXpEl = document.getElementById('map-hud-xp');
      if (mapXpEl) mapXpEl.textContent = `${state.xp} / ${state.xpForNextLevel} XP`;

      const mapDiscoveredEl = document.getElementById('map-hud-discovered');
      const allMerchants = window.WandrState.getAllMerchants();
      if (mapDiscoveredEl) {
        mapDiscoveredEl.textContent = `${state.discoveredMerchantIds.length} / ${allMerchants.length} DISCOVERED`;
      }

      // Refresh views if currently active
      if (this.currentTab === 'discover') this.renderDiscoverView();
      if (this.currentTab === 'collection') this.renderCollectionView();
      if (this.currentTab === 'quests') this.renderQuestsView();
    });
  }

  // --- Discover Codex View ---
  renderDiscoverView() {
    const container = document.getElementById('discover-merchants-grid');
    if (!container) return;

    const merchants = window.WandrState.getAllMerchants();
    const query = this.searchQuery.toLowerCase().trim();

    const filtered = merchants.filter(m => {
      const matchCoven = this.selectedCovenFilter === 'ALL' || m.coven === this.selectedCovenFilter;
      const matchQuery = !query || 
        m.name.toLowerCase().includes(query) || 
        m.coven.toLowerCase().includes(query) ||
        m.lore.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query);
      return matchCoven && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16 bg-surface-card rounded-2xl border border-white/5 p-8">
          <span class="text-4xl block mb-2">🔍</span>
          <h3 class="font-headline-md text-text-primary uppercase mb-2">No Merchants Located</h3>
          <p class="font-body-md text-text-secondary">Adjust your search telemetry or coven filter to reveal establishments.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => this.createMerchantCardHtml(m)).join('');
  }

  createMerchantCardHtml(m) {
    const isDiscovered = window.WandrState.isMerchantDiscovered(m.id);
    const glowColor = m.rarityColor || '#00F59B';

    return `
      <div class="group relative rounded-2xl bg-surface-card overflow-hidden shadow-xl hover:shadow-[0_0_28px_${glowColor}50] transition-all duration-300 flex flex-col border border-white/5">
        <div class="h-1.5 w-full" style="background-color: ${glowColor};"></div>
        <div class="relative h-52 w-full overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               alt="${m.name}" src="${m.image}" />
          <div class="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent"></div>
          
          <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-obsidian-deep/85 backdrop-blur-sm font-badge-arcade text-badge-arcade uppercase"
               style="color: ${glowColor};">
            ${m.covenIcon} ${m.coven}
          </div>
          <div class="absolute top-3 right-3 px-2 py-0.5 rounded bg-obsidian-deep/85 backdrop-blur-sm text-text-primary font-code-pill text-code-pill">
            ${m.distanceText}
          </div>
          
          ${isDiscovered ? `
            <div class="absolute bottom-2 left-3 px-2 py-0.5 rounded-full bg-neon-mint text-obsidian-deep font-code-pill text-code-pill font-bold flex items-center gap-1 shadow-md">
              <span class="material-symbols-outlined text-[14px]">check_circle</span> DISCOVERED
            </div>
          ` : `
            <div class="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-surface-container-high text-neon-mint font-code-pill text-code-pill font-bold shadow-md">
              +${m.xp} XP
            </div>
          `}
        </div>

        <div class="p-5 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-badge-arcade text-badge-arcade uppercase" style="color: ${glowColor};">
                ${m.rarity} DISCOVERY
              </span>
              <div class="flex items-center text-amber-ember font-code-pill text-code-pill">
                <span>⭐ ${m.rating}</span>
                <span class="text-text-muted ml-1">(${m.reviews})</span>
              </div>
            </div>
            <h3 class="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">${m.name}</h3>
            <p class="font-body-sm text-body-sm text-text-secondary mt-1.5 line-clamp-2">${m.lore}</p>
          </div>

          <div class="mt-4 pt-3 bg-surface-container-high/40 -mx-5 -mb-5 px-5 pb-4 flex items-center justify-between border-t border-white/5">
            <div class="flex flex-col">
              <span class="font-code-pill text-badge-arcade text-neon-mint font-bold uppercase">${m.hours}</span>
              <span class="font-code-pill text-code-pill text-text-muted truncate max-w-[150px]">${m.address}</span>
            </div>
            <button onclick="window.WandrApp.openCodexModal('${m.id}')" 
                    class="px-3.5 py-1.5 rounded bg-surface-container hover:bg-neon-mint hover:text-obsidian-deep transition-all font-headline-sm text-code-pill uppercase font-bold text-text-primary shadow-sm">
              VIEW CODEX
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Quests View ---
  renderQuestsView() {
    const container = document.getElementById('quests-list-container');
    if (!container) return;

    const quests = window.WANDR_QUESTS || [];
    container.innerHTML = quests.map(q => {
      const isActive = window.WandrState.isQuestActive(q.id);
      const isCompleted = window.WandrState.isQuestCompleted(q.id);

      let actionBtnHtml = '';
      if (isCompleted) {
        actionBtnHtml = `
          <span class="px-4 py-2 rounded-lg bg-neon-mint/20 text-neon-mint font-code-pill text-code-pill font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">verified</span> COMPLETED
          </span>
        `;
      } else if (isActive) {
        actionBtnHtml = `
          <button onclick="window.WandrApp.triggerQuestCheckIn('${q.id}')"
                  class="px-5 py-2.5 rounded-xl bg-neon-mint text-obsidian-deep font-headline-sm text-code-pill uppercase font-bold shadow-[0_0_16px_rgba(0,245,155,0.4)] hover:brightness-110 transition-all">
            COMPLETE & CLAIM +${q.rewardXP} XP
          </button>
        `;
      } else {
        actionBtnHtml = `
          <button onclick="window.WandrApp.acceptQuestAction('${q.id}')"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-magical-gold to-amber-ember text-obsidian-deep font-headline-sm text-code-pill uppercase font-bold shadow-[0_0_16px_rgba(255,209,92,0.35)] hover:shadow-[0_0_24px_rgba(255,209,92,0.5)] transition-all">
            ACCEPT BOUNTY
          </button>
        `;
      }

      return `
        <div class="p-6 rounded-2xl bg-surface-card border border-white/10 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-neon-mint/30 transition-all">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-magical-gold text-2xl shrink-0">
              <span class="material-symbols-outlined text-2xl">${q.icon}</span>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded ${q.badgeColor} font-badge-arcade text-badge-arcade uppercase font-bold">${q.type}</span>
                <span class="font-code-pill text-code-pill text-text-muted">• DIFFICULTY: ${q.difficulty.toUpperCase()}</span>
              </div>
              <h3 class="font-headline-lg text-lg uppercase font-bold text-text-primary tracking-tight">${q.title}</h3>
              <p class="font-body-sm text-text-secondary mt-1 max-w-xl">${q.description}</p>
              
              <div class="flex flex-wrap items-center gap-3 mt-3 font-code-pill text-code-pill">
                <span class="px-2.5 py-1 rounded bg-surface-container text-neon-mint font-bold">💎 +${q.rewardXP} XP</span>
                <span class="px-2.5 py-1 rounded bg-surface-container text-magical-gold font-bold">✨ ${q.rewardArtifact}</span>
              </div>
            </div>
          </div>
          <div class="shrink-0 flex items-center lg:justify-end">
            ${actionBtnHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  acceptQuestAction(questId) {
    const ok = window.WandrState.acceptQuest(questId);
    if (ok) {
      this.showToast('BOUNTY ACCEPTED', 'Quest is now actively tracked in your telemetry log!');
      this.renderQuestsView();
    }
  }

  triggerQuestCheckIn(questId) {
    const ok = window.WandrState.completeQuest(questId);
    if (ok) {
      this.showToast('QUEST COMPLETE!', '+150 Explorer XP & Silver Ward Shard added to inventory!');
      this.renderQuestsView();
    }
  }

  // --- Events View ---
  renderEventsView() {
    const container = document.getElementById('events-list-container');
    if (!container) return;

    const events = [
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

    container.innerHTML = events.map(ev => `
      <div class="rounded-2xl bg-surface-card border border-white/10 overflow-hidden shadow-xl flex flex-col md:flex-row hover:border-electric-violet/40 transition-all">
        <div class="md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden">
          <img src="${ev.image}" class="w-full h-full object-cover" alt="${ev.title}" />
          <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-card via-transparent to-transparent"></div>
        </div>
        <div class="p-6 flex flex-col justify-between flex-1">
          <div>
            <div class="flex items-center gap-2 mb-2 font-code-pill text-code-pill">
              <span class="px-2 py-0.5 rounded bg-electric-violet/20 text-electric-violet font-bold uppercase">${ev.coven}</span>
              <span class="text-magical-gold font-bold">${ev.date}</span>
            </div>
            <h3 class="font-headline-lg text-xl uppercase font-bold text-text-primary tracking-tight">${ev.title}</h3>
            <p class="font-body-sm text-text-secondary mt-1.5">${ev.description}</p>
            <div class="mt-3 flex items-center gap-2 font-code-pill text-code-pill text-neon-mint">
              <span class="material-symbols-outlined text-[16px]">stars</span>
              <span>${ev.perk}</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span class="font-code-pill text-code-pill text-text-muted">${ev.location}</span>
            <button onclick="window.WandrApp.rsvpEvent('${ev.id}')"
                    class="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-electric-violet hover:text-obsidian-deep text-text-primary font-headline-sm text-code-pill uppercase font-bold transition-all shadow-sm">
              RSVP & LOCK TELEMETRY
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  rsvpEvent(eventId) {
    if (window.WandrAudio) window.WandrAudio.playQuestAccept();
    this.showToast('EVENT RSVP CONFIRMED', 'Arcane calendar lock saved. Telemetry coordinates stored.');
  }

  // --- Leaderboard View ---
  renderLeaderboardView() {
    const container = document.getElementById('leaderboard-list-container');
    if (!container) return;

    const state = window.WandrState.getState();
    const leaders = [
      { rank: 1, name: "KAI_VALEN", title: "GRAND ARCH-MAGE", xp: 14280, streak: 42, badge: "👑 GOLD SIGIL", isUser: false },
      { rank: 2, name: "ROWAN_GREY", title: "SECTOR PIONEER", xp: 11450, streak: 31, badge: "⚡ NEON CODEX", isUser: false },
      { rank: 3, name: "NYX_CYPHER", title: "MASTER CARTOGRAPHER", xp: 9820, streak: 26, badge: "🔮 OBSIDIAN KEY", isUser: false },
      { rank: 4, name: "SOLARIS_B", title: "COVEN VANGUARD", xp: 6240, streak: 18, badge: "🍞 HEARTH MASTER", isUser: false },
      { rank: 5, name: state.playerName, title: state.playerTitle, xp: state.xp, streak: state.streak, badge: "⚔️ APPRENTICE", isUser: true },
      { rank: 6, name: "TESSA_W", title: "WARD SCOUT", xp: 1620, streak: 6, badge: "🧵 NEEDLE RUNIC", isUser: false },
      { rank: 7, name: "DARIEN_K", title: "WAYFINDER", xp: 1390, streak: 4, badge: "🧭 COMPASS BEACON", isUser: false }
    ];

    container.innerHTML = leaders.map(l => `
      <div class="p-4 rounded-xl ${l.isUser ? 'bg-arcane-violet-surface border-2 border-neon-mint/80 shadow-[0_0_24px_rgba(0,245,155,0.25)]' : 'bg-surface-card border border-white/5'} flex items-center justify-between gap-4 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg ${l.rank <= 3 ? 'bg-magical-gold text-obsidian-deep' : 'bg-surface-container text-text-secondary'} font-hud-stat flex items-center justify-center font-bold text-lg">
            #${l.rank}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-sm uppercase font-bold text-text-primary ${l.isUser ? 'text-neon-mint' : ''}">${l.name}</span>
              ${l.isUser ? '<span class="px-1.5 py-0.5 rounded bg-neon-mint text-obsidian-deep font-badge-arcade text-[10px] font-bold">YOU</span>' : ''}
              <span class="hidden sm:inline font-code-pill text-[11px] text-magical-gold">${l.badge}</span>
            </div>
            <span class="font-code-pill text-[11px] text-text-muted">${l.title}</span>
          </div>
        </div>
        <div class="flex items-center gap-6 font-code-pill text-code-pill">
          <div class="hidden md:flex flex-col text-right">
            <span class="text-amber-ember font-bold">🔥 ${l.streak}D STREAK</span>
            <span class="text-text-muted text-[10px]">ACTIVE PASS</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="font-hud-stat text-neon-mint font-bold text-base">${l.xp.toLocaleString()} XP</span>
            <span class="text-text-muted text-[10px]">TOTAL POWER</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- Collection Compendium View ---
  renderCollectionView() {
    const container = document.getElementById('collection-cards-grid');
    if (!container) return;

    const merchants = window.WandrState.getAllMerchants();
    const state = window.WandrState.getState();

    // Summary stats
    const totalDiscovered = state.discoveredMerchantIds.length;
    const shardsCount = state.shards || 0;

    const countEl = document.getElementById('collection-stats-count');
    if (countEl) countEl.textContent = `${totalDiscovered} / ${merchants.length}`;

    const shardsEl = document.getElementById('collection-stats-shards');
    if (shardsEl) shardsEl.textContent = `${shardsCount} SHARDS`;

    container.innerHTML = merchants.map(m => {
      const isDiscovered = window.WandrState.isMerchantDiscovered(m.id);
      const glowColor = m.rarityColor || '#00F59B';

      if (isDiscovered) {
        return `
          <div class="group relative rounded-2xl bg-surface-card border-2 overflow-hidden shadow-2xl transition-all duration-300 tilt-card holo-shimmer cursor-pointer hover:scale-[1.02]"
               style="border-color: ${glowColor}; box-shadow: 0 0 24px ${glowColor}40;"
               onclick="window.WandrApp.openCodexModal('${m.id}')">
            <div class="relative h-60 w-full overflow-hidden">
              <img src="${m.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${m.name}" />
              <div class="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-obsidian-deep/90 text-xs font-badge-arcade uppercase" style="color: ${glowColor};">
                ${m.rarity}
              </div>
              <div class="absolute top-3 right-3 px-2 py-0.5 rounded bg-neon-mint text-obsidian-deep text-[11px] font-code-pill font-bold shadow-md">
                UNLOCKED
              </div>
              <div class="absolute bottom-3 left-3 flex items-center gap-1.5">
                <span class="text-2xl">${m.covenIcon}</span>
                <span class="font-headline-sm text-sm uppercase font-bold text-text-primary drop-shadow">${m.name}</span>
              </div>
            </div>
            <div class="p-4 bg-surface-card">
              <div class="flex items-center justify-between text-code-pill font-code-pill text-text-secondary mb-2">
                <span>COVEN: ${m.coven}</span>
                <span class="text-magical-gold font-bold">⭐ ${m.rating}</span>
              </div>
              <p class="font-body-sm text-[12px] text-text-secondary line-clamp-2">${m.lore}</p>
              <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span class="font-code-pill text-[10px] text-text-muted">KEEPER: ${m.keeperName || 'Guardian'}</span>
                <span class="font-code-pill text-[11px] text-neon-mint font-bold">+${m.xp} XP</span>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="group relative rounded-2xl bg-surface-card/60 border border-dashed border-white/15 overflow-hidden shadow-lg p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
            <div class="w-16 h-16 rounded-full bg-obsidian-deep border border-white/10 flex items-center justify-center text-3xl mb-3 text-text-muted">
              🔒
            </div>
            <span class="font-badge-arcade text-badge-arcade uppercase text-text-muted mb-1">${m.rarity} ENIGMA</span>
            <h4 class="font-headline-sm text-base uppercase font-bold text-text-primary mb-1">${m.name}</h4>
            <p class="font-code-pill text-[11px] text-text-muted mb-4">${m.distanceText} • ${m.coven}</p>
            <button onclick="window.WandrApp.switchTab('the-ward'); window.WandrMap.panToMerchant('${m.id}')"
                    class="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-neon-mint hover:text-obsidian-deep font-code-pill text-[11px] uppercase font-bold text-text-primary transition-colors">
              HUNT ON RADAR
            </button>
          </div>
        `;
      }
    }).join('');
  }

  // --- Codex Modal Controller ---
  openCodexModal(merchantId) {
    const merchant = window.WandrState.getMerchantById(merchantId);
    if (!merchant) return;

    this.activeCodexMerchantId = merchantId;
    const isDiscovered = window.WandrState.isMerchantDiscovered(merchantId);
    const glowColor = merchant.rarityColor || '#00F59B';

    const modal = document.getElementById('codex-modal');
    const content = document.getElementById('codex-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative rounded-2xl bg-surface-card border-2 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden max-w-2xl w-full mx-auto animate-modal-enter"
           style="border-color: ${glowColor};">
        
        <!-- Header Image & Shimmer -->
        <div class="relative h-64 sm:h-72 w-full overflow-hidden holo-shimmer">
          <img src="${merchant.image}" alt="${merchant.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/60"></div>
          
          <button onclick="window.WandrApp.closeCodexModal()"
                  class="absolute top-4 right-4 w-9 h-9 rounded-full bg-obsidian-deep/80 hover:bg-obsidian-deep text-text-primary flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>

          <div class="absolute top-4 left-4 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded bg-obsidian-deep/90 font-badge-arcade text-badge-arcade uppercase font-bold" style="color: ${glowColor};">
              ${merchant.rarity} CODEX
            </span>
            <span class="px-2.5 py-1 rounded bg-obsidian-deep/90 text-text-primary font-code-pill text-code-pill">
              ${merchant.covenIcon} ${merchant.coven}
            </span>
          </div>

          <div class="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div class="flex items-center gap-2 text-amber-ember font-code-pill text-code-pill mb-1">
                <span>⭐ ${merchant.rating}</span>
                <span class="text-text-muted">(${merchant.reviews} community reviews)</span>
              </div>
              <h2 class="font-headline-xl text-2xl sm:text-3xl uppercase font-bold text-text-primary tracking-tight drop-shadow-md">
                ${merchant.name}
              </h2>
            </div>
            <div class="px-3 py-1.5 rounded-full bg-obsidian-deep/90 border border-neon-mint font-code-pill text-neon-mint font-bold text-sm shadow-md">
              +${merchant.xp} XP
            </div>
          </div>
        </div>

        <!-- Body Details -->
        <div class="p-6 sm:p-8 flex flex-col gap-6">
          <!-- Telemetry Specs -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-obsidian-deep/80 border border-white/5 font-code-pill text-code-pill">
            <div>
              <span class="text-text-muted block text-[11px]">OPENING SPELL</span>
              <span class="text-neon-mint font-bold">${merchant.hours}</span>
            </div>
            <div>
              <span class="text-text-muted block text-[11px]">PROXIMITY</span>
              <span class="text-magical-gold font-bold">${merchant.distanceText}</span>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <span class="text-text-muted block text-[11px]">LOCATION</span>
              <span class="text-text-primary font-bold truncate block">${merchant.address}</span>
            </div>
          </div>

          <!-- Keeper Lore -->
          <div>
            <h4 class="font-badge-arcade text-badge-arcade text-magical-gold uppercase mb-1">KEEPER ARCHIVES</h4>
            <p class="font-body-md text-text-secondary leading-relaxed">${merchant.lore}</p>
            <span class="inline-block mt-2 font-code-pill text-xs text-text-muted italic">— Recorded by Keeper ${merchant.keeperName || 'Sanctuary Guardian'}</span>
          </div>

          <!-- Secret Perk -->
          <div class="p-4 rounded-xl bg-arcane-violet-surface border border-electric-violet/40 shadow-inner flex items-start gap-3">
            <span class="text-2xl">✨</span>
            <div>
              <span class="font-badge-arcade text-badge-arcade text-electric-violet uppercase font-bold block mb-0.5">EXCLUSIVE WANDR PERK</span>
              <p class="font-body-sm text-text-primary font-medium">${merchant.secretPerk}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/10">
            ${isDiscovered ? `
              <button disabled class="w-full sm:flex-1 py-3.5 rounded-xl bg-neon-mint/20 border border-neon-mint/60 text-neon-mint font-headline-sm uppercase font-bold flex items-center justify-center gap-2 cursor-default">
                <span class="material-symbols-outlined text-xl">verified</span>
                SIGIL STAMPED (IN COLLECTION)
              </button>
            ` : `
              <button onclick="window.WandrApp.checkInActiveMerchant()" 
                      class="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-neon-mint to-neon-lime text-obsidian-deep font-headline-sm uppercase font-bold shadow-[0_0_24px_rgba(0,245,155,0.45)] hover:shadow-[0_0_36px_rgba(0,245,155,0.7)] transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-xl">qr_code_scanner</span>
                CHECK IN & STAMP SIGIL (+${merchant.xp} XP)
              </button>
            `}
            <button onclick="window.WandrApp.viewMerchantOnMap('${merchant.id}')"
                    class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-card-hover text-text-primary font-headline-sm uppercase font-bold transition-colors flex items-center justify-center gap-2 border border-white/10">
              <span class="material-symbols-outlined text-xl text-magical-gold">explore</span>
              LOCATE ON RADAR
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.WandrAudio) window.WandrAudio.playCardFlip();
  }

  closeCodexModal() {
    const modal = document.getElementById('codex-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.activeCodexMerchantId = null;
  }

  checkInActiveMerchant() {
    if (!this.activeCodexMerchantId) return;

    const result = window.WandrState.checkInMerchant(this.activeCodexMerchantId);
    if (result.success) {
      this.showToast('CARD UNLOCKED!', result.message, `+${result.xpGained} XP`);
      this.openCodexModal(this.activeCodexMerchantId); // refresh modal to show stamped state
    } else {
      this.showToast('ALREADY DISCOVERED', result.message);
    }
  }

  viewMerchantOnMap(merchantId) {
    this.closeCodexModal();
    this.switchTab('the-ward');
    setTimeout(() => {
      if (window.WandrMap) {
        window.WandrMap.panToMerchant(merchantId);
      }
    }, 200);
  }

  // --- Register Merchant Modal Controller ---
  openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.WandrAudio) window.WandrAudio.playClick();
  }

  closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements['shop_name'].value;
    const coven = form.elements['shop_coven'].value;
    const rarity = form.elements['shop_rarity'].value;
    const address = form.elements['shop_address'].value;
    const hours = form.elements['shop_hours'].value;
    const keeperName = form.elements['shop_keeper'].value;
    const lore = form.elements['shop_lore'].value;
    const secretPerk = form.elements['shop_perk'].value;
    const image = form.elements['shop_image'].value || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80';

    const covenIcons = {
      "Bakers' Coven": "🍞",
      "Potions & Elixirs": "🧪",
      "Enchanted Threads": "🧵",
      "Arcane Goods": "🔮",
      "Coffee Alchemy": "☕",
      "Arcane Relics": "🎵"
    };

    const newMerchant = window.WandrState.registerMerchant({
      name,
      coven,
      covenIcon: covenIcons[coven] || "✨",
      rarity,
      address,
      hours,
      keeperName,
      lore,
      secretPerk,
      image
    });

    this.closeRegisterModal();
    form.reset();

    // Fanfare and feedback
    if (window.WandrAudio) window.WandrAudio.playLevelUp();
    this.showToast('GUILD CHARTER SEALED!', `${name} is now a consecrated merchant on the Ward radar! (+100 XP)`);

    // Update map markers
    if (window.WandrMap) {
      window.WandrMap.renderMerchantMarkers();
      window.WandrMap.panToMerchant(newMerchant.id);
    }
  }

  // --- Level Up Modal ---
  showLevelUpModal(level, title) {
    const modal = document.getElementById('levelup-modal');
    const lvlText = document.getElementById('levelup-modal-level');
    const titleText = document.getElementById('levelup-modal-title');
    if (lvlText) lvlText.textContent = `LEVEL ${level}`;
    if (titleText) titleText.textContent = title;

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeLevelUpModal() {
    const modal = document.getElementById('levelup-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // --- Floating Toast Notifications ---
  showToast(title, subtitle, badgeText = '+50 XP') {
    const toast = document.getElementById('hud-toast');
    if (!toast) return;

    const titleEl = document.getElementById('hud-toast-title');
    const subEl = document.getElementById('hud-toast-subtitle');
    const badgeEl = document.getElementById('hud-toast-badge');

    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    if (badgeEl) badgeEl.textContent = badgeText;

    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-32', 'opacity-0');
    }, 4500);
  }

  // --- Daily Countdown Timer ---
  startCountdownTimer() {
    let remaining = 24139; // ~6h 42m 19s
    const timerEl = document.getElementById('daily-spell-countdown');

    this.timerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) remaining = 86400;

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      const formatted = `${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}M ${String(s).padStart(2, '0')}S`;
      if (timerEl) timerEl.textContent = `EXPIRES IN ${formatted}`;
    }, 1000);
  }

  // --- Audio Control ---
  updateSoundButtons() {
    const isMuted = window.WandrAudio.isMuted();
    const headerBtn = document.getElementById('header-audio-btn');
    if (headerBtn) {
      const dot = headerBtn.querySelector('.sound-indicator-dot');
      const text = headerBtn.querySelector('.sound-indicator-text');
      if (text) text.textContent = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
      if (dot) {
        if (isMuted) {
          dot.classList.remove('bg-electric-violet', 'animate-pulse');
          dot.classList.add('bg-text-muted');
        } else {
          dot.classList.add('bg-electric-violet', 'animate-pulse');
          dot.classList.remove('bg-text-muted');
        }
      }
    }

    const mapAudioBtn = document.getElementById('audio-toggle');
    if (mapAudioBtn) {
      const icon = mapAudioBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isMuted ? 'volume_off' : 'volume_up';
    }
  }

  toggleSound() {
    window.WandrAudio.toggleMute();
    this.updateSoundButtons();
    if (!window.WandrAudio.isMuted()) {
      window.WandrAudio.playClick();
    }
  }

  // --- Event Bindings ---
  bindEvents() {
    // Sound toggles
    const headerAudioBtn = document.getElementById('header-audio-btn');
    if (headerAudioBtn) {
      headerAudioBtn.addEventListener('click', () => this.toggleSound());
    }

    const mapAudioBtn = document.getElementById('audio-toggle');
    if (mapAudioBtn) {
      mapAudioBtn.addEventListener('click', () => this.toggleSound());
    }

    // Daily spell hero accept button
    const bountyBtn = document.getElementById('accept-bounty-btn');
    if (bountyBtn) {
      bountyBtn.addEventListener('click', () => {
        window.WandrState.acceptQuest('quest-threshold');
        bountyBtn.textContent = 'BOUNTY ACTIVE! TRACKING...';
        bountyBtn.classList.remove('from-magical-gold', 'to-amber-ember');
        bountyBtn.classList.add('bg-neon-mint', 'text-obsidian-deep');
        this.showToast('BOUNTY ACTIVE', 'Daily Magic Quest locked! Check into any new merchant to claim reward.');
      });
    }

    // Modal close outside clicks
    window.addEventListener('click', (e) => {
      const codexModal = document.getElementById('codex-modal');
      if (e.target === codexModal) this.closeCodexModal();

      const regModal = document.getElementById('register-modal');
      if (e.target === regModal) this.closeRegisterModal();

      const lvlModal = document.getElementById('levelup-modal');
      if (e.target === lvlModal) this.closeLevelUpModal();
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCodexModal();
        this.closeRegisterModal();
        this.closeLevelUpModal();
      }
    });

    // Search and filters in Discover
    const searchInput = document.getElementById('discover-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderDiscoverView();
        if (window.WandrMap) {
          window.WandrMap.renderMerchantMarkers(this.selectedCovenFilter, this.searchQuery);
        }
      });
    }

    // Filter pills
    document.querySelectorAll('[data-coven-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-coven-filter]').forEach(p => {
          p.classList.remove('bg-neon-mint', 'text-obsidian-deep', 'font-bold');
          p.classList.add('bg-surface-container', 'text-text-secondary');
        });
        pill.classList.add('bg-neon-mint', 'text-obsidian-deep', 'font-bold');
        pill.classList.remove('bg-surface-container', 'text-text-secondary');

        this.selectedCovenFilter = pill.getAttribute('data-coven-filter');
        this.renderDiscoverView();
        if (window.WandrMap) {
          window.WandrMap.renderMerchantMarkers(this.selectedCovenFilter, this.searchQuery);
        }
        if (window.WandrAudio) window.WandrAudio.playClick();
      });
    });

    // Register Shop Form
    const regForm = document.getElementById('register-shop-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }
  }
}

const WandrApp = new WandrApplication();
window.WandrApp = WandrApp;

document.addEventListener('DOMContentLoaded', () => {
  WandrApp.init();
});
