"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Pin, 
  Trash2, 
  Clock, 
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  MoreVertical,
  ThumbsUp,
  Heart,
  PartyPopper,
  Trophy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Announcement } from "@/hooks/useAnnouncements";

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onAddReaction?: (id: string, emoji: string) => void;
  onRemoveReaction?: (id: string) => void;
  canManage?: boolean;
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '🏆', '💪', '👏'];

export function AnnouncementCard({
  announcement,
  onDelete,
  onTogglePin,
  onMarkAsRead,
  onAddReaction,
  onRemoveReaction,
  canManage = false,
}: AnnouncementCardProps) {
  const { data: session } = useSession();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isUnread = session?.user && !announcement.readBy.includes(session.user.id);
  const userReaction = announcement.reactions.find(r => r.userId === session?.user?.id);

  // Get priority styles
  const getPriorityStyles = () => {
    switch (announcement.priority) {
      case 'URGENT':
        return {
          border: '1px solid rgba(239, 68, 68, 0.5)',
          icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          glow: '0 0 20px rgba(239, 68, 68, 0.2)',
        };
      case 'HIGH':
        return {
          border: '1px solid rgba(251, 191, 36, 0.5)',
          icon: <AlertCircle className="h-4 w-4 text-yellow-400" />,
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          glow: '0 0 15px rgba(251, 191, 36, 0.15)',
        };
      case 'NORMAL':
        return {
          border: '1px solid rgba(138, 43, 226, 0.3)',
          icon: <Bell className="h-4 w-4 text-purple-400" />,
          badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          glow: 'none',
        };
      case 'LOW':
        return {
          border: '1px solid rgba(107, 114, 128, 0.3)',
          icon: <Info className="h-4 w-4 text-gray-400" />,
          badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          glow: 'none',
        };
    }
  };

  const priorityStyles = getPriorityStyles();

  // Handle card click to mark as read
  const handleCardClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(announcement.id);
    }
    setIsExpanded(!isExpanded);
  };

  // Handle reaction click
  const handleReactionClick = (emoji: string) => {
    if (userReaction?.emoji === emoji) {
      onRemoveReaction?.(announcement.id);
    } else {
      onAddReaction?.(announcement.id, emoji);
    }
    setShowReactions(false);
  };

  // Group reactions by emoji
  const groupedReactions = announcement.reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format the timestamp
  const timeAgo = formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true });

  // Truncate content for preview
  const shouldTruncate = announcement.content.length > 200 && !isExpanded;
  const displayContent = shouldTruncate 
    ? announcement.content.substring(0, 200) + '...' 
    : announcement.content;

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: isUnread 
          ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(10, 0, 20, 0.6) 0%, rgba(26, 10, 46, 0.4) 100%)',
        border: priorityStyles.border,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: priorityStyles.glow,
        position: 'relative',
      }}
      className="hover:bg-purple-500/5"
    >
      {/* Unread indicator */}
      {isUnread && (
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#a855f7',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        {/* Priority icon */}
        <div style={{
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(138, 43, 226, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {priorityStyles.icon}
        </div>

        {/* Title and meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ 
              color: '#fff', 
              fontSize: '1rem', 
              fontWeight: '600',
              margin: 0,
            }}>
              {announcement.title}
            </h3>
            
            {announcement.isPinned && (
              <Pin className="h-3 w-3 text-amber-400" />
            )}
            
            <span 
              className={`rounded-full border ${priorityStyles.badge}`}
              style={{ fontSize: '0.65rem', padding: '2px 6px', fontWeight: '600', letterSpacing: '0.02em' }}
            >
              {announcement.priority}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '4px',
            color: '#9ca3af',
            fontSize: '0.8rem',
          }}>
            <span>{announcement.author.name}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Options menu */}
        {canManage && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              style={{
                background: 'rgba(138, 43, 226, 0.2)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: '#9ca3af',
              }}
              className="hover:bg-purple-500/30"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showOptions && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                  border: '1px solid rgba(138, 43, 226, 0.4)',
                  borderRadius: '8px',
                  padding: '4px',
                  zIndex: 50,
                  minWidth: '120px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                <button
                  onClick={() => {
                    onTogglePin?.(announcement.id);
                    setShowOptions(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: announcement.isPinned ? '#fbbf24' : '#d1d5db',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  className="hover:bg-purple-500/20"
                >
                  <Pin className="h-4 w-4" />
                  {announcement.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => {
                    onDelete?.(announcement.id);
                    setShowOptions(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  className="hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ 
        color: '#d1d5db', 
        fontSize: '0.9rem', 
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
      }}>
        {displayContent}
        {shouldTruncate && (
          <span style={{ color: '#a855f7', marginLeft: '4px' }}>Read more</span>
        )}
      </div>

      {/* Footer with reactions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(138, 43, 226, 0.2)',
      }}>
        {/* Existing reactions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                handleReactionClick(emoji);
              }}
              className="hover:scale-110 active:scale-95 transition-transform"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                background: userReaction?.emoji === emoji 
                  ? 'rgba(138, 43, 226, 0.3)' 
                  : 'rgba(138, 43, 226, 0.1)',
                border: userReaction?.emoji === emoji 
                  ? '1px solid rgba(168, 85, 247, 0.5)' 
                  : '1px solid transparent',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <span>{emoji}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Add reaction button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: '#9ca3af',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="hover:bg-purple-500/20"
          >
            <span>😀</span>
            <span>React</span>
          </button>

          {showReactions && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '4px',
                background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                border: '1px solid rgba(138, 43, 226, 0.4)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                gap: '4px',
                zIndex: 50,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: userReaction?.emoji === emoji 
                      ? 'rgba(138, 43, 226, 0.3)' 
                      : 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                  }}
                  className="hover:bg-purple-500/30"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
