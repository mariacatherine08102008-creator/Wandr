import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export function CodexModal() {
  const { codexMerchantId, closeCodex, getMerchantById, isMerchantDiscovered, checkInMerchant, panToMerchantOnMap } = useGameState();

  if (!codexMerchantId) return null;

  const merchant = getMerchantById(codexMerchantId);
  if (!merchant) return null;

  const isDiscovered = isMerchantDiscovered(merchant.id);
  const glowColor = merchant.rarityColor || '#00F59B';

  return (
    <div 
      className="fixed inset-0 z-50 bg-obsidian-deep/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCodex();
      }}
    >
      <div 
        className="relative rounded-2xl bg-surface-card border-2 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden max-w-2xl w-full mx-auto animate-modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{ borderColor: glowColor }}
      >
        {/* Header Image & Holographic Shimmer */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden holo-shimmer">
          <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/60"></div>
          
          <button 
            onClick={closeCodex}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-obsidian-deep/80 hover:bg-obsidian-deep text-text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-obsidian-deep/90 font-badge-arcade text-badge-arcade uppercase font-bold" style={{ color: glowColor }}>
              {merchant.rarity} CODEX
            </span>
            <span className="px-2.5 py-1 rounded bg-obsidian-deep/90 text-text-primary font-code-pill text-code-pill">
              {merchant.covenIcon} {merchant.coven}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-ember font-code-pill text-code-pill mb-1">
                <span>⭐ {merchant.rating}</span>
                <span className="text-text-muted">({merchant.reviews} community reviews)</span>
              </div>
              <h2 className="font-headline-xl text-2xl sm:text-3xl uppercase font-bold text-text-primary tracking-tight drop-shadow-md">
                {merchant.name}
              </h2>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-obsidian-deep/90 border border-neon-mint font-code-pill text-neon-mint font-bold text-sm shadow-md">
              +{merchant.xp} XP
            </div>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Telemetry Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-obsidian-deep/80 border border-white/5 font-code-pill text-code-pill">
            <div>
              <span className="text-text-muted block text-[11px]">OPENING SPELL</span>
              <span className="text-neon-mint font-bold">{merchant.hours}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">PROXIMITY</span>
              <span className="text-magical-gold font-bold">{merchant.distanceText}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-text-muted block text-[11px]">LOCATION</span>
              <span className="text-text-primary font-bold truncate block">{merchant.address}</span>
            </div>
          </div>

          {/* Keeper Lore */}
          <div>
            <h4 className="font-badge-arcade text-badge-arcade text-magical-gold uppercase mb-1">KEEPER ARCHIVES</h4>
            <p className="font-body-md text-text-secondary leading-relaxed">{merchant.lore}</p>
            <span className="inline-block mt-2 font-code-pill text-xs text-text-muted italic">
              — Recorded by Keeper {merchant.keeperName || 'Sanctuary Guardian'}
            </span>
          </div>

          {/* Secret Perk */}
          <div className="p-4 rounded-xl bg-arcane-violet-surface border border-electric-violet/40 shadow-inner flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <span className="font-badge-arcade text-badge-arcade text-electric-violet uppercase font-bold block mb-0.5">
                EXCLUSIVE WANDR PERK
              </span>
              <p className="font-body-sm text-text-primary font-medium">{merchant.secretPerk}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/10">
            {isDiscovered ? (
              <button 
                disabled 
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-neon-mint/20 border border-neon-mint/60 text-neon-mint font-headline-sm uppercase font-bold flex items-center justify-center gap-2 cursor-default"
              >
                <span className="material-symbols-outlined text-xl">verified</span>
                SIGIL STAMPED (IN COLLECTION)
              </button>
            ) : (
              <button 
                onClick={() => checkInMerchant(merchant.id)}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-neon-mint to-neon-lime text-obsidian-deep font-headline-sm uppercase font-bold shadow-[0_0_24px_rgba(0,245,155,0.45)] hover:shadow-[0_0_36px_rgba(0,245,155,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                CHECK IN & STAMP SIGIL (+{merchant.xp} XP)
              </button>
            )}
            <button 
              onClick={() => panToMerchantOnMap(merchant.id)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-card-hover text-text-primary font-headline-sm uppercase font-bold transition-colors flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-magical-gold">explore</span>
              LOCATE ON RADAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
