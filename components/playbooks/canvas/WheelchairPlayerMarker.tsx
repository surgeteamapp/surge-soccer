"use client";

import React, { useState, useRef, useEffect } from 'react';

export type PlayerRole = 'G' | 'S' | 'W' | 'C';
export type DisplayMode = 'letter' | 'number';
export type PlayerAction = 
  | 'none'
  | 'spin_left'
  | 'spin_right'
  | 'punch_pass'
  | 'side_left'
  | 'side_right';

export interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  jerseyNumber: number;
  role: PlayerRole;
  displayMode?: DisplayMode;
  playerName?: string;
  isOpponent: boolean;
  rotation: number;
  hasBall?: boolean;
  action?: PlayerAction;
}

interface PowerSoccerPlayerMarkerProps {
  position: PlayerPosition;
  isSelected: boolean;
  canMove: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onRotationChange: (id: string, rotation: number) => void;
}

export const PowerSoccerPlayerMarker = ({
  position,
  isSelected,
  canMove,
  onSelect,
  onPositionChange,
  onRotationChange
}: PowerSoccerPlayerMarkerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const connectionLineRef = useRef<HTMLDivElement>(null);
  
  const sizeW = 60;  // Width - horizontal wheelchair
  const sizeH = 40;  // Height
  const rotatorDistance = 35;  // Distance to rotation handle - increased to avoid overlap
  
  // Team colors
  const teamColor = position.isOpponent 
    ? '#dc2626'  // Red for opponents
    : '#7c3aed'; // Purple for team
  const teamColorDark = position.isOpponent
    ? '#991b1b'
    : '#5b21b6';
  const teamColorGlow = position.isOpponent
    ? 'rgba(239, 68, 68, 0.6)'
    : 'rgba(124, 58, 237, 0.6)';
  
  // Display text (letter or number)
  const displayText = position.displayMode === 'number' 
    ? position.jerseyNumber.toString() 
    : position.role;
  
    
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canMove) return;
    // Don't start drag if clicking on the rotation handle or connection line
    if (rotatorRef.current && rotatorRef.current.contains(e.target as Node)) {
      return;
    }
    if (connectionLineRef.current && connectionLineRef.current.contains(e.target as Node)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onSelect(position.id);
    setIsDragging(true);
  };
  
  // Prevent click events from bubbling after drag/rotate
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleRotatorMouseDown = (e: React.MouseEvent) => {
    if (!canMove) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect(position.id);
    setIsRotating(true);
  };
  
  // Scroll wheel to rotate (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    if (!canMove) return;
    e.preventDefault();
    e.stopPropagation();
    const rotationDelta = e.deltaY > 0 ? 15 : -15;
    let newRotation = position.rotation + rotationDelta;
    if (newRotation < 0) newRotation += 360;
    if (newRotation >= 360) newRotation -= 360;
    onRotationChange(position.id, newRotation);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && markerRef.current) {
        const rect = markerRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left - sizeW / 2;
          const y = e.clientY - rect.top - sizeH / 2;
          onPositionChange(position.id, x, y);
        }
      }
      
      if (isRotating && markerRef.current) {
        const rect = markerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let rotation = (angle * 180 / Math.PI) + 90;
        if (rotation < 0) rotation += 360;
        
        // Snap to 15° increments (hold Shift for free rotation)
        if (!e.shiftKey) {
          rotation = Math.round(rotation / 15) * 15;
        }
        
        onRotationChange(position.id, rotation);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(false);
      setIsRotating(false);
    };
    
    if (isDragging || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isRotating, position.id, onPositionChange, onRotationChange, sizeW, sizeH]);

  return (
    <div 
      ref={markerRef}
      style={{
        position: 'absolute',
        width: `${sizeW}px`,
        height: `${sizeH}px`,
        left: position.x,
        top: position.y,
        transform: `rotate(${position.rotation}deg)`,
        cursor: canMove ? 'move' : 'default',
        zIndex: isSelected ? 20 : 10,
        transition: isDragging || isRotating ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out, transform 0.15s ease',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onWheel={handleWheel}
      title={position.playerName || `Player ${position.jerseyNumber}`}
    >
      {/* Power wheelchair top-down SVG - exact 1:1 copy of BlueChair.png reference */}
      <svg 
        width={sizeW} 
        height={sizeH} 
        viewBox="0 0 200 120"
        style={{
          filter: isSelected 
            ? `drop-shadow(0 0 8px ${teamColorGlow})` 
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.4))`,
        }}
      >
        {/* Ball possession glow */}
        {position.hasBall && (
          <circle 
            cx="100" 
            cy="60" 
            r="65" 
            fill="none"
            stroke="rgba(255, 215, 0, 0.6)"
            strokeWidth="3"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
        
        {/* Main black chassis frame outline */}
        <rect 
          x="35" 
          y="15" 
          width="160" 
          height="90" 
          rx="8"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        
        {/* Top wheel */}
        <rect 
          x="55" 
          y="3" 
          width="55" 
          height="18" 
          rx="4"
          fill="#1a1a1a"
        />
        
        {/* Bottom wheel */}
        <rect 
          x="55" 
          y="99" 
          width="55" 
          height="18" 
          rx="4"
          fill="#1a1a1a"
        />
        
        {/* Main seat body - 60px wide */}
        <rect 
          x="45" 
          y="22" 
          width="60" 
          height="76" 
          rx="5"
          fill={teamColor}
          stroke={isSelected ? '#fff' : teamColorDark}
          strokeWidth={isSelected ? 3 : 2}
        />
        
        {/* Position letter inside seat */}
        <text
          x="75"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="42"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          transform={`rotate(${-position.rotation}, 75, 60)`}
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
        >
          {position.role}
        </text>
        
        {/* Right guard area with footrests inside - moved with footrests */}
        <rect 
          x="130" 
          y="22" 
          width="50" 
          height="76" 
          rx="4"
          fill="#333"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        {/* Footrests inside right guard - moved left by 25px total */}
        <rect 
          x="137" 
          y="28" 
          width="28" 
          height="22" 
          rx="3"
          fill={teamColor}
          stroke={teamColorDark}
          strokeWidth="2"
        />
        <rect 
          x="137" 
          y="70" 
          width="28" 
          height="22" 
          rx="3"
          fill={teamColor}
          stroke={teamColorDark}
          strokeWidth="2"
        />
      </svg>
      
      {/* Rotation handle */}
      {isSelected && canMove && (
        <div
          ref={rotatorRef}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            backgroundColor: '#fff',
            border: `2px solid ${teamColor}`,
            borderRadius: '50%',
            top: `-${rotatorDistance}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'grab',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 30,
          }}
          onMouseDown={handleRotatorMouseDown}
          onClick={handleClick}
        />
      )}
      
      {/* Connection line to rotation handle */}
      {isSelected && canMove && (
        <div
          ref={connectionLineRef}
          style={{
            position: 'absolute',
            width: '2px',
            height: `${rotatorDistance - 4}px`,
            backgroundColor: teamColor,
            top: `-${rotatorDistance - 8}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Action radius indicator (20px) - shows where ball path should start */}
      {position.action && position.action !== 'none' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px dashed rgba(245, 158, 11, 0.6)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            pointerEvents: 'none',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
          }}
        />
      )}
      
      {/* Action indicator */}
      {position.action && position.action !== 'none' && (
        <div
          style={{
            position: 'absolute',
            bottom: '-18px',
            left: '50%',
            transform: `translateX(-50%) rotate(-${position.rotation}deg)`,
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#f59e0b',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}
        >
          {position.action === 'spin_left' && '↺ SPIN'}
          {position.action === 'spin_right' && '↻ SPIN'}
          {position.action === 'punch_pass' && '→ PUNCH'}
          {position.action === 'side_left' && '← SIDE'}
          {position.action === 'side_right' && '→ SIDE'}
        </div>
      )}
    </div>
  );
};

export default PowerSoccerPlayerMarker;
