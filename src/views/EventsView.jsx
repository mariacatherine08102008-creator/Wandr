import React, { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { WandrAudio } from '../services/audio';
import { WandrAPI } from '../services/api';

const INITIAL_FALLBACK_EVENTS = [
  {
    id: 'event-solstice',
    title: "Arcane Solstice Night Market",
    date: "THIS FRIDAY • 7:00 PM - 11:00 PM",
    location: "Octavia Courtyard & Sector-09 Alleys",
    coven: "Artisans & Bakers Guild",
    description: "Twilight gathering of 18 independent makers. Featuring warm spiced cider, torchlit sourdough tastings, live ambient modular synths, and limited-edition holographic cards.",
    perk: "+200 Discovery XP & Event Badge",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    isRsvped: false
  },
  {
    id: 'event-tea-ceremony',
    title: "Nocturnal Herbal Infusion Circle",
    date: "SATURDAY • 6:30 PM",
    location: "Alchemist Apothecary Greenhouse",
    coven: "Potions & Elixirs",
    description: "Intimate wildcrafted botanicals masterclass led by Herbalist Marigold. Taste coastal sage and blue lotus preparations brewed in glass alembics.",
    perk: "Vial of Arcane Mist + 100 XP",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    isRsvped: false
  },
  {
    id: 'event-loom-workshop',
    title: "Arcane Sigil Embroidery Atelier",
    date: "SUNDAY • 2:00 PM",
    location: "The Neon Loom Workspace",
    coven: "Enchanted Threads",
    description: "Bring a vintage denim or canvas piece to customize with reflective and luminescent protective ward sigils hand-guided by master Jaxen.",
    perk: "Sigil Card Unlock + 120 XP",
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
    isRsvped: false
  }
];

export function EventsView() {
  const { showToast } = useGameState();
  const [events, setEvents] = useState(INITIAL_FALLBACK_EVENTS);

  useEffect(() => {
    let isMounted = true;
    WandrAPI.getEvents()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleRSVP = async (eventId) => {
    WandrAudio.playQuestAccept();
    showToast('EVENT RSVP CONFIRMED', 'Arcane calendar lock saved. Telemetry coordinates stored.');

    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, isRsvped: true } : ev));

    try {
      await WandrAPI.rsvpEvent(eventId);
    } catch (e) {
      console.warn('Backend event RSVP sync deferred:', e);
    }
  };

  return (
    <div className="max-w-ward-max-width mx-auto px-grid-gutter-desktop py-space-2xl">
      <div className="mb-8">
        <span className="font-badge-arcade text-badge-arcade text-electric-violet uppercase">COMMUNITY RITUALS</span>
        <h1 className="font-headline-xl text-3xl uppercase font-bold text-text-primary mt-1">WARD GATHERINGS & POP-UPS</h1>
        <p className="font-body-sm text-text-secondary mt-1">Attend night markets, artisan workshops, and secret solstice tastings hosted by independent keepers.</p>
      </div>

      <div className="flex flex-col gap-6">
        {events.map(ev => (
          <div 
            key={ev.id}
            className="rounded-2xl bg-surface-card border border-white/10 overflow-hidden shadow-xl flex flex-col md:flex-row hover:border-electric-violet/40 transition-all"
          >
            <div className="md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden">
              <img src={ev.image} className="w-full h-full object-cover" alt={ev.title} />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-card via-transparent to-transparent"></div>
            </div>
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2 mb-2 font-code-pill text-code-pill">
                  <span className="px-2 py-0.5 rounded bg-electric-violet/20 text-electric-violet font-bold uppercase">{ev.coven}</span>
                  <span className="text-magical-gold font-bold">{ev.date}</span>
                </div>
                <h3 className="font-headline-lg text-xl uppercase font-bold text-text-primary tracking-tight">{ev.title}</h3>
                <p className="font-body-sm text-text-secondary mt-1.5">{ev.description}</p>
                <div className="mt-3 flex items-center gap-2 font-code-pill text-code-pill text-neon-mint">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span>{ev.perk}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="font-code-pill text-code-pill text-text-muted">{ev.location}</span>
                {ev.isRsvped ? (
                  <span className="px-4 py-1.5 rounded-lg bg-neon-mint/20 text-neon-mint font-headline-sm text-code-pill uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    TELEMETRY LOCKED
                  </span>
                ) : (
                  <button 
                    onClick={() => handleRSVP(ev.id)}
                    className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-electric-violet hover:text-obsidian-deep text-text-primary font-headline-sm text-code-pill uppercase font-bold transition-all shadow-sm cursor-pointer"
                  >
                    RSVP & LOCK TELEMETRY
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
