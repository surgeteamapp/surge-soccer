"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PowerSoccerField } from './WheelchairRugbyField';
import { PowerSoccerPlayerMarker, PlayerPosition, PlayerRole } from './WheelchairPlayerMarker';
import { BallMarker, BallPosition } from './BallMarker';
import { PlayLineDrawer } from './PlayLineDrawer';

export type ToolType = 
  | 'select' 
  | 'addPlayerTeam' 
  | 'addPlayerOpponent' 
  | 'addBall'
  | 'freeDraw' 
  | 'dashed'
  | 'arrow' 
  | 'zone'
  | 'delete'
  | 'diagonal'
  | 'rectangle'
  | 'ballPath';

export interface PlayLine {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  dashed: boolean;
  arrowEnd?: boolean;
  isBallPath?: boolean;
  ballSpeed?: number; // Speed multiplier: 0.25 = slow, 1 = normal, 2 = fast
}


export interface FrameData {
  positions: PlayerPosition[];
  lines: PlayLine[];
  annotations: any[];
  ballPosition: BallPosition | null;
}

interface PlayCanvasProps {
  frameData: FrameData;
  activeTool: ToolType;
  isAnimating: boolean;
  animationProgress: number;
  nextFrameData?: FrameData;
  canEdit: boolean;
  showGrid?: boolean;
  drawColor?: string;
  animatedBallPosition?: { x: number; y: number } | null;
  onFrameChange: (data: Partial<FrameData>) => void;
  onSelect: (id: string | null) => void;
  onBallPositionUpdate?: (position: { x: number; y: number } | null) => void;
  selectedId: string | null;
}

// Calculate perpendicular distance from point to line
const perpendicularDistance = (
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
  
  const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
  const closestX = lineStart.x + u * dx;
  const closestY = lineStart.y + u * dy;
  
  return Math.sqrt(Math.pow(point.x - closestX, 2) + Math.pow(point.y - closestY, 2));
};

// Ramer-Douglas-Peucker line simplification
const rdpSimplify = (points: { x: number; y: number }[], epsilon: number): { x: number; y: number }[] => {
  if (points.length < 3) return points;
  
  let maxDist = 0;
  let maxIndex = 0;
  const end = points.length - 1;
  
  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [points[0], points[end]];
};

// Smooth line using Ramer-Douglas-Peucker algorithm + Catmull-Rom spline
const smoothLine = (points: { x: number; y: number }[]): { x: number; y: number }[] => {
  if (points.length < 3) return points;
  
  // First, simplify with RDP algorithm
  const simplified = rdpSimplify(points, 3);
  
  // Then smooth with Catmull-Rom spline
  if (simplified.length < 3) return simplified;
  
  const smoothed: { x: number; y: number }[] = [];
  const segments = 8;
  
  for (let i = 0; i < simplified.length - 1; i++) {
    const p0 = simplified[Math.max(0, i - 1)];
    const p1 = simplified[i];
    const p2 = simplified[Math.min(simplified.length - 1, i + 1)];
    const p3 = simplified[Math.min(simplified.length - 1, i + 2)];
    
    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;
      
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * s +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * s +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3
      );
      
      smoothed.push({ x, y });
    }
  }
  smoothed.push(simplified[simplified.length - 1]);
  
  return smoothed;
};

export const PlayCanvas = ({
  frameData,
  activeTool,
  isAnimating,
  animationProgress,
  nextFrameData,
  canEdit,
  showGrid = false,
  drawColor = '#000000',
  animatedBallPosition,
  onFrameChange,
  onSelect,
  onBallPositionUpdate,
  selectedId,
}: PlayCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStartPoint, setLineStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);
  
  // Rectangle drawing state
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [rectEnd, setRectEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Ball path drag state (drag from ball to create path)
  const [isBallPathDragging, setIsBallPathDragging] = useState(false);
  const [ballPathStart, setBallPathStart] = useState<{ x: number; y: number } | null>(null);
  const [ballPathEnd, setBallPathEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Ref to avoid stale closure in drag end handler
  const frameDataRef = useRef(frameData);
  frameDataRef.current = frameData;
  
  // Canvas dimensions
  const canvasWidth = 900;
  const canvasHeight = 500;
  
  // Default line settings
  const lineColor = drawColor;
  const [lineWidth, setLineWidth] = useState(3);

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Find player with action near a point (within 20px radius)
  const findActionPlayerNearPoint = useCallback((
    point: { x: number; y: number },
    positions: PlayerPosition[]
  ): PlayerPosition | null => {
    const ACTION_RADIUS = 20;
    for (const player of positions) {
      if (player.action && player.action !== 'none') {
        // Player center is at player.x + 30, player.y + 30 (approx center of marker)
        const playerCenterX = player.x + 30;
        const playerCenterY = player.y + 30;
        const distance = Math.sqrt(
          Math.pow(point.x - playerCenterX, 2) + 
          Math.pow(point.y - playerCenterY, 2)
        );
        if (distance <= ACTION_RADIUS + 30) { // 30px is approx player radius
          return player;
        }
      }
    }
    return null;
  }, []);

  // Calculate ball position along ball path during animation
  // Ball moves smoothly from path start to path end based on progress
  const getBallPathPosition = useCallback((
    ballPaths: PlayLine[],
    progress: number,
    positions: PlayerPosition[]
  ): { x: number; y: number } | null => {
    if (!isAnimating) return null;
    
    // Find the ball path for this frame (should be only one per frame)
    const activePath = ballPaths.find(line => line.isBallPath && line.points.length >= 2);
    
    if (!activePath || activePath.points.length < 2) return null;
    
    const points = activePath.points;
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const speed = activePath.ballSpeed || 1;
    
    // Check if there's a player with action near the ball path start
    const actionPlayer = findActionPlayerNearPoint(startPoint, positions);
    
    // Determine when ball should start moving based on action sync
    const STRIKE_PHASE_START = 0.3;
    let ballProgress: number;
    
    if (actionPlayer) {
      // Ball waits for strike phase, then moves from 30% to 100%
      if (progress < STRIKE_PHASE_START) {
        // Ball hasn't started moving yet - stay at start
        return {
          x: startPoint.x - 10,
          y: startPoint.y - 10,
        };
      }
      // Map progress from [0.3, 1] to [0, 1] for ball movement
      ballProgress = (progress - STRIKE_PHASE_START) / (1 - STRIKE_PHASE_START);
    } else {
      // No action player - ball moves throughout frame
      ballProgress = progress;
    }
    
    // Clamp progress to [0, 1]
    ballProgress = Math.max(0, Math.min(1, ballProgress));
    
    // Apply speed modifier - speed affects the path completion timing
    // Speed = 1.0: ball completes path exactly as frame ends
    // Speed = 2.0: ball completes path halfway through the frame, then stays at end
    // Speed = 0.5: ball only reaches halfway along path when frame ends
    const speedAdjustedProgress = Math.min(1, ballProgress * speed);
    
    // Apply smooth easing for natural motion
    const easedProgress = easeInOutCubic(speedAdjustedProgress);
    
    // For simple 2-point paths (start and end), interpolate directly
    if (points.length === 2) {
      const x = startPoint.x + (endPoint.x - startPoint.x) * easedProgress;
      const y = startPoint.y + (endPoint.y - startPoint.y) * easedProgress;
      return {
        x: x - 10,
        y: y - 10,
      };
    }
    
    // For multi-point paths, calculate total length and interpolate along segments
    let totalLength = 0;
    const segmentLengths: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      segmentLengths.push(length);
      totalLength += length;
    }
    
    if (totalLength === 0) {
      return { x: startPoint.x - 10, y: startPoint.y - 10 };
    }
    
    // Find position along path based on eased progress
    const targetDistance = easedProgress * totalLength;
    let accumulatedDistance = 0;
    
    for (let i = 0; i < segmentLengths.length; i++) {
      if (segmentLengths[i] === 0) continue;
      
      if (accumulatedDistance + segmentLengths[i] >= targetDistance) {
        // Interpolate within this segment
        const segmentProgress = (targetDistance - accumulatedDistance) / segmentLengths[i];
        const x = points[i].x + (points[i + 1].x - points[i].x) * segmentProgress;
        const y = points[i].y + (points[i + 1].y - points[i].y) * segmentProgress;
        return {
          x: x - 10,
          y: y - 10,
        };
      }
      accumulatedDistance += segmentLengths[i];
    }
    
    // At the end - return endpoint
    return {
      x: endPoint.x - 10,
      y: endPoint.y - 10,
    };
  }, [isAnimating, findActionPlayerNearPoint]);

  // Track last ball position to prevent infinite updates
  const lastBallPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Reset ref when animation stops
  useEffect(() => {
    if (!isAnimating) {
      lastBallPosRef.current = null;
    }
  }, [isAnimating]);
  
  // Store onBallPositionUpdate in ref to avoid dependency issues
  const onBallPositionUpdateRef = useRef(onBallPositionUpdate);
  onBallPositionUpdateRef.current = onBallPositionUpdate;
  
  // Update ball position for cross-frame tracking (in useEffect to avoid render loops)
  useEffect(() => {
    if (!isAnimating || !onBallPositionUpdateRef.current) return;
    
    const currentFrameData = frameDataRef.current;
    if (!currentFrameData.ballPosition) return;
    
    const ballPaths = currentFrameData.lines.filter(l => l.isBallPath);
    if (ballPaths.length === 0) return;
    
    const activePath = ballPaths.find(line => line.isBallPath && line.points.length >= 2);
    if (!activePath) return;
    
    const points = activePath.points;
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    
    // Simple linear interpolation for ball position update
    const progress = Math.max(0, Math.min(1, animationProgress));
    const x = startPoint.x + (endPoint.x - startPoint.x) * progress - 10;
    const y = startPoint.y + (endPoint.y - startPoint.y) * progress - 10;
    
    // Only update if position actually changed
    if (!lastBallPosRef.current || 
        Math.abs(lastBallPosRef.current.x - x) > 0.5 || 
        Math.abs(lastBallPosRef.current.y - y) > 0.5) {
      lastBallPosRef.current = { x, y };
      onBallPositionUpdateRef.current({ x, y });
    }
  }, [isAnimating, animationProgress]);

  // Calculate interpolated position during animation with action animations
  const getInterpolatedPosition = useCallback((
    current: PlayerPosition,
    next: PlayerPosition | undefined,
    progress: number
  ): PlayerPosition => {
    if (!isAnimating) return current;
    
    const easedProgress = easeInOutCubic(progress);
    
    // If no next position, still animate actions but don't move
    const targetX = next?.x ?? current.x;
    const targetY = next?.y ?? current.y;
    const targetRotation = next?.rotation ?? current.rotation;
    
    // Base interpolation
    let x = current.x + (targetX - current.x) * easedProgress;
    let y = current.y + (targetY - current.y) * easedProgress;
    let rotation = current.rotation + (targetRotation - current.rotation) * easedProgress;
    
    // Apply action animations
    const action = current.action;
    if (action && action !== 'none') {
      // Action animation phases: wind-up (0-0.3), strike (0.3-0.5), follow-through (0.5-1)
      const actionPhase = progress < 0.3 ? 'windup' : progress < 0.5 ? 'strike' : 'followthrough';
      
      switch (action) {
        case 'spin_left':
          // 360° counter-clockwise spin
          if (progress < 0.6) {
            rotation = current.rotation - (360 * (progress / 0.6));
          } else {
            rotation = current.rotation - 360 + (targetRotation - (current.rotation - 360)) * ((progress - 0.6) / 0.4);
          }
          break;
          
        case 'spin_right':
          // 360° clockwise spin
          if (progress < 0.6) {
            rotation = current.rotation + (360 * (progress / 0.6));
          } else {
            rotation = current.rotation + 360 + (targetRotation - (current.rotation + 360)) * ((progress - 0.6) / 0.4);
          }
          break;
          
        case 'punch_pass':
          // Forward lunge motion - more pronounced
          {
            const angle = (current.rotation - 90) * (Math.PI / 180);
            if (actionPhase === 'windup') {
              // Pull back
              const pullback = Math.sin((progress / 0.3) * Math.PI) * 15;
              x -= Math.cos(angle) * pullback;
              y -= Math.sin(angle) * pullback;
            } else if (actionPhase === 'strike') {
              // Quick forward thrust - much larger movement
              const thrust = Math.sin(((progress - 0.3) / 0.2) * Math.PI) * 35;
              x += Math.cos(angle) * thrust;
              y += Math.sin(angle) * thrust;
            } else {
              // Follow through - ease back
              const ease = (1 - ((progress - 0.5) / 0.5)) * 10;
              x += Math.cos(angle) * ease;
              y += Math.sin(angle) * ease;
            }
          }
          break;
          
        case 'side_left':
          // Lateral sweep to the left
          if (progress < 0.4) {
            // Wind up - rotate right slightly
            rotation = current.rotation + 15 * Math.sin((progress / 0.4) * Math.PI);
          } else if (progress < 0.7) {
            // Strike - quick rotation left
            rotation = current.rotation - 30 * Math.sin(((progress - 0.4) / 0.3) * Math.PI);
          }
          break;
          
        case 'side_right':
          // Lateral sweep to the right
          if (progress < 0.4) {
            // Wind up - rotate left slightly
            rotation = current.rotation - 15 * Math.sin((progress / 0.4) * Math.PI);
          } else if (progress < 0.7) {
            // Strike - quick rotation right
            rotation = current.rotation + 30 * Math.sin(((progress - 0.4) / 0.3) * Math.PI);
          }
          break;
      }
    }
    
    return {
      ...current,
      x,
      y,
      rotation,
    };
  }, [isAnimating]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canEdit || isAnimating) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clear selection if clicking on empty space with select tool
    if (e.target === canvasRef.current && activeTool === 'select') {
      onSelect(null);
    }
    
    switch (activeTool) {
      case 'addPlayerTeam':
        addPlayer(x, y, false);
        break;
      case 'addPlayerOpponent':
        addPlayer(x, y, true);
        break;
      case 'addBall':
        addBall(x, y);
        break;
      case 'dashed':
      case 'diagonal':
        handleLineDrawing(x, y);
        break;
      // freeDraw, arrow, ballPath are handled by onMouseDown
      case 'freeDraw':
      case 'arrow':
      case 'ballPath':
        break;
      case 'rectangle':
        handleRectDrawing(x, y);
        break;
      default:
        break;
    }
  };

  // Role assignments based on player count
  const roleOrder: PlayerRole[] = ['G', 'S', 'W', 'C'];
  
  // Add player
  const addPlayer = (x: number, y: number, isOpponent: boolean, role?: PlayerRole) => {
    const teamPositions = frameData.positions.filter(p => p.isOpponent === isOpponent);
    if (teamPositions.length >= 4) {
      return; // Max 4 players per team
    }
    
    // Determine role - use provided role or assign based on count
    const assignedRole = role || roleOrder[teamPositions.length];
    
    const newPosition: PlayerPosition = {
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x: x - 28,
      y: y - 28,
      jerseyNumber: teamPositions.length + 1,
      role: assignedRole,
      displayMode: 'letter',
      isOpponent,
      rotation: isOpponent ? 180 : 0,
      hasBall: false,
    };
    
    onFrameChange({
      positions: [...frameData.positions, newPosition],
    });
    onSelect(newPosition.id);
  };

  // Add ball
  const addBall = (x: number, y: number) => {
    const newBall: BallPosition = {
      x: x - 12,
      y: y - 12,
    };
    
    onFrameChange({ ballPosition: newBall });
  };

  // Ball path drag handlers (drag from ball to create path)
  const handleBallPathDragStart = useCallback((startX: number, startY: number) => {
    setIsBallPathDragging(true);
    setBallPathStart({ x: startX, y: startY });
    setBallPathEnd({ x: startX, y: startY });
  }, []);

  const handleBallPathDragMove = useCallback((endX: number, endY: number) => {
    setBallPathEnd({ x: endX, y: endY });
  }, []);

  const handleBallPathDragEnd = useCallback((endX: number, endY: number) => {
    if (ballPathStart) {
      // Only create path if dragged a minimum distance
      const distance = Math.sqrt(
        Math.pow(endX - ballPathStart.x, 2) + Math.pow(endY - ballPathStart.y, 2)
      );
      
      if (distance > 20) {
        // Use ref to get current lines (avoids stale closure and infinite loops)
        const currentLines = frameDataRef.current.lines;
        
        // Remove existing ball path (one per frame rule)
        const filteredLines = currentLines.filter(l => !l.isBallPath);
        
        // Get existing ball path speed if any
        const existingPath = currentLines.find(l => l.isBallPath);
        const existingSpeed = existingPath?.ballSpeed || 1.0;
        
        const newBallPath: PlayLine = {
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          points: [ballPathStart, { x: endX, y: endY }],
          color: '#f59e0b',
          width: 4,
          dashed: false,
          arrowEnd: true,
          isBallPath: true,
          ballSpeed: existingSpeed,
        };
        
        onFrameChange({ lines: [...filteredLines, newBallPath] });
        onSelect(newBallPath.id);
      }
    }
    
    setIsBallPathDragging(false);
    setBallPathStart(null);
    setBallPathEnd(null);
  }, [ballPathStart, onFrameChange, onSelect]);

  // Handle line drawing
  const handleLineDrawing = (x: number, y: number) => {
    if (!isDrawingLine) {
      setIsDrawingLine(true);
      setLineStartPoint({ x, y });
      setLinePoints([{ x, y }]);
    }
  };

  // Handle canvas mouse down for freeDraw and arrow tools
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canEdit || isAnimating) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle freeDraw, arrow, and ballPath tools
    if (activeTool === 'freeDraw' || activeTool === 'arrow' || activeTool === 'ballPath') {
      setIsDrawingLine(true);
      setLineStartPoint({ x, y });
      setLinePoints([{ x, y }]);
    }
  };


  // Handle rectangle drawing
  const handleRectDrawing = (x: number, y: number) => {
    if (!isDrawingRect) {
      setIsDrawingRect(true);
      setRectStart({ x, y });
      setRectEnd({ x, y });
    }
  };

  // Handle mouse move for line drawing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingLine && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // For diagonal and ballPath tools, only keep start and current end point (straight line)
        if (activeTool === 'diagonal' || activeTool === 'ballPath') {
          setLinePoints(prev => [prev[0], { x, y }]);
        } else {
          // Free draw for other line tools
          setLinePoints(prev => [...prev, { x, y }]);
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawingLine && lineStartPoint && linePoints.length > 1) {
        // Check if trying to add a second ball path (only one allowed per frame)
        const existingBallPath = frameData.lines.find(l => l.isBallPath);
        if (activeTool === 'ballPath' && existingBallPath) {
          // Replace existing ball path instead of adding new one
          const filteredLines = frameData.lines.filter(l => !l.isBallPath);
          const finalPoints = [linePoints[0], linePoints[linePoints.length - 1]];
          const newLine: PlayLine = {
            id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            points: finalPoints,
            color: '#f59e0b',
            width: 4,
            dashed: false,
            arrowEnd: true,
            isBallPath: true,
            ballSpeed: existingBallPath.ballSpeed || 1.0, // Keep existing speed
          };
          onFrameChange({
            lines: [...filteredLines, newLine],
          });
          onSelect(newLine.id);
          setIsDrawingLine(false);
          setLineStartPoint(null);
          setLinePoints([]);
          return;
        }
        
        // For diagonal and ballPath, use only start and end point
        // For freeDraw and arrow, smooth the line
        let finalPoints: { x: number; y: number }[];
        
        if (activeTool === 'diagonal' || activeTool === 'ballPath') {
          finalPoints = [linePoints[0], linePoints[linePoints.length - 1]];
        } else if (activeTool === 'freeDraw' || activeTool === 'arrow') {
          finalPoints = smoothLine(linePoints);
        } else {
          finalPoints = linePoints;
        }
          
        const newLine: PlayLine = {
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          points: finalPoints,
          color: activeTool === 'ballPath' ? '#f59e0b' : lineColor, // Use selected color
          width: activeTool === 'ballPath' ? 4 : 3,
          dashed: activeTool === 'dashed',
          arrowEnd: activeTool === 'arrow' || activeTool === 'ballPath',
          isBallPath: activeTool === 'ballPath',
          ballSpeed: activeTool === 'ballPath' ? 1.0 : undefined, // Default speed
        };
        
        onFrameChange({
          lines: [...frameData.lines, newLine],
        });
        onSelect(newLine.id);
      }
      
      setIsDrawingLine(false);
      setLineStartPoint(null);
      setLinePoints([]);
    };
    
    if (isDrawingLine) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawingLine, lineStartPoint, linePoints, activeTool, lineColor, lineWidth, frameData.lines, onFrameChange, onSelect]);

  // Handle mouse move/up for rectangle drawing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingRect && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRectEnd({ x, y });
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawingRect && rectStart && rectEnd) {
        // Create 4 lines forming a rectangle
        const x1 = Math.min(rectStart.x, rectEnd.x);
        const y1 = Math.min(rectStart.y, rectEnd.y);
        const x2 = Math.max(rectStart.x, rectEnd.x);
        const y2 = Math.max(rectStart.y, rectEnd.y);
        
        const rectLines: PlayLine[] = [
          // Top
          { id: `line-${Date.now()}-1`, points: [{ x: x1, y: y1 }, { x: x2, y: y1 }], color: '#000000', width: 3, dashed: false },
          // Right
          { id: `line-${Date.now()}-2`, points: [{ x: x2, y: y1 }, { x: x2, y: y2 }], color: '#000000', width: 3, dashed: false },
          // Bottom
          { id: `line-${Date.now()}-3`, points: [{ x: x2, y: y2 }, { x: x1, y: y2 }], color: '#000000', width: 3, dashed: false },
          // Left
          { id: `line-${Date.now()}-4`, points: [{ x: x1, y: y2 }, { x: x1, y: y1 }], color: '#000000', width: 3, dashed: false },
        ];
        
        onFrameChange({
          lines: [...frameData.lines, ...rectLines],
        });
      }
      
      setIsDrawingRect(false);
      setRectStart(null);
      setRectEnd(null);
    };
    
    if (isDrawingRect) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawingRect, rectStart, rectEnd, frameData.lines, onFrameChange]);

  // Handle position change
  const handlePositionChange = (id: string, x: number, y: number) => {
    const positions = frameData.positions.map(pos => 
      pos.id === id ? { ...pos, x, y } : pos
    );
    onFrameChange({ positions });
  };

  // Handle rotation change
  const handleRotationChange = (id: string, rotation: number) => {
    const positions = frameData.positions.map(pos => 
      pos.id === id ? { ...pos, rotation } : pos
    );
    onFrameChange({ positions });
  };

  // Handle ball position change
  const handleBallPositionChange = (x: number, y: number) => {
    onFrameChange({ ballPosition: { ...frameData.ballPosition, x, y } });
  };

  // Handle line change
  const handleLineChange = (id: string, points: { x: number; y: number }[]) => {
    const lines = frameData.lines.map(line => 
      line.id === id ? { ...line, points } : line
    );
    onFrameChange({ lines });
  };

  // Handle line delete
  const handleLineDelete = (id: string) => {
    const lines = frameData.lines.filter(line => line.id !== id);
    onFrameChange({ lines });
    onSelect(null);
  };

  // Get cursor style based on tool
  const getCursorStyle = () => {
    switch (activeTool) {
      case 'addPlayerTeam':
      case 'addPlayerOpponent':
      case 'addBall':
        return 'crosshair';
      case 'freeDraw':
      case 'arrow':
      case 'dashed':
      case 'diagonal':
      case 'rectangle':
      case 'ballPath':
        return 'crosshair';
      case 'delete':
        return 'not-allowed';
      default:
        return 'default';
    }
  };

  // Temporary line while drawing
  const tempLine = isDrawingLine && linePoints.length > 1 && (
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
      <defs>
        <marker
          id="tempArrow"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
        </marker>
      </defs>
      <path
        d={`M ${linePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="none"
        strokeDasharray={activeTool === 'dashed' ? '8,4' : undefined}
        markerEnd={activeTool === 'arrow' ? 'url(#tempArrow)' : undefined}
      />
    </svg>
  );

  
  return (
    <div 
      ref={canvasRef}
      style={{
        position: 'relative',
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)',
        borderRadius: '12px',
        overflow: 'visible',
        cursor: getCursorStyle(),
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* Field */}
      <PowerSoccerField 
        width={canvasWidth} 
        height={canvasHeight}
        showGrid={showGrid}
      />
      
      {/* Lines */}
      {frameData.lines.map(line => (
        <PlayLineDrawer
          key={line.id}
          line={line}
          isSelected={selectedId === line.id}
          canEdit={canEdit && !isAnimating}
          scale={1}
          onSelect={onSelect}
          onLineChange={handleLineChange}
          onLineDelete={handleLineDelete}
        />
      ))}
      
      {/* Players */}
      {frameData.positions.map((position) => {
        const nextPosition = nextFrameData?.positions.find(p => p.id === position.id);
        const displayPosition = isAnimating
          ? getInterpolatedPosition(position, nextPosition, animationProgress)
          : position;
        
        return (
          <PowerSoccerPlayerMarker
            key={position.id}
            position={displayPosition}
            isSelected={selectedId === position.id}
            canMove={canEdit && !isAnimating}
            onSelect={onSelect}
            onPositionChange={handlePositionChange}
            onRotationChange={handleRotationChange}
          />
        );
      })}
      
      {/* Ball */}
      {frameData.ballPosition && (() => {
        // Get ball paths from current frame
        const ballPaths = frameData.lines.filter(l => l.isBallPath);
        // Calculate animated ball position - if animating with a path, follow the path
        // Otherwise use the frame's ball position
        const pathPosition = isAnimating 
          ? getBallPathPosition(ballPaths, animationProgress, frameData.positions)
          : null;
        const displayBallPosition = pathPosition || frameData.ballPosition;
        
        return displayBallPosition && (
          <BallMarker
            position={displayBallPosition}
            isSelected={selectedId === 'ball'}
            canMove={canEdit && !isAnimating}
            onSelect={() => onSelect('ball')}
            onPositionChange={handleBallPositionChange}
            onPathDragStart={handleBallPathDragStart}
            onPathDragMove={handleBallPathDragMove}
            onPathDragEnd={handleBallPathDragEnd}
          />
        );
      })()}
      
      {/* Ghost ball at ball path endpoint */}
      {!isAnimating && frameData.ballPosition && (() => {
        const ballPath = frameData.lines.find(l => l.isBallPath && l.points.length >= 2);
        if (!ballPath) return null;
        
        const endpoint = ballPath.points[ballPath.points.length - 1];
        return (
          <div
            style={{
              position: 'absolute',
              left: endpoint.x - 10,
              top: endpoint.y - 10,
              width: 20,
              height: 20,
              opacity: 0.5,
              pointerEvents: 'none',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <svg 
              width={20} 
              height={20} 
              viewBox="-2500 -2500 5000 5000"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
              }}
            >
              <g stroke="#f59e0b" strokeWidth={48}>
                <circle fill="rgba(255,255,255,0.7)" r="2376"/>
              </g>
            </svg>
          </div>
        );
      })()}
      
      {/* Temp line while drawing */}
      {tempLine}
      
      {/* Ball path drag preview */}
      {isBallPathDragging && ballPathStart && ballPathEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <defs>
            <marker
              id="ballPathArrowPreview"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
            </marker>
          </defs>
          <line
            x1={ballPathStart.x}
            y1={ballPathStart.y}
            x2={ballPathEnd.x}
            y2={ballPathEnd.y}
            stroke="#f59e0b"
            strokeWidth={4}
            strokeDasharray="8,4"
            markerEnd="url(#ballPathArrowPreview)"
            opacity={0.8}
          />
        </svg>
      )}
      
      {/* Temp rectangle while drawing */}
      {isDrawingRect && rectStart && rectEnd && (
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
          <rect
            x={Math.min(rectStart.x, rectEnd.x)}
            y={Math.min(rectStart.y, rectEnd.y)}
            width={Math.abs(rectEnd.x - rectStart.x)}
            height={Math.abs(rectEnd.y - rectStart.y)}
            stroke="#000000"
            strokeWidth={3}
            fill="none"
          />
        </svg>
      )}
    </div>
  );
};

export default PlayCanvas;
