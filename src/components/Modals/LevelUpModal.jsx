import React from 'react';
import { useGameState } from '../../context/GameStateContext';

export function LevelUpModal() {
  const { levelUpData, setLevelUpData } = useGameState();

  if (!levelUpData) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-obsidian-deep/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setLevelUpData(null);
      }}
    >
      <div className="relative rounded-3xl bg-arcane-violet-surface border-2 border-magical-gold p-8 sm:p-12 text-center max-w-md w-full shadow-[0_0_60px_rgba(255,209,92,0.4)] animate-modal-enter">
        <div className="w-20 h-20 rounded-full bg-magical-gold/20 border-2 border-magical-gold text-magical-gold mx-auto flex items-center justify-center text-4xl mb-4 animate-bounce">
          ⭐
        </div>
        <span className="font-badge-arcade text-badge-arcade text-magical-gold uppercase tracking-widest block mb-1">
          ARCANE ADVANCEMENT
        </span>
        <h2 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mb-1">
          LEVEL {levelUpData.level}
        </h2>
        <h3 className="font-code-pill text-neon-mint text-sm font-bold uppercase mb-4">
          {levelUpData.title}
        </h3>
        <p className="font-body-sm text-text-secondary mb-6">
          Your real-world steps have expanded your arcane sonar radius! New merchant codices are now visible on the ward grid.
        </p>
        
        <button 
          onClick={() => setLevelUpData(null)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-magical-gold to-amber-ember text-obsidian-deep font-headline-sm uppercase font-bold shadow-[0_0_24px_rgba(255,209,92,0.5)] hover:scale-105 transition-all cursor-pointer"
        >
          CLAIM POWER & CONTINUE
        </button>
      </div>
    </div>
  );
}
