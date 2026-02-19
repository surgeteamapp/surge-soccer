"use client";

import { useState, useRef, useEffect } from 'react';
import { Pencil, Circle as CircleIcon, Square, ArrowRight, Trash2, Save } from 'lucide-react';

type DrawingMode = 'pen' | 'arrow' | 'circle' | 'rectangle' | 'none';

type DrawingPoint = {
  x: number;
  y: number;
};

type DrawingLine = {
  points: DrawingPoint[];
  color: string;
  width: number;
  type: 'pen' | 'arrow';
};

type DrawingCircle = {
  x: number;
  y: number;
  radius: number;
  color: string;
  width: number;
};

type DrawingRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  lineWidth: number;
};

interface DrawingData {
  lines: DrawingLine[];
  circles: DrawingCircle[];
  rectangles: DrawingRectangle[];
}

interface VideoDrawingCanvasProps {
  width: number;
  height: number;
  initialDrawingData?: DrawingData;
  onSave: (drawingData: DrawingData) => void;
  onClose: () => void;
  isReadOnly?: boolean;
}

export function VideoDrawingCanvas({
  width,
  height,
  initialDrawingData,
  onSave,
  onClose,
  isReadOnly = false,
}: VideoDrawingCanvasProps) {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drawing state
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff0000'); // Red
  const [lineWidth, setLineWidth] = useState(3);
  
  // Drawing elements
  const [lines, setLines] = useState<DrawingLine[]>(initialDrawingData?.lines || []);
  const [circles, setCircles] = useState<DrawingCircle[]>(initialDrawingData?.circles || []);
  const [rectangles, setRectangles] = useState<DrawingRectangle[]>(initialDrawingData?.rectangles || []);
  
  // Current drawing state
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [currentCircle, setCurrentCircle] = useState<DrawingCircle | null>(null);
  const [currentRectangle, setCurrentRectangle] = useState<DrawingRectangle | null>(null);
  const [startPoint, setStartPoint] = useState<DrawingPoint | null>(null);
  
  // Available colors
  const colorOptions = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ffffff', // White
  ];
  
  // Draw all elements on canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw all lines
    lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.moveTo(line.points[0].x, line.points[0].y);
      
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      
      ctx.stroke();
      
      // Draw arrow if needed
      if (line.type === 'arrow' && line.points.length >= 2) {
        const lastPoint = line.points[line.points.length - 1];
        const prevPoint = line.points[line.points.length - 2];
        
        // Calculate angle
        const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);
        
        // Arrow head size
        const headLength = 15;
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(
          lastPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          lastPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(
          lastPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          lastPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
    
    // Draw current line if exists
    if (currentLine && currentLine.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = currentLine.color;
      ctx.lineWidth = currentLine.width;
      ctx.moveTo(currentLine.points[0].x, currentLine.points[0].y);
      
      for (let i = 1; i < currentLine.points.length; i++) {
        ctx.lineTo(currentLine.points[i].x, currentLine.points[i].y);
      }
      
      ctx.stroke();
      
      // Draw arrow if needed
      if (currentLine.type === 'arrow' && currentLine.points.length >= 2) {
        const lastPoint = currentLine.points[currentLine.points.length - 1];
        const prevPoint = currentLine.points[currentLine.points.length - 2];
        
        // Calculate angle
        const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);
        
        // Arrow head size
        const headLength = 15;
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(
          lastPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          lastPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(
          lastPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          lastPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }
    
    // Draw all circles
    circles.forEach(circle => {
      ctx.beginPath();
      ctx.strokeStyle = circle.color;
      ctx.lineWidth = circle.width;
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Draw current circle if exists
    if (currentCircle) {
      ctx.beginPath();
      ctx.strokeStyle = currentCircle.color;
      ctx.lineWidth = currentCircle.width;
      ctx.arc(currentCircle.x, currentCircle.y, currentCircle.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw all rectangles
    rectangles.forEach(rect => {
      ctx.beginPath();
      ctx.strokeStyle = rect.color;
      ctx.lineWidth = rect.lineWidth;
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.stroke();
    });
    
    // Draw current rectangle if exists
    if (currentRectangle) {
      ctx.beginPath();
      ctx.strokeStyle = currentRectangle.color;
      ctx.lineWidth = currentRectangle.lineWidth;
      ctx.rect(
        currentRectangle.x,
        currentRectangle.y,
        currentRectangle.width,
        currentRectangle.height
      );
      ctx.stroke();
    }
  };
  
  // Draw canvas whenever drawing elements change
  useEffect(() => {
    drawCanvas();
  }, [lines, circles, rectangles, currentLine, currentCircle, currentRectangle]);
  
  // Handle initial drawing data
  useEffect(() => {
    if (initialDrawingData) {
      setLines(initialDrawingData.lines || []);
      setCircles(initialDrawingData.circles || []);
      setRectangles(initialDrawingData.rectangles || []);
    }
  }, [initialDrawingData]);
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly || drawingMode === 'none') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const point = { x, y };
    setStartPoint(point);
    
    if (drawingMode === 'pen') {
      const newLine: DrawingLine = {
        points: [point],
        color,
        width: lineWidth,
        type: 'pen',
      };
      setCurrentLine(newLine);
    } else if (drawingMode === 'arrow') {
      const newLine: DrawingLine = {
        points: [point],
        color,
        width: lineWidth,
        type: 'arrow',
      };
      setCurrentLine(newLine);
    } else if (drawingMode === 'circle') {
      setCurrentCircle({
        x,
        y,
        radius: 0,
        color,
        width: lineWidth,
      });
    } else if (drawingMode === 'rectangle') {
      setCurrentRectangle({
        x,
        y,
        width: 0,
        height: 0,
        color,
        lineWidth,
      });
    }
  };
  
  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly || !isDrawing || drawingMode === 'none') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (drawingMode === 'pen' || drawingMode === 'arrow') {
      if (currentLine) {
        setCurrentLine({
          ...currentLine,
          points: [...currentLine.points, { x, y }],
        });
      }
    } else if (drawingMode === 'circle' && startPoint && currentCircle) {
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      
      setCurrentCircle({
        ...currentCircle,
        radius,
      });
    } else if (drawingMode === 'rectangle' && startPoint && currentRectangle) {
      setCurrentRectangle({
        ...currentRectangle,
        width: x - startPoint.x,
        height: y - startPoint.y,
      });
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    if (isReadOnly || !isDrawing || drawingMode === 'none') return;
    
    setIsDrawing(false);
    
    if (drawingMode === 'pen' || drawingMode === 'arrow') {
      if (currentLine && currentLine.points.length > 1) {
        setLines([...lines, currentLine]);
      }
      setCurrentLine(null);
    } else if (drawingMode === 'circle') {
      if (currentCircle && currentCircle.radius > 0) {
        setCircles([...circles, currentCircle]);
      }
      setCurrentCircle(null);
    } else if (drawingMode === 'rectangle') {
      if (currentRectangle && (currentRectangle.width !== 0 || currentRectangle.height !== 0)) {
        setRectangles([...rectangles, currentRectangle]);
      }
      setCurrentRectangle(null);
    }
    
    setStartPoint(null);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    handleMouseUp();
  };
  
  // Handle save
  const handleSave = () => {
    onSave({
      lines,
      circles,
      rectangles,
    });
  };
  
  // Handle clear
  const handleClear = () => {
    setLines([]);
    setCircles([]);
    setRectangles([]);
    setCurrentLine(null);
    setCurrentCircle(null);
    setCurrentRectangle(null);
    setStartPoint(null);
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col">
      {/* Canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`absolute top-0 left-0 z-10 ${isReadOnly ? '' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      
      {/* Toolbar */}
      {!isReadOnly && (
        <div className="flex items-center justify-between p-2 bg-gray-900/70 mt-2 rounded-md">
          {/* Drawing tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setDrawingMode('pen')}
              className={`p-1 rounded-md ${
                drawingMode === 'pen' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Pen"
            >
              <Pencil className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setDrawingMode('arrow')}
              className={`p-1 rounded-md ${
                drawingMode === 'arrow' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Arrow"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setDrawingMode('circle')}
              className={`p-1 rounded-md ${
                drawingMode === 'circle' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Circle"
            >
              <CircleIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setDrawingMode('rectangle')}
              className={`p-1 rounded-md ${
                drawingMode === 'rectangle' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Rectangle"
            >
              <Square className="h-5 w-5" />
            </button>
          </div>
          
          {/* Color selector */}
          <div className="flex items-center space-x-1">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full ${
                  color === c ? 'ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: c }}
                title={`Color: ${c}`}
              />
            ))}
          </div>
          
          {/* Line width selector */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setLineWidth(1)}
              className={`p-1 rounded-md ${
                lineWidth === 1 ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Thin"
            >
              <div className="w-5 h-1 bg-white"></div>
            </button>
            
            <button
              onClick={() => setLineWidth(3)}
              className={`p-1 rounded-md ${
                lineWidth === 3 ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Medium"
            >
              <div className="w-5 h-3 bg-white"></div>
            </button>
            
            <button
              onClick={() => setLineWidth(5)}
              className={`p-1 rounded-md ${
                lineWidth === 5 ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              title="Thick"
            >
              <div className="w-5 h-5 bg-white"></div>
            </button>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleClear}
              className="p-1 rounded-md text-red-300 hover:bg-gray-800"
              title="Clear"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSave}
              className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              title="Save"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
