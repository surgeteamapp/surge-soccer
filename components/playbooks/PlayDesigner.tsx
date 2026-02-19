"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlayView, PlayVersion, Play, usePlaybooks } from '@/hooks/usePlaybooks';
import { PlayToolbar, ToolType } from './PlayToolbar';
import { PlayDesignerCanvas } from './canvas/PlayDesignerCanvas';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PlusCircle, Save, FileSymlink, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PlayDesignerProps {
  playId: string;
  versionId?: string;
  readOnly?: boolean;
}

export const PlayDesigner = ({ 
  playId, 
  versionId,
  readOnly = false 
}: PlayDesignerProps) => {
  const router = useRouter();
  const { 
    getPlayById, 
    getCurrentVersion, 
    createPlayVersion, 
    updatePlayView 
  } = usePlaybooks();
  const { toast } = useToast();
  
  // Get the play data
  const play = getPlayById(playId);
  
  // State
  const [selectedVersionId, setSelectedVersionId] = useState<string>(versionId || (play?.currentVersionId || ''));
  const [selectedVersion, setSelectedVersion] = useState<PlayVersion | undefined>(undefined);
  const [activeViewId, setActiveViewId] = useState<string>('');
  const [activeView, setActiveView] = useState<PlayView | undefined>(undefined);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [viewName, setViewName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // History for undo/redo
  const historyRef = useRef<PlayView[]>([]);
  const currentHistoryIndexRef = useRef(-1);
  
  // Load selected version
  useEffect(() => {
    if (play) {
      let version: PlayVersion | undefined;
      
      if (selectedVersionId) {
        version = play.versions.find(v => v.id === selectedVersionId);
      }
      
      if (!version) {
        // Fallback to current version
        version = getCurrentVersion(play);
      }
      
      setSelectedVersion(version);
      
      if (version && version.views.length > 0) {
        // Find initial view or use first view
        const initialView = version.views.find(v => v.isInitialView) || version.views[0];
        setActiveViewId(initialView.id);
        setActiveView(initialView);
        setViewName(initialView.name);
        
        // Reset history
        historyRef.current = [{ ...initialView }];
        currentHistoryIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
      }
    }
  }, [play, selectedVersionId, getCurrentVersion]);
  
  // Save view name change
  const handleViewNameChange = () => {
    if (!activeView || activeView.name === viewName || !play || readOnly) return;
    
    const updatedView = { ...activeView, name: viewName };
    
    // Add to history
    addToHistory(updatedView);
    
    // Update view in state
    setActiveView(updatedView);
    setHasUnsavedChanges(true);
  };
  
  // Handle view selection
  const handleViewSelect = (viewId: string) => {
    if (!selectedVersion) return;
    
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Do you want to continue without saving?')) {
        return;
      }
    }
    
    const view = selectedVersion.views.find(v => v.id === viewId);
    if (view) {
      setActiveViewId(viewId);
      setActiveView(view);
      setViewName(view.name);
      
      // Reset history
      historyRef.current = [{ ...view }];
      currentHistoryIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      
      setHasUnsavedChanges(false);
    }
  };
  
  // Create new view
  const createNewView = () => {
    if (!selectedVersion || !play || readOnly) return;
    
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Do you want to continue without saving?')) {
        return;
      }
    }
    
    // Create a new empty view
    const newView: PlayView = {
      id: `view-new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `View ${selectedVersion.views.length + 1}`,
      positions: [],
      lines: [],
      texts: [],
      animations: [],
      isInitialView: false
    };
    
    // Update version with new view
    const updatedViews = [...selectedVersion.views, newView];
    const updatedVersion = { ...selectedVersion, views: updatedViews };
    
    // Update version in state
    setSelectedVersion(updatedVersion);
    
    // Set as active view
    setActiveViewId(newView.id);
    setActiveView(newView);
    setViewName(newView.name);
    
    // Reset history
    historyRef.current = [{ ...newView }];
    currentHistoryIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    
    setHasUnsavedChanges(true);
  };
  
  // Create new version
  const createNewVersion = async () => {
    if (!play || readOnly) return;
    
    try {
      // Check for unsaved changes
      if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Do you want to save before creating a new version?')) {
          return;
        }
        await saveChanges();
      }
      
      // Create new version
      const newVersion = await createPlayVersion(playId, {
        name: `Version ${play.versions.length + 1}`,
        basedOnVersionId: selectedVersionId
      });
      
      // Switch to new version
      setSelectedVersionId(newVersion.id);
      toast({
        title: "Success",
        description: "New version created successfully",
      });
    } catch (error) {
      console.error("Failed to create new version:", error);
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      });
    }
  };
  
  // Save changes
  const saveChanges = async () => {
    if (!activeView || !selectedVersion || !play || readOnly) return;
    
    try {
      await updatePlayView(playId, selectedVersionId, activeViewId, activeView);
      
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };
  
  // Handle view changes
  const handleViewChange = (updates: Partial<PlayView>) => {
    if (!activeView || readOnly) return;
    
    const updatedView = { ...activeView, ...updates };
    
    // Add to history
    addToHistory(updatedView);
    
    // Update view in state
    setActiveView(updatedView);
    setHasUnsavedChanges(true);
  };
  
  // Add to history
  const addToHistory = (view: PlayView) => {
    // Remove any future states if we're in the middle of the history
    if (currentHistoryIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentHistoryIndexRef.current + 1);
    }
    
    // Add new state
    historyRef.current.push({ ...view });
    
    // Cap history length to prevent memory issues
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    } else {
      currentHistoryIndexRef.current++;
    }
    
    // Update undo/redo state
    setCanUndo(currentHistoryIndexRef.current > 0);
    setCanRedo(false);
  };
  
  // Undo
  const handleUndo = () => {
    if (currentHistoryIndexRef.current <= 0 || readOnly) return;
    
    currentHistoryIndexRef.current--;
    const previousState = historyRef.current[currentHistoryIndexRef.current];
    
    setActiveView({ ...previousState });
    setHasUnsavedChanges(true);
    
    // Update undo/redo state
    setCanUndo(currentHistoryIndexRef.current > 0);
    setCanRedo(currentHistoryIndexRef.current < historyRef.current.length - 1);
  };
  
  // Redo
  const handleRedo = () => {
    if (currentHistoryIndexRef.current >= historyRef.current.length - 1 || readOnly) return;
    
    currentHistoryIndexRef.current++;
    const nextState = historyRef.current[currentHistoryIndexRef.current];
    
    setActiveView({ ...nextState });
    setHasUnsavedChanges(true);
    
    // Update undo/redo state
    setCanUndo(currentHistoryIndexRef.current > 0);
    setCanRedo(currentHistoryIndexRef.current < historyRef.current.length - 1);
  };
  
  // Play animation
  const handlePlay = () => {
    setIsAnimating(!isAnimating);
  };
  
  // If play not found
  if (!play) {
    return <div className="p-4">Play not found</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{play.name}</h2>
            <p className="text-gray-500 text-sm">{play.category} - {play.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <Button variant="outline" onClick={createNewVersion}>
                  <FileSymlink className="h-4 w-4 mr-2" />
                  New Version
                </Button>
                
                <Button 
                  variant="default" 
                  onClick={saveChanges}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select
              value={selectedVersionId}
              onValueChange={setSelectedVersionId}
              disabled={readOnly || play.versions.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {play.versions.map(version => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border-r h-8"></div>
          
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={activeViewId}
                onValueChange={handleViewSelect}
                disabled={!selectedVersion || selectedVersion.views.length <= 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  {selectedVersion?.views.map(view => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                onBlur={handleViewNameChange}
                placeholder="View name"
                disabled={readOnly || !activeView}
                className="w-64"
              />
              
              {!readOnly && (
                <Button
                  variant="outline"
                  onClick={createNewView}
                  disabled={!selectedVersion}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New View
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toolbar */}
      {!readOnly && activeView && (
        <PlayToolbar
          activeTool={activeTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onToolSelect={setActiveTool}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={saveChanges}
          onDelete={() => {}} // TODO: Implement delete selected
          onDuplicate={() => {}} // TODO: Implement duplicate selected
          onLineWidthChange={() => {}} // TODO: Implement line width change
          onLineColorChange={() => {}} // TODO: Implement line color change
          onLineDashedToggle={() => {}} // TODO: Implement line dashed toggle
          onTextColorChange={() => {}} // TODO: Implement text color change
          onTextSizeChange={() => {}} // TODO: Implement text size change
          onAnimationSpeedChange={setAnimationSpeed}
          onPlay={handlePlay}
          disableSave={!hasUnsavedChanges}
        />
      )}
      
      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        {activeView ? (
          <PlayDesignerCanvas
            playView={activeView}
            activeTool={activeTool}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            canEdit={!readOnly}
            onViewChange={handleViewChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a view to edit</p>
          </div>
        )}
      </div>
    </div>
  );
};
