"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Types for Film Study sessions
export interface FilmStudyMarker {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  type: 'note' | 'highlight' | 'question' | 'drill';
  color: string;
  drawingData?: DrawingData;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: Date;
  replies: MarkerReply[];
}

export interface MarkerReply {
  id: string;
  markerId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface DrawingData {
  lines: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    width: number;
    type: 'pen' | 'arrow';
  }>;
  circles: Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    width: number;
  }>;
  rectangles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    lineWidth: number;
  }>;
  texts: Array<{
    x: number;
    y: number;
    content: string;
    color: string;
    fontSize: number;
  }>;
}

export interface FilmStudyParticipant {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isOnline: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

export interface FilmStudySession {
  id: string;
  videoId: string;
  videoTitle: string;
  hostId: string;
  hostName: string;
  participants: FilmStudyParticipant[];
  markers: FilmStudyMarker[];
  isLive: boolean;
  syncEnabled: boolean;
  currentTime: number;
  isPlaying: boolean;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface CreateMarkerInput {
  timestamp: number;
  title: string;
  content: string;
  type: FilmStudyMarker['type'];
  color?: string;
  drawingData?: DrawingData;
}

export function useFilmStudy(videoId: string) {
  const { data: session, status } = useSession();
  const [studySession, setStudySession] = useState<FilmStudySession | null>(null);
  const [markers, setMarkers] = useState<FilmStudyMarker[]>([]);
  const [participants, setParticipants] = useState<FilmStudyParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // WebSocket/real-time connection ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session on mount (only once)
  useEffect(() => {
    if (initialized || status === 'loading') return;
    
    const initSession = async () => {
      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userId = session?.user?.id || 'coach-1';
        const userName = session?.user?.name || 'Coach';
        const userRole = (session?.user as any)?.role || 'COACH';
        
        const mockSession: FilmStudySession = {
          id: `study-${videoId}-${Date.now()}`,
          videoId,
          videoTitle: 'Game Film',
          hostId: userId,
          hostName: userName,
          participants: [
            {
              id: userId,
              name: userName,
              role: userRole,
              isOnline: true,
              isMuted: false,
              isVideoOn: true,
              isScreenSharing: false,
              joinedAt: new Date(),
            }
          ],
          markers: [],
          isLive: true,
          syncEnabled: true,
          currentTime: 0,
          isPlaying: false,
          createdAt: new Date(),
        };
        
        setStudySession(mockSession);
        setParticipants(mockSession.participants);
        setIsHost(true);
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize film study session:', err);
        setError('Failed to start film study session');
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
  }, [videoId, session, status, initialized]);

  // Kept for external calls if needed
  const initializeSession = useCallback(async () => {
    // Session already initialized via useEffect
    return studySession;
  }, [studySession]);

  // Load existing markers for a video
  const loadMarkers = useCallback(async () => {
    if (!videoId) return;
    
    try {
      const response = await fetch(`/api/videos/${videoId}/markers`);
      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }
      const data = await response.json();
      
      // Transform API response to match FilmStudyMarker type
      const loadedMarkers: FilmStudyMarker[] = data.map((marker: any) => ({
        id: marker.id,
        timestamp: marker.timestamp,
        title: marker.title,
        content: marker.content || '',
        type: marker.type as FilmStudyMarker['type'],
        color: marker.color,
        drawingData: marker.drawingData,
        authorId: marker.authorId,
        authorName: marker.authorName,
        authorRole: marker.authorRole,
        createdAt: new Date(marker.createdAt),
        replies: (marker.replies || []).map((reply: any) => ({
          id: reply.id,
          markerId: reply.markerId,
          content: reply.content,
          authorId: reply.authorId,
          authorName: reply.authorName,
          createdAt: new Date(reply.createdAt),
        })),
      }));
      
      setMarkers(loadedMarkers);
    } catch (err) {
      console.error('Failed to load markers:', err);
    }
  }, [videoId]);

  // Create a new marker
  const createMarker = useCallback(async (input: CreateMarkerInput): Promise<FilmStudyMarker | null> => {
    if (!session?.user) return null;
    
    try {
      const response = await fetch(`/api/videos/${videoId}/markers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: input.timestamp,
          title: input.title,
          content: input.content,
          type: input.type,
          color: input.color || getMarkerColor(input.type),
          drawingData: input.drawingData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create marker');
      }
      
      const data = await response.json();
      
      const newMarker: FilmStudyMarker = {
        id: data.id,
        timestamp: data.timestamp,
        title: data.title,
        content: data.content || '',
        type: data.type as FilmStudyMarker['type'],
        color: data.color,
        drawingData: data.drawingData,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        createdAt: new Date(data.createdAt),
        replies: [],
      };
      
      setMarkers(prev => [...prev, newMarker].sort((a, b) => a.timestamp - b.timestamp));
      
      return newMarker;
    } catch (err) {
      console.error('Failed to create marker:', err);
      return null;
    }
  }, [session, videoId]);

  // Update a marker
  const updateMarker = useCallback(async (markerId: string, updates: Partial<CreateMarkerInput>) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/markers/${markerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update marker');
      }
      
      const data = await response.json();
      
      setMarkers(prev => prev.map(m => 
        m.id === markerId ? {
          ...m,
          title: data.title,
          content: data.content || '',
          type: data.type as FilmStudyMarker['type'],
          color: data.color,
          drawingData: data.drawingData,
        } : m
      ));
    } catch (err) {
      console.error('Failed to update marker:', err);
    }
  }, [videoId]);

  // Delete a marker
  const deleteMarker = useCallback(async (markerId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/markers/${markerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete marker');
      }
      
      setMarkers(prev => prev.filter(m => m.id !== markerId));
    } catch (err) {
      console.error('Failed to delete marker:', err);
    }
  }, [videoId]);

  // Add reply to a marker
  const addReply = useCallback(async (markerId: string, content: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/videos/${videoId}/markers/${markerId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reply');
      }
      
      const data = await response.json();
      
      const newReply: MarkerReply = {
        id: data.id,
        markerId: data.markerId,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: new Date(data.createdAt),
      };
      
      setMarkers(prev => prev.map(m => 
        m.id === markerId 
          ? { ...m, replies: [...m.replies, newReply] }
          : m
      ));
    } catch (err) {
      console.error('Failed to add reply:', err);
    }
  }, [session, videoId]);

  // Sync playback state (for live sessions)
  const syncPlayback = useCallback((time: number, playing: boolean) => {
    if (!syncEnabled || !isHost) return;
    
    setCurrentTime(time);
    setIsPlaying(playing);
    
    // In production, broadcast via WebSocket
    // wsRef.current?.send(JSON.stringify({ type: 'sync', time, playing }));
  }, [syncEnabled, isHost]);

  // Toggle sync mode
  const toggleSync = useCallback(() => {
    setSyncEnabled(prev => !prev);
  }, []);

  // Invite participant
  const inviteParticipant = useCallback(async (userId: string, userName: string) => {
    // In production, send invitation via API
    console.log('Inviting:', userName);
  }, []);

  // Toggle participant mute
  const toggleMute = useCallback(() => {
    if (!session?.user) return;
    
    setParticipants(prev => prev.map(p => 
      p.id === session.user?.id ? { ...p, isMuted: !p.isMuted } : p
    ));
  }, [session]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!session?.user) return;
    
    setParticipants(prev => prev.map(p => 
      p.id === session.user?.id ? { ...p, isVideoOn: !p.isVideoOn } : p
    ));
  }, [session]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      // In production, use WebRTC screen sharing
      setParticipants(prev => prev.map(p => 
        p.id === session.user?.id ? { ...p, isScreenSharing: !p.isScreenSharing } : p
      ));
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
    }
  }, [session]);

  // End session
  const endSession = useCallback(() => {
    setStudySession(null);
    setParticipants([]);
    wsRef.current?.close();
  }, []);

  // Load markers on mount
  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Add marker from socket sync (for non-coaches receiving marker updates)
  const addMarkerFromSync = useCallback((marker: FilmStudyMarker) => {
    setMarkers(prev => {
      if (prev.some(m => m.id === marker.id)) return prev;
      return [...prev, marker].sort((a, b) => a.timestamp - b.timestamp);
    });
  }, []);

  // Remove marker from socket sync
  const removeMarkerFromSync = useCallback((markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  }, []);

  return {
    // Session state
    studySession,
    isLoading,
    error,
    isHost,
    
    // Markers
    markers,
    createMarker,
    updateMarker,
    deleteMarker,
    addReply,
    addMarkerFromSync,
    removeMarkerFromSync,
    
    // Participants
    participants,
    inviteParticipant,
    
    // Playback sync
    syncEnabled,
    toggleSync,
    currentTime,
    isPlaying,
    syncPlayback,
    
    // Media controls
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    
    // Session management
    initializeSession,
    endSession,
  };
}

// Helper function to get marker color based on type
function getMarkerColor(type: FilmStudyMarker['type']): string {
  switch (type) {
    case 'highlight': return '#f59e0b'; // Amber
    case 'note': return '#22c55e'; // Green
    case 'question': return '#3b82f6'; // Blue
    case 'drill': return '#a855f7'; // Purple
    default: return '#6b7280'; // Gray
  }
}
