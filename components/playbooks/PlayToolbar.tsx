"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { 
  MousePointer2, 
  UserRound, 
  UserPlus, 
  Minus, 
  Pencil, 
  Type, 
  Play, 
  RotateCw, 
  Trash2, 
  Copy, 
  AlignLeft, 
  AlignCenter,
  AlignRight, 
  Save, 
  Undo, 
  Redo,
  ChevronDown
} from "lucide-react";

export type ToolType = 
  | 'select' 
  | 'addPlayerTeam' 
  | 'addPlayerOpponent' 
  | 'line' 
  | 'dashed'
  | 'arrow' 
  | 'text' 
  | 'animate'
  | 'delete';

interface PlayToolbarProps {
  activeTool: ToolType;
  canRedo: boolean;
  canUndo: boolean;
  onToolSelect: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLineWidthChange: (width: number) => void;
  onLineColorChange: (color: string) => void;
  onLineDashedToggle: (dashed: boolean) => void;
  onTextColorChange: (color: string) => void;
  onTextSizeChange: (size: number) => void;
  onAnimationSpeedChange: (speed: number) => void;
  onPlay: () => void;
  disableSave?: boolean;
}

export const PlayToolbar = ({
  activeTool,
  canRedo,
  canUndo,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onDelete,
  onDuplicate,
  onLineWidthChange,
  onLineColorChange,
  onLineDashedToggle,
  onTextColorChange,
  onTextSizeChange,
  onAnimationSpeedChange,
  onPlay,
  disableSave = false
}: PlayToolbarProps) => {
  const [activeTab, setActiveTab] = useState<string>("draw");
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState("#2196F3");
  const [lineDashed, setLineDashed] = useState(false);
  const [textSize, setTextSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Common colors
  const colors = [
    "#2196F3", // Blue
    "#FF5722", // Orange
    "#4CAF50", // Green
    "#F44336", // Red
    "#9C27B0", // Purple
    "#FFEB3B", // Yellow
    "#000000", // Black
    "#757575"  // Gray
  ];
  
  // Handler for line width change
  const handleLineWidthChange = (value: number[]) => {
    const width = value[0];
    setLineWidth(width);
    onLineWidthChange(width);
  };
  
  // Handler for line color change
  const handleLineColorChange = (color: string) => {
    setLineColor(color);
    onLineColorChange(color);
  };
  
  // Handler for line dashed toggle
  const handleLineDashedToggle = () => {
    setLineDashed(!lineDashed);
    onLineDashedToggle(!lineDashed);
  };
  
  // Handler for text size change
  const handleTextSizeChange = (value: number[]) => {
    const size = value[0];
    setTextSize(size);
    onTextSizeChange(size);
  };
  
  // Handler for text color change
  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    onTextColorChange(color);
  };
  
  // Handler for animation speed change
  const handleAnimationSpeedChange = (value: number[]) => {
    const speed = value[0];
    setAnimationSpeed(speed);
    onAnimationSpeedChange(speed);
  };

  return (
    <div className="p-2 bg-white border-b border-gray-200 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="animate">Animate</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={!canUndo}
                  onClick={onUndo}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={!canRedo}
                  onClick={onRedo}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onPlay}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Play Animation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={disableSave}
                  onClick={onSave}
                  className="ml-2"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Changes</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Draw Tab Content */}
      {activeTab === "draw" && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'select' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('select')}
                >
                  <MousePointer2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select Tool</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'addPlayerTeam' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('addPlayerTeam')}
                >
                  <UserRound className="h-4 w-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Team Player</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'addPlayerOpponent' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('addPlayerOpponent')}
                >
                  <UserPlus className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Opponent Player</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'line' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('line')}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw Line</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'arrow' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('arrow')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw Arrow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'text' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('text')}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Text</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="border-r h-8 mx-1"></div>
          
          {(activeTool === 'line' || activeTool === 'arrow') && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-8 h-8 p-0">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: lineColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <Button
                        key={color}
                        variant="outline"
                        className="w-8 h-8 p-0"
                        onClick={() => handleLineColorChange(color)}
                      >
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="w-32">
                <Slider
                  value={[lineWidth]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={handleLineWidthChange}
                />
              </div>
              
              <Toggle
                pressed={lineDashed}
                onPressedChange={handleLineDashedToggle}
                size="sm"
              >
                Dashed
              </Toggle>
            </>
          )}
          
          {activeTool === 'text' && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-8 h-8 p-0">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: textColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <Button
                        key={color}
                        variant="outline"
                        className="w-8 h-8 p-0"
                        onClick={() => handleTextColorChange(color)}
                      >
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="w-32">
                <Slider
                  value={[textSize]}
                  min={10}
                  max={24}
                  step={2}
                  onValueChange={handleTextSizeChange}
                />
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Edit Tab Content */}
      {activeTab === "edit" && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Selected</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'delete' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Tool</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="border-r h-8 mx-1"></div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDelete}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}
      
      {/* Animate Tab Content */}
      {activeTab === "animate" && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeTool === 'animate' ? 'secondary' : 'ghost'} 
                  size="icon"
                  onClick={() => onToolSelect('animate')}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Animate Object</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="border-r h-8 mx-1"></div>
          
          <div className="flex items-center">
            <span className="text-sm mr-2">Speed:</span>
            <div className="w-32">
              <Slider
                value={[animationSpeed]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handleAnimationSpeedChange}
              />
            </div>
            <span className="text-sm ml-2">{animationSpeed.toFixed(1)}x</span>
          </div>
          
          <div className="border-r h-8 mx-1"></div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onPlay}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Play Animation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
