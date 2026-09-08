import React from 'react';
import { useGameState } from '../context/GameStateContext';

export function Footer() {
  const { setIsRegisterOpen, allMerchants, setActiveTab } = useGameState();

  return (
    <footer className="w-full bg-surface-card shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t border-white/5">
      <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-lg flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-white/5">
          <div className="flex items-center gap-space-sm font-code-pill text-code-pill">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-mint animate-ping"></span>
            <span className="text-neon-mint font-bold uppercase tracking-wider">WARD PULSE:</span>
            <span className="text-text-primary">{allMerchants.length + 6} MERCHANTS ACTIVE</span>
            <span className="text-text-muted">•</span>
            <span className="text-magical-gold">1 MYSTERY SIGNATURE NEARBY</span>
            <span className="text-text-muted">•</span>
            <span className="text-electric-violet">GPS LOCKED</span>
          </div>
          <div className="flex items-center gap-space-md">
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="px-space-md py-space-xs rounded bg-surface-container-high text-neon-mint hover:bg-primary-container hover:text-on-primary-container font-headline-sm text-code-pill uppercase transition-all duration-200 shadow-[0_0_12px_rgba(0,245,155,0.2)] cursor-pointer"
            >
              REGISTER YOUR SHOP (MERCHANT GUILD)
            </button>
            <button 
              onClick={() => setActiveTab('the-ward')}
              className="font-code-pill text-code-pill text-on-surface-variant hover:text-on-surface uppercase transition-colors cursor-pointer"
            >
              COMMUNITY TRAILS
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-sm text-text-muted font-code-pill text-code-pill">
          <div className="flex items-center gap-space-xs">
            <span className="px-space-xs py-space-xxs rounded bg-obsidian-deep text-magical-gold font-badge-arcade text-badge-arcade border border-magical-gold/30">
              SEAL OF ACCREDITATION
            </span>
            <span>VERIFIED ARCANE LOCAL MERCHANT NETWORK</span>
          </div>
          <div>© 2024 WANDR CARTOGRAPHY INC. ALL REALMS RESERVED.</div>
        </div>
      </div>
    </footer>
  );
}
