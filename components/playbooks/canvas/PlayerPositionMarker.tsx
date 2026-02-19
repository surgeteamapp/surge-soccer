"use client";

import { useState, useRef, useEffect } from 'react';
import { PlayPosition } from '@/hooks/usePlaybooks';

interface PlayerPositionMarkerProps {
  position: PlayPosition;
  isSelected: boolean;
  canMove: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onRotationChange: (id: string, rotation: number) => void;
}

export const PlayerPositionMarker = ({
  position,
  isSelected,
  canMove,
  onSelect,
  onPositionChange,
  onRotationChange
}: PlayerPositionMarkerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  
  const size = 50; // Size of the marker in pixels
  const rotatorDistance = 30; // Distance of rotation handle from center
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canMove) return;
    
    e.stopPropagation();
    onSelect(position.id);
    setIsDragging(true);
  };
  
  const handleRotatorMouseDown = (e: React.MouseEvent) => {
    if (!canMove) return;
    
    e.stopPropagation();
    setIsRotating(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && markerRef.current) {
        const rect = markerRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          onPositionChange(position.id, x, y);
        }
      }
      
      if (isRotating && markerRef.current) {
        const rect = markerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate angle in radians
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        // Convert to degrees and ensure 0-360 range
        let rotation = (angle * 180 / Math.PI) + 90;
        if (rotation < 0) rotation += 360;
        
        onRotationChange(position.id, rotation);
      }
    };
    
    const handleMouseUp = () => {
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
  }, [isDragging, isRotating, position.id, onPositionChange, onRotationChange, size]);
  
  // Colors
  const teamColor = position.isOpponent ? '#FF5252' : '#4CAF50';
  const selectedBorderColor = '#2196F3';
  
  const markerStyle = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: position.x,
    top: position.y,
    backgroundColor: teamColor,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `rotate(${position.rotation}deg)`,
    border: isSelected ? `2px solid ${selectedBorderColor}` : 'none',
    cursor: canMove ? 'move' : 'default',
    zIndex: isSelected ? 10 : 1,
    transition: isDragging || isRotating ? 'none' : 'all 0.2s ease',
    userSelect: 'none',
  } as React.CSSProperties;
  
  const pointerStyle = {
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `16px solid ${teamColor}`,
    position: 'absolute',
    top: '-10px',
  } as React.CSSProperties;
  
  const numberStyle = {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    zIndex: 2,
  } as React.CSSProperties;
  
  const rotatorStyle = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: selectedBorderColor,
    borderRadius: '50%',
    top: `-${rotatorDistance}px`,
    cursor: 'pointer',
    display: isSelected && canMove ? 'block' : 'none',
  } as React.CSSProperties;

  return (
    <div 
      ref={markerRef}
      style={markerStyle}
      onMouseDown={handleMouseDown}
      title={position.playerName || `Player ${position.playerNumber || ''}`}
    >
      <div style={pointerStyle}></div>
      <span style={numberStyle}>
        {position.playerNumber || ''}
      </span>
      <div 
        ref={rotatorRef}
        style={rotatorStyle}
        onMouseDown={handleRotatorMouseDown}
      />
    </div>
  );
};
