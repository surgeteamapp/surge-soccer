"use client";

import { useState } from 'react';
import { TrainingTask } from '@/hooks/useTraining';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Video, 
  Target,
  Eye, 
  User,
  Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface TaskCardProps {
  task: TrainingTask;
  onView: (taskId: string) => void;
  onUpdateProgress: (taskId: string, progress: number) => Promise<void>;
}

export const TaskCard = ({ task, onView, onUpdateProgress }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(task.completionPercentage);
  const [viewBtnHover, setViewBtnHover] = useState(false);
  
  const assignedDate = format(new Date(task.assignedDate), 'MMM d');
  const dueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date';
  const lastUpdated = formatDistanceToNow(new Date(task.lastUpdated), { addSuffix: true });
  
  const getStatusStyle = () => {
    switch (task.status) {
      case 'pending':
        return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'in_progress':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'completed':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case 'overdue':
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };
  
  const getDifficultyStyle = () => {
    switch (task.difficulty) {
      case 'beginner':
        return { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case 'intermediate':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'advanced':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  const getProgressColor = () => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };
  
  const handleProgressUpdate = async () => {
    try {
      setUpdating(true);
      await onUpdateProgress(task.id, progress);
    } finally {
      setUpdating(false);
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Status and Difficulty */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'capitalize',
          ...getStatusStyle(),
        }}>
          {task.status.replace('_', ' ')}
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'capitalize',
          ...getDifficultyStyle(),
        }}>
          {task.difficulty}
        </span>
      </div>

      {/* Title and Description */}
      <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 6px 0' }}>
        {task.title}
      </h3>
      <p style={{ 
        color: '#9ca3af', 
        fontSize: '0.8rem', 
        margin: '0 0 14px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.4',
      }}>
        {task.description}
      </p>

      {/* Meta Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{task.assignedByName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{task.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Assigned: {assignedDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar style={{ height: '12px', width: '12px', color: task.status === 'overdue' ? '#f87171' : '#6b7280' }} />
          <span style={{ color: task.status === 'overdue' ? '#f87171' : '#9ca3af', fontSize: '0.7rem' }}>Due: {dueDate}</span>
        </div>
      </div>

      {/* Resources */}
      {(task.playId || task.videoUrl) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {task.playId && (
            <Link href={`/plays/${task.playId}`} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c4b5fd',
                fontSize: '0.7rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}>
                <BookOpen style={{ height: '10px', width: '10px' }} />
                {task.playName}
              </span>
            </Link>
          )}
          {task.videoUrl && (
            <Link href={task.videoUrl} target="_blank" style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '0.7rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}>
                <Video style={{ height: '10px', width: '10px' }} />
                Video
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Progress</span>
          <span style={{ color: getProgressColor(), fontSize: '0.85rem', fontWeight: '700' }}>{progress}%</span>
        </div>
        <div style={{
          height: '6px',
          borderRadius: '3px',
          background: 'rgba(138, 43, 226, 0.2)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${getProgressColor()}80, ${getProgressColor()})`,
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Progress Slider */}
      {task.status !== 'completed' && task.status !== 'overdue' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            disabled={updating}
            style={{
              flex: 1,
              height: '4px',
              cursor: 'pointer',
              accentColor: '#a855f7',
            }}
          />
          <button
            onClick={handleProgressUpdate}
            disabled={progress === task.completionPercentage || updating}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: progress === task.completionPercentage || updating
                ? 'rgba(138, 43, 226, 0.1)'
                : 'rgba(168, 85, 247, 0.3)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: progress === task.completionPercentage || updating ? '#6b7280' : '#c4b5fd',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: progress === task.completionPercentage || updating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {updating && <Loader2 className="animate-spin" style={{ height: '12px', width: '12px' }} />}
            {updating ? 'Saving' : 'Update'}
          </button>
        </div>
      )}

      {/* Last Updated */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <Clock style={{ height: '12px', width: '12px', color: '#6b7280' }} />
        <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>Updated {lastUpdated}</span>
      </div>

      {/* View Button */}
      <button
        onClick={() => onView(task.id)}
        onMouseEnter={() => setViewBtnHover(true)}
        onMouseLeave={() => setViewBtnHover(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '10px',
          background: viewBtnHover
            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: 'auto',
        }}
      >
        <Eye style={{ height: '16px', width: '16px' }} />
        View Details
      </button>
    </div>
  );
};
