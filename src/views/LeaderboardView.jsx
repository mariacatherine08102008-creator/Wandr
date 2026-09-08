import React, { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { WandrAPI } from '../services/api';

export function LeaderboardView() {
  const { state } = useGameState();

  const fallbackLeaders = [
    { rank: 1, name: "KAI_VALEN", title: "GRAND ARCH-MAGE", xp: 14280, streak: 42, badge: "👑 GOLD SIGIL", isUser: false },
    { rank: 2, name: "ROWAN_GREY", title: "SECTOR PIONEER", xp: 11450, streak: 31, badge: "⚡ NEON CODEX", isUser: false },
    { rank: 3, name: "NYX_CYPHER", title: "MASTER CARTOGRAPHER", xp: 9820, streak: 26, badge: "🔮 OBSIDIAN KEY", isUser: false },
    { rank: 4, name: "SOLARIS_B", title: "COVEN VANGUARD", xp: 6240, streak: 18, badge: "🍞 HEARTH MASTER", isUser: false },
    { rank: 5, name: state.playerName, title: state.playerTitle, xp: state.xp, streak: state.streak, badge: "⚔️ APPRENTICE", isUser: true },
    { rank: 6, name: "TESSA_W", title: "WARD SCOUT", xp: 1620, streak: 6, badge: "🧵 NEEDLE RUNIC", isUser: false },
    { rank: 7, name: "DARIEN_K", title: "WAYFINDER", xp: 1390, streak: 4, badge: "🧭 COMPASS BEACON", isUser: false }
  ];

  const [leaders, setLeaders] = useState(fallbackLeaders);
  const [weeklyReset, setWeeklyReset] = useState("2D 14H REMAINING");

  useEffect(() => {
    let isMounted = true;
    WandrAPI.getLeaderboard()
      .then(data => {
        if (isMounted && data && Array.isArray(data.leaders) && data.leaders.length > 0) {
          setLeaders(data.leaders);
          if (data.weeklyReset) setWeeklyReset(data.weeklyReset);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [state.xp, state.streak]);

  return (
    <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-badge-arcade text-badge-arcade text-amber-ember uppercase">SECTOR-09 RANKINGS</span>
          <h1 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mt-1">HALL OF GRAND EXPLORERS</h1>
          <p className="font-body-sm text-text-secondary mt-1">Top ward wanderers ordered by discovery XP and exploration consistency.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-surface-card border border-white/10 font-code-pill text-xs text-text-muted">
          <span>WEEKLY RESET:</span> <span className="text-magical-gold font-bold">{weeklyReset}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {leaders.map(l => (
          <div 
            key={l.rank || l.id}
            className={`p-4 rounded-xl ${
              l.isUser 
                ? 'bg-arcane-violet-surface border-2 border-neon-mint/80 shadow-[0_0_24px_rgba(0,245,155,0.25)]' 
                : 'bg-surface-card border border-white/5'
            } flex items-center justify-between gap-4 transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${l.rank <= 3 ? 'bg-magical-gold text-obsidian-deep' : 'bg-surface-container text-text-secondary'} font-hud-stat flex items-center justify-center font-bold text-lg`}>
                #{l.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-headline-sm text-sm uppercase font-bold text-text-primary ${l.isUser ? 'text-neon-mint' : ''}`}>
                    {l.name}
                  </span>
                  {l.isUser && (
                    <span className="px-1.5 py-0.5 rounded bg-neon-mint text-obsidian-deep font-badge-arcade text-[10px] font-bold">
                      YOU
                    </span>
                  )}
                  <span className="hidden sm:inline font-code-pill text-[11px] text-magical-gold">{l.badge}</span>
                </div>
                <span className="font-code-pill text-[11px] text-text-muted">{l.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 font-code-pill text-code-pill">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-amber-ember font-bold">🔥 {l.streak}D STREAK</span>
                <span className="text-text-muted text-[10px]">ACTIVE PASS</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-hud-stat text-neon-mint font-bold text-base">{l.xp.toLocaleString()} XP</span>
                <span className="text-text-muted text-[10px]">TOTAL POWER</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
