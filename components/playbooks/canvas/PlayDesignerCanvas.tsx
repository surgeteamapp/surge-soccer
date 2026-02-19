"use client";

import { useState, useRef, useEffect } from 'react';
import { PlayView, PlayPosition, PlayLine, PlayText, PlayAnimation } from '@/hooks/usePlaybooks';
import { PlayerPositionMarker } from './PlayerPositionMarker';
import { PlayLineDrawer } from './PlayLineDrawer';
import { PlayTextAnnotation } from './PlayTextAnnotation';
import { ToolType } from '../PlayToolbar';

interface PlayDesignerCanvasProps {
  playView: PlayView;
  activeTool: ToolType;
  isAnimating: boolean;
  animationSpeed: number;
  canEdit: boolean;
  onViewChange: (updates: Partial<PlayView>) => void;
}

export const PlayDesignerCanvas = ({
  playView,
  activeTool,
  isAnimating,
  animationSpeed,
  canEdit,
  onViewChange,
}: PlayDesignerCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStartPoint, setLineStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [linePoints, setLinePoints] = useState<{ x: number, y: number }[]>([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  
  const scale = 1; // Could add zoom functionality in the future
  
  // Field dimensions (in pixels)
  const fieldWidth = 800;
  const fieldHeight = 500;
  
  // Effect for handling canvas click
  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
      // If we're not clicking on a child element
      if (e.target === canvasRef.current) {
        // Clear selection
        setSelectedId(null);
        
        // Handle tool actions
        if (canEdit) {
          const rect = canvasRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          switch (activeTool) {
            case 'addPlayerTeam':
              addPlayerPosition(x, y, false);
              break;
            case 'addPlayerOpponent':
              addPlayerPosition(x, y, true);
              break;
            case 'line':
            case 'arrow':
              handleLineDrawing(x, y);
              break;
            case 'text':
              addTextAnnotation(x, y);
              break;
            default:
              break;
          }
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingLine && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update temporary line points
        setLinePoints([...(lineStartPoint ? [lineStartPoint] : []), { x, y }]);
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawingLine && lineStartPoint && linePoints.length > 0) {
        // Finish drawing the line
        addLine(
          [lineStartPoint, ...linePoints.slice(1)],
          activeTool === 'arrow'
        );
        
        setIsDrawingLine(false);
        setLineStartPoint(null);
        setLinePoints([]);
      }
    };
    
    // Add event listeners
    if (canvasRef.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTool, canEdit, isDrawingLine, lineStartPoint, linePoints]);
  
  // Effect for handling animation
  useEffect(() => {
    if (isAnimating) {
      if (animationTimer) {
        clearInterval(animationTimer);
      }
      
      // Reset progress
      setAnimationProgress(0);
      
      // Start animation timer
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          const newProgress = prev + 0.01;
          
          // Stop animation when complete
          if (newProgress >= 1) {
            clearInterval(timer);
            return 1;
          }
          
          return newProgress;
        });
      }, 16 / animationSpeed); // ~60fps, adjusted for speed
      
      setAnimationTimer(timer);
      
      return () => {
        clearInterval(timer);
      };
    } else {
      // Reset animation
      setAnimationProgress(0);
      if (animationTimer) {
        clearInterval(animationTimer);
        setAnimationTimer(null);
      }
    }
  }, [isAnimating, animationSpeed]);
  
  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };
  
  // Add player position
  const addPlayerPosition = (x: number, y: number, isOpponent: boolean) => {
    // Create a new player position
    const newPosition: PlayPosition = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x,
      y,
      isOpponent,
      playerNumber: playView.positions.length + 1,
      rotation: isOpponent ? 180 : 0,
    };
    
    // Update the play view
    onViewChange({
      positions: [...playView.positions, newPosition]
    });
    
    // Select the new position
    setSelectedId(newPosition.id);
  };
  
  // Handle player position change
  const handlePositionChange = (id: string, x: number, y: number) => {
    // Update the player position
    const positions = playView.positions.map(pos => {
      if (pos.id === id) {
        return { ...pos, x, y };
      }
      return pos;
    });
    
    onViewChange({ positions });
  };
  
  // Handle player rotation change
  const handleRotationChange = (id: string, rotation: number) => {
    // Update the player rotation
    const positions = playView.positions.map(pos => {
      if (pos.id === id) {
        return { ...pos, rotation };
      }
      return pos;
    });
    
    onViewChange({ positions });
  };
  
  // Handle line drawing
  const handleLineDrawing = (x: number, y: number) => {
    if (!isDrawingLine) {
      // Start drawing a line
      setIsDrawingLine(true);
      setLineStartPoint({ x, y });
      setLinePoints([{ x, y }]);
    }
  };
  
  // Add line
  const addLine = (points: { x: number, y: number }[], hasArrow: boolean = false) => {
    // Create a new line
    const newLine: PlayLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      points,
      color: '#2196F3', // Default blue
      width: 2,
      dashed: false,
      arrowEnd: hasArrow,
    };
    
    // Update the play view
    onViewChange({
      lines: [...playView.lines, newLine]
    });
    
    // Select the new line
    setSelectedId(newLine.id);
  };
  
  // Handle line change
  const handleLineChange = (id: string, points: { x: number, y: number }[]) => {
    // Update the line
    const lines = playView.lines.map(line => {
      if (line.id === id) {
        return { ...line, points };
      }
      return line;
    });
    
    onViewChange({ lines });
  };
  
  // Handle line delete
  const handleLineDelete = (id: string) => {
    // Remove the line
    const lines = playView.lines.filter(line => line.id !== id);
    onViewChange({ lines });
    
    // Clear selection
    setSelectedId(null);
  };
  
  // Add text annotation
  const addTextAnnotation = (x: number, y: number) => {
    // Create a new text annotation
    const newText: PlayText = {
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x,
      y,
      content: 'Text Label',
      fontSize: 16,
      color: '#000000',
    };
    
    // Update the play view
    onViewChange({
      texts: [...playView.texts, newText]
    });
    
    // Select the new text
    setSelectedId(newText.id);
  };
  
  // Handle text change
  const handleTextChange = (id: string, updates: Partial<PlayText>) => {
    // Update the text
    const texts = playView.texts.map(text => {
      if (text.id === id) {
        return { ...text, ...updates };
      }
      return text;
    });
    
    onViewChange({ texts });
  };
  
  // Handle text delete
  const handleTextDelete = (id: string) => {
    // Remove the text
    const texts = playView.texts.filter(text => text.id !== id);
    onViewChange({ texts });
    
    // Clear selection
    setSelectedId(null);
  };
  
  // Calculate animated position for a player
  const getAnimatedPosition = (position: PlayPosition) => {
    // Find animation for this position
    const animation = playView.animations.find(a => a.positionId === position.id);
    
    if (!animation || !isAnimating) {
      return position;
    }
    
    // Sort keyframes by time
    const keyframes = [...animation.keyframes].sort((a, b) => a.time - b.time);
    
    // Find the keyframes to interpolate between
    let startFrame = keyframes[0];
    let endFrame = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (animationProgress >= keyframes[i].time && animationProgress <= keyframes[i + 1].time) {
        startFrame = keyframes[i];
        endFrame = keyframes[i + 1];
        break;
      }
    }
    
    // Calculate progress within these keyframes
    const frameProgress = endFrame.time !== startFrame.time 
      ? (animationProgress - startFrame.time) / (endFrame.time - startFrame.time)
      : 0;
    
    // Linear interpolation
    const x = startFrame.x + (endFrame.x - startFrame.x) * frameProgress;
    const y = startFrame.y + (endFrame.y - startFrame.y) * frameProgress;
    
    // Rotation interpolation (if available)
    const rotation = (startFrame.rotation !== undefined && endFrame.rotation !== undefined)
      ? startFrame.rotation + (endFrame.rotation - startFrame.rotation) * frameProgress
      : position.rotation;
    
    return { ...position, x, y, rotation };
  };
  
  // Generate soccer field markings
  const fieldMarkings = (
    <svg 
      width={fieldWidth} 
      height={fieldHeight} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        pointerEvents: 'none',
      }}
    >
      {/* Field outline */}
      <rect 
        x="0" 
        y="0" 
        width={fieldWidth} 
        height={fieldHeight} 
        fill="#4CAF50" 
        stroke="white" 
        strokeWidth="4" 
      />
      
      {/* Center circle */}
      <circle 
        cx={fieldWidth / 2} 
        cy={fieldHeight / 2} 
        r="70" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
      />
      
      {/* Center line */}
      <line 
        x1={fieldWidth / 2} 
        y1="0" 
        x2={fieldWidth / 2} 
        y2={fieldHeight} 
        stroke="white" 
        strokeWidth="4" 
      />
      
      {/* Center spot */}
      <circle 
        cx={fieldWidth / 2} 
        cy={fieldHeight / 2} 
        r="4" 
        fill="white" 
      />
      
      {/* Goal area left */}
      <rect 
        x="0" 
        y={(fieldHeight - 150) / 2} 
        width="60" 
        height="150" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
      />
      
      {/* Goal area right */}
      <rect 
        x={fieldWidth - 60} 
        y={(fieldHeight - 150) / 2} 
        width="60" 
        height="150" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
      />
    </svg>
  );

  // Draw temporary line while drawing
  const tempLineElement = isDrawingLine && linePoints.length > 1 ? (
    <svg 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <path
        d={`M ${linePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
        stroke="#2196F3"
        strokeWidth="2"
        fill="none"
        strokeDasharray={activeTool === 'dashed' ? '5,5' : undefined}
        markerEnd={activeTool === 'arrow' ? 'url(#tempArrow)' : undefined}
      />
      <defs>
        <marker
          id="tempArrow"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#2196F3" />
        </marker>
      </defs>
    </svg>
  ) : null;

  return (
    <div 
      ref={canvasRef}
      style={{ 
        position: 'relative',
        width: `${fieldWidth}px`,
        height: `${fieldHeight}px`,
        backgroundColor: '#4CAF50',
        overflow: 'hidden',
        margin: '0 auto',
        cursor: activeTool === 'select' ? 'default' : 'crosshair',
      }}
    >
      {/* Field markings */}
      {fieldMarkings}
      
      {/* Lines */}
      {playView.lines.map(line => (
        <PlayLineDrawer
          key={line.id}
          line={line}
          isSelected={selectedId === line.id}
          canEdit={canEdit}
          scale={scale}
          onSelect={handleSelect}
          onLineChange={handleLineChange}
          onLineDelete={handleLineDelete}
        />
      ))}
      
      {/* Players */}
      {playView.positions.map(position => {
        // Apply animation if active
        const displayPosition = isAnimating
          ? getAnimatedPosition(position)
          : position;
        
        return (
          <PlayerPositionMarker
            key={position.id}
            position={displayPosition}
            isSelected={selectedId === position.id}
            canMove={canEdit}
            onSelect={handleSelect}
            onPositionChange={handlePositionChange}
            onRotationChange={handleRotationChange}
          />
        );
      })}
      
      {/* Text annotations */}
      {playView.texts.map(text => (
        <PlayTextAnnotation
          key={text.id}
          text={text}
          isSelected={selectedId === text.id}
          canEdit={canEdit}
          onSelect={handleSelect}
          onTextChange={handleTextChange}
          onTextDelete={handleTextDelete}
        />
      ))}
      
      {/* Temporary line being drawn */}
      {tempLineElement}
    </div>
  );
};
