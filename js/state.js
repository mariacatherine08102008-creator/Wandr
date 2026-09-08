/**
 * WANDR - Centralized RPG Game State Management
 * Handles XP progression, levels, check-ins, card compendium, and localStorage sync.
 */
class WandrStateManager {
  constructor() {
    this.storageKey = 'wandr_game_state_v2';
    this.listeners = [];
    this.state = this.loadState();
  }

  getDefaultState() {
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
      customMerchants: [],
      history: []
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...this.getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse saved state, initializing fresh state', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    // Initial call
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  getState() {
    return this.state;
  }

  getAllMerchants() {
    const base = window.WANDR_MERCHANTS || [];
    const custom = this.state.customMerchants || [];
    return [...base, ...custom];
  }

  getMerchantById(id) {
    return this.getAllMerchants().find(m => m.id === id);
  }

  isMerchantDiscovered(id) {
    return this.state.discoveredMerchantIds.includes(id);
  }

  addXP(amount, reason = 'Explorer Discovery') {
    let leveledUp = false;
    let newLevel = this.state.level;
    let nextThreshold = this.state.xpForNextLevel;
    let currThreshold = this.state.xpForCurrentLevel;
    let newXP = this.state.xp + amount;

    // Check for level up
    while (newXP >= nextThreshold) {
      leveledUp = true;
      newLevel += 1;
      currThreshold = nextThreshold;
      nextThreshold = Math.floor(nextThreshold * 1.4);
    }

    this.state.xp = newXP;
    this.state.level = newLevel;
    this.state.xpForNextLevel = nextThreshold;
    this.state.xpForCurrentLevel = currThreshold;

    this.state.history.unshift({
      type: 'XP_GAIN',
      amount,
      reason,
      timestamp: Date.now()
    });

    if (leveledUp) {
      // Update title at milestones
      if (newLevel >= 15) this.state.playerTitle = 'ARCH-MAGE CARTOGRAPHER';
      else if (newLevel >= 12) this.state.playerTitle = 'REALM EXPLORER MASTER';
      else if (newLevel >= 10) this.state.playerTitle = 'JOURNEYMAN ARCANIST';

      if (window.WandrAudio) window.WandrAudio.playLevelUp();
      if (window.WandrApp && window.WandrApp.showLevelUpModal) {
        window.WandrApp.showLevelUpModal(newLevel, this.state.playerTitle);
      }
    } else {
      if (window.WandrAudio) window.WandrAudio.playXPCollect();
    }

    this.saveState();
    return { leveledUp, newXP: this.state.xp, newLevel: this.state.level };
  }

  checkInMerchant(merchantId) {
    const merchant = this.getMerchantById(merchantId);
    if (!merchant) return { success: false, message: 'Merchant not found' };

    const alreadyDiscovered = this.isMerchantDiscovered(merchantId);
    if (alreadyDiscovered) {
      return { 
        success: false, 
        alreadyDiscovered: true, 
        message: `${merchant.name} is already recorded in your Arcane Codex!` 
      };
    }

    this.state.discoveredMerchantIds.push(merchantId);
    this.state.shards += 1; // Award 1 silver shard per check-in

    const xpGained = merchant.xp || 50;
    this.addXP(xpGained, `Check-in: ${merchant.name}`);

    // If active quest is "The Unknown Threshold", auto-complete it!
    if (this.isQuestActive('quest-threshold')) {
      this.completeQuest('quest-threshold');
    }

    this.saveState();
    return {
      success: true,
      alreadyDiscovered: false,
      xpGained,
      merchant,
      message: `Sigil stamped! Discovered ${merchant.name} (+${xpGained} XP, +1 Shard)`
    };
  }

  registerMerchant(merchantData) {
    const newId = 'custom-' + Date.now().toString(36);
    const newMerchant = {
      id: newId,
      name: merchantData.name,
      coven: merchantData.coven || "Arcane Goods",
      covenIcon: merchantData.covenIcon || "✨",
      rarity: merchantData.rarity || "Uncommon",
      rarityColor: merchantData.rarity === 'Rare' ? '#38BDF8' : (merchantData.rarity === 'Epic' ? '#B347FF' : '#00F59B'),
      coords: merchantData.coords || [37.7749 + (Math.random() - 0.5) * 0.008, -122.4194 + (Math.random() - 0.5) * 0.008],
      address: merchantData.address || 'Hayes Valley Sanctuary',
      distanceKm: 0.3,
      distanceText: '300M AWAY',
      hours: merchantData.hours || 'Open till 8 PM',
      isOpen: true,
      xp: 75,
      rating: 5.0,
      reviews: 1,
      lore: merchantData.lore || 'A newly consecrated independent establishment pledged to the Wandr local realm.',
      secretPerk: merchantData.secretPerk || 'Welcome perk: 10% off your first community exploration visit.',
      image: merchantData.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      isMystery: false,
      keeperName: merchantData.keeperName || 'Keeper'
    };

    this.state.customMerchants.push(newMerchant);
    // Auto-discover own shop
    if (!this.state.discoveredMerchantIds.includes(newId)) {
      this.state.discoveredMerchantIds.push(newId);
    }
    this.addXP(100, `Merchant Guild Charter: ${newMerchant.name}`);
    this.saveState();
    return newMerchant;
  }

  acceptQuest(questId) {
    if (!this.state.acceptedQuestIds.includes(questId)) {
      this.state.acceptedQuestIds.push(questId);
      if (window.WandrAudio) window.WandrAudio.playQuestAccept();
      this.saveState();
      return true;
    }
    return false;
  }

  completeQuest(questId) {
    if (!this.state.completedQuestIds.includes(questId)) {
      this.state.completedQuestIds.push(questId);
      // Give quest bounty
      this.state.shards += 2;
      this.addXP(150, 'Completed Daily Magic Bounty');
      this.saveState();
      return true;
    }
    return false;
  }

  isQuestActive(questId) {
    return this.state.acceptedQuestIds.includes(questId) && !this.state.completedQuestIds.includes(questId);
  }

  isQuestCompleted(questId) {
    return this.state.completedQuestIds.includes(questId);
  }
}

const WandrState = new WandrStateManager();
window.WandrState = WandrState;
