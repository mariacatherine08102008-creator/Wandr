/**
 * WANDR - Interactive Arcane Cartography (Leaflet + Sonar Overlay)
 */
class WandrMapController {
  constructor() {
    this.map = null;
    this.markers = new Map();
    this.playerMarker = null;
    this.playerCoords = [37.7749, -122.4194];
    this.radarOverlay = null;
    this.containerId = 'interactive-ward-map';
  }

  init(containerId = 'interactive-ward-map') {
    this.containerId = containerId;
    const container = document.getElementById(containerId);
    if (!container) return;

    // Destroy existing if any
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize Leaflet
    this.map = L.map(containerId, {
      center: this.playerCoords,
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    // Dark Matter Tiles (Free, OpenStreetMap based, cyberpunk/obsidian dark style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.renderPlayerMarker();
    this.renderMerchantMarkers();

    // Map click blip
    this.map.on('click', () => {
      if (window.WandrAudio) window.WandrAudio.playClick();
    });

    // Handle map resize on container visibility change
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  renderPlayerMarker() {
    if (!this.map) return;

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

    if (this.playerMarker) {
      this.playerMarker.setLatLng(this.playerCoords);
    } else {
      this.playerMarker = L.marker(this.playerCoords, { icon: playerIcon, zIndexOffset: 1000 }).addTo(this.map);
    }
  }

  renderMerchantMarkers(filterCoven = 'ALL', searchQuery = '') {
    if (!this.map) return;

    // Clear existing merchant markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers.clear();

    const merchants = window.WandrState.getAllMerchants();
    const query = searchQuery.trim().toLowerCase();

    merchants.forEach(merchant => {
      if (filterCoven !== 'ALL' && merchant.coven !== filterCoven) return;
      if (query && !merchant.name.toLowerCase().includes(query) && !merchant.coven.toLowerCase().includes(query)) {
        return;
      }

      const isDiscovered = window.WandrState.isMerchantDiscovered(merchant.id);
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

      const marker = L.marker(merchant.coords, { icon }).addTo(this.map);

      // Custom Popup
      const popupHtml = `
        <div class="p-3 bg-surface-card text-on-surface w-64">
          <div class="flex items-center justify-between mb-1">
            <span class="font-code-pill text-[10px] uppercase font-bold" style="color: ${glowColor};">${merchant.rarity} • ${merchant.coven}</span>
            <span class="font-code-pill text-[10px] text-text-muted">${merchant.distanceText}</span>
          </div>
          <h4 class="font-headline-sm text-sm uppercase font-bold text-text-primary mb-1">${merchant.name}</h4>
          <p class="font-body-sm text-[11px] text-text-secondary line-clamp-2 mb-2">${merchant.lore}</p>
          <div class="flex items-center justify-between pt-2 border-t border-white/10">
            <span class="font-code-pill text-[10px] text-neon-mint font-bold">+${merchant.xp} XP</span>
            <button onclick="window.WandrApp.openCodexModal('${merchant.id}')" 
                    class="px-2.5 py-1 rounded bg-surface-container-high hover:bg-neon-mint hover:text-obsidian-deep font-code-pill text-[10px] uppercase font-bold text-text-primary transition-colors">
              VIEW CODEX
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, className: 'arcane-popup' });

      marker.on('click', () => {
        if (window.WandrAudio) window.WandrAudio.playSonarPing();
      });

      this.markers.set(merchant.id, marker);
    });
  }

  panToMerchant(merchantId) {
    const merchant = window.WandrState.getMerchantById(merchantId);
    if (merchant && this.map) {
      this.map.flyTo(merchant.coords, 17, { duration: 1.2 });
      const marker = this.markers.get(merchantId);
      if (marker) {
        setTimeout(() => marker.openPopup(), 1200);
      }
    }
  }

  requestUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.playerCoords = [pos.coords.latitude, pos.coords.longitude];
          this.renderPlayerMarker();
          if (this.map) {
            this.map.setView(this.playerCoords, 16);
          }
          if (window.WandrApp) {
            window.WandrApp.showToast('GPS SYNCHRONIZED', `Locked onto Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using simulated Sector-09 coordinates', err);
          if (window.WandrApp) {
            window.WandrApp.showToast('GPS LOCAL SIMULATION', 'Active in Sector-09 (Hayes Valley Ward Grid)');
          }
        }
      );
    }
  }
}

const WandrMap = new WandrMapController();
window.WandrMap = WandrMap;
