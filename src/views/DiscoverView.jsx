import React, { useState } from 'react';
import { useGameState } from '../context/GameStateContext';
import { WandrAudio } from '../services/audio';

export function DiscoverView() {
  const { allMerchants, openCodex, isMerchantDiscovered } = useGameState();
  const [selectedCoven, setSelectedCoven] = useState('ALL');
  const [query, setQuery] = useState('');

  const covens = [
    { id: 'ALL', label: 'ALL COVENS' },
    { id: "Bakers' Coven", label: "🍞 BAKERS' COVEN" },
    { id: 'Potions & Elixirs', label: '🧪 POTIONS & ELIXIRS' },
    { id: 'Enchanted Threads', label: '🧵 ENCHANTED THREADS' },
    { id: 'Arcane Goods', label: '🔮 ARCANE GOODS' },
    { id: 'Coffee Alchemy', label: '☕ COFFEE ALCHEMY' },
    { id: 'Arcane Relics', label: '🎵 ARCANE RELICS' },
  ];

  const handleCovenClick = (covenId) => {
    setSelectedCoven(covenId);
    WandrAudio.playClick();
  };

  const filtered = allMerchants.filter(m => {
    const matchCoven = selectedCoven === 'ALL' || m.coven === selectedCoven;
    const q = query.toLowerCase().trim();
    const matchQuery = !q || 
      m.name.toLowerCase().includes(q) || 
      m.coven.toLowerCase().includes(q) ||
      m.lore.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q);
    return matchCoven && matchQuery;
  });

  return (
    <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-badge-arcade text-badge-arcade text-neon-mint uppercase">REALM COMPENDIUM</span>
          <h1 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mt-1">DISCOVER LOCAL MERCHANTS</h1>
          <p className="font-body-sm text-text-secondary mt-1">Browse verified indie artisans, bakers, tea alchemists, and clothiers.</p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <input 
            type="text" 
            placeholder="Search by name, coven, or lore..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-surface-card border border-white/10 text-text-primary font-code-pill text-xs focus:outline-none focus:border-neon-mint transition-colors placeholder:text-text-muted" 
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-lg">search</span>
        </div>
      </div>

      {/* Coven Filter Pills */}
      <div className="flex flex-wrap gap-2 pb-6 border-b border-white/5 font-code-pill text-xs">
        {covens.map(c => {
          const isActive = selectedCoven === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleCovenClick(c.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'bg-neon-mint text-obsidian-deep font-bold' 
                  : 'bg-surface-container text-text-secondary hover:text-text-primary'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Merchants Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-card rounded-2xl border border-white/5 p-8 mt-8">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="font-headline-md text-text-primary uppercase mb-2">No Merchants Located</h3>
          <p className="font-body-md text-text-secondary">Adjust your search telemetry or coven filter to reveal establishments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mt-8">
          {filtered.map(m => {
            const isDiscovered = isMerchantDiscovered(m.id);
            const glowColor = m.rarityColor || '#00F59B';

            return (
              <div 
                key={m.id}
                className="group relative rounded-2xl bg-surface-card overflow-hidden shadow-xl hover:shadow-[0_0_28px_rgba(0,245,155,0.2)] transition-all duration-300 flex flex-col border border-white/5"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: glowColor }}></div>
                <div className="relative h-52 w-full overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={m.name} 
                    src={m.image} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent"></div>
                  
                  <div 
                    className="absolute top-3 left-3 px-2 py-0.5 rounded bg-obsidian-deep/85 backdrop-blur-sm font-badge-arcade text-badge-arcade uppercase"
                    style={{ color: glowColor }}
                  >
                    {m.covenIcon} {m.coven}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-obsidian-deep/85 backdrop-blur-sm text-text-primary font-code-pill text-code-pill">
                    {m.distanceText}
                  </div>
                  
                  {isDiscovered ? (
                    <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full bg-neon-mint text-obsidian-deep font-code-pill text-code-pill font-bold flex items-center gap-1 shadow-md">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> DISCOVERED
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-full bg-surface-container-high text-neon-mint font-code-pill text-code-pill font-bold shadow-md">
                      +{m.xp} XP
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-badge-arcade text-badge-arcade uppercase" style={{ color: glowColor }}>
                        {m.rarity} DISCOVERY
                      </span>
                      <div className="flex items-center text-amber-ember font-code-pill text-code-pill">
                        <span>⭐ {m.rating}</span>
                        <span className="text-text-muted ml-1">({m.reviews})</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-text-primary uppercase tracking-tight">{m.name}</h3>
                    <p className="font-body-sm text-body-sm text-text-secondary mt-1.5 line-clamp-2">{m.lore}</p>
                  </div>

                  <div className="mt-4 pt-3 bg-surface-container-high/40 -mx-5 -mb-5 px-5 pb-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="font-code-pill text-badge-arcade text-neon-mint font-bold uppercase">{m.hours}</span>
                      <span className="font-code-pill text-code-pill text-text-muted truncate max-w-[150px]">{m.address}</span>
                    </div>
                    <button 
                      onClick={() => openCodex(m.id)}
                      className="px-3.5 py-1.5 rounded bg-surface-container hover:bg-neon-mint hover:text-obsidian-deep transition-all font-headline-sm text-code-pill uppercase font-bold text-text-primary shadow-sm cursor-pointer"
                    >
                      VIEW CODEX
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
