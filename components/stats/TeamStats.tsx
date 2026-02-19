"use client";

import { 
  TrendingUp,
  TrendingDown, 
  Award, 
  Activity, 
  Percent, 
  Clock, 
  Shield,
  Goal,
  ArrowRight,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { StatCard } from './StatCard';
import type { TeamSeasonStats, GameBasicInfo, TeamGameStats } from '@/hooks/useStats';

interface TeamStatsProps {
  teamSeasonStats: TeamSeasonStats;
  games: GameBasicInfo[];
  teamGameStats: TeamGameStats[];
}

export function TeamStats({ teamSeasonStats, games, teamGameStats }: TeamStatsProps) {
  // Format stats for display
  const winPercentage = Math.round((teamSeasonStats.wins / teamSeasonStats.games) * 100);
  const formattedPowerPlayPercentage = teamSeasonStats.powerPlayPercentage.toFixed(1);
  const formattedPenaltyKillPercentage = teamSeasonStats.penaltyKillPercentage.toFixed(1);
  const formattedAveragePossession = teamSeasonStats.averagePossession.toFixed(1);

  // Prepare data for bar chart (goals per game)
  const goalsPerGameData = games.map(game => {
    // Find game goals from teamSeasonStats.goalsFor and manually calculating per game
    // In a real implementation, we would have this data available
    const goalsFor = Math.floor(Math.random() * 4); // Mock data, should be replaced with real data
    const goalsAgainst = parseInt(game.score?.split('-')[1] || '0');
    
    return {
      name: game.opponentName,
      goalsFor,
      goalsAgainst,
      result: game.result
    };
  });

  // Prepare data for line chart (possession over time)
  const possessionData = games.map((game, index) => {
    const gameStats = teamGameStats.find(stat => stat.gameId === game.id);
    return {
      name: game.opponentName,
      possession: gameStats?.possession || 0,
    };
  });

  // Prepare data for pie chart (results distribution)
  const resultsData = [
    { name: 'Wins', value: teamSeasonStats.wins, color: '#4CAF50' },
    { name: 'Draws', value: teamSeasonStats.draws, color: '#FFC107' },
    { name: 'Losses', value: teamSeasonStats.losses, color: '#F44336' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Record */}
        <StatCard
          title="Record"
          value={`${teamSeasonStats.wins}-${teamSeasonStats.losses}-${teamSeasonStats.draws}`}
          subtitle={`${winPercentage}% Win Rate`}
          icon={<Award className="h-6 w-6" />}
          color="blue"
        />
        
        {/* Goals For/Against */}
        <StatCard
          title="Goals"
          value={`${teamSeasonStats.goalsFor}-${teamSeasonStats.goalsAgainst}`}
          subtitle={`${teamSeasonStats.goalDifferential > 0 ? '+' : ''}${teamSeasonStats.goalDifferential} Differential`}
          icon={<Goal className="h-6 w-6" />}
          color="green"
        />
        
        {/* Power Play */}
        <StatCard
          title="Power Play"
          value={`${formattedPowerPlayPercentage}%`}
          subtitle={`${teamSeasonStats.powerPlayGoals}/${teamSeasonStats.powerPlayOpportunities}`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
        
        {/* Penalty Kill */}
        <StatCard
          title="Penalty Kill"
          value={`${formattedPenaltyKillPercentage}%`}
          subtitle={`${teamSeasonStats.penaltyKillSuccess}/${teamSeasonStats.penaltyKillOpportunities}`}
          icon={<Shield className="h-6 w-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals per game chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Goals Per Game
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={goalsPerGameData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="goalsFor" fill="#4CAF50" name="Goals For" />
              <Bar dataKey="goalsAgainst" fill="#F44336" name="Goals Against" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Possession over time chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Possession Percentage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={possessionData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="possession"
                stroke="#2196F3"
                name="Possession %"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="averagePossession"
                stroke="#9C27B0"
                name="Average"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results distribution pie chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Results Distribution
          </h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {resultsData.map((entry, index) => (
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
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            {resultsData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team stats summary */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Key Team Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Average Possession</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${teamSeasonStats.averagePossession}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">{formattedAveragePossession}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Power Play Efficiency</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${teamSeasonStats.powerPlayPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">{formattedPowerPlayPercentage}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Penalty Kill Success</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{ width: `${teamSeasonStats.penaltyKillPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">{formattedPenaltyKillPercentage}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Win Percentage</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${winPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">{winPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
