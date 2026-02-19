"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  BookmarkPlus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PlayCanvas, FrameData } from './canvas/PlayCanvas';
import { PlayFrame } from './AnimationTimeline';

interface PlayViewerProps {
  playId: string;
  playName?: string;
  playDescription?: string;
  category?: string;
  frames: PlayFrame[];
  authorName?: string;
}

export const PlayViewer = ({ 
  playId,
  playName = 'Untitled Play',
  playDescription,
  category,
  frames,
  authorName,
}: PlayViewerProps) => {
  const router = useRouter();
  
  // Animation state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Current frame data
  const currentFrame = frames[currentFrameIndex];
  const nextFrame = frames[currentFrameIndex + 1];
  const totalDuration = frames.reduce((sum, f) => sum + f.duration, 0);
  const currentTime = frames.slice(0, currentFrameIndex).reduce((sum, f) => sum + f.duration, 0);

  // Animation loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const frameDuration = (currentFrame?.duration || 1) * 1000 / playbackSpeed;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / frameDuration, 1);
        
        setAnimationProgress(progress);
        
        if (progress >= 1) {
          if (currentFrameIndex < frames.length - 1) {
            setCurrentFrameIndex(prev => prev + 1);
            setAnimationProgress(0);
          } else {
            // End of animation
            setIsPlaying(false);
            setAnimationProgress(1);
          }
        }
        
        if (isPlaying && (progress < 1 || currentFrameIndex < frames.length - 1)) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, currentFrameIndex, currentFrame?.duration, playbackSpeed, frames.length]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Reset animation
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setAnimationProgress(0);
  };

  // Mark as viewed (would call API)
  const handleMarkViewed = async () => {
    try {
      await fetch(`/api/plays/${playId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  // Mark viewed on mount
  useEffect(() => {
    handleMarkViewed();
  }, [playId]);

  // Button style
  const buttonStyle = (id: string, active = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    background: active 
      ? 'rgba(168, 85, 247, 0.4)'
      : hoveredButton === id 
        ? 'rgba(168, 85, 247, 0.2)' 
        : 'rgba(255, 255, 255, 0.1)',
    color: active ? '#c4b5fd' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  // Card style
  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
    borderRadius: '16px',
  };

  if (!currentFrame) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
      }}>
        No frames available
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
        padding: isFullscreen ? '16px' : '24px',
      }}
    >
      {/* Header */}
      {!isFullscreen && (
        <div style={{
          ...cardStyle,
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#fff',
                margin: 0,
              }}>
                {playName}
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginTop: '4px',
              }}>
                {category && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    color: '#c4b5fd',
                    fontSize: '12px',
                  }}>
                    {category.replace(/_/g, ' ')}
                  </span>
                )}
                {authorName && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    by {authorName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={buttonStyle('bookmark')}
              onMouseEnter={() => setHoveredButton('bookmark')}
              onMouseLeave={() => setHoveredButton(null)}
              title="Bookmark"
            >
              <BookmarkPlus size={20} />
            </button>
            <button
              style={buttonStyle('fullscreen')}
              onMouseEnter={() => setHoveredButton('fullscreen')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Play description */}
      {!isFullscreen && playDescription && (
        <div style={{
          ...cardStyle,
          padding: '16px 24px',
          marginBottom: '24px',
        }}>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
            {playDescription}
          </p>
        </div>
      )}
      
      {/* Canvas */}
      <div style={{
        ...cardStyle,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <PlayCanvas
          frameData={{
            positions: currentFrame.positions || [],
            lines: currentFrame.lines || [],
            annotations: currentFrame.annotations || [],
            ballPosition: currentFrame.ballPosition || null,
          }}
          activeTool="select"
          isAnimating={isPlaying}
          animationProgress={animationProgress}
          nextFrameData={nextFrame ? {
            positions: nextFrame.positions,
            lines: nextFrame.lines,
            annotations: nextFrame.annotations,
            ballPosition: nextFrame.ballPosition,
          } : undefined}
          canEdit={false}
          showGrid={false}
          onFrameChange={() => {}}
          onSelect={() => {}}
          selectedId={null}
        />
      </div>
      
      {/* Playback controls */}
      <div style={{
        ...cardStyle,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}>
        {/* Progress bar */}
        <div style={{
          flex: 1,
          maxWidth: '400px',
          marginRight: '24px',
        }}>
          <div style={{
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            position: 'relative',
            cursor: 'pointer',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${((currentTime + (currentFrame?.duration || 0) * animationProgress) / totalDuration) * 100}%`,
              background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 0.8))',
              borderRadius: '3px',
              transition: isPlaying ? 'none' : 'width 0.15s ease',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
            <span>{(currentTime + (currentFrame?.duration || 0) * animationProgress).toFixed(1)}s</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>
        </div>
        
        {/* Transport controls */}
        <button
          style={buttonStyle('reset')}
          onMouseEnter={() => setHoveredButton('reset')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          style={buttonStyle('prev')}
          onMouseEnter={() => setHoveredButton('prev')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => {
            setIsPlaying(false);
            setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
            setAnimationProgress(0);
          }}
          disabled={currentFrameIndex === 0}
        >
          <SkipBack size={20} />
        </button>
        
        <button
          style={{
            ...buttonStyle('play', isPlaying),
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            background: isPlaying 
              ? 'rgba(239, 68, 68, 0.4)'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)',
          }}
          onMouseEnter={() => setHoveredButton('play')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => {
            if (currentFrameIndex === frames.length - 1 && !isPlaying) {
              handleReset();
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        
        <button
          style={buttonStyle('next')}
          onMouseEnter={() => setHoveredButton('next')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => {
            setIsPlaying(false);
            setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1));
            setAnimationProgress(0);
          }}
          disabled={currentFrameIndex === frames.length - 1}
        >
          <SkipForward size={20} />
        </button>
        
        {/* Speed control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '24px',
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Speed:</span>
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: playbackSpeed === speed 
                  ? 'rgba(168, 85, 247, 0.4)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: playbackSpeed === speed ? '#c4b5fd' : '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setPlaybackSpeed(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
        
        {/* Frame indicator */}
        <div style={{
          marginLeft: '24px',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#c4b5fd',
          fontFamily: 'monospace',
        }}>
          Frame {currentFrameIndex + 1} / {frames.length}
        </div>
      </div>
    </div>
  );
};

export default PlayViewer;
