"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import type { PlayerBasicInfo, GameBasicInfo, PlayerGameStats, TeamGameStats } from '@/hooks/useStats';

interface StatsInputFormProps {
  game: GameBasicInfo;
  players: PlayerBasicInfo[];
  onSubmit: (playerStats: Omit<PlayerGameStats, 'id'>[], teamStats: Omit<TeamGameStats, 'id'>) => void;
  onClose: () => void;
}

export function StatsInputForm({ 
  game, 
  players,
  onSubmit,
  onClose,
}: StatsInputFormProps) {
  // Initialize team stats with default values
  const [teamStats, setTeamStats] = useState<Omit<TeamGameStats, 'id'>>({
    gameId: game.id,
    possession: 50,
    powerPlayGoals: 0,
    powerPlayOpportunities: 0,
    penaltyKillSuccess: 0,
    penaltyKillOpportunities: 0,
    shotsOnGoal: 0,
    formation: "3-2-1",
  });
  
  // Initialize player stats with default values for each player
  const [playerStats, setPlayerStats] = useState<Record<string, Omit<PlayerGameStats, 'id'>>>(
    players.reduce((acc, player) => {
      acc[player.id] = {
        gameId: game.id,
        playerId: player.id,
        goalsScored: 0,
        assists: 0,
        saves: 0,
        playingTimeMinutes: 0,
        spinMoves: 0,
        defensiveBlocks: 0,
        penalties: 0,
        batteryUsagePercent: 0,
        speedZoneLow: 0,
        speedZoneMid: 0,
        speedZoneHigh: 0,
        coachRating: 5, // Default rating
      };
      return acc;
    }, {} as Record<string, Omit<PlayerGameStats, 'id'>>)
  );
  
  // Handle team stats changes
  const handleTeamStatsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeamStats(prev => ({
      ...prev,
      [name]: name === 'formation' ? value : Number(value),
    }));
  };
  
  // Handle player stats changes
  const handlePlayerStatsChange = (playerId: string, field: keyof PlayerGameStats, value: number) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert player stats object to array
    const playerStatsArray = Object.values(playerStats);
    
    onSubmit(playerStatsArray, teamStats);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Stats Entry: {game.opponentName} ({game.homeOrAway})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Team Stats Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Team Statistics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Possession (%)
                </label>
                <input
                  type="number"
                  name="possession"
                  min="0"
                  max="100"
                  value={teamStats.possession}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Formation
                </label>
                <select
                  name="formation"
                  value={teamStats.formation}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="3-2-1">3-2-1</option>
                  <option value="2-3-1">2-3-1</option>
                  <option value="2-2-2">2-2-2</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shots on Goal
                </label>
                <input
                  type="number"
                  name="shotsOnGoal"
                  min="0"
                  value={teamStats.shotsOnGoal}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Power Play Goals
                </label>
                <input
                  type="number"
                  name="powerPlayGoals"
                  min="0"
                  value={teamStats.powerPlayGoals}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Power Play Opportunities
                </label>
                <input
                  type="number"
                  name="powerPlayOpportunities"
                  min="0"
                  value={teamStats.powerPlayOpportunities}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Penalty Kill Success
                </label>
                <input
                  type="number"
                  name="penaltyKillSuccess"
                  min="0"
                  value={teamStats.penaltyKillSuccess}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Penalty Kill Opportunities
                </label>
                <input
                  type="number"
                  name="penaltyKillOpportunities"
                  min="0"
                  value={teamStats.penaltyKillOpportunities}
                  onChange={handleTeamStatsChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Player Stats Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Player Statistics
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Player
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Minutes
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Goals
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Assists
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Saves
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Spin
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blocks
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      PIM
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Battery
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {player.name} {player.jerseyNumber && `#${player.jerseyNumber}`}
                        <div className="text-xs text-gray-500 dark:text-gray-400">{player.position}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].playingTimeMinutes}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'playingTimeMinutes', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].goalsScored}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'goalsScored', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].assists}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'assists', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].saves}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'saves', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].spinMoves}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'spinMoves', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].defensiveBlocks}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'defensiveBlocks', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={playerStats[player.id].penalties}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'penalties', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={playerStats[player.id].batteryUsagePercent || 0}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'batteryUsagePercent', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <select
                          value={playerStats[player.id].coachRating || 5}
                          onChange={(e) => handlePlayerStatsChange(player.id, 'coachRating', Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Stats
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
