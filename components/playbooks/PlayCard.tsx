"use client";

import { useState } from 'react';
import { Play } from '@/hooks/usePlaybooks';
import { Clock, Edit, Eye, User, Target, GitBranch, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PlayCardProps {
  play: Play;
  onView: (playId: string) => void;
  onEdit: (playId: string) => void;
}

export const PlayCard = ({ play, onView, onEdit }: PlayCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewBtnHover, setViewBtnHover] = useState(false);
  const [editBtnHover, setEditBtnHover] = useState(false);

  const createdAt = formatDistanceToNow(new Date(play.createdAt), { addSuffix: true });
  const updatedAt = formatDistanceToNow(new Date(play.updatedAt), { addSuffix: true });

  const getStatusStyle = () => {
    if (play.isPublished) {
      return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
    }
    return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Offense': '#3b82f6',
      'Defense': '#ef4444',
      'Set Pieces': '#22c55e',
      'Transitions': '#f59e0b',
      'Power Plays': '#a855f7',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12) 0%, rgba(75, 0, 130, 0.08) 100%)',
        border: `1px solid ${isHovered ? 'rgba(168, 85, 247, 0.5)' : 'rgba(138, 43, 226, 0.25)'}`,
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 8px 25px rgba(138, 43, 226, 0.3)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '600',
          ...getStatusStyle(),
        }}>
          {play.isPublished ? 'Published' : 'Draft'}
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '600',
          background: `${getCategoryColor(play.category)}20`,
          color: getCategoryColor(play.category),
          border: `1px solid ${getCategoryColor(play.category)}40`,
        }}>
          {play.category}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ 
        color: '#fff', 
        fontSize: '1rem', 
        fontWeight: '600', 
        margin: '0 0 6px 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {play.name}
      </h3>

      {/* Description */}
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
        {play.description || 'No description provided'}
      </p>

      {/* Meta Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{play.authorName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
            {play.versions.length} {play.versions.length === 1 ? 'version' : 'versions'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Created {createdAt}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Updated {updatedAt}</span>
        </div>
      </div>

      {/* Tags */}
      {play.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {play.tags.slice(0, 4).map((tag) => (
            <span key={tag} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: 'rgba(138, 43, 226, 0.12)',
              border: '1px solid rgba(138, 43, 226, 0.25)',
              color: '#c4b5fd',
              fontSize: '0.65rem',
              fontWeight: '500',
            }}>
              <Tag style={{ height: '8px', width: '8px' }} />
              {tag}
            </span>
          ))}
          {play.tags.length > 4 && (
            <span style={{
              padding: '3px 8px',
              borderRadius: '5px',
              background: 'rgba(107, 114, 128, 0.15)',
              border: '1px solid rgba(107, 114, 128, 0.25)',
              color: '#9ca3af',
              fontSize: '0.65rem',
              fontWeight: '500',
            }}>
              +{play.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button
          onClick={() => onView(play.id)}
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
          View
        </button>
        <button
          onClick={() => onEdit(play.id)}
          onMouseEnter={() => setEditBtnHover(true)}
          onMouseLeave={() => setEditBtnHover(false)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '10px',
            background: editBtnHover
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
          <Edit style={{ height: '14px', width: '14px' }} />
          Edit
        </button>
      </div>
    </div>
  );
};
