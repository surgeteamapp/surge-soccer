"use client";

import React, { useState, useRef, useEffect } from 'react';

export interface BallPosition {
  x: number;
  y: number;
  holderId?: string; // Player ID if ball is being held
}

interface BallMarkerProps {
  position: BallPosition;
  isSelected: boolean;
  canMove: boolean;
  onSelect: () => void;
  onPositionChange: (x: number, y: number) => void;
  onPathDragStart?: (startX: number, startY: number) => void;
  onPathDragMove?: (endX: number, endY: number) => void;
  onPathDragEnd?: (endX: number, endY: number) => void;
}

export const BallMarker = ({
  position,
  isSelected,
  canMove,
  onSelect,
  onPositionChange,
  onPathDragStart,
  onPathDragMove,
  onPathDragEnd,
}: BallMarkerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  
  // Store callbacks in refs to avoid stale closures in useEffect
  const onPositionChangeRef = useRef(onPositionChange);
  const onPathDragMoveRef = useRef(onPathDragMove);
  const onPathDragEndRef = useRef(onPathDragEnd);
  onPositionChangeRef.current = onPositionChange;
  onPathDragMoveRef.current = onPathDragMove;
  onPathDragEndRef.current = onPathDragEnd;
  
  const size = 20;
  
  // Drag from ball creates a ball path (not moves the ball)
  const isPathMode = !!(onPathDragStart && onPathDragMove && onPathDragEnd);
  const isPathModeRef = useRef(isPathMode);
  isPathModeRef.current = isPathMode;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canMove) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    
    // If in path mode, start path creation from ball center
    if (isPathMode && markerRef.current) {
      const ballCenterX = position.x + size / 2;
      const ballCenterY = position.y + size / 2;
      onPathDragStart(ballCenterX, ballCenterY);
    }
  };
  
  // Expanded bounds - ball can go outside canvas but stays within parent container padding
  const expandedPadding = 24; // PlayDesignerNew padding
  const canvasWidth = 900;
  const canvasHeight = 500;
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && markerRef.current) {
        const rect = markerRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          
          // Constrain to canvas bounds
          x = Math.max(0, Math.min(canvasWidth, x));
          y = Math.max(0, Math.min(canvasHeight, y));
          
          if (isPathModeRef.current && onPathDragMoveRef.current) {
            // Path mode: report endpoint for path preview
            onPathDragMoveRef.current(x, y);
          } else if (onPositionChangeRef.current) {
            // Legacy mode: move the ball
            const ballX = x - size / 2;
            const ballY = y - size / 2;
            onPositionChangeRef.current(
              Math.max(-expandedPadding, Math.min(canvasWidth + expandedPadding - size, ballX)),
              Math.max(-expandedPadding, Math.min(canvasHeight + expandedPadding - size, ballY))
            );
          }
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && isPathModeRef.current && onPathDragEndRef.current && markerRef.current) {
        const rect = markerRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          x = Math.max(0, Math.min(canvasWidth, x));
          y = Math.max(0, Math.min(canvasHeight, y));
          onPathDragEndRef.current(x, y);
        }
      }
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size]);

  return (
    <div 
      ref={markerRef}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: position.x,
        top: position.y,
        cursor: canMove ? (isPathMode ? 'crosshair' : 'move') : 'default',
        zIndex: isDragging ? 9999 : 15,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isPathMode ? "Drag to create ball path" : "Ball"}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="-2500 -2500 5000 5000"
        style={{
          filter: isSelected 
            ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' 
            : isHovered && isPathMode
              ? 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.9))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          transition: 'filter 0.15s ease',
        }}
      >
        {/* Public domain soccer ball from Wikimedia Commons */}
        <g stroke={isSelected ? '#ffd700' : '#000'} strokeWidth={isSelected ? 48 : 24}>
          <circle fill="#fff" r="2376"/>
          <path fill="none" d="m-1643-1716 155 158m-550 2364c231 231 538 195 826 202m-524-2040c-491 351-610 1064-592 1060m1216-1008c-51 373 84 783 364 1220m-107-2289c157-157 466-267 873-329m-528 4112c-50 132-37 315-8 510m62-3883c282 32 792 74 1196 303m-404 2644c310 173 649 247 1060 180m-340-2008c-242 334-534 645-872 936m1109-2119c-111-207-296-375-499-534m1146 1281c100 3 197 44 290 141m-438 495c158 297 181 718 204 1140"/>
        </g>
        <path fill="#000" d="m-1624-1700c243-153 498-303 856-424 141 117 253 307 372 492-288 275-562 544-724 756-274-25-410-2-740-60 3-244 84-499 236-764zm2904-40c271 248 537 498 724 788-55 262-105 553-180 704-234-35-536-125-820-200-138-357-231-625-340-924 210-156 417-296 616-368zm-3273 3033a2376 2376 0 0 1-378-1392l59-7c54 342 124 674 311 928-36 179-2 323 51 458zm1197-1125c365 60 717 120 1060 180 106 333 120 667 156 1000-263 218-625 287-944 420-372-240-523-508-736-768 122-281 257-561 464-832zm3013 678a2376 2376 0 0 1-925 1147l-116-5c84-127 114-297 118-488 232-111 464-463 696-772 86 30 159 72 227 118zm-2287 1527a2376 2376 0 0 1-993-251c199 74 367 143 542 83 53 75 176 134 451 168z"/>
      </svg>
      
      {/* Selection ring */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            width: `${size + 8}px`,
            height: `${size + 8}px`,
            borderRadius: '50%',
            border: '2px dashed rgba(255, 215, 0, 0.8)',
            animation: 'spin 4s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default BallMarker;
