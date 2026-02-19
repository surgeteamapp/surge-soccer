"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Clock, Calendar, Users, Eye, Video, Lock } from "lucide-react";
import { formatTime, formatRelativeTime } from "@/lib/utils";
import type { Video as VideoType } from "@/hooks/useVideos";

interface VideoCardProps {
  video: VideoType;
  onClick?: (videoId: string) => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(video.id);
    }
  };

  const duration = video.duration ? formatTime(video.duration) : "Unknown";
  
  // Get thumbnail - use YouTube thumbnail if youtubeId exists
  const getThumbnailUrl = () => {
    if (imageError) return null;
    if (video.thumbnail && !video.thumbnail.includes('placeholder')) {
      return video.thumbnail;
    }
    if (video.youtubeId) {
      return `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12) 0%, rgba(75, 0, 130, 0.08) 100%)',
        border: `1px solid ${isHovered ? 'rgba(168, 85, 247, 0.5)' : 'rgba(138, 43, 226, 0.25)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 12px 30px rgba(138, 43, 226, 0.35)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'rgba(138, 43, 226, 0.2)' }}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(75, 0, 130, 0.4) 100%)',
          }}>
            <Video style={{ height: '48px', width: '48px', color: '#a855f7', opacity: 0.6 }} />
          </div>
        )}
        
        {/* Play overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Play style={{ height: '28px', width: '28px', color: '#fff', marginLeft: '3px' }} fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: '500',
        }}>
          {duration}
        </div>

        {/* Private badge */}
        {!video.isPublic && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(168, 85, 247, 0.9)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Lock style={{ height: '10px', width: '10px' }} />
            Private
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          color: '#fff',
          fontSize: '0.95rem',
          fontWeight: '600',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
        }}>
          {video.title}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <Calendar style={{ height: '12px', width: '12px', color: '#6b7280' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{formatRelativeTime(video.createdAt)}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye style={{ height: '12px', width: '12px', color: '#6b7280' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{video.viewCount} views</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users style={{ height: '12px', width: '12px', color: '#6b7280' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{video.assignments.length} assigned</span>
          </div>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {video.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: 'rgba(138, 43, 226, 0.15)',
                  border: '1px solid rgba(138, 43, 226, 0.25)',
                  color: '#c4b5fd',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                }}
              >
                {tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span style={{
                padding: '3px 8px',
                borderRadius: '5px',
                background: 'rgba(107, 114, 128, 0.15)',
                color: '#9ca3af',
                fontSize: '0.7rem',
                fontWeight: '500',
              }}>
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
