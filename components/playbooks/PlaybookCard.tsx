"use client";

import { useState } from 'react';
import { Playbook } from '@/hooks/usePlaybooks';
import { Book, Clock, Layers, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PlaybookCardProps {
  playbook: Playbook;
  onView: (playbookId: string) => void;
  onEdit: (playbookId: string) => void;
}

export const PlaybookCard = ({ playbook, onView, onEdit }: PlaybookCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [editBtnHover, setEditBtnHover] = useState(false);

  const totalPlays = playbook.plays.length;
  const categories = Array.from(new Set(playbook.plays.map(play => play.category)));
  const lastUpdated = formatDistanceToNow(new Date(playbook.updatedAt), { addSuffix: true });

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(playbook.id)}
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
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(138, 43, 226, 0.4) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Book style={{ height: '22px', width: '22px', color: '#c4b5fd' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '1rem', 
            fontWeight: '600', 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {playbook.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Clock style={{ height: '12px', width: '12px', color: '#6b7280' }} />
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Updated {lastUpdated}</span>
          </div>
        </div>
      </div>

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
        {playbook.description || 'No description provided'}
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers style={{ height: '14px', width: '14px', color: '#3b82f6' }} />
          <span style={{ color: '#d1d5db', fontSize: '0.8rem', fontWeight: '500' }}>
            {totalPlays} {totalPlays === 1 ? 'play' : 'plays'}
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {categories.slice(0, 3).map((category) => (
            <span key={category} style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '0.7rem',
              fontWeight: '500',
            }}>
              {category.replace(/_/g, ' ')}
            </span>
          ))}
          {categories.length > 3 && (
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(138, 43, 226, 0.15)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: '#c4b5fd',
              fontSize: '0.7rem',
              fontWeight: '500',
            }}>
              +{categories.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(playbook.id);
          }}
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
