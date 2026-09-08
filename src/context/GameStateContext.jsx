import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_MERCHANTS } from '../data/merchants';
import { INITIAL_QUESTS } from '../data/quests';
import { WandrAudio } from '../services/audio';
import { WandrAPI } from '../services/api';

const GameStateContext = createContext(null);

const STORAGE_KEY = 'wandr_react_state_v2';

export function GameStateProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not load stored state', e);
    }
    return {
      playerName: 'ALTHEA',
      playerTitle: 'APPRENTICE MAGE',
      level: 8,
      xp: 1850,
      xpForNextLevel: 2500,
      xpForCurrentLevel: 1500,
      streak: 7,
      shards: 14,
      discoveredMerchantIds: ['moonlight-bakery'],
      acceptedQuestIds: [],
      completedQuestIds: [],
      customMerchants: []
    };
  });

  const [merchantsList, setMerchantsList] = useState(INITIAL_MERCHANTS);
  const [activeTab, setActiveTab] = useState('the-ward');
  const [soundMuted, setSoundMuted] = useState(WandrAudio.isMuted());
  const [codexMerchantId, setCodexMerchantId] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [panTargetId, setPanTargetId] = useState(null);
  const [toast, setToast] = useState({ show: false, title: '', subtitle: '', badge: '' });

  // Sync state with backend on mount
  useEffect(() => {
    let isMounted = true;

    async function syncWithBackend() {
      try {
        const [backendPlayer, backendMerchants] = await Promise.all([
          WandrAPI.getPlayerState().catch(() => null),
          WandrAPI.getMerchants().catch(() => null)
        ]);

        if (!isMounted) return;

        if (backendPlayer) {
          setState(prev => ({
            ...prev,
            ...backendPlayer
          }));
        }

        if (backendMerchants && backendMerchants.length > 0) {
          setMerchantsList(backendMerchants);
        }
      } catch (err) {
        console.warn('Backend sync deferred, running with cached state:', err);
      }
    }

    syncWithBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist state to localStorage for offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Could not save state', e);
    }
  }, [state]);

  const showToast = (title, subtitle, badge = '+50 XP') => {
    setToast({ show: true, title, subtitle, badge });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const toggleSound = () => {
    const unmuted = WandrAudio.toggleMute();
    setSoundMuted(!unmuted);
    if (unmuted) WandrAudio.playClick();
  };

  const addXP = (amount, reason = 'Explorer Discovery') => {
    let leveledUp = false;
    let newLevel = state.level;
    let nextThreshold = state.xpForNextLevel;
    let currThreshold = state.xpForCurrentLevel;
    let newXP = state.xp + amount;
    let newTitle = state.playerTitle;

    while (newXP >= nextThreshold) {
      leveledUp = true;
      newLevel += 1;
      currThreshold = nextThreshold;
      nextThreshold = Math.floor(nextThreshold * 1.4);
    }

    if (newLevel >= 15) newTitle = 'ARCH-MAGE CARTOGRAPHER';
    else if (newLevel >= 12) newTitle = 'REALM EXPLORER MASTER';
    else if (newLevel >= 10) newTitle = 'JOURNEYMAN ARCANIST';

    setState(prev => ({
      ...prev,
      xp: newXP,
      level: newLevel,
      xpForNextLevel: nextThreshold,
      xpForCurrentLevel: currThreshold,
      playerTitle: newTitle
    }));

    if (leveledUp) {
      WandrAudio.playLevelUp();
      setLevelUpData({ level: newLevel, title: newTitle });
    } else {
      WandrAudio.playXPCollect();
    }
  };

  // Combine fetched merchants with any local custom additions
  const allMerchants = merchantsList;

  const getMerchantById = (id) => {
    return allMerchants.find(m => m.id === id);
  };

  const isMerchantDiscovered = (id) => {
    return state.discoveredMerchantIds.includes(id);
  };

  const checkInMerchant = async (merchantId) => {
    const merchant = getMerchantById(merchantId);
    if (!merchant) return;

    if (isMerchantDiscovered(merchantId)) {
      showToast('ALREADY RECORDED', `${merchant.name} is already in your Arcane Codex!`, 'STAMPED');
      return;
    }

    const xpGained = merchant.xp || 50;

    // Optimistic local update
    setState(prev => {
      const nextAccepted = prev.acceptedQuestIds;
      const nextCompleted = prev.completedQuestIds.includes('quest-threshold') 
        ? prev.completedQuestIds 
        : (prev.acceptedQuestIds.includes('quest-threshold') ? [...prev.completedQuestIds, 'quest-threshold'] : prev.completedQuestIds);

      return {
        ...prev,
        discoveredMerchantIds: [...prev.discoveredMerchantIds, merchantId],
        shards: prev.shards + 1,
        completedQuestIds: nextCompleted
      };
    });

    addXP(xpGained, `Check-in: ${merchant.name}`);
    showToast('CARD UNLOCKED!', `Sigil stamped for ${merchant.name}! Added to compendium.`, `+${xpGained} XP`);

    // Sync with backend API
    try {
      const res = await WandrAPI.checkInMerchant(merchantId);
      if (res && res.player) {
        setState(prev => ({
          ...prev,
          ...res.player
        }));
      }
    } catch (err) {
      console.warn('Backend checkin sync deferred:', err);
    }
  };

  const registerMerchant = async (formData) => {
    const newId = 'custom-' + Date.now().toString(36);
    const newMerchant = {
      id: newId,
      name: formData.name,
      coven: formData.coven || "Arcane Goods",
      covenIcon: formData.covenIcon || "✨",
      rarity: formData.rarity || "Uncommon",
      rarityColor: formData.rarity === 'Rare' ? '#38BDF8' : (formData.rarity === 'Epic' ? '#B347FF' : '#00F59B'),
      coords: formData.coords || [37.7749 + (Math.random() - 0.5) * 0.008, -122.4194 + (Math.random() - 0.5) * 0.008],
      address: formData.address || 'Hayes Valley Sanctuary',
      distanceKm: 0.3,
      distanceText: '300M AWAY',
      hours: formData.hours || 'Open till 8 PM',
      isOpen: true,
      xp: 75,
      rating: 5.0,
      reviews: 1,
      lore: formData.lore || 'A newly consecrated independent establishment pledged to the Wandr local realm.',
      secretPerk: formData.secretPerk || 'Welcome perk: 10% off your first community exploration visit.',
      image: formData.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      isMystery: false,
      keeperName: formData.keeperName || 'Keeper'
    };

    // Optimistic local state update
    setMerchantsList(prev => [newMerchant, ...prev]);
    setState(prev => ({
      ...prev,
      customMerchants: [newMerchant, ...(prev.customMerchants || [])],
      discoveredMerchantIds: [...prev.discoveredMerchantIds, newId]
    }));

    addXP(100, `Merchant Guild Charter: ${newMerchant.name}`);
    showToast('GUILD CHARTER SEALED!', `${newMerchant.name} is now on the Ward radar!`, '+100 XP');
    setPanTargetId(newId);

    // Persist to backend
    try {
      const res = await WandrAPI.registerMerchant({
        ...formData,
        coords: newMerchant.coords
      });
      if (res && res.merchant) {
        setMerchantsList(prev => [res.merchant, ...prev.filter(m => m.id !== newId)]);
        if (res.player) {
          setState(prev => ({ ...prev, ...res.player }));
        }
      }
    } catch (err) {
      console.warn('Backend register sync deferred:', err);
    }

    return newMerchant;
  };

  const acceptQuest = async (questId) => {
    if (!state.acceptedQuestIds.includes(questId)) {
      setState(prev => ({
        ...prev,
        acceptedQuestIds: [...prev.acceptedQuestIds, questId]
      }));
      WandrAudio.playQuestAccept();
      showToast('BOUNTY ACCEPTED', 'Quest is now actively tracked in your telemetry log!');

      try {
        await WandrAPI.acceptQuest(questId);
      } catch (err) {
        console.warn('Backend acceptQuest sync deferred:', err);
      }
    }
  };

  const completeQuest = async (questId) => {
    if (!state.completedQuestIds.includes(questId)) {
      setState(prev => ({
        ...prev,
        completedQuestIds: [...prev.completedQuestIds, questId],
        shards: prev.shards + 2
      }));
      addXP(150, 'Completed Daily Magic Bounty');
      showToast('QUEST COMPLETE!', '+150 Explorer XP & 2 Silver Ward Shards claimed!', '+150 XP');

      try {
        const res = await WandrAPI.completeQuest(questId);
        if (res && res.player) {
          setState(prev => ({ ...prev, ...res.player }));
        }
      } catch (err) {
        console.warn('Backend completeQuest sync deferred:', err);
      }
    }
  };

  const openCodex = (merchantId) => {
    setCodexMerchantId(merchantId);
    WandrAudio.playCardFlip();
  };

  const closeCodex = () => {
    setCodexMerchantId(null);
  };

  const panToMerchantOnMap = (merchantId) => {
    closeCodex();
    setActiveTab('the-ward');
    setPanTargetId(merchantId);
  };

  return (
    <GameStateContext.Provider value={{
      state,
      activeTab,
      setActiveTab,
      soundMuted,
      toggleSound,
      allMerchants,
      getMerchantById,
      isMerchantDiscovered,
      checkInMerchant,
      registerMerchant,
      acceptQuest,
      completeQuest,
      codexMerchantId,
      openCodex,
      closeCodex,
      isRegisterOpen,
      setIsRegisterOpen,
      levelUpData,
      setLevelUpData,
      panTargetId,
      setPanTargetId,
      toast,
      showToast,
      setToast
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameStateProvider');
  return context;
}
