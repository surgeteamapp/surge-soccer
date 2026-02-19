"use client";

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, User } from 'lucide-react';
import type { PlayerSeasonStats } from '@/hooks/useStats';

interface PlayerStatsTableProps {
  players: PlayerSeasonStats[];
  onSelectPlayer: (playerId: string) => void;
}

type SortField = 'name' | 'games' | 'goals' | 'assists' | 'points' | 'blocks' | 'spinMoves' | 'rating';
type SortDirection = 'asc' | 'desc';

export function PlayerStatsTable({ players, onSelectPlayer }: PlayerStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  // Get unique positions from players for filter dropdown
  const positions = Array.from(
    new Set(players.map(player => player.player.position || 'Unknown'))
  );

  // Sort players based on current sort field and direction
  const sortedPlayers = [...players].sort((a, b) => {
    let valueA, valueB;
    
    // Determine values to compare based on sort field
    switch (sortField) {
      case 'name':
        valueA = a.player.name.toLowerCase();
        valueB = b.player.name.toLowerCase();
        break;
      case 'goals':
        valueA = a.goalsScored;
        valueB = b.goalsScored;
        break;
      case 'assists':
        valueA = a.assists;
        valueB = b.assists;
        break;
      case 'points':
        valueA = a.goalsScored + a.assists;
        valueB = b.goalsScored + b.assists;
        break;
      case 'games':
        valueA = a.games;
        valueB = b.games;
        break;
      case 'blocks':
        valueA = a.defensiveBlocks;
        valueB = b.defensiveBlocks;
        break;
      case 'spinMoves':
        valueA = a.spinMoves;
        valueB = b.spinMoves;
        break;
      case 'rating':
        valueA = a.averageCoachRating;
        valueB = b.averageCoachRating;
        break;
      default:
        valueA = a.goalsScored + a.assists;
        valueB = b.goalsScored + b.assists;
    }
    
    // Apply sort direction
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Filter players based on search term and position filter
  const filteredPlayers = sortedPlayers.filter(player => {
    const nameMatch = player.player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const positionMatch = !positionFilter || player.player.position === positionFilter;
    return nameMatch && positionMatch;
  });

  // Handle sort header click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending for most stats
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Search & Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Player Statistics
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Position Filter */}
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
            <select
              value={positionFilter || ''}
              onChange={(e) => setPositionFilter(e.target.value || null)}
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Player {renderSortIndicator('name')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('games')}
              >
                GP {renderSortIndicator('games')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('goals')}
              >
                Goals {renderSortIndicator('goals')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('assists')}
              >
                Assists {renderSortIndicator('assists')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('points')}
              >
                Points {renderSortIndicator('points')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('spinMoves')}
              >
                Spin Moves {renderSortIndicator('spinMoves')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('blocks')}
              >
                Blocks {renderSortIndicator('blocks')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rating')}
              >
                Rating {renderSortIndicator('rating')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlayers.map((player) => (
              <tr 
                key={player.player.id} 
                onClick={() => onSelectPlayer(player.player.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {player.player.avatarUrl ? (
                        <img src={player.player.avatarUrl} alt={player.player.name} className="h-10 w-10 rounded-full" />
                      ) : (
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {player.player.name}
                        {player.player.jerseyNumber && <span className="ml-1 text-gray-500 dark:text-gray-400">#{player.player.jerseyNumber}</span>}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {player.player.position || 'Player'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.games}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.goalsScored}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.assists}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{player.goalsScored + player.assists}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.spinMoves}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.defensiveBlocks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <span>{player.averageCoachRating.toFixed(1)}</span>
                    <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(player.averageCoachRating / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No players match your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
