/**
 * WANDR - Frontend API Client
 * Interfaces with the Arcane REST API with resilient fallback
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[WANDR API Client] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const WandrAPI = {
  // Player
  getPlayerState: () => request('/player'),
  updatePlayer: (data) => request('/player', { method: 'PUT', body: JSON.stringify(data) }),
  awardXP: (amount, reason) => request('/player/xp', { method: 'POST', body: JSON.stringify({ amount, reason }) }),
  resetPlayer: () => request('/player/reset', { method: 'POST' }),

  // Merchants
  getMerchants: (coven = 'ALL', query = '') => {
    const params = new URLSearchParams();
    if (coven && coven !== 'ALL') params.append('coven', coven);
    if (query) params.append('q', query);
    const queryString = params.toString();
    return request(`/merchants${queryString ? `?${queryString}` : ''}`);
  },
  getMerchantById: (id) => request(`/merchants/${id}`),
  registerMerchant: (data) => request('/merchants', { method: 'POST', body: JSON.stringify(data) }),
  checkInMerchant: (id) => request(`/merchants/${id}/checkin`, { method: 'POST' }),
  getMerchantReviews: (id) => request(`/merchants/${id}/reviews`),
  addMerchantReview: (id, review) => request(`/merchants/${id}/reviews`, { method: 'POST', body: JSON.stringify(review) }),

  // Quests
  getQuests: () => request('/quests'),
  acceptQuest: (id) => request(`/quests/${id}/accept`, { method: 'POST' }),
  completeQuest: (id) => request(`/quests/${id}/complete`, { method: 'POST' }),

  // Events
  getEvents: () => request('/events'),
  rsvpEvent: (id) => request(`/events/${id}/rsvp`, { method: 'POST' }),

  // Leaderboard & Telemetry
  getLeaderboard: () => request('/leaderboard'),
  getTelemetry: () => request('/leaderboard/telemetry')
};
