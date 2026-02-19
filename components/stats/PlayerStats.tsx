"use client";

import { useState } from 'react';
import { 
  User,
  Goal,
  Clock,
  Zap,
  Shield,
  BarChart2,
  Battery,
  Gauge,
  Star,
  Filter
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend
} from 'recharts';

import { StatCard } from './StatCard';
import type { PlayerSeasonStats, PlayerGameStats } from '@/hooks/useStats';

interface PlayerStatsProps {
  player: PlayerSeasonStats;
  gameStats?: PlayerGameStats[];
  showGameStats?: boolean;
}

export function PlayerStats({ player, gameStats = [], showGameStats = false }: PlayerStatsProps) {
  const [statView, setStatView] = useState<'overview' | 'detailed'>('overview');

  // Format and calculate stats for display
  const totalPoints = player.goalsScored + player.assists;
  const pointsPerGame = totalPoints / (player.games || 1);
  const totalSpeed = player.speedZoneLow + player.speedZoneMid + player.speedZoneHigh;
  
  const speedPercentages = {
    low: Math.round((player.speedZoneLow / totalSpeed) * 100) || 0,
    mid: Math.round((player.speedZoneMid / totalSpeed) * 100) || 0,
    high: Math.round((player.speedZoneHigh / totalSpeed) * 100) || 0,
  };

  // Prepare radar chart data
  const radarData = [
    { stat: 'Goals', value: player.goalsScored, fullMark: 10 },
    { stat: 'Assists', value: player.assists, fullMark: 10 },
    { stat: 'Spin Moves', value: player.spinMoves, fullMark: 20 },
    { stat: 'Blocks', value: player.defensiveBlocks, fullMark: 15 },
    { stat: 'Rating', value: player.averageCoachRating, fullMark: 10 },
  ];

  // Prepare speed distribution pie chart data
  const speedData = [
    { name: 'Low Speed', value: speedPercentages.low, color: '#2196F3' },
    { name: 'Mid Speed', value: speedPercentages.mid, color: '#4CAF50' },
    { name: 'High Speed', value: speedPercentages.high, color: '#F44336' },
  ];

  // Prepare game-by-game stats bar chart
  const gameStatsData = gameStats.map(stat => ({
    name: `Game ${stat.gameId.replace('game', '')}`,
    goals: stat.goalsScored,
    assists: stat.assists,
    blocks: stat.defensiveBlocks,
    spinMoves: stat.spinMoves,
    battery: stat.batteryUsagePercent,
    rating: stat.coachRating,
  }));

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {player.player.name} 
            {player.player.jerseyNumber && <span className="ml-2">#{player.player.jerseyNumber}</span>}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {player.player.position || 'Player'}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="ml-auto">
          <div className="flex space-x-2 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${
                statView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setStatView('overview')}
            >
              Overview
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${
                statView === 'detailed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setStatView('detailed')}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      {statView === 'overview' && (
        <>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Games Played"
              value={player.games}
              subtitle={`${player.playingTimeMinutes} total minutes`}
              icon={<Clock className="h-6 w-6" />}
              color="blue"
            />
            
            <StatCard
              title="Goals"
              value={player.goalsScored}
              subtitle={`${player.assists} assists, ${totalPoints} points`}
              icon={<Goal className="h-6 w-6" />}
              color="green"
            />
            
            <StatCard
              title="Spin Moves"
              value={player.spinMoves}
              subtitle={`${(player.spinMoves / player.games).toFixed(1)} per game`}
              icon={<Zap className="h-6 w-6" />}
              color="purple"
            />
            
            <StatCard
              title="Defensive Blocks"
              value={player.defensiveBlocks}
              subtitle={`${(player.defensiveBlocks / player.games).toFixed(1)} per game`}
              icon={<Shield className="h-6 w-6" />}
              color="red"
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Performance Radar
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="stat" tick={{ fill: '#6B7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Speed Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Speed Zone Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speedData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                    >
                      {speedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 space-x-4">
                {speedData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Battery Usage"
              value={`${player.averageBatteryUsage.toFixed(0)}%`}
              subtitle="Average per game"
              icon={<Battery className="h-6 w-6" />}
              color="yellow"
              size="sm"
            />
            
            <StatCard
              title="Points Per Game"
              value={pointsPerGame.toFixed(1)}
              subtitle={`${totalPoints} total points`}
              icon={<BarChart2 className="h-6 w-6" />}
              color="blue"
              size="sm"
            />
            
            <StatCard
              title="Coach Rating"
              value={player.averageCoachRating.toFixed(1)}
              subtitle="Out of 10"
              icon={<Star className="h-6 w-6" />}
              color="purple"
              size="sm"
            />
          </div>
        </>
      )}
      
      {/* Detailed Stats View */}
      {statView === 'detailed' && (
        <>
          {/* Game by Game Stats Chart */}
          {showGameStats && gameStatsData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Game by Game Performance
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <select className="text-sm border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Stats</option>
                    <option value="offense">Offensive</option>
                    <option value="defense">Defensive</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gameStatsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="goals" fill="#4CAF50" name="Goals" />
                    <Bar yAxisId="left" dataKey="assists" fill="#2196F3" name="Assists" />
                    <Bar yAxisId="left" dataKey="blocks" fill="#F44336" name="Blocks" />
                    <Bar yAxisId="left" dataKey="spinMoves" fill="#9C27B0" name="Spin Moves" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Detailed Stats Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Full Statistics Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Per Game
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Games Played
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.games}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Goals
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.goalsScored}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.goalsScored / player.games).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Assists
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.assists}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.assists / player.games).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Points
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {totalPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {pointsPerGame.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Spin Moves
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.spinMoves}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.spinMoves / player.games).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Defensive Blocks
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.defensiveBlocks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.defensiveBlocks / player.games).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Penalties
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.penalties}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.penalties / player.games).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Playing Time
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.playingTimeMinutes} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(player.playingTimeMinutes / player.games).toFixed(1)} min
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Battery Usage
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.averageBatteryUsage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Coach Rating
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.averageCoachRating.toFixed(1)}/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
