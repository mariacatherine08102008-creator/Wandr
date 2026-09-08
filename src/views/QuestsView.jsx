import React from 'react';
import { useGameState } from '../context/GameStateContext';
import { INITIAL_QUESTS } from '../data/quests';

export function QuestsView() {
  const { state, acceptQuest, completeQuest } = useGameState();

  return (
    <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
      <div className="mb-8">
        <span className="font-badge-arcade text-badge-arcade text-magical-gold uppercase">ARCANE SPELLBOOK</span>
        <h1 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mt-1">BOUNTIES & EXPEDITIONS</h1>
        <p className="font-body-sm text-text-secondary mt-1">Accept active neighborhood bounties, complete real-world discoveries, and claim explorer XP.</p>
      </div>

      <div className="flex flex-col gap-4">
        {INITIAL_QUESTS.map(q => {
          const isActive = state.acceptedQuestIds.includes(q.id) && !state.completedQuestIds.includes(q.id);
          const isCompleted = state.completedQuestIds.includes(q.id);

          return (
            <div 
              key={q.id}
              className="p-6 rounded-2xl bg-surface-card border border-white/10 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-neon-mint/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-magical-gold text-2xl shrink-0">
                  <span className="material-symbols-outlined text-2xl">{q.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded ${q.badgeColor} font-badge-arcade text-badge-arcade uppercase font-bold`}>
                      {q.type}
                    </span>
                    <span className="font-code-pill text-code-pill text-text-muted">• DIFFICULTY: {q.difficulty.toUpperCase()}</span>
                  </div>
                  <h3 className="font-headline-lg text-lg uppercase font-bold text-text-primary tracking-tight">{q.title}</h3>
                  <p className="font-body-sm text-text-secondary mt-1 max-w-xl">{q.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3 font-code-pill text-code-pill">
                    <span className="px-2.5 py-1 rounded bg-surface-container text-neon-mint font-bold">💎 +{q.rewardXP} XP</span>
                    <span className="px-2.5 py-1 rounded bg-surface-container text-magical-gold font-bold">✨ {q.rewardArtifact}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center lg:justify-end">
                {isCompleted ? (
                  <span className="px-4 py-2 rounded-lg bg-neon-mint/20 text-neon-mint font-code-pill text-code-pill font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">verified</span> COMPLETED
                  </span>
                ) : isActive ? (
                  <button 
                    onClick={() => completeQuest(q.id)}
                    className="px-5 py-2.5 rounded-xl bg-neon-mint text-obsidian-deep font-headline-sm text-code-pill uppercase font-bold shadow-[0_0_16px_rgba(0,245,155,0.4)] hover:brightness-110 transition-all cursor-pointer"
                  >
                    COMPLETE & CLAIM +{q.rewardXP} XP
                  </button>
                ) : (
                  <button 
                    onClick={() => acceptQuest(q.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-magical-gold to-amber-ember text-obsidian-deep font-headline-sm text-code-pill uppercase font-bold shadow-[0_0_16px_rgba(255,209,92,0.35)] hover:shadow-[0_0_24px_rgba(255,209,92,0.5)] transition-all cursor-pointer"
                  >
                    ACCEPT BOUNTY
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
