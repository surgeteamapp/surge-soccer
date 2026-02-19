"use client";

import { useState } from 'react';
import { PlayerProgress } from '@/hooks/useTraining';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Activity,
  Plus, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PlayerProgressCardProps {
  player: PlayerProgress;
  onView: (userId: string) => void;
  onAssignTask: (userId: string) => void;
}

export const PlayerProgressCard = ({ player, onView, onAssignTask }: PlayerProgressCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewBtnHover, setViewBtnHover] = useState(false);
  const [assignBtnHover, setAssignBtnHover] = useState(false);

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getActivityBadgeStyle = (type: string) => {
    switch (type) {
      case 'started':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'progress':
        return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'completed':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isHovered ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered 
          ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(138, 43, 226, 0.2)' 
          : '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.4) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User style={{ height: '22px', width: '22px', color: '#60a5fa' }} />
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
              {player.userName}
              {player.playerNumber && (
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(138, 43, 226, 0.2)',
                  color: '#c4b5fd',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  #{player.playerNumber}
                </span>
              )}
            </h3>
            {player.position && (
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{player.position}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Overall Progress</span>
          <span style={{ color: getProgressColor(player.overallProgress), fontSize: '0.9rem', fontWeight: '700' }}>
            {player.overallProgress}%
          </span>
        </div>
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(138, 43, 226, 0.2)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${player.overallProgress}%`,
            background: `linear-gradient(90deg, ${getProgressColor(player.overallProgress)}80, ${getProgressColor(player.overallProgress)})`,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Task Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '10px',
          padding: '10px',
          textAlign: 'center',
        }}>
          <CheckCircle style={{ height: '16px', width: '16px', color: '#4ade80', margin: '0 auto 4px' }} />
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{player.tasks.completed}</p>
          <p style={{ color: '#6b7280', fontSize: '0.65rem', margin: 0 }}>Completed</p>
        </div>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '10px',
          padding: '10px',
          textAlign: 'center',
        }}>
          <Clock style={{ height: '16px', width: '16px', color: '#60a5fa', margin: '0 auto 4px' }} />
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            {player.tasks.total - player.tasks.completed - player.tasks.overdue}
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.65rem', margin: 0 }}>In Progress</p>
        </div>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '10px',
          textAlign: 'center',
        }}>
          <AlertTriangle style={{ height: '16px', width: '16px', color: '#f87171', margin: '0 auto 4px' }} />
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{player.tasks.overdue}</p>
          <p style={{ color: '#6b7280', fontSize: '0.65rem', margin: 0 }}>Overdue</p>
        </div>
      </div>

      {/* Recent Activity */}
      {player.recentActivity.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity style={{ height: '12px', width: '12px' }} />
            RECENT ACTIVITY
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {player.recentActivity.slice(0, 2).map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                background: 'rgba(138, 43, 226, 0.08)',
                borderRadius: '8px',
              }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  ...getActivityBadgeStyle(activity.type),
                }}>
                  {activity.type}
                </span>
                <span style={{ color: '#d1d5db', fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activity.taskTitle}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h4 style={{ color: '#4ade80', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUp style={{ height: '10px', width: '10px' }} />
            STRENGTHS
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {player.strengths.slice(0, 3).map((strength, index) => (
              <span key={index} style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '0.65rem',
                fontWeight: '500',
              }}>
                {strength}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ color: '#f87171', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDown style={{ height: '10px', width: '10px' }} />
            TO IMPROVE
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {player.areasToImprove.slice(0, 3).map((area, index) => (
              <span key={index} style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.65rem',
                fontWeight: '500',
              }}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onView(player.userId)}
          onMouseEnter={() => setViewBtnHover(true)}
          onMouseLeave={() => setViewBtnHover(false)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '10px',
            background: viewBtnHover ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            color: '#c4b5fd',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Eye style={{ height: '14px', width: '14px' }} />
          View Details
        </button>
        <button
          onClick={() => onAssignTask(player.userId)}
          onMouseEnter={() => setAssignBtnHover(true)}
          onMouseLeave={() => setAssignBtnHover(false)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '10px',
            background: assignBtnHover
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Plus style={{ height: '14px', width: '14px' }} />
          Assign Task
        </button>
      </div>
    </div>
  );
};
