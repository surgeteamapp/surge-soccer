import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Types for playbooks and plays
export interface PlayPosition {
  id: string;
  x: number;
  y: number;
  playerNumber?: number;
  playerName?: string;
  isOpponent: boolean;
  rotation: number;
}

export interface PlayLine {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  dashed: boolean;
  arrowEnd?: boolean;
}

export interface PlayText {
  id: string;
  x: number;
  y: number;
  content: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  width?: number;
  height?: number;
}

export interface PlayAnimation {
  positionId: string;
  keyframes: { time: number; x: number; y: number; rotation?: number }[];
}

export interface PlayView {
  id: string;
  name: string;
  positions: PlayPosition[];
  lines: PlayLine[];
  texts: PlayText[];
  animations: PlayAnimation[];
  isInitialView: boolean;
}

export interface PlayVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  views: PlayView[];
}

export interface Play {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  versions: PlayVersion[];
  currentVersionId: string;
}

export interface Playbook {
  id: string;
  name: string;
  description?: string;
  plays: Play[];
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Available play categories (enum values)
export const PlayCategories = [
  'DEFENSE',
  'CORNER_KICKS',
  'SIDE_OUTS',
  'GOAL_KICKS',
  'KICKOFFS',
  'INDIRECT',
  'DIRECT'
] as const;

// Display names for categories
export const PlayCategoryLabels: Record<string, string> = {
  'DEFENSE': 'Defense',
  'CORNER_KICKS': 'Corner Kicks',
  'SIDE_OUTS': 'Side Outs',
  'GOAL_KICKS': 'Goal Kicks',
  'KICKOFFS': 'Kickoffs',
  'INDIRECT': 'Indirect',
  'DIRECT': 'Direct'
};

export function usePlaybooks() {
  const { data: session } = useSession();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch playbooks from API
  const fetchPlaybooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/playbooks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch playbooks');
      }
      
      const data = await response.json();
      
      // Transform API data to match our Playbook interface
      const transformedPlaybooks: Playbook[] = (data.playbooks || []).map((pb: any) => ({
        id: pb.id,
        name: pb.name,
        description: pb.description,
        teamId: pb.teamId,
        createdAt: new Date(pb.createdAt),
        updatedAt: new Date(pb.updatedAt),
        plays: (pb.plays || []).map((play: any) => ({
          id: play.id,
          name: play.name,
          description: play.description,
          category: play.category,
          tags: play.tags || [],
          isPublished: play.isPublished,
          createdAt: new Date(play.createdAt),
          updatedAt: new Date(play.updatedAt),
          authorId: play.authorId,
          authorName: play.authorName,
          versions: (play.versions || []).map((v: any) => ({
            id: v.id,
            name: `Version ${v.versionNumber}`,
            description: v.notes,
            createdAt: new Date(v.createdAt),
            createdBy: play.authorId,
            createdByName: play.authorName,
            views: [], // Views are stored in positionData
          })),
          currentVersionId: play.currentVersionId,
        })),
      }));
      
      setPlaybooks(transformedPlaybooks);
      setAvailableTags(data.availableTags || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch playbooks:', err);
      setError('Failed to load playbooks. Please try again later.');
      setPlaybooks([]);
      setAvailableTags([]);
      setIsLoading(false);
    }
  };
  
  // Refetch function to refresh data
  const refetch = () => {
    if (session?.user) {
      fetchPlaybooks();
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchPlaybooks();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  // Get a playbook by id
  const getPlaybookById = (id: string): Playbook | undefined => {
    return playbooks.find(playbook => playbook.id === id);
  };
  
  // Get a play by id
  const getPlayById = (id: string): Play | undefined => {
    for (const playbook of playbooks) {
      const play = playbook.plays.find(p => p.id === id);
      if (play) return play;
    }
    return undefined;
  };
  
  // Get plays by category
  const getPlaysByCategory = (category: string): Play[] => {
    const result: Play[] = [];
    for (const playbook of playbooks) {
      const plays = playbook.plays.filter(p => p.category === category);
      result.push(...plays);
    }
    return result;
  };
  
  // Get plays by tag
  const getPlaysByTag = (tag: string): Play[] => {
    const result: Play[] = [];
    for (const playbook of playbooks) {
      const plays = playbook.plays.filter(p => p.tags.includes(tag));
      result.push(...plays);
    }
    return result;
  };
  
  // Get the current version of a play
  const getCurrentVersion = (play: Play): PlayVersion | undefined => {
    return play.versions.find(v => v.id === play.currentVersionId);
  };
  
  // Create a new play
  const createPlay = async (
    playbookId: string,
    playData: {
      name: string;
      description?: string;
      category: string;
      tags: string[];
    }
  ): Promise<Play> => {
    try {
      // In a real implementation, we would send this to the API
      // For now, we'll just simulate it
      
      // Find the playbook
      const playbookIndex = playbooks.findIndex(p => p.id === playbookId);
      if (playbookIndex === -1) {
        throw new Error(`Playbook with ID ${playbookId} not found`);
      }
      
      // Create the initial version
      const newVersionId = `version-new-${Date.now()}`;
      const newVersion: PlayVersion = {
        id: newVersionId,
        name: 'Version 1.0',
        createdAt: new Date(),
        createdBy: session?.user?.id || 'unknown',
        createdByName: session?.user?.name || 'Unknown User',
        views: [
          {
            id: `view-new-${Date.now()}`,
            name: 'Initial Setup',
            positions: [],
            lines: [],
            texts: [],
            animations: [],
            isInitialView: true,
          }
        ]
      };
      
      // Create the new play
      const newPlay: Play = {
        id: `play-new-${Date.now()}`,
        name: playData.name,
        description: playData.description,
        category: playData.category,
        tags: playData.tags,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: session?.user?.id || 'unknown',
        authorName: session?.user?.name || 'Unknown User',
        versions: [newVersion],
        currentVersionId: newVersionId,
      };
      
      // Update the playbook
      const updatedPlaybook = {
        ...playbooks[playbookIndex],
        plays: [...playbooks[playbookIndex].plays, newPlay],
        updatedAt: new Date(),
      };
      
      // Update the state
      const newPlaybooks = [...playbooks];
      newPlaybooks[playbookIndex] = updatedPlaybook;
      setPlaybooks(newPlaybooks);
      
      // Update available tags
      const newTags = playData.tags.filter(tag => !availableTags.includes(tag));
      if (newTags.length > 0) {
        setAvailableTags([...availableTags, ...newTags]);
      }
      
      return newPlay;
    } catch (err) {
      console.error('Failed to create play:', err);
      setError('Failed to create play. Please try again later.');
      throw err;
    }
  };
  
  // Create a new version of a play
  const createPlayVersion = async (
    playId: string,
    versionData: {
      name: string;
      description?: string;
      basedOnVersionId?: string;
    }
  ): Promise<PlayVersion> => {
    try {
      // Find the play
      let playFound = false;
      let playbookIndex = -1;
      let playIndex = -1;
      
      for (let i = 0; i < playbooks.length; i++) {
        const j = playbooks[i].plays.findIndex(p => p.id === playId);
        if (j !== -1) {
          playFound = true;
          playbookIndex = i;
          playIndex = j;
          break;
        }
      }
      
      if (!playFound) {
        throw new Error(`Play with ID ${playId} not found`);
      }
      
      const play = playbooks[playbookIndex].plays[playIndex];
      
      // Determine base version to copy views from
      let baseVersion = play.versions.find(v => v.id === versionData.basedOnVersionId);
      if (!baseVersion) {
        baseVersion = getCurrentVersion(play);
      }
      
      // Create new views by deep copying from base version
      const newViews: PlayView[] = baseVersion ? baseVersion.views.map(view => ({
        ...view,
        id: `view-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })) : [];
      
      // Create new version
      const newVersionId = `version-new-${Date.now()}`;
      const newVersion: PlayVersion = {
        id: newVersionId,
        name: versionData.name,
        description: versionData.description,
        createdAt: new Date(),
        createdBy: session?.user?.id || 'unknown',
        createdByName: session?.user?.name || 'Unknown User',
        views: newViews,
      };
      
      // Update play
      const updatedPlay = {
        ...play,
        versions: [...play.versions, newVersion],
        currentVersionId: newVersionId,
        updatedAt: new Date(),
      };
      
      // Update playbook
      const updatedPlaybook = {
        ...playbooks[playbookIndex],
        plays: [
          ...playbooks[playbookIndex].plays.slice(0, playIndex),
          updatedPlay,
          ...playbooks[playbookIndex].plays.slice(playIndex + 1)
        ],
        updatedAt: new Date(),
      };
      
      // Update state
      const newPlaybooks = [...playbooks];
      newPlaybooks[playbookIndex] = updatedPlaybook;
      setPlaybooks(newPlaybooks);
      
      return newVersion;
    } catch (err) {
      console.error('Failed to create play version:', err);
      setError('Failed to create play version. Please try again later.');
      throw err;
    }
  };
  
  // Update play details
  const updatePlay = async (
    playId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      isPublished?: boolean;
    }
  ): Promise<Play> => {
    try {
      // Find the play
      let playFound = false;
      let playbookIndex = -1;
      let playIndex = -1;
      
      for (let i = 0; i < playbooks.length; i++) {
        const j = playbooks[i].plays.findIndex(p => p.id === playId);
        if (j !== -1) {
          playFound = true;
          playbookIndex = i;
          playIndex = j;
          break;
        }
      }
      
      if (!playFound) {
        throw new Error(`Play with ID ${playId} not found`);
      }
      
      const play = playbooks[playbookIndex].plays[playIndex];
      
      // Update the play
      const updatedPlay = {
        ...play,
        ...updates,
        updatedAt: new Date(),
      };
      
      // Update playbook
      const updatedPlaybook = {
        ...playbooks[playbookIndex],
        plays: [
          ...playbooks[playbookIndex].plays.slice(0, playIndex),
          updatedPlay,
          ...playbooks[playbookIndex].plays.slice(playIndex + 1)
        ],
        updatedAt: new Date(),
      };
      
      // Update state
      const newPlaybooks = [...playbooks];
      newPlaybooks[playbookIndex] = updatedPlaybook;
      setPlaybooks(newPlaybooks);
      
      // Update available tags
      if (updates.tags) {
        const newTags = updates.tags.filter(tag => !availableTags.includes(tag));
        if (newTags.length > 0) {
          setAvailableTags([...availableTags, ...newTags]);
        }
      }
      
      return updatedPlay;
    } catch (err) {
      console.error('Failed to update play:', err);
      setError('Failed to update play. Please try again later.');
      throw err;
    }
  };
  
  // Update play view
  const updatePlayView = async (
    playId: string, 
    versionId: string,
    viewId: string, 
    updates: {
      name?: string;
      positions?: PlayPosition[];
      lines?: PlayLine[];
      texts?: PlayText[];
      animations?: PlayAnimation[];
    }
  ): Promise<PlayView> => {
    try {
      // Find the play
      let playFound = false;
      let playbookIndex = -1;
      let playIndex = -1;
      
      for (let i = 0; i < playbooks.length; i++) {
        const j = playbooks[i].plays.findIndex(p => p.id === playId);
        if (j !== -1) {
          playFound = true;
          playbookIndex = i;
          playIndex = j;
          break;
        }
      }
      
      if (!playFound) {
        throw new Error(`Play with ID ${playId} not found`);
      }
      
      const play = playbooks[playbookIndex].plays[playIndex];
      
      // Find the version
      const versionIndex = play.versions.findIndex(v => v.id === versionId);
      if (versionIndex === -1) {
        throw new Error(`Version with ID ${versionId} not found in play ${playId}`);
      }
      
      const version = play.versions[versionIndex];
      
      // Find the view
      const viewIndex = version.views.findIndex(v => v.id === viewId);
      if (viewIndex === -1) {
        throw new Error(`View with ID ${viewId} not found in version ${versionId}`);
      }
      
      const view = version.views[viewIndex];
      
      // Update the view
      const updatedView = {
        ...view,
        ...updates,
      };
      
      // Update version
      const updatedVersion = {
        ...version,
        views: [
          ...version.views.slice(0, viewIndex),
          updatedView,
          ...version.views.slice(viewIndex + 1)
        ]
      };
      
      // Update play
      const updatedPlay = {
        ...play,
        versions: [
          ...play.versions.slice(0, versionIndex),
          updatedVersion,
          ...play.versions.slice(versionIndex + 1)
        ],
        updatedAt: new Date(),
      };
      
      // Update playbook
      const updatedPlaybook = {
        ...playbooks[playbookIndex],
        plays: [
          ...playbooks[playbookIndex].plays.slice(0, playIndex),
          updatedPlay,
          ...playbooks[playbookIndex].plays.slice(playIndex + 1)
        ],
        updatedAt: new Date(),
      };
      
      // Update state
      const newPlaybooks = [...playbooks];
      newPlaybooks[playbookIndex] = updatedPlaybook;
      setPlaybooks(newPlaybooks);
      
      return updatedView;
    } catch (err) {
      console.error('Failed to update play view:', err);
      setError('Failed to update play view. Please try again later.');
      throw err;
    }
  };

  return {
    playbooks,
    availableTags,
    isLoading,
    error,
    refetch,
    getPlaybookById,
    getPlayById,
    getPlaysByCategory,
    getPlaysByTag,
    getCurrentVersion,
    createPlay,
    createPlayVersion,
    updatePlay,
    updatePlayView,
  };
}
