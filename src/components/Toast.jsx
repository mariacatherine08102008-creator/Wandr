import React from 'react';
import { useGameState } from '../context/GameStateContext';

export function Toast() {
  const { toast } = useGameState();

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-arcane-violet-surface/95 border border-electric-violet/50 backdrop-blur-md shadow-[0_0_24px_rgba(179,71,255,0.4)] flex items-center gap-4 max-w-sm transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto">
      <div className="w-10 h-10 rounded-xl bg-electric-violet flex items-center justify-center text-obsidian-deep font-bold text-xl shrink-0 shadow-md">
        ✨
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-badge-arcade text-badge-arcade text-magical-gold uppercase">DISCOVERY EVENT</span>
          <span className="px-1.5 py-0.5 rounded bg-obsidian-deep text-neon-mint font-badge-arcade text-[10px] font-bold border border-neon-mint/30">
            {toast.badge}
          </span>
        </div>
        <span className="font-headline-sm text-xs text-text-primary font-bold">{toast.title}</span>
        <span className="font-body-sm text-[11px] text-text-secondary line-clamp-1">{toast.subtitle}</span>
      </div>
    </div>
  );
}
