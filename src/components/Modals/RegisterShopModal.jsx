import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';

export function RegisterShopModal() {
  const { isRegisterOpen, setIsRegisterOpen, registerMerchant } = useGameState();
  const [formData, setFormData] = useState({
    name: '',
    coven: "Bakers' Coven",
    rarity: 'Uncommon',
    address: '',
    hours: '',
    keeperName: '',
    lore: '',
    secretPerk: '',
    image: ''
  });

  if (!isRegisterOpen) return null;

  const covenIcons = {
    "Bakers' Coven": "🍞",
    "Potions & Elixirs": "🧪",
    "Enchanted Threads": "🧵",
    "Arcane Goods": "🔮",
    "Coffee Alchemy": "☕",
    "Arcane Relics": "🎵"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMerchant({
      ...formData,
      covenIcon: covenIcons[formData.coven] || "✨"
    });
    setIsRegisterOpen(false);
    setFormData({
      name: '',
      coven: "Bakers' Coven",
      rarity: 'Uncommon',
      address: '',
      hours: '',
      keeperName: '',
      lore: '',
      secretPerk: '',
      image: ''
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-obsidian-deep/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsRegisterOpen(false);
      }}
    >
      <div className="relative rounded-2xl bg-surface-card border-2 border-neon-mint/60 shadow-[0_0_50px_rgba(0,245,155,0.25)] overflow-hidden max-w-xl w-full mx-auto animate-modal-enter p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <span className="font-badge-arcade text-badge-arcade text-neon-mint uppercase">MERCHANT GUILD PORTAL</span>
            <h2 className="font-headline-lg text-2xl uppercase font-bold text-text-primary mt-0.5">REGISTER YOUR INDIE SHOP</h2>
          </div>
          <button 
            onClick={() => setIsRegisterOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-code-pill text-xs">
          <div>
            <label className="block text-text-muted mb-1 uppercase">ESTABLISHMENT NAME *</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Copper Hearth Antiquities" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 uppercase">COVEN CATEGORY *</label>
              <select 
                value={formData.coven}
                onChange={(e) => setFormData({ ...formData, coven: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint"
              >
                <option value="Bakers' Coven">🍞 Bakers' Coven</option>
                <option value="Potions & Elixirs">🧪 Potions & Elixirs</option>
                <option value="Enchanted Threads">🧵 Enchanted Threads</option>
                <option value="Arcane Goods">🔮 Arcane Goods</option>
                <option value="Coffee Alchemy">☕ Coffee Alchemy</option>
                <option value="Arcane Relics">🎵 Arcane Relics</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 uppercase">CARD RARITY TIER</label>
              <select 
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint"
              >
                <option value="Uncommon">Uncommon (Neon Mint)</option>
                <option value="Rare">Rare (Celestial Blue)</option>
                <option value="Epic">Epic (Electric Violet)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 uppercase">PHYSICAL STREET ADDRESS *</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. 520 Linden St, Hayes" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 uppercase">HOURS OF POWER (OPEN HOURS) *</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Open till 8 PM" 
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1 uppercase">KEEPER / ARTISAN NAME *</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Master Alchemist Rowan" 
              value={formData.keeperName}
              onChange={(e) => setFormData({ ...formData, keeperName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 uppercase">ESTABLISHMENT LORE & PHILOSOPHY *</label>
            <textarea 
              required 
              rows={2} 
              placeholder="Tell explorers what makes your craft authentic..." 
              value={formData.lore}
              onChange={(e) => setFormData({ ...formData, lore: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint"
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 uppercase">EXCLUSIVE WANDR EXPLORER PERK *</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. 10% off house tea or secret cookie sample" 
              value={formData.secretPerk}
              onChange={(e) => setFormData({ ...formData, secretPerk: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 uppercase">PHOTO / SIGNAGE URL (OPTIONAL)</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/..." 
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-deep border border-white/10 text-text-primary focus:outline-none focus:border-neon-mint" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-neon-mint to-neon-lime text-obsidian-deep font-headline-sm uppercase font-bold shadow-[0_0_24px_rgba(0,245,155,0.4)] hover:brightness-110 transition-all text-sm cursor-pointer"
          >
            📜 CONSECRATE SHOP ON WARD RADAR (+100 XP)
          </button>
        </form>
      </div>
    </div>
  );
}
