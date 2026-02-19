"use client";

import { useState, useRef, useEffect } from 'react';
import { PlayLine } from '@/hooks/usePlaybooks';

interface PlayLineDrawerProps {
  line: PlayLine;
  isSelected: boolean;
  canEdit: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onLineChange: (id: string, points: { x: number, y: number }[]) => void;
  onLineDelete: (id: string) => void;
}

export const PlayLineDrawer = ({
  line,
  isSelected,
  canEdit,
  scale = 1,
  onSelect,
  onLineChange,
  onLineDelete
}: PlayLineDrawerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle point dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activePoint !== null && svgRef.current && canEdit) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        
        const newPoints = [...line.points];
        newPoints[activePoint] = { x, y };
        onLineChange(line.id, newPoints);
      }
    };
    
    const handleMouseUp = () => {
      setActivePoint(null);
    };
    
    if (activePoint !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activePoint, line.id, line.points, onLineChange, canEdit, scale]);
  
  // Create the SVG path string from points
  const createPathString = () => {
    if (line.points.length < 2) return '';
    
    let path = `M ${line.points[0].x} ${line.points[0].y}`;
    for (let i = 1; i < line.points.length; i++) {
      path += ` L ${line.points[i].x} ${line.points[i].y}`;
    }
    return path;
  };
  
  // Create the arrow marker for the end of the path
  const arrowMarker = line.arrowEnd ? (
    <marker
      id={`arrowhead-${line.id}`}
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill={line.color} />
    </marker>
  ) : null;
  
  // Handle selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(line.id);
  };
  
  // Handle point selection for dragging
  const handlePointMouseDown = (index: number, e: React.MouseEvent) => {
    if (!canEdit) return;
    
    e.stopPropagation();
    setActivePoint(index);
    onSelect(line.id);
  };
  
  // Create control points for each point in the line
  const controlPoints = line.points.map((point, index) => (
    <circle
      key={`point-${index}`}
      cx={point.x}
      cy={point.y}
      r={5}
      fill={isSelected ? '#2196F3' : 'transparent'}
      stroke={isSelected ? '#2196F3' : 'transparent'}
      strokeWidth={2}
      style={{ 
        cursor: canEdit ? 'move' : 'default',
        display: isSelected ? 'block' : 'none' 
      }}
      onMouseDown={(e) => handlePointMouseDown(index, e)}
    />
  ));
  
  // Handle keypresses for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && (e.key === 'Delete' || e.key === 'Backspace') && canEdit) {
        onLineDelete(line.id);
      }
    };
    
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, onLineDelete, line.id, canEdit]);

  // Calculate the stroke-dasharray if line is dashed
  const dashArray = line.dashed ? `${line.width * 3} ${line.width * 2}` : undefined;

  return (
    <svg 
      ref={svgRef}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        cursor: canEdit && isHovered ? 'pointer' : 'default'
      }}
    >
      <defs>
        {arrowMarker}
      </defs>
      <path
        d={createPathString()}
        stroke={line.color}
        strokeWidth={line.width}
        strokeDasharray={dashArray}
        fill="none"
        markerEnd={line.arrowEnd ? `url(#arrowhead-${line.id})` : undefined}
        style={{ 
          pointerEvents: 'stroke',
          cursor: canEdit ? 'pointer' : 'default'
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {controlPoints}
    </svg>
  );
};
