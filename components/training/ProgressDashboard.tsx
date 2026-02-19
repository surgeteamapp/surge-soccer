"use client";

import { useState } from 'react';
import { useTraining } from '@/hooks/useTraining';
import { PlayerProgressCard } from './PlayerProgressCard';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Search, TrendingUp, Target, 
  CheckCircle, AlertTriangle, Users, ChevronDown, Award, Flame, Clock
} from 'lucide-react';

interface ProgressDashboardProps {
  cardStyle?: React.CSSProperties;
}

export const ProgressDashboard = ({ cardStyle }: ProgressDashboardProps) => {
  // Default card style if not provided
  const defaultCardStyle: React.CSSProperties = cardStyle || {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px"
  };
  const router = useRouter();
  const { playerProgress, isLoading } = useTraining();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('progress-desc');
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  
  // Handle view player
  const handleViewPlayer = (userId: string) => {
    router.push(`/training/players/${userId}`);
  };
  
  // Handle assign task
  const handleAssignTask = (userId: string) => {
    router.push(`/training/tasks/assign?userId=${userId}`);
  };
  
  
  // Filter and sort players
  const getFilteredPlayers = () => {
    let filtered = [...playerProgress];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(player =>
        player.userName.toLowerCase().includes(query) ||
        player.position?.toLowerCase().includes(query)
      );
    }
    
    switch (sortOption) {
      case 'progress-desc':
        return filtered.sort((a, b) => b.overallProgress - a.overallProgress);
      case 'progress-asc':
        return filtered.sort((a, b) => a.overallProgress - b.overallProgress);
      case 'name-asc':
        return filtered.sort((a, b) => a.userName.localeCompare(b.userName));
      case 'name-desc':
        return filtered.sort((a, b) => b.userName.localeCompare(a.userName));
      case 'completed-desc':
        return filtered.sort((a, b) => b.tasks.completed - a.tasks.completed);
      case 'overdue-desc':
        return filtered.sort((a, b) => b.tasks.overdue - a.tasks.overdue);
      default:
        return filtered;
    }
  };
  
  const filteredPlayers = getFilteredPlayers();
  
  // Calculate stats
  const averageProgress = playerProgress.length 
    ? Math.round(playerProgress.reduce((sum, player) => sum + player.overallProgress, 0) / playerProgress.length)
    : 0;
  const totalTasks = playerProgress.reduce((sum, player) => sum + player.tasks.total, 0);
  const completedTasks = playerProgress.reduce((sum, player) => sum + player.tasks.completed, 0);
  const overdueTasks = playerProgress.reduce((sum, player) => sum + player.tasks.overdue, 0);
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Enhanced analytics
  const topPerformers = [...playerProgress]
    .sort((a, b) => b.overallProgress - a.overallProgress)
    .slice(0, 3);
  
  const needsAttention = [...playerProgress]
    .filter(p => p.tasks.overdue > 0 || p.overallProgress < 30)
    .sort((a, b) => b.tasks.overdue - a.tasks.overdue)
    .slice(0, 3);
  
  const inProgressTasks = playerProgress.reduce((sum, player) => 
    sum + (player.tasks.total - player.tasks.completed - player.tasks.overdue), 0);

  const statCards = [
    { label: "Team Average", value: `${averageProgress}%`, icon: TrendingUp, color: "#3b82f6" },
    { label: "Total Tasks", value: totalTasks, icon: Target, color: "#a855f7" },
    { label: "Completion Rate", value: `${completionRate}%`, subtext: `${completedTasks} completed`, icon: CheckCircle, color: "#22c55e" },
    { label: "Overdue", value: overdueTasks, icon: AlertTriangle, color: "#ef4444" },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 0' }}>
        <Loader2 className="animate-spin" style={{ height: '48px', width: '48px', color: '#a855f7' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users style={{ height: '24px', width: '24px', color: '#a855f7' }} />
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Team Progress</h2>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '8px', 
            background: 'rgba(168, 85, 247, 0.2)', 
            color: '#c4b5fd', 
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {playerProgress.length} Players
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              ...defaultCardStyle,
              padding: '16px',
              border: hoveredStat === stat.label 
                ? '1px solid rgba(168, 85, 247, 0.5)' 
                : '1px solid rgba(138, 43, 226, 0.3)',
              transition: 'all 0.3s ease',
              transform: hoveredStat === stat.label ? 'translateY(-3px)' : 'none',
              boxShadow: hoveredStat === stat.label 
                ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(138, 43, 226, 0.2)' 
                : defaultCardStyle.boxShadow,
              textAlign: 'center',
            }}
          >
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: `linear-gradient(135deg, ${stat.color}30 0%, ${stat.color}15 100%)`,
              border: `1px solid ${stat.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <stat.icon style={{ height: '20px', width: '20px', color: stat.color }} />
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>{stat.label}</p>
            <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 0 0', textShadow: `0 0 20px ${stat.color}40` }}>{stat.value}</p>
            {stat.subtext && <p style={{ color: '#6b7280', fontSize: '0.7rem', margin: '2px 0 0 0' }}>{stat.subtext}</p>}
          </div>
        ))}
      </div>

      {/* Analytics Insights Row */}
      {playerProgress.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Top Performers */}
          <div style={{
            ...defaultCardStyle,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Award style={{ height: '18px', width: '18px', color: '#fbbf24' }} />
              <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>Top Performers</h3>
            </div>
            {topPerformers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topPerformers.map((player, idx) => (
                  <div
                    key={player.userId}
                    onClick={() => handleViewPlayer(player.userId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: idx === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(10, 0, 20, 0.5)',
                      border: idx === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(138, 43, 226, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #cd7f32, #a0522d)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, color: '#fff', fontSize: '0.85rem', fontWeight: '500' }}>{player.userName}</span>
                    <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: '700' }}>{player.overallProgress}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>No data yet</p>
            )}
          </div>

          {/* Needs Attention */}
          <div style={{
            ...defaultCardStyle,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Flame style={{ height: '18px', width: '18px', color: '#ef4444' }} />
              <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>Needs Attention</h3>
            </div>
            {needsAttention.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {needsAttention.map((player) => (
                  <div
                    key={player.userId}
                    onClick={() => handleViewPlayer(player.userId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ flex: 1, color: '#fff', fontSize: '0.85rem', fontWeight: '500' }}>{player.userName}</span>
                    {player.tasks.overdue > 0 && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}>
                        <AlertTriangle style={{ height: '10px', width: '10px' }} />
                        {player.tasks.overdue} overdue
                      </span>
                    )}
                    <span style={{ color: player.overallProgress < 30 ? '#f87171' : '#fbbf24', fontSize: '0.85rem', fontWeight: '600' }}>
                      {player.overallProgress}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle style={{ height: '24px', width: '24px', color: '#4ade80', margin: '0 auto 8px' }} />
                <p style={{ color: '#4ade80', fontSize: '0.85rem', margin: 0 }}>All players on track!</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{
            ...defaultCardStyle,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock style={{ height: '18px', width: '18px', color: '#60a5fa' }} />
              <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>Quick Stats</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Active Players</span>
                <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600' }}>{playerProgress.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>In Progress</span>
                <span style={{ color: '#60a5fa', fontSize: '0.95rem', fontWeight: '600' }}>{inProgressTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tasks/Player Avg</span>
                <span style={{ color: '#c4b5fd', fontSize: '0.95rem', fontWeight: '600' }}>
                  {playerProgress.length ? Math.round(totalTasks / playerProgress.length) : 0}
                </span>
              </div>
              <div style={{ height: '1px', background: 'rgba(138, 43, 226, 0.2)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Health Score</span>
                <span style={{
                  color: overdueTasks === 0 ? '#4ade80' : overdueTasks < 3 ? '#fbbf24' : '#f87171',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                }}>
                  {overdueTasks === 0 ? 'Excellent' : overdueTasks < 3 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          flex: '1 1 300px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(10, 0, 20, 0.8)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
        }}>
          <Search style={{ height: '18px', width: '18px', color: '#a855f7' }} />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
        
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(10, 0, 20, 0.8)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            color: '#c4b5fd',
            fontSize: '0.9rem',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '200px',
          }}
        >
          <option value="progress-desc">Progress (High to Low)</option>
          <option value="progress-asc">Progress (Low to High)</option>
          <option value="name-asc">Name (A to Z)</option>
          <option value="name-desc">Name (Z to A)</option>
          <option value="completed-desc">Most Completed</option>
          <option value="overdue-desc">Most Overdue</option>
        </select>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div style={{
          ...defaultCardStyle,
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Users style={{ height: '32px', width: '32px', color: '#a855f7' }} />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0' }}>
            No players found
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search.' : 'Add players in Settings to start tracking their progress.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredPlayers.map(player => (
            <PlayerProgressCard
              key={player.userId}
              player={player}
              onView={handleViewPlayer}
              onAssignTask={handleAssignTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
