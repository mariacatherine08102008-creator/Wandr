import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGameState } from '../context/GameStateContext';
import { WandrAudio } from '../services/audio';

export function WardMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const { allMerchants, isMerchantDiscovered, openCodex, panTargetId, setPanTargetId, state } = useGameState();

  const playerCoords = [37.7749, -122.4194];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: playerCoords,
        zoom: 15,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Player marker
      const playerHtml = `
        <div class="relative flex items-center justify-center marker-pin" style="width: 48px; height: 48px;">
          <div class="absolute w-12 h-12 rounded-full bg-neon-mint/25 animate-ping"></div>
          <div class="absolute w-8 h-8 rounded-full bg-electric-violet/30 animate-pulse"></div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-neon-mint to-electric-violet p-0.5 shadow-[0_0_20px_rgba(0,245,155,0.8)] flex items-center justify-center z-10">
            <div class="w-full h-full bg-obsidian-deep rounded-full flex items-center justify-center text-neon-mint">
              <span class="material-symbols-outlined text-[18px]">navigation</span>
            </div>
          </div>
          <div class="absolute -bottom-6 px-1.5 py-0.5 rounded bg-obsidian-deep/90 border border-neon-mint/40 font-code-pill text-[9px] text-magical-gold whitespace-nowrap shadow-md pointer-events-none">
            YOU (EXPLORER)
          </div>
        </div>
      `;

      const playerIcon = L.divIcon({
        className: 'custom-player-icon',
        html: playerHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      L.marker(playerCoords, { icon: playerIcon, zIndexOffset: 1000 }).addTo(map);

      map.on('click', () => {
        WandrAudio.playClick();
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove stale markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current.clear();

    // Render merchant markers
    allMerchants.forEach(merchant => {
      const isDiscovered = isMerchantDiscovered(merchant.id);
      const glowColor = merchant.rarityColor || '#00F59B';
      const bounceClass = merchant.isMystery ? 'animate-bounce' : '';

      const markerHtml = `
        <div class="relative group marker-pin ${bounceClass}" style="width: 42px; height: 42px;">
          <div class="w-10 h-10 rounded-xl bg-surface-card border-2 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125"
               style="border-color: ${glowColor}; box-shadow: 0 0 16px ${glowColor}60;">
            <span class="text-base leading-none select-none">${merchant.covenIcon || '✨'}</span>
            ${isDiscovered ? '<span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-mint border border-obsidian-deep"></span>' : ''}
          </div>
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-obsidian-deep/95 border border-white/10 font-code-pill text-[9px] text-text-primary whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${merchant.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: `merchant-icon-${merchant.id}`,
        html: markerHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      const marker = L.marker(merchant.coords, { icon }).addTo(map);

      marker.on('click', () => {
        WandrAudio.playSonarPing();
        openCodex(merchant.id);
      });

      markersRef.current.set(merchant.id, marker);
    });

    // Invalidate size after render
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);

    return () => {
      // Map stays alive across tabs unless container removed
    };
  }, [allMerchants, state.discoveredMerchantIds]);

  // Handle pan target if directed from codex / directory
  useEffect(() => {
    if (panTargetId && mapInstanceRef.current) {
      const merchant = allMerchants.find(m => m.id === panTargetId);
      if (merchant) {
        mapInstanceRef.current.flyTo(merchant.coords, 17, { duration: 1.2 });
      }
      setPanTargetId(null);
    }
  }, [panTargetId]);

  return (
    <div className="relative w-full h-[560px] rounded-2xl bg-surface-card overflow-hidden shadow-2xl border border-white/10">
      {/* Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Grid Pattern & CRT scanlines */}
      <div className="absolute inset-0 bg-[radial-gradient(#171F32_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40 z-10"></div>
      <div className="absolute inset-0 crt-scanlines opacity-20 pointer-events-none z-10"></div>

      {/* Radar Sweep Beam */}
      <div className="radar-sweep-beam"></div>

      {/* TOP FLOATING HUD CARD OVERLAY */}
      <div className="absolute top-space-base left-space-base z-20 flex flex-col gap-space-xs w-72 p-space-md rounded-xl bg-obsidian-deep/90 backdrop-blur-lg shadow-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="font-badge-arcade text-badge-arcade text-neon-mint">
            LEVEL {String(state.level).padStart(2, '0')}: {state.playerTitle.split(' ')[0]}
          </span>
          <span className="font-code-pill text-code-pill text-magical-gold">
            {state.xp.toLocaleString()} / {state.xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-mint to-electric-violet shadow-[0_0_10px_rgba(0,245,155,0.7)] transition-all duration-500"
            style={{ width: `${Math.min(100, (state.xp / state.xpForNextLevel) * 100)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-code-pill font-code-pill pt-space-xxs text-text-secondary">
          <span>MERCHANTS VISITED</span>
          <span className="text-text-primary font-bold">
            {state.discoveredMerchantIds.length} / {allMerchants.length} DISCOVERED
          </span>
        </div>
        <div className="mt-space-xs p-space-xs rounded bg-surface-card flex items-center gap-space-xs text-code-pill font-code-pill text-magical-gold border border-white/5">
          <span className="w-2 h-2 rounded-full bg-magical-gold animate-ping"></span>
          <span>SONAR: 1 MYSTERY DETECTED</span>
        </div>
      </div>

      {/* Helper Note */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-deep/80 backdrop-blur-md border border-white/5 font-code-pill text-[11px] text-text-muted">
        <span className="text-neon-mint">⚡ TIP:</span> Click any glowing establishment marker to inspect its codex & stamp sigil.
      </div>
    </div>
  );
}
