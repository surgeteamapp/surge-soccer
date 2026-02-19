"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Eye,
  Share2,
  Settings,
  MousePointer2,
  Users,
  UserPlus,
  Circle,
  Pencil,
  ArrowRight,
  Square,
  Trash2,
  Grid3X3,
  Undo,
  Redo,
  LayoutTemplate,
  HelpCircle,
  X,
} from 'lucide-react';
import { PlayCanvas, ToolType, FrameData, PlayLine } from './canvas/PlayCanvas';
import { PlayerPosition } from './canvas/WheelchairPlayerMarker';
import { BallPosition } from './canvas/BallMarker';
import { AnimationTimeline, PlayFrame } from './AnimationTimeline';
import { TemplateSelector } from './TemplateSelector';
import { FormationTemplate } from '@/lib/playbook-templates';
import { PlayDesignerHelp } from './PlayDesignerHelp';
import { TagInput } from '@/components/ui/TagInput';

// Common tag suggestions for plays
const TAG_SUGGESTIONS = [
  'offensive', 'defensive', 'set piece', 'corner kick',
  'penalty', 'kickoff', 'pressing', 'zone defense', 
  'man marking', 'quick play', 'wing play',
];

interface PlayDesignerNewProps {
  playId?: string;
  playbookId?: string;
  readOnly?: boolean;
}

export const PlayDesignerNew = ({ 
  playId, 
  playbookId,
  readOnly = false 
}: PlayDesignerNewProps) => {
  const router = useRouter();
  
  // Play metadata
  const [playName, setPlayName] = useState('New Play');
  const [playDescription, setPlayDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Frames
  const [frames, setFrames] = useState<PlayFrame[]>([
    {
      id: 'frame-1',
      frameNumber: 0,
      duration: 2.0,
      positions: [],
      lines: [],
      annotations: [],
      ballPosition: null,
    }
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Tools & UI state
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  
  // Drawing customization
  const [drawColor, setDrawColor] = useState('#000000');
  
  const DRAW_COLORS = [
    { color: '#000000', name: 'Black' },
    { color: '#ffffff', name: 'White' },
    { color: '#a855f7', name: 'Purple' },
    { color: '#ef4444', name: 'Red' },
    { color: '#eab308', name: 'Yellow' },
  ];
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Ball animation state - tracks ball position across frames
  const [animatedBallPosition, setAnimatedBallPosition] = useState<{ x: number; y: number } | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<PlayFrame[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Template selector
  const [showTemplateSelector, setShowTemplateSelector] = useState(!playId); // Show on new play
  
  // Help modal
  const [showHelp, setShowHelp] = useState(false);

  // Current frame data
  const currentFrame = frames[currentFrameIndex];
  const nextFrame = frames[currentFrameIndex + 1];

  // Animation loop - use ref to track isPlaying to avoid stale closure
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  
  const framesRef = useRef(frames);
  framesRef.current = frames;
  
  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    
    // Allow single-frame animation for action previews
    if (frames.length === 0 || !currentFrame) {
      return;
    }
    
    const frameDuration = (currentFrame.duration || 1) * 1000 / playbackSpeed;
    const startTime = Date.now();
    
    
    const animate = () => {
      // Use refs to get current values, avoiding stale closure
      if (!isPlayingRef.current) {
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / frameDuration, 1);
      
      setAnimationProgress(progress);
      
      if (progress >= 1) {
        // Move to next frame
        const totalFrames = framesRef.current.length;
        
        if (totalFrames > 1) {
          setCurrentFrameIndex(prevIndex => {
            if (prevIndex < totalFrames - 1) {
              return prevIndex + 1;
            } else {
              // Loop back to start
              return 0;
            }
          });
        } else {
          // Single frame - just loop the animation
          setAnimationProgress(0);
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        setAnimationProgress(0);
        return; // Stop this animation loop, new one will start for next frame
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, currentFrameIndex, currentFrame?.duration, playbackSpeed, frames.length]);

  // Cleanup animation state when playback stops
  useEffect(() => {
    if (!isPlaying) {
      // Cancel any pending animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Reset progress to 0 when stopped
      setAnimationProgress(0);
      // Reset animated ball position
      setAnimatedBallPosition(null);
    } else {
      // When playback starts, initialize ball position from current frame
      if (currentFrame?.ballPosition) {
        setAnimatedBallPosition({ 
          x: currentFrame.ballPosition.x, 
          y: currentFrame.ballPosition.y 
        });
      }
    }
  }, [isPlaying]);
  
  // When frame changes during playback, use ball path endpoint as new start position
  useEffect(() => {
    if (isPlaying && currentFrameIndex > 0) {
      // Get the previous frame's ball path endpoint
      const prevFrame = frames[currentFrameIndex - 1];
      const prevBallPath = prevFrame?.lines.find(l => l.isBallPath && l.points.length >= 2);
      if (prevBallPath) {
        const endPoint = prevBallPath.points[prevBallPath.points.length - 1];
        setAnimatedBallPosition({ x: endPoint.x - 10, y: endPoint.y - 10 });
      }
    }
  }, [currentFrameIndex, isPlaying]);

  // Handle frame change
  const handleFrameChange = useCallback((updates: Partial<FrameData>) => {
    if (readOnly) return;
    
    setFrames(prev => {
      const newFrames = [...prev];
      newFrames[currentFrameIndex] = {
        ...newFrames[currentFrameIndex],
        ...updates,
      };
      return newFrames;
    });
    setHasUnsavedChanges(true);
  }, [currentFrameIndex, readOnly]);

  // Get ball position for new frame (uses ball path endpoint if available)
  const getBallPositionForNextFrame = useCallback((frame: PlayFrame | undefined): BallPosition | null => {
    if (!frame?.ballPosition) return null;
    
    // Check if frame has a ball path - use its endpoint
    const ballPath = frame.lines.find(l => l.isBallPath && l.points.length >= 2);
    if (ballPath) {
      const endpoint = ballPath.points[ballPath.points.length - 1];
      return {
        x: endpoint.x - 10, // Adjust for ball center offset
        y: endpoint.y - 10,
      };
    }
    
    // No ball path - copy current position
    return { ...frame.ballPosition };
  }, []);

  // Add new frame
  const handleAddFrame = useCallback(() => {
    if (readOnly) return;
    
    const lastFrame = frames[frames.length - 1];
    const newFrame: PlayFrame = {
      id: `frame-${Date.now()}`,
      frameNumber: frames.length,
      duration: 2.0,
      positions: lastFrame ? [...lastFrame.positions] : [],
      lines: [],
      annotations: [],
      ballPosition: getBallPositionForNextFrame(lastFrame),
    };
    
    setFrames(prev => [...prev, newFrame]);
    setCurrentFrameIndex(frames.length);
    setHasUnsavedChanges(true);
  }, [frames, readOnly, getBallPositionForNextFrame]);

  // Delete frame
  const handleDeleteFrame = useCallback((index: number) => {
    if (readOnly || frames.length <= 1) return;
    
    setFrames(prev => {
      const newFrames = prev.filter((_, i) => i !== index);
      return newFrames.map((f, i) => ({ ...f, frameNumber: i }));
    });
    
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(Math.max(0, frames.length - 2));
    }
    setHasUnsavedChanges(true);
  }, [currentFrameIndex, frames.length, readOnly]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: FormationTemplate) => {
    const newFrame: PlayFrame = {
      id: 'frame-1',
      frameNumber: 0,
      duration: 2.0,
      positions: template.positions.map(p => ({ ...p, id: `${p.id}-${Date.now()}` })),
      lines: [],
      annotations: [],
      ballPosition: template.ballPosition ? { ...template.ballPosition } : null,
    };
    
    setFrames([newFrame]);
    setCurrentFrameIndex(0);
    setTags([template.category.toLowerCase().replace('_', ' ')]);
    setPlayName(`New ${template.name} Play`);
    setHasUnsavedChanges(true);
  }, []);

  // Duplicate frame
  const handleDuplicateFrame = useCallback((index: number) => {
    if (readOnly) return;
    
    const frameToDuplicate = frames[index];
    const newFrame: PlayFrame = {
      ...frameToDuplicate,
      id: `frame-${Date.now()}`,
      frameNumber: index + 1,
    };
    
    setFrames(prev => {
      const newFrames = [...prev];
      newFrames.splice(index + 1, 0, newFrame);
      return newFrames.map((f, i) => ({ ...f, frameNumber: i }));
    });
    
    setCurrentFrameIndex(index + 1);
    setHasUnsavedChanges(true);
  }, [frames, readOnly]);

  // Save play
  const handleSave = async () => {
    if (readOnly) return;
    
    setIsSaving(true);
    try {
      const method = playId ? 'PUT' : 'POST';
      const url = playId ? `/api/plays/${playId}` : '/api/plays';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playName,
          description: playDescription,
          tags,
          playbookId,
          frames: frames.map(f => ({
            frameNumber: f.frameNumber,
            duration: f.duration,
            positions: f.positions,
            lines: f.lines,
            annotations: f.annotations,
            ballPosition: f.ballPosition,
          })),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save play:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Tool button style
  const toolButtonStyle = (tool: string, active = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: 'none',
    background: active 
      ? 'rgba(168, 85, 247, 0.4)'
      : hoveredTool === tool 
        ? 'rgba(168, 85, 247, 0.2)' 
        : 'transparent',
    color: active ? '#c4b5fd' : '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: '4px',
  });

  // Card style
  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
    borderRadius: '16px',
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        ...cardStyle,
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 100,
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
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div>
            <input
              type="text"
              value={playName}
              onChange={(e) => {
                setPlayName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              disabled={readOnly}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#fff',
                outline: 'none',
                width: '300px',
              }}
              placeholder="Play Name"
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginTop: '4px',
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <TagInput
                  tags={tags}
                  onChange={(newTags) => {
                    setTags(newTags);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Add tags..."
                  disabled={readOnly}
                  suggestions={TAG_SUGGESTIONS}
                  maxTags={8}
                />
              </div>
              
              {hasUnsavedChanges && (
                <span style={{ fontSize: '12px', color: '#f59e0b' }}>
                  • Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Tool tip for add tools */}
        {(activeTool === 'addPlayerTeam' || activeTool === 'addPlayerOpponent' || activeTool === 'addBall') && (
          <div style={{
            padding: '12px 18px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(234, 179, 8, 0.2) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#fbbf24',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
          }}>
            💡 Click on court to place. Switch to <strong>Select</strong> to move.
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!readOnly && (
            <>
              <button
                onClick={() => setShowHelp(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.15s ease',
                }}
                title="How to use the Play Designer"
              >
                <HelpCircle size={18} />
                Help
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: hasUnsavedChanges 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: hasUnsavedChanges ? '#fff' : '#6b7280',
                  cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  transition: 'all 0.15s ease',
                }}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Tool palette */}
        {!readOnly && (
          <>
          <div style={{
            ...cardStyle,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '68px',
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#6b7280', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Tools
            </div>
            
            <button
              style={toolButtonStyle('select', activeTool === 'select')}
              onMouseEnter={() => setHoveredTool('select')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('select')}
              title="Select"
            >
              <MousePointer2 size={20} />
            </button>
            
            <div style={{ 
              width: '100%', 
              height: '1px', 
              background: 'rgba(138, 43, 226, 0.2)',
              margin: '8px 0',
            }} />
            
            <button
              style={toolButtonStyle('addPlayerTeam', activeTool === 'addPlayerTeam')}
              onMouseEnter={() => setHoveredTool('addPlayerTeam')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('addPlayerTeam')}
              title="Add Team Player"
            >
              <Users size={20} style={{ color: activeTool === 'addPlayerTeam' ? '#a855f7' : undefined }} />
            </button>
            
            <button
              style={toolButtonStyle('addPlayerOpponent', activeTool === 'addPlayerOpponent')}
              onMouseEnter={() => setHoveredTool('addPlayerOpponent')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('addPlayerOpponent')}
              title="Add Opponent"
            >
              <UserPlus size={20} style={{ color: activeTool === 'addPlayerOpponent' ? '#ef4444' : undefined }} />
            </button>
            
            <button
              style={toolButtonStyle('addBall', activeTool === 'addBall')}
              onMouseEnter={() => setHoveredTool('addBall')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('addBall')}
              title="Add Ball"
            >
              <Circle size={20} />
            </button>
            
            <div style={{ 
              width: '100%', 
              height: '1px', 
              background: 'rgba(138, 43, 226, 0.2)',
              margin: '8px 0',
            }} />
            
            <button
              style={toolButtonStyle('freeDraw', activeTool === 'freeDraw')}
              onMouseEnter={() => setHoveredTool('freeDraw')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('freeDraw')}
              title="Free Draw"
            >
              <Pencil size={20} />
            </button>
            
            <button
              style={toolButtonStyle('arrow', activeTool === 'arrow')}
              onMouseEnter={() => setHoveredTool('arrow')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('arrow')}
              title="Draw Arrow"
            >
              <ArrowRight size={20} />
            </button>
            
            {/* Color picker for draw tools */}
            {(activeTool === 'freeDraw' || activeTool === 'arrow') && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 4px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                marginTop: '4px',
              }}>
                {DRAW_COLORS.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setDrawColor(c.color)}
                    title={c.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: drawColor === c.color 
                        ? '2px solid #2196F3' 
                        : c.color === '#ffffff' 
                          ? '1px solid rgba(255,255,255,0.5)' 
                          : '2px solid transparent',
                      background: c.color,
                      cursor: 'pointer',
                      boxShadow: drawColor === c.color ? '0 0 8px rgba(33,150,243,0.5)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}
            
            <div style={{ 
              width: '100%', 
              height: '1px', 
              background: 'rgba(138, 43, 226, 0.2)',
              margin: '8px 0',
            }} />
            
            <button
              style={toolButtonStyle('template')}
              onMouseEnter={() => setHoveredTool('template')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setShowTemplateSelector(true)}
              title="Formation Templates"
            >
              <LayoutTemplate size={20} />
            </button>
            
            <button
              style={toolButtonStyle('grid', showGrid)}
              onMouseEnter={() => setHoveredTool('grid')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <Grid3X3 size={20} />
            </button>
            
            <button
              style={toolButtonStyle('delete', activeTool === 'delete')}
              onMouseEnter={() => setHoveredTool('delete')}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setActiveTool('delete')}
              title="Delete"
            >
              <Trash2 size={20} style={{ color: activeTool === 'delete' ? '#ef4444' : undefined }} />
            </button>
            
          </div>
        </>
        )}
        
        {/* Canvas area */}
        <div style={{ flex: 1 }}>
          <div style={{
            ...cardStyle,
            padding: '24px',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <PlayCanvas
              frameData={{
                positions: currentFrame?.positions || [],
                lines: currentFrame?.lines || [],
                annotations: currentFrame?.annotations || [],
                ballPosition: currentFrame?.ballPosition || null,
              }}
              activeTool={activeTool}
              isAnimating={isPlaying}
              animationProgress={animationProgress}
              nextFrameData={nextFrame ? {
                positions: nextFrame.positions,
                lines: nextFrame.lines,
                annotations: nextFrame.annotations,
                ballPosition: nextFrame.ballPosition,
              } : undefined}
              canEdit={!readOnly}
              showGrid={showGrid}
              drawColor={drawColor}
              animatedBallPosition={animatedBallPosition}
              onFrameChange={handleFrameChange}
              onSelect={setSelectedId}
              onBallPositionUpdate={setAnimatedBallPosition}
              selectedId={selectedId}
            />
          </div>
          
          {/* Timeline */}
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <AnimationTimeline
              frames={frames}
              currentFrameIndex={currentFrameIndex}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onFrameSelect={setCurrentFrameIndex}
              onAddFrame={handleAddFrame}
              onDeleteFrame={handleDeleteFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onFrameDurationChange={(index, duration) => {
                setFrames(prev => {
                  const newFrames = [...prev];
                  newFrames[index] = { ...newFrames[index], duration };
                  return newFrames;
                });
                setHasUnsavedChanges(true);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onSpeedChange={setPlaybackSpeed}
              canEdit={!readOnly}
            />
          </div>
        </div>
        
        {/* Properties panel - always visible */}
        {!readOnly && (
          <div style={{
            ...cardStyle,
            padding: '16px',
            width: '250px',
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#c4b5fd',
              marginBottom: '16px',
            }}>
              Properties
            </div>
            
            {!selectedId ? (
              <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
                Select a player, ball, or element to view properties
              </div>
            ) : (
            <>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
              Selected: {selectedId.startsWith('player') ? 'Player' : selectedId === 'ball' ? 'Ball' : 'Element'}
            </div>
            
            {/* Ball Quick Actions */}
            {selectedId === 'ball' && currentFrame?.ballPosition && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                  Quick Actions
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {/* Clear Path */}
                  {currentFrame.lines.some(l => l.isBallPath) && (
                    <button
                      onClick={() => {
                        const newLines = currentFrame.lines.filter(l => !l.isBallPath);
                        handleFrameChange({ lines: newLines });
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <X size={12} />
                      Clear Path
                    </button>
                  )}
                  
                  {/* Copy to Next Frame */}
                  {currentFrameIndex < frames.length - 1 && (
                    <button
                      onClick={() => {
                        const nextFrameIdx = currentFrameIndex + 1;
                        setFrames(prev => {
                          const newFrames = [...prev];
                          newFrames[nextFrameIdx] = {
                            ...newFrames[nextFrameIdx],
                            ballPosition: { ...currentFrame.ballPosition! },
                          };
                          return newFrames;
                        });
                        setHasUnsavedChanges(true);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(138, 43, 226, 0.3)',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        background: 'rgba(138, 43, 226, 0.1)',
                        color: '#a78bfa',
                      }}
                    >
                      Copy to Next
                    </button>
                  )}
                </div>
                
                {/* Speed Presets */}
                {currentFrame.lines.some(l => l.isBallPath) && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                      Speed Presets
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { label: '0.5x', value: 0.5 },
                        { label: '1x', value: 1 },
                        { label: '2x', value: 2 },
                      ].map(preset => {
                        const currentSpeed = currentFrame.lines.find(l => l.isBallPath)?.ballSpeed || 1;
                        const isActive = Math.abs(currentSpeed - preset.value) < 0.05;
                        return (
                          <button
                            key={preset.value}
                            onClick={() => {
                              const newLines = currentFrame.lines.map(l => 
                                l.isBallPath ? { ...l, ballSpeed: preset.value } : l
                              );
                              handleFrameChange({ lines: newLines });
                            }}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              background: isActive ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                              color: isActive ? '#f59e0b' : '#9ca3af',
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Player Action Selector */}
            {selectedId.startsWith('player') && (() => {
              const selectedPlayer = currentFrame?.positions.find(p => p.id === selectedId);
              if (!selectedPlayer) return null;
              
              const actions = [
                { value: 'none', label: 'None' },
                { value: 'spin_left', label: '↺ Spin Left' },
                { value: 'spin_right', label: '↻ Spin Right' },
                { value: 'punch_pass', label: '→ Punch Pass' },
                { value: 'side_left', label: '← Side Left' },
                { value: 'side_right', label: '→ Side Right' },
              ];
              
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    Action (for next frame)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {actions.map(action => (
                      <button
                        key={action.value}
                        onClick={() => {
                          const newPositions = currentFrame.positions.map(p => 
                            p.id === selectedId ? { ...p, action: action.value as any } : p
                          );
                          handleFrameChange({ positions: newPositions });
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          background: selectedPlayer.action === action.value || (!selectedPlayer.action && action.value === 'none')
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'rgba(138, 43, 226, 0.1)',
                          color: selectedPlayer.action === action.value || (!selectedPlayer.action && action.value === 'none')
                            ? '#f59e0b'
                            : '#a78bfa',
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            {/* Ball Path Speed Control - show when ball or ball path is selected */}
            {(() => {
              const ballPath = currentFrame?.lines.find(l => l.isBallPath);
              const showSpeedControl = (selectedId === 'ball' || 
                (selectedId?.startsWith('line') && currentFrame?.lines.find(l => l.id === selectedId)?.isBallPath));
              
              if (!ballPath || !showSpeedControl) return null;
              
              const currentSpeed = ballPath.ballSpeed || 1;
              
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    Ball Speed: {currentSpeed.toFixed(1)}x
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={currentSpeed}
                    onChange={(e) => {
                      const newSpeed = parseFloat(e.target.value);
                      const newLines = currentFrame.lines.map(l => 
                        l.isBallPath ? { ...l, ballSpeed: newSpeed } : l
                      );
                      handleFrameChange({ lines: newLines });
                    }}
                    style={{
                      width: '100%',
                      accentColor: '#f59e0b',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280' }}>
                    <span>Very Slow</span>
                    <span>Normal</span>
                    <span>Very Fast</span>
                  </div>
                </div>
              );
            })()}
            
            <button
              onClick={() => {
                if (selectedId === 'ball') {
                  handleFrameChange({ ballPosition: null });
                } else {
                  const positions = currentFrame.positions.filter(p => p.id !== selectedId);
                  const lines = currentFrame.lines.filter(l => l.id !== selectedId);
                  const annotations = currentFrame.annotations.filter(a => a.id !== selectedId);
                  handleFrameChange({ positions, lines, annotations });
                }
                setSelectedId(null);
              }}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
            </>
            )}
          </div>
        )}
      </div>
      
      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />
      
      {/* Help Modal */}
      <PlayDesignerHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};

export default PlayDesignerNew;
