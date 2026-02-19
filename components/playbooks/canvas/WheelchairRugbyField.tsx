"use client";

import React from 'react';

interface PowerSoccerFieldProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
}

export const PowerSoccerField = ({
  width = 900,
  height = 500,
  showGrid = false,
}: PowerSoccerFieldProps) => {
  // Fill the entire container - no padding
  // The field will stretch to fill the canvas
  const courtWidth = width;
  const courtHeight = height;
  const offsetX = 0;
  const offsetY = 0;
  
  // Goal area - proportional to field (roughly 20% width, 50% height)
  const goalAreaDepth = courtWidth * 0.18;
  const goalAreaHeight = courtHeight * 0.5;
  
  // Penalty mark position (inside goal area, roughly 1/3 from goal line)
  const penaltyMarkX = goalAreaDepth * 0.6;
  
  // Goal dimensions - small red rectangles on goal line
  const goalPostWidth = 12;
  const goalPostHeight = courtHeight * 0.35;
  
  // Corner pole size
  const poleSize = 10;
  
  // X mark size for penalty spots
  const xMarkSize = 6;
  
  // Line positions
  const centerX = courtWidth / 2;
  const centerY = courtHeight / 2;
  
  return (
    <svg 
      width={width} 
      height={height} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        pointerEvents: 'none',
      }}
    >
      {/* Wood grain pattern definition */}
      <defs>
        <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="200" height="12">
          <rect width="200" height="12" fill="#c4956a"/>
          <rect y="0" width="200" height="2" fill="#b8845a" opacity="0.4"/>
          <rect y="4" width="200" height="1" fill="#d4a574" opacity="0.3"/>
          <rect y="7" width="200" height="1.5" fill="#a67748" opacity="0.35"/>
          <rect y="10" width="200" height="1" fill="#d4a574" opacity="0.25"/>
        </pattern>
        <pattern id="woodPlanks" patternUnits="userSpaceOnUse" width="200" height="60">
          <rect width="200" height="60" fill="url(#woodGrain)"/>
          <line x1="0" y1="0" x2="200" y2="0" stroke="#8b6240" strokeWidth="0.5" opacity="0.4"/>
          <line x1="0" y1="60" x2="200" y2="60" stroke="#8b6240" strokeWidth="0.5" opacity="0.4"/>
        </pattern>
        <linearGradient id="courtSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08"/>
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      
      {/* Wooden court background */}
      <rect 
        x={offsetX} 
        y={offsetY} 
        width={courtWidth} 
        height={courtHeight} 
        fill="url(#woodPlanks)"
      />
      {/* Court sheen overlay */}
      <rect 
        x={offsetX} 
        y={offsetY} 
        width={courtWidth} 
        height={courtHeight} 
        fill="url(#courtSheen)"
      />
      {/* Court border */}
      <rect 
        x={offsetX} 
        y={offsetY} 
        width={courtWidth} 
        height={courtHeight} 
        fill="none"
        stroke="#ffffff" 
        strokeWidth="3"
      />
      
      {/* Left goal area - white outline only */}
      <rect 
        x={offsetX} 
        y={(courtHeight - goalAreaHeight) / 2} 
        width={goalAreaDepth} 
        height={goalAreaHeight} 
        fill="none"
        stroke="#ffffff" 
        strokeWidth="2"
      />
      
      {/* Right goal area - white outline only */}
      <rect 
        x={courtWidth - goalAreaDepth} 
        y={(courtHeight - goalAreaHeight) / 2} 
        width={goalAreaDepth} 
        height={goalAreaHeight} 
        fill="none"
        stroke="#ffffff" 
        strokeWidth="2"
      />
      
      {/* Center/Halfway line - white */}
      <line 
        x1={centerX} 
        y1={offsetY} 
        x2={centerX} 
        y2={courtHeight}
        stroke="#ffffff" 
        strokeWidth="2"
      />
      
      {/* Left penalty mark - black X */}
      <g>
        <line 
          x1={penaltyMarkX - xMarkSize} 
          y1={centerY - xMarkSize} 
          x2={penaltyMarkX + xMarkSize} 
          y2={centerY + xMarkSize}
          stroke="#1a1a1a" 
          strokeWidth="2"
        />
        <line 
          x1={penaltyMarkX + xMarkSize} 
          y1={centerY - xMarkSize} 
          x2={penaltyMarkX - xMarkSize} 
          y2={centerY + xMarkSize}
          stroke="#1a1a1a" 
          strokeWidth="2"
        />
      </g>
      
      {/* Right penalty mark - black X */}
      <g>
        <line 
          x1={courtWidth - penaltyMarkX - xMarkSize} 
          y1={centerY - xMarkSize} 
          x2={courtWidth - penaltyMarkX + xMarkSize} 
          y2={centerY + xMarkSize}
          stroke="#1a1a1a" 
          strokeWidth="2"
        />
        <line 
          x1={courtWidth - penaltyMarkX + xMarkSize} 
          y1={centerY - xMarkSize} 
          x2={courtWidth - penaltyMarkX - xMarkSize} 
          y2={centerY + xMarkSize}
          stroke="#1a1a1a" 
          strokeWidth="2"
        />
      </g>
      
      {/* Left goal posts - red horizontal lines inside goal area */}
      <line 
        x1={0} 
        y1={(courtHeight - goalAreaHeight) / 2 + 40} 
        x2={20} 
        y2={(courtHeight - goalAreaHeight) / 2 + 40}
        stroke="#dc2626" 
        strokeWidth="3"
      />
      <line 
        x1={0} 
        y1={(courtHeight + goalAreaHeight) / 2 - 40} 
        x2={20} 
        y2={(courtHeight + goalAreaHeight) / 2 - 40}
        stroke="#dc2626" 
        strokeWidth="3"
      />
      
      {/* Right goal posts - red horizontal lines inside goal area */}
      <line 
        x1={courtWidth - 20} 
        y1={(courtHeight - goalAreaHeight) / 2 + 40} 
        x2={courtWidth} 
        y2={(courtHeight - goalAreaHeight) / 2 + 40}
        stroke="#dc2626" 
        strokeWidth="3"
      />
      <line 
        x1={courtWidth - 20} 
        y1={(courtHeight + goalAreaHeight) / 2 - 40} 
        x2={courtWidth} 
        y2={(courtHeight + goalAreaHeight) / 2 - 40}
        stroke="#dc2626" 
        strokeWidth="3"
      />
      
      {/* Corner diagonal lines - white */}
      {/* Top-left corner */}
      <line 
        x1={0} 
        y1={40} 
        x2={40} 
        y2={0}
        stroke="#ffffff" 
        strokeWidth="2"
      />
      {/* Top-right corner */}
      <line 
        x1={courtWidth - 40} 
        y1={0} 
        x2={courtWidth} 
        y2={40}
        stroke="#ffffff" 
        strokeWidth="2"
      />
      {/* Bottom-left corner */}
      <line 
        x1={0} 
        y1={courtHeight - 40} 
        x2={40} 
        y2={courtHeight}
        stroke="#ffffff" 
        strokeWidth="2"
      />
      {/* Bottom-right corner */}
      <line 
        x1={courtWidth - 40} 
        y1={courtHeight} 
        x2={courtWidth} 
        y2={courtHeight - 40}
        stroke="#ffffff" 
        strokeWidth="2"
      />
      
      {/* Optional grid overlay */}
      {showGrid && (
        <g opacity="0.2">
          {/* Vertical grid lines */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(courtWidth / 12) * (i + 1)}
              y1={0}
              x2={(courtWidth / 12) * (i + 1)}
              y2={courtHeight}
              stroke="#999"
              strokeWidth="1"
            />
          ))}
          {/* Horizontal grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(courtHeight / 6) * (i + 1)}
              x2={courtWidth}
              y2={(courtHeight / 6) * (i + 1)}
              stroke="#999"
              strokeWidth="1"
            />
          ))}
        </g>
      )}
    </svg>
  );
};

export default PowerSoccerField;
