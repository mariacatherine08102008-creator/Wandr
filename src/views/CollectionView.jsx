import React from 'react';
import { useGameState } from '../context/GameStateContext';

export function CollectionView() {
  const { allMerchants, state, isMerchantDiscovered, openCodex, panToMerchantOnMap } = useGameState();

  return (
    <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-badge-arcade text-badge-arcade text-magical-gold uppercase">HOLOGRAPHIC COMPENDIUM</span>
          <h1 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mt-1">COLLECTED WARD CARDS</h1>
          <p className="font-body-sm text-text-secondary mt-1">Digital collectibles unlocked by checking in at physical independent establishments.</p>
        </div>
        <div className="flex items-center gap-3 font-code-pill text-xs">
          <div className="px-3.5 py-1.5 rounded-lg bg-surface-card border border-white/10 text-neon-mint font-bold">
            CARDS: <span className="text-text-primary">{state.discoveredMerchantIds.length} / {allMerchants.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-surface-card border border-white/10 text-magical-gold font-bold">
            <span>{state.shards} SHARDS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allMerchants.map(m => {
          const isDiscovered = isMerchantDiscovered(m.id);
          const glowColor = m.rarityColor || '#00F59B';

          if (isDiscovered) {
            return (
              <div 
                key={m.id}
                className="group relative rounded-2xl bg-surface-card border-2 overflow-hidden shadow-2xl transition-all duration-300 tilt-card holo-shimmer cursor-pointer hover:scale-[1.02]"
                style={{ borderColor: glowColor, boxShadow: `0 0 24px ${glowColor}40` }}
                onClick={() => openCodex(m.id)}
              >
                <div className="relative h-60 w-full overflow-hidden">
                  <img src={m.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-obsidian-deep/90 text-xs font-badge-arcade uppercase" style={{ color: glowColor }}>
                    {m.rarity}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-neon-mint text-obsidian-deep text-[11px] font-code-pill font-bold shadow-md">
                    UNLOCKED
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span className="text-2xl">{m.covenIcon}</span>
                    <span className="font-headline-sm text-sm uppercase font-bold text-text-primary drop-shadow">{m.name}</span>
                  </div>
                </div>
                <div className="p-4 bg-surface-card">
                  <div className="flex items-center justify-between text-code-pill font-code-pill text-text-secondary mb-2">
                    <span>COVEN: {m.coven}</span>
                    <span className="text-magical-gold font-bold">⭐ {m.rating}</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-text-secondary line-clamp-2">{m.lore}</p>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="font-code-pill text-[10px] text-text-muted">KEEPER: {m.keeperName || 'Guardian'}</span>
                    <span className="font-code-pill text-[11px] text-neon-mint font-bold">+{m.xp} XP</span>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div 
                key={m.id}
                className="group relative rounded-2xl bg-surface-card/60 border border-dashed border-white/15 overflow-hidden shadow-lg p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-obsidian-deep border border-white/10 flex items-center justify-center text-3xl mb-3 text-text-muted">
                  🔒
                </div>
                <span className="font-badge-arcade text-badge-arcade uppercase text-text-muted mb-1">{m.rarity} ENIGMA</span>
                <h4 className="font-headline-sm text-base uppercase font-bold text-text-primary mb-1">{m.name}</h4>
                <p className="font-code-pill text-[11px] text-text-muted mb-4">{m.distanceText} • {m.coven}</p>
                <button 
                  onClick={() => panToMerchantOnMap(m.id)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-neon-mint hover:text-obsidian-deep font-code-pill text-[11px] uppercase font-bold text-text-primary transition-colors cursor-pointer"
                >
                  HUNT ON RADAR
                </button>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
