// Safe localStorage utilities that work with SSR
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item ${key}:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item ${key}:`, error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item ${key}:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// Specific keys for the app
export const STORAGE_KEYS = {
  EVENTS: 'surge-soccer-events',
  GAMES: 'surge-soccer-games',
  PLAYERS: 'surge-soccer-players',
  TEAM_STATS: 'surge-soccer-team-stats',
  PLAYER_STATS: 'surge-soccer-player-stats',
  AVAILABLE_USERS: 'surge-soccer-available-users',
  TRAINING_TEMPLATES: 'surge-soccer-training-templates',
  MVP_PREFIX: 'surge-soccer-mvp-'
} as const;
