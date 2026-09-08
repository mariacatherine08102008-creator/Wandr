import React, { useState } from 'react';
import { useGameState } from '../context/GameStateContext';
import { WandrAudio } from '../services/audio';

export function Header() {
  const { state, activeTab, setActiveTab, soundMuted, toggleSound, setIsRegisterOpen } = useGameState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const range = state.xpForNextLevel - state.xpForCurrentLevel;
  const progress = Math.max(0, Math.min(100, ((state.xp - state.xpForCurrentLevel) / (range || 1)) * 100));

  const navItems = [
    { id: 'the-ward', label: 'THE WARD' },
    { id: 'discover', label: 'DISCOVER' },
    { id: 'quests', label: 'QUESTS' },
    { id: 'events', label: 'EVENTS' },
    { id: 'leaderboard', label: 'LEADERBOARD' },
    { id: 'collection', label: 'COLLECTION' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    WandrAudio.playClick();
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-obsidian-deep/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border-b border-white/5">
      <div className="h-20 max-w-ward-max-width mx-auto px-grid-gutter-desktop flex items-center justify-between gap-space-md">
        
        {/* Brand Logo */}
        <button onClick={() => handleTabClick('the-ward')} className="flex items-center gap-space-md shrink-0 hover:opacity-95 transition-opacity text-left cursor-pointer">
          <img 
            alt="WANDR Arcane Compass Logo" 
            className="h-10 w-10 object-contain rounded-xl shadow-[0_0_12px_rgba(0,245,155,0.4)] border border-neon-mint/30" 
            src="/logo.png"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-md text-headline-md tracking-wider font-bold text-text-primary">WANDR</span>
              <span className="px-space-xs py-space-xxs rounded bg-surface-card text-neon-mint font-badge-arcade text-badge-arcade uppercase">VER. 2.4</span>
            </div>
            <span className="font-code-pill text-code-pill tracking-widest text-magical-gold uppercase">WANDER • DISCOVER • COLLECT</span>
          </div>
        </button>

        {/* Main Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-space-sm">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-space-md py-space-xs uppercase transition-all duration-200 font-headline-sm text-code-pill cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold rounded-lg shadow-[0_0_16px_rgba(0,245,155,0.35)]'
                    : 'rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* HUD Telemetry Controls */}
        <div className="flex items-center gap-space-md shrink-0">
          {/* Audio Synth Toggle */}
          <button 
            onClick={toggleSound}
            className="hidden md:flex items-center gap-space-xs px-space-sm py-space-xxs rounded bg-surface-card text-electric-violet hover:bg-surface-container-high hover:text-on-surface transition-all font-badge-arcade text-badge-arcade cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${soundMuted ? 'bg-text-muted' : 'bg-electric-violet animate-pulse'}`}></span>
            <span>{soundMuted ? 'SOUND: OFF' : 'SOUND: ON'}</span>
          </button>

          {/* Player XP / Level Pill */}
          <div className="hidden lg:flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg bg-surface-card border border-white/5">
            <span className="font-badge-arcade text-badge-arcade text-magical-gold px-space-xs py-space-xxs rounded bg-obsidian-deep">
              LVL {String(state.level).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-space-xxs">
              <div className="flex justify-between items-center text-code-pill font-code-pill text-text-muted">
                <span className="text-neon-mint font-bold">XP</span>
                <span>{state.xp.toLocaleString()} / {state.xpForNextLevel.toLocaleString()}</span>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-obsidian-deep overflow-hidden">
                <div 
                  className="h-full bg-neon-mint shadow-[0_0_8px_rgba(0,245,155,0.6)] transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="font-badge-arcade text-badge-arcade text-amber-ember">{state.streak}D STREAK</span>
          </div>

          {/* Profile Widget */}
          <div className="relative group flex items-center gap-space-xs">
            <div className="p-0.5 rounded-full bg-surface-card shadow-[0_0_12px_rgba(179,71,255,0.4)] border border-electric-violet/50">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover" 
                   src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmcBT9d8q3znTJQ6nv10jNuGa5RERVz9wWnG9A_cxGJj_QWkol_E1IXFPlBDLgyfiE3pQhPthz_7X05mc_a-PcX3Vo-dwpg-Owfj68Su17c01GGft9G5kDMbUw5y9ADQEm3Zd1NoWflsneeJBKEU3pTwig0xUg32eoTuaeHuUMUZ8jrtCq6LTNZPl_sKPROtt6V_GijEKcRyryDTTb9rJsG907ENNehLtk5Del-P4-mDVg1o2RNyqFIA"/>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-badge-arcade text-badge-arcade text-on-surface">{state.playerName}</span>
              <span className="font-code-pill text-code-pill text-electric-violet">{state.playerTitle}</span>
            </div>
          </div>

          {/* Mobile Drawer Trigger */}
          <div className="flex xl:hidden">
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg bg-surface-card text-neon-mint hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-obsidian-deep/98 border-b border-white/10 px-6 py-4 flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`py-2 text-left uppercase font-code-pill font-bold cursor-pointer ${
                activeTab === item.id ? 'text-neon-mint' : 'text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => { setIsRegisterOpen(true); setMobileMenuOpen(false); }}
            className="py-2 text-left text-magical-gold uppercase font-code-pill font-bold cursor-pointer"
          >
            🏛️ REGISTER SHOP
          </button>
        </div>
      )}
    </header>
  );
}
