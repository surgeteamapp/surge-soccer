import { safeLocalStorage, STORAGE_KEYS } from './localStorage';

// Debug function to clear all app data (call from browser console)
export const clearAllAppData = () => {
  console.log('Clearing all app data...');
  Object.values(STORAGE_KEYS).forEach(key => {
    if (typeof key === 'string') {
      safeLocalStorage.removeItem(key);
    }
  });
  console.log('All app data cleared');
};

// Debug function to inspect current localStorage data
export const inspectLocalStorage = () => {
  console.log('=== LocalStorage Debug Info ===');
  Object.values(STORAGE_KEYS).forEach(key => {
    if (typeof key === 'string') {
      const data = safeLocalStorage.getItem(key);
      console.log(`${key}:`, data ? `${JSON.parse(data || 'null')?.length || 0} items` : 'null');
      if (data && key === STORAGE_KEYS.EVENTS) {
        try {
          const parsed = JSON.parse(data);
          console.log('Events preview:', parsed.slice(0, 2));
        } catch (e) {
          console.log('Events data is corrupted');
        }
      }
    }
  });
  console.log('=== End Debug Info ===');
};

// Function to fix corrupted data
export const fixCorruptedData = () => {
  console.log('Checking for corrupted data...');
  
  // Check events
  const events = safeLocalStorage.getItem(STORAGE_KEYS.EVENTS);
  if (events) {
    try {
      JSON.parse(events);
    } catch (e) {
      console.log('Events data corrupted, clearing...');
      safeLocalStorage.removeItem(STORAGE_KEYS.EVENTS);
    }
  }
  
  // Check games
  const games = safeLocalStorage.getItem(STORAGE_KEYS.GAMES);
  if (games) {
    try {
      JSON.parse(games);
    } catch (e) {
      console.log('Games data corrupted, clearing...');
      safeLocalStorage.removeItem(STORAGE_KEYS.GAMES);
    }
  }
  
  // Check players
  const players = safeLocalStorage.getItem(STORAGE_KEYS.PLAYERS);
  if (players) {
    try {
      JSON.parse(players);
    } catch (e) {
      console.log('Players data corrupted, clearing...');
      safeLocalStorage.removeItem(STORAGE_KEYS.PLAYERS);
    }
  }
  
  // Check team stats
  const teamStats = safeLocalStorage.getItem(STORAGE_KEYS.TEAM_STATS);
  if (teamStats) {
    try {
      JSON.parse(teamStats);
    } catch (e) {
      console.log('Team stats data corrupted, clearing...');
      safeLocalStorage.removeItem(STORAGE_KEYS.TEAM_STATS);
    }
  }
  
  console.log('Data fix complete');
};

// Make these functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).surgeSoccerDebug = {
    clearAllData: clearAllAppData,
    inspectData: inspectLocalStorage,
    fixData: fixCorruptedData,
  };
  console.log('Debug functions available at window.surgeSoccerDebug');
}
