"use client";

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Plus, 
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface PlayFrame {
  id: string;
  frameNumber: number;
  duration: number;
  positions: any[];
  lines: any[];
  annotations: any[];
  ballPosition: any | null;
}

interface AnimationTimelineProps {
  frames: PlayFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onFrameSelect: (index: number) => void;
  onAddFrame: () => void;
  onDeleteFrame: (index: number) => void;
  onDuplicateFrame: (index: number) => void;
  onFrameDurationChange: (index: number, duration: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
  canEdit: boolean;
}

export const AnimationTimeline = ({
  frames,
  currentFrameIndex,
  isPlaying,
  playbackSpeed,
  onFrameSelect,
  onAddFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onFrameDurationChange,
  onPlay,
  onPause,
  onSpeedChange,
  canEdit,
}: AnimationTimelineProps) => {
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Calculate total duration
  const totalDuration = frames.reduce((sum, frame) => sum + (frame?.duration || 1), 0);
  
  // Calculate current time position
  const currentTime = frames
    .slice(0, currentFrameIndex)
    .reduce((sum, frame) => sum + (frame?.duration || 1), 0);

  const buttonStyle = (id: string, active = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: active 
      ? 'rgba(168, 85, 247, 0.4)'
      : hoveredButton === id 
        ? 'rgba(168, 85, 247, 0.2)' 
        : 'transparent',
    color: active ? '#c4b5fd' : '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  const frameStyle = (index: number): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    background: currentFrameIndex === index 
      ? 'rgba(168, 85, 247, 0.3)'
      : hoveredFrame === index 
        ? 'rgba(168, 85, 247, 0.15)' 
        : 'rgba(255, 255, 255, 0.05)',
    border: currentFrameIndex === index 
      ? '2px solid rgba(168, 85, 247, 0.6)'
      : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minWidth: '80px',
    position: 'relative',
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
      borderTop: '1px solid rgba(138, 43, 226, 0.3)',
      padding: '12px 16px',
    }}>
      {/* Playback controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {/* Transport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            style={buttonStyle('prev')}
            onMouseEnter={() => setHoveredButton('prev')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => onFrameSelect(Math.max(0, currentFrameIndex - 1))}
            disabled={currentFrameIndex === 0}
          >
            <SkipBack size={18} />
          </button>
          
          <button
            style={{
              ...buttonStyle('play'),
              width: '44px',
              height: '44px',
              background: isPlaying 
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(168, 85, 247, 0.3)',
              border: `2px solid ${isPlaying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
            }}
            onMouseEnter={() => setHoveredButton('play')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          
          <button
            style={buttonStyle('next')}
            onMouseEnter={() => setHoveredButton('next')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => onFrameSelect(Math.min(frames.length - 1, currentFrameIndex + 1))}
            disabled={currentFrameIndex === frames.length - 1}
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        {/* Time display */}
        <div style={{
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#c4b5fd',
        }}>
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </div>
        
        {/* Speed control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '16px',
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Speed:</span>
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: playbackSpeed === speed 
                  ? 'rgba(168, 85, 247, 0.4)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: playbackSpeed === speed ? '#c4b5fd' : '#9ca3af',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => onSpeedChange(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
        
        {/* Frame info */}
        <div style={{
          marginLeft: 'auto',
          fontSize: '13px',
          color: '#9ca3af',
        }}>
          Frame {currentFrameIndex + 1} of {frames.length}
        </div>
      </div>
      
      {/* Timeline scrubber */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <div style={{
          flex: 1,
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          position: 'relative',
          cursor: 'pointer',
        }}>
          {/* Progress bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${(currentTime / totalDuration) * 100}%`,
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 0.8))',
            borderRadius: '3px',
            transition: isPlaying ? 'none' : 'width 0.15s ease',
          }} />
          
          {/* Frame markers */}
          {frames.map((frame, index) => {
            const frameStart = frames
              .slice(0, index)
              .reduce((sum, f) => sum + (f?.duration || 1), 0);
            const position = (frameStart / totalDuration) * 100;
            
            return (
              <div
                key={frame.id}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: `${position}%`,
                  width: '2px',
                  height: '10px',
                  background: currentFrameIndex === index 
                    ? '#c4b5fd' 
                    : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '1px',
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Frame thumbnails */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            style={frameStyle(index)}
            onMouseEnter={() => setHoveredFrame(index)}
            onMouseLeave={() => setHoveredFrame(null)}
            onClick={() => onFrameSelect(index)}
          >
            {/* Frame number */}
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: currentFrameIndex === index ? '#c4b5fd' : '#9ca3af',
              marginBottom: '4px',
            }}>
              Frame {index + 1}
            </div>
            
            {/* Mini preview (placeholder) */}
            <div style={{
              width: '60px',
              height: '36px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#6b7280',
              marginBottom: '4px',
            }}>
              {frame.positions.length} players
            </div>
            
            {/* Duration */}
            <div style={{
              fontSize: '10px',
              color: '#6b7280',
            }}>
              {(frame?.duration || 1).toFixed(1)}s
            </div>
            
            {/* Frame actions */}
            {canEdit && hoveredFrame === index && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                display: 'flex',
                gap: '2px',
              }}>
                <button
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'rgba(168, 85, 247, 0.8)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateFrame(index);
                  }}
                  title="Duplicate frame"
                >
                  <Copy size={12} />
                </button>
                {frames.length > 1 && (
                  <button
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.8)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFrame(index);
                    }}
                    title="Delete frame"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Add frame button */}
        {canEdit && (
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              borderRadius: '8px',
              background: hoveredButton === 'addFrame' 
                ? 'rgba(168, 85, 247, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: '2px dashed rgba(168, 85, 247, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              minWidth: '80px',
              color: '#9ca3af',
            }}
            onMouseEnter={() => setHoveredButton('addFrame')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={onAddFrame}
          >
            <Plus size={20} style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '11px' }}>Add Frame</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimationTimeline;
