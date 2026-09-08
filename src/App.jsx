import React from 'react';
import { useGameState } from './context/GameStateContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TheWardView } from './views/TheWardView';
import { DiscoverView } from './views/DiscoverView';
import { QuestsView } from './views/QuestsView';
import { EventsView } from './views/EventsView';
import { LeaderboardView } from './views/LeaderboardView';
import { CollectionView } from './views/CollectionView';
import { CodexModal } from './components/Modals/CodexModal';
import { RegisterShopModal } from './components/Modals/RegisterShopModal';
import { LevelUpModal } from './components/Modals/LevelUpModal';
import { Toast } from './components/Toast';

export function App() {
  const { activeTab } = useGameState();

  return (
    <div className="bg-obsidian-deep min-h-screen text-on-surface flex flex-col selection:bg-neon-mint selection:text-obsidian-deep">
      <Header />

      <main className="w-full pt-20 flex-1">
        {activeTab === 'the-ward' && <TheWardView />}
        {activeTab === 'discover' && <DiscoverView />}
        {activeTab === 'quests' && <QuestsView />}
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'collection' && <CollectionView />}
      </main>

      <Footer />

      {/* Global Modals & Toasts */}
      <CodexModal />
      <RegisterShopModal />
      <LevelUpModal />
      <Toast />
    </div>
  );
}
