import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';

export type Season = '2024-2025' | '2025-2026';

export const AVAILABLE_SEASONS: Season[] = ['2024-2025', '2025-2026'];

export interface PlayerBasicInfo {
  id: string;
  name: string;
  jerseyNumber?: number;
  position?: string;
  avatarUrl?: string;
}

export interface PlayerGameStats {
  id: string;
  gameId: string;
  playerId: string;
  goalsScored: number;
  assists: number;
  saves: number;
  playingTimeMinutes: number;
  spinMoves: number;
  defensiveBlocks: number;
  penalties: number;
  batteryUsagePercent?: number;
  speedZoneLow: number;
  speedZoneMid: number;
  speedZoneHigh: number;
  coachRating?: number;
}

export interface GameBasicInfo {
  id: string;
  date: Date;
  opponentName: string;
  homeOrAway: 'HOME' | 'AWAY';
  location?: string;
  score?: string;
  result?: 'WIN' | 'LOSS' | 'DRAW';
}

export interface TeamGameStats {
  id: string;
  gameId: string;
  possession?: number;
  powerPlayGoals: number;
  powerPlayOpportunities: number;
  penaltyKillSuccess: number;
  penaltyKillOpportunities: number;
  shotsOnGoal: number;
  formation?: string;
}

export interface PlayerSeasonStats {
  player: PlayerBasicInfo;
  games: number;
  goalsScored: number;
  assists: number;
  saves: number;
  playingTimeMinutes: number;
  spinMoves: number;
  defensiveBlocks: number;
  penalties: number;
  averageBatteryUsage: number;
  speedZoneLow: number;
  speedZoneMid: number;
  speedZoneHigh: number;
  averageCoachRating: number;
}

export interface TeamSeasonStats {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  averagePossession: number;
  powerPlayGoals: number;
  powerPlayOpportunities: number;
  powerPlayPercentage: number;
  penaltyKillSuccess: number;
  penaltyKillOpportunities: number;
  penaltyKillPercentage: number;
}

export interface StatsFilter {
  season?: string;
  gameId?: string;
  playerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SeasonTeamStats {
  season: Season;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  points: number;
  winRate: number;
  avgGoalsPerGame: number;
  possession: number;
  passAccuracy: number;
  shotsOnTarget: number;
}

export interface SeasonPlayerStats {
  id: string;
  season: Season;
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  saves: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export interface GamePlayerStats {
  playerId: string;
  playerName: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  saves: number;
}

export interface GameRecord {
  id: string;
  season: Season;
  date: string;
  opponent: string;
  homeAway: 'HOME' | 'AWAY';
  ourScore: number;
  theirScore: number;
  result: 'W' | 'L' | 'D';
  // Enhanced game stats
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  // Per-player stats for this game
  playerStats?: GamePlayerStats[];
}

export function useStats() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season>('2025-2026');
  const hasLoadedInitialRef = useRef(false);
  
  const [players, setPlayers] = useState<PlayerBasicInfo[]>([]);
  const [games, setGames] = useState<GameBasicInfo[]>([]);
  const [playerGameStats, setPlayerGameStats] = useState<PlayerGameStats[]>([]);
  const [teamGameStats, setTeamGameStats] = useState<TeamGameStats[]>([]);
  const [playerSeasonStats, setPlayerSeasonStats] = useState<PlayerSeasonStats[]>([]);
  const [teamSeasonStats, setTeamSeasonStats] = useState<TeamSeasonStats | null>(null);
  
  // New season-based stats - empty by default, to be populated with real data
  const [seasonTeamStats, setSeasonTeamStats] = useState<Record<Season, SeasonTeamStats>>({
    '2024-2025': {
      season: '2024-2025',
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsScored: 0,
      goalsConceded: 0,
      cleanSheets: 0,
      points: 0,
      winRate: 0,
      avgGoalsPerGame: 0,
      possession: 0,
      passAccuracy: 0,
      shotsOnTarget: 0,
    },
    '2025-2026': {
      season: '2025-2026',
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsScored: 0,
      goalsConceded: 0,
      cleanSheets: 0,
      points: 0,
      winRate: 0,
      avgGoalsPerGame: 0,
      possession: 0,
      passAccuracy: 0,
      shotsOnTarget: 0,
    },
  });

  // Player stats - empty by default, will be populated from database
  const [seasonPlayerStats, setSeasonPlayerStats] = useState<SeasonPlayerStats[]>([]);

  // Game records - empty by default, will be populated from database
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);

  // Load players and game records from localStorage
  useEffect(() => {
    const loadStats = () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load players from localStorage (same as PlayerSettingsPage)
        const savedPlayers = localStorage.getItem('surge-soccer-players');
        let fetchedPlayers: PlayerBasicInfo[] = [];
        
        if (savedPlayers) {
          const parsedPlayers = JSON.parse(savedPlayers);
          fetchedPlayers = parsedPlayers.map((p: any) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            jerseyNumber: p.jerseyNumber,
            position: p.position || 'Player',
          }));
        }
        
        setPlayers(fetchedPlayers);
        
        // Load game records from localStorage
        let loadedGames: GameRecord[] = [];
        const savedGames = safeLocalStorage.getItem(STORAGE_KEYS.GAMES);
        console.log('Loading games from localStorage:', savedGames);
        if (savedGames) {
          try {
            loadedGames = JSON.parse(savedGames);
            console.log('Parsed games:', loadedGames);
          } catch (parseError) {
            console.warn('Failed to parse saved games:', parseError);
            safeLocalStorage.removeItem(STORAGE_KEYS.GAMES);
            loadedGames = [];
          }
        }
        setGameRecords(loadedGames);
        
        // Load team stats from localStorage or recalculate from games
        let teamStatsLoaded = false;
        const savedTeamStats = safeLocalStorage.getItem(STORAGE_KEYS.TEAM_STATS);
        if (savedTeamStats) {
          try {
            setSeasonTeamStats(JSON.parse(savedTeamStats));
            teamStatsLoaded = true;
          } catch (parseError) {
            console.warn('Failed to parse saved team stats:', parseError);
            safeLocalStorage.removeItem(STORAGE_KEYS.TEAM_STATS);
          }
        }
        if (!teamStatsLoaded && loadedGames.length > 0) {
          // Recalculate team stats from games
          const recalculatedStats: Record<Season, SeasonTeamStats> = {
            '2024-2025': { season: '2024-2025', gamesPlayed: 0, wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0, cleanSheets: 0, points: 0, winRate: 0, avgGoalsPerGame: 0, possession: 0, passAccuracy: 0, shotsOnTarget: 0 },
            '2025-2026': { season: '2025-2026', gamesPlayed: 0, wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0, cleanSheets: 0, points: 0, winRate: 0, avgGoalsPerGame: 0, possession: 0, passAccuracy: 0, shotsOnTarget: 0 },
          };
          loadedGames.forEach(game => {
            const stats = recalculatedStats[game.season];
            stats.gamesPlayed++;
            if (game.result === 'W') { stats.wins++; stats.points += 3; }
            if (game.result === 'L') stats.losses++;
            if (game.result === 'D') { stats.draws++; stats.points += 1; }
            stats.goalsScored += game.ourScore;
            stats.goalsConceded += game.theirScore;
            if (game.theirScore === 0) stats.cleanSheets++;
          });
          // Calculate derived stats
          AVAILABLE_SEASONS.forEach(season => {
            const stats = recalculatedStats[season];
            if (stats.gamesPlayed > 0) {
              stats.winRate = Math.round((stats.wins / stats.gamesPlayed) * 100);
              stats.avgGoalsPerGame = Math.round((stats.goalsScored / stats.gamesPlayed) * 10) / 10;
            }
          });
          setSeasonTeamStats(recalculatedStats);
        }
        
        // Initialize season player stats for each player and calculate from game records
        const initialPlayerStats: SeasonPlayerStats[] = [];
        AVAILABLE_SEASONS.forEach(season => {
          fetchedPlayers.forEach((player, idx) => {
            // Calculate stats from game records for this player and season
            const playerGamesInSeason = loadedGames.filter(g => 
              g.season === season && g.playerStats?.some(ps => ps.playerId === player.id)
            );
            
            let totalGoals = 0;
            let totalAssists = 0;
            let totalSaves = 0;
            let totalMinutes = 0;
            let gamesPlayed = 0;
            
            playerGamesInSeason.forEach(game => {
              const playerStat = game.playerStats?.find(ps => ps.playerId === player.id);
              if (playerStat && playerStat.minutesPlayed > 0) {
                gamesPlayed++;
                totalGoals += playerStat.goals || 0;
                totalAssists += playerStat.assists || 0;
                totalSaves += playerStat.saves || 0;
                totalMinutes += playerStat.minutesPlayed || 0;
              }
            });
            
            initialPlayerStats.push({
              id: `${player.id}-${season}`,
              season: season,
              playerId: player.id,
              playerName: player.name,
              jerseyNumber: player.jerseyNumber || idx + 1,
              position: player.position || 'Player',
              gamesPlayed: gamesPlayed,
              goals: totalGoals,
              assists: totalAssists,
              saves: totalSaves,
              minutesPlayed: totalMinutes,
              yellowCards: 0,
              redCards: 0,
              rating: gamesPlayed > 0 ? Math.min(10, 5 + (totalGoals * 0.5) + (totalAssists * 0.3)) : 0,
            });
          });
        });
        setSeasonPlayerStats(initialPlayerStats);
        
        setGames([]);
        setPlayerGameStats([]);
        setTeamGameStats([]);
        setPlayerSeasonStats([]);
        setTeamSeasonStats(null);
        
        setIsLoading(false);
        hasLoadedInitialRef.current = true;
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load statistics. Please try again later.");
        setIsLoading(false);
        hasLoadedInitialRef.current = true; // Prevent persistence from overwriting on error
      }
    };

    loadStats();
    
    // Listen for storage changes to update when players are modified
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'surge-soccer-players' || e.key === 'surge-soccer-games') {
        loadStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist game records to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    
    console.log('Persisting games to localStorage:', gameRecords);
    
    // Prevent race condition: don't overwrite existing data with empty array
    if (gameRecords.length === 0) {
      const existingData = safeLocalStorage.getItem(STORAGE_KEYS.GAMES);
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Skipping save - would overwrite non-empty games with empty array');
            return; // Don't overwrite non-empty data with empty array
          }
        } catch (e) {
          // If parsing fails, allow the save
        }
      }
    }
    
    const serializedGames = gameRecords.map(g => {
      const gameDate = typeof g.date === 'object' && g.date !== null && 'toISOString' in g.date 
        ? (g.date as Date).toISOString() 
        : g.date;
      
      return {
        ...g,
        date: gameDate,
        playerStats: g.playerStats?.map(ps => ({
          ...ps,
          minutesPlayed: ps.minutesPlayed,
          goals: ps.goals,
          assists: ps.assists,
          saves: ps.saves,
        })) || [],
      };
    });
    
    safeLocalStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(serializedGames));
    console.log('Games saved to localStorage');
  }, [gameRecords]);

  // Persist team stats to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    
    console.log('Persisting team stats to localStorage:', seasonTeamStats);
    safeLocalStorage.setItem(STORAGE_KEYS.TEAM_STATS, JSON.stringify(seasonTeamStats));
    console.log('Team stats saved to localStorage');
  }, [seasonTeamStats]);

  // Recalculate player season stats whenever game records change
  useEffect(() => {
    if (players.length === 0) return;
    
    const updatedPlayerStats: SeasonPlayerStats[] = [];
    AVAILABLE_SEASONS.forEach(season => {
      players.forEach((player, idx) => {
        const playerGamesInSeason = gameRecords.filter(g => 
          g.season === season && g.playerStats?.some(ps => ps.playerId === player.id)
        );
        
        let totalGoals = 0;
        let totalAssists = 0;
        let totalSaves = 0;
        let totalMinutes = 0;
        let gamesPlayed = 0;
        
        playerGamesInSeason.forEach(game => {
          const playerStat = game.playerStats?.find(ps => ps.playerId === player.id);
          if (playerStat && playerStat.minutesPlayed > 0) {
            gamesPlayed++;
            totalGoals += playerStat.goals || 0;
            totalAssists += playerStat.assists || 0;
            totalSaves += playerStat.saves || 0;
            totalMinutes += playerStat.minutesPlayed || 0;
          }
        });
        
        updatedPlayerStats.push({
          id: `${player.id}-${season}`,
          season: season,
          playerId: player.id,
          playerName: player.name,
          jerseyNumber: player.jerseyNumber || idx + 1,
          position: player.position || 'Player',
          gamesPlayed: gamesPlayed,
          goals: totalGoals,
          assists: totalAssists,
          saves: totalSaves,
          minutesPlayed: totalMinutes,
          yellowCards: 0,
          redCards: 0,
          rating: gamesPlayed > 0 ? Math.min(10, 5 + (totalGoals * 0.5) + (totalAssists * 0.3)) : 0,
        });
      });
    });
    setSeasonPlayerStats(updatedPlayerStats);
  }, [gameRecords, players]);

  // Function to get player stats for a specific game
  const getPlayerGameStats = (gameId: string, playerId?: string) => {
    if (playerId) {
      return playerGameStats.filter(
        stat => stat.gameId === gameId && stat.playerId === playerId
      );
    }
    return playerGameStats.filter(stat => stat.gameId === gameId);
  };

  // Function to get team stats for a specific game
  const getTeamGameStats = (gameId: string) => {
    return teamGameStats.find(stat => stat.gameId === gameId) || null;
  };

  // Function to get a player's stats across all games
  const getPlayerStats = (playerId: string) => {
    return playerSeasonStats.find(stats => stats.player.id === playerId) || null;
  };

  // Function to get a game by ID
  const getGame = (gameId: string) => {
    return games.find(game => game.id === gameId) || null;
  };

  // Function to get a player by ID
  const getPlayer = (playerId: string) => {
    return players.find(player => player.id === playerId) || null;
  };

  // Function to add new player game stats
  const addPlayerGameStats = async (stats: Omit<PlayerGameStats, 'id'>) => {
    try {
      // In a real implementation, we would send the stats to the API
      // For now, we'll just simulate it
      const newStats: PlayerGameStats = {
        ...stats,
        id: `new-${Date.now()}`,
      };
      
      setPlayerGameStats(prev => [...prev, newStats]);
      
      return newStats;
    } catch (err) {
      console.error("Failed to add player game stats:", err);
      setError("Failed to save player statistics. Please try again later.");
      throw err;
    }
  };

  // Function to add new team game stats
  const addTeamGameStats = async (stats: Omit<TeamGameStats, 'id'>) => {
    try {
      // In a real implementation, we would send the stats to the API
      // For now, we'll just simulate it
      const newStats: TeamGameStats = {
        ...stats,
        id: `team-new-${Date.now()}`,
      };
      
      setTeamGameStats(prev => [...prev, newStats]);
      
      return newStats;
    } catch (err) {
      console.error("Failed to add team game stats:", err);
      setError("Failed to save team statistics. Please try again later.");
      throw err;
    }
  };

  // Get stats for current season
  const getCurrentSeasonTeamStats = useCallback(() => {
    return seasonTeamStats[currentSeason];
  }, [currentSeason, seasonTeamStats]);

  const getCurrentSeasonPlayerStats = useCallback(() => {
    return seasonPlayerStats.filter(ps => ps.season === currentSeason);
  }, [currentSeason, seasonPlayerStats]);

  const getCurrentSeasonGames = useCallback(() => {
    return gameRecords.filter(g => g.season === currentSeason).sort((a, b) => {
      // Sort by creation order: newest (last created) at top, oldest (first created) at bottom
      const aTime = parseInt(a.id.replace('g-', '')) || 0;
      const bTime = parseInt(b.id.replace('g-', '')) || 0;
      return bTime - aTime;
    });
  }, [currentSeason, gameRecords]);

  // Update team stats for a season
  const updateSeasonTeamStats = useCallback((season: Season, updates: Partial<SeasonTeamStats>) => {
    setSeasonTeamStats(prev => ({
      ...prev,
      [season]: { ...prev[season], ...updates },
    }));
  }, []);

  // Update player stats
  const updateSeasonPlayerStats = useCallback((statsId: string, updates: Partial<SeasonPlayerStats>) => {
    setSeasonPlayerStats(prev => prev.map(ps => 
      ps.id === statsId ? { ...ps, ...updates } : ps
    ));
  }, []);

  // Add a new game record
  const addGameRecord = useCallback((game: Omit<GameRecord, 'id'>) => {
    const newGame: GameRecord = {
      ...game,
      id: `g-${Date.now()}`,
    };
    setGameRecords(prev => [...prev, newGame]);
    
    // Update team stats
    const teamStats = seasonTeamStats[game.season];
    const isWin = game.result === 'W';
    const isLoss = game.result === 'L';
    const isDraw = game.result === 'D';
    
    const newGamesPlayed = teamStats.gamesPlayed + 1;
    const newWins = teamStats.wins + (isWin ? 1 : 0);
    const newGoalsScored = teamStats.goalsScored + game.ourScore;
    
    updateSeasonTeamStats(game.season, {
      gamesPlayed: newGamesPlayed,
      wins: newWins,
      losses: teamStats.losses + (isLoss ? 1 : 0),
      draws: teamStats.draws + (isDraw ? 1 : 0),
      goalsScored: newGoalsScored,
      goalsConceded: teamStats.goalsConceded + game.theirScore,
      cleanSheets: teamStats.cleanSheets + (game.theirScore === 0 ? 1 : 0),
      points: teamStats.points + (isWin ? 3 : isDraw ? 1 : 0),
      winRate: Math.round((newWins / newGamesPlayed) * 100),
      avgGoalsPerGame: Math.round((newGoalsScored / newGamesPlayed) * 10) / 10,
    });
    
    return newGame;
  }, [seasonTeamStats, updateSeasonTeamStats]);

  // Update a game record
  const updateGameRecord = useCallback((gameId: string, updates: Partial<GameRecord>) => {
    const oldGame = gameRecords.find(g => g.id === gameId);
    if (!oldGame) return;
    
    // Update the game record
    setGameRecords(prev => prev.map(g => g.id === gameId ? { ...g, ...updates } : g));
    
    // Recalculate team stats if score or result changed
    if (updates.ourScore !== undefined || updates.theirScore !== undefined || updates.result !== undefined) {
      const teamStats = seasonTeamStats[oldGame.season];
      const oldIsWin = oldGame.result === 'W';
      const oldIsLoss = oldGame.result === 'L';
      const oldIsDraw = oldGame.result === 'D';
      
      const newResult = updates.result || oldGame.result;
      const newOurScore = updates.ourScore ?? oldGame.ourScore;
      const newTheirScore = updates.theirScore ?? oldGame.theirScore;
      const newIsWin = newResult === 'W';
      const newIsLoss = newResult === 'L';
      const newIsDraw = newResult === 'D';
      
      const newWins = teamStats.wins - (oldIsWin ? 1 : 0) + (newIsWin ? 1 : 0);
      const newGoalsScored = teamStats.goalsScored - oldGame.ourScore + newOurScore;
      
      updateSeasonTeamStats(oldGame.season, {
        wins: newWins,
        losses: teamStats.losses - (oldIsLoss ? 1 : 0) + (newIsLoss ? 1 : 0),
        draws: teamStats.draws - (oldIsDraw ? 1 : 0) + (newIsDraw ? 1 : 0),
        goalsScored: newGoalsScored,
        goalsConceded: teamStats.goalsConceded - oldGame.theirScore + newTheirScore,
        cleanSheets: teamStats.cleanSheets - (oldGame.theirScore === 0 ? 1 : 0) + (newTheirScore === 0 ? 1 : 0),
        points: teamStats.points - (oldIsWin ? 3 : oldIsDraw ? 1 : 0) + (newIsWin ? 3 : newIsDraw ? 1 : 0),
        winRate: teamStats.gamesPlayed > 0 ? Math.round((newWins / teamStats.gamesPlayed) * 100) : 0,
        avgGoalsPerGame: teamStats.gamesPlayed > 0 ? Math.round((newGoalsScored / teamStats.gamesPlayed) * 10) / 10 : 0,
      });
    }
  }, [gameRecords, seasonTeamStats, updateSeasonTeamStats]);

  // Delete a game record
  const deleteGameRecord = useCallback((gameId: string) => {
    const game = gameRecords.find(g => g.id === gameId);
    if (!game) return;
    
    setGameRecords(prev => prev.filter(g => g.id !== gameId));
    
    // Update team stats
    const teamStats = seasonTeamStats[game.season];
    const isWin = game.result === 'W';
    const isLoss = game.result === 'L';
    const isDraw = game.result === 'D';
    
    const newGamesPlayed = teamStats.gamesPlayed - 1;
    const newWins = teamStats.wins - (isWin ? 1 : 0);
    const newGoalsScored = teamStats.goalsScored - game.ourScore;
    
    updateSeasonTeamStats(game.season, {
      gamesPlayed: newGamesPlayed,
      wins: newWins,
      losses: teamStats.losses - (isLoss ? 1 : 0),
      draws: teamStats.draws - (isDraw ? 1 : 0),
      goalsScored: newGoalsScored,
      goalsConceded: teamStats.goalsConceded - game.theirScore,
      cleanSheets: teamStats.cleanSheets - (game.theirScore === 0 ? 1 : 0),
      points: teamStats.points - (isWin ? 3 : isDraw ? 1 : 0),
      winRate: newGamesPlayed > 0 ? Math.round((newWins / newGamesPlayed) * 100) : 0,
      avgGoalsPerGame: newGamesPlayed > 0 ? Math.round((newGoalsScored / newGamesPlayed) * 10) / 10 : 0,
    });
  }, [gameRecords, seasonTeamStats, updateSeasonTeamStats]);

  // Check if user can edit stats
  const canEditStats = useCallback(() => {
    const role = (session?.user as any)?.role;
    return role === 'COACH' || role === 'ADMIN' || role === 'TEAM_MANAGER';
  }, [session]);

  return {
    players,
    games,
    playerGameStats,
    teamGameStats,
    playerSeasonStats,
    teamSeasonStats,
    isLoading,
    error,
    getPlayerGameStats,
    getTeamGameStats,
    getPlayerStats,
    getGame,
    getPlayer,
    addPlayerGameStats,
    addTeamGameStats,
    // Season-based
    currentSeason,
    setCurrentSeason,
    seasonTeamStats,
    seasonPlayerStats,
    gameRecords,
    getCurrentSeasonTeamStats,
    getCurrentSeasonPlayerStats,
    getCurrentSeasonGames,
    updateSeasonTeamStats,
    updateSeasonPlayerStats,
    addGameRecord,
    updateGameRecord,
    deleteGameRecord,
    canEditStats,
    availableSeasons: AVAILABLE_SEASONS,
  };
}
