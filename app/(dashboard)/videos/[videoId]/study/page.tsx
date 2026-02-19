"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useVideos } from "@/hooks/useVideos";
import { useFilmStudy, FilmStudyMarker } from "@/hooks/useFilmStudy";
import { useSocket } from "@/context/SocketContext";
import { formatTime } from "@/lib/utils";
import {
  ArrowLeft, Pencil, Circle, Square, ArrowRight, Trash2, X, Plus,
  Flag, HelpCircle, Target, MessageSquare, Loader2, Copy, Check, ChevronLeft, ChevronRight,
  Play, Pause, Users, Eraser, Video, VideoOff, Mic, MicOff, PhoneOff, Phone,
} from "lucide-react";
import DailyIframe from '@daily-co/daily-js';
import Link from "next/link";

type DrawingTool = 'pen' | 'arrow' | 'circle' | 'rectangle' | 'eraser';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function FilmStudyPage() {
  const { videoId } = useParams() as { videoId: string };
  const { data: session } = useSession();
  const { getVideoById, isLoading: videoLoading } = useVideos();
  const { markers, createMarker, deleteMarker, addReply, addMarkerFromSync, removeMarkerFromSync, isLoading: sessionLoading } = useFilmStudy(videoId);

  const video = getVideoById(videoId);
  
  // Video state
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI state
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<FilmStudyMarker | null>(null);
  const [markerFilter, setMarkerFilter] = useState<'all' | 'note' | 'highlight' | 'question' | 'critique'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncEnabled, setIsSyncEnabled] = useState(true); // Coach sync mode
  
  // Marker form state
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const [newMarkerContent, setNewMarkerContent] = useState('');
  const [newMarkerType, setNewMarkerType] = useState<FilmStudyMarker['type']>('note');
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('pen');
  const [drawingColor, setDrawingColor] = useState('#a855f7');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const canvasSnapshotRef = useRef<ImageData | null>(null);

  const isCoach = (session?.user as any)?.role === 'COACH' || (session?.user as any)?.role === 'ADMIN';
  const filteredMarkers = markers.filter(m => markerFilter === 'all' || m.type === markerFilter);
  
  // Socket.IO connection
  const { socket, connect, isConnected } = useSocket();
  const [sessionParticipants, setSessionParticipants] = useState<Array<{name: string, odataId: string}>>([]);

  // Video call state
  const [isInCall, setIsInCall] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [callRoomUrl, setCallRoomUrl] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isCallCollapsed, setIsCallCollapsed] = useState(true);
  const [callPanelPos, setCallPanelPos] = useState<{ x: number; y: number } | null>(null);
  const [callPanelSize, setCallPanelSize] = useState({ width: 320, height: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const dailyCallRef = useRef<any>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube IFrame API for YouTube videos
  useEffect(() => {
    if (!video?.youtubeId) return;
    
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    const initPlayer = () => {
      if (!ytContainerRef.current || ytPlayerRef.current) return;
      
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: video.youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration() || 0);
          },
          onStateChange: (event: any) => {
            const player = event.target;
            const playerState = event.data;
            
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (playerState === 1) {
              setIsPlaying(true);
              setDuration(player.getDuration() || 0);
              if (isCoach && isSyncEnabled && socket && isConnected) {
                socket.emit('sync-playback', { time: player.getCurrentTime(), playing: true, duration: player.getDuration() });
              }
            } else if (playerState === 2 || playerState === 0) {
              setIsPlaying(false);
              if (isCoach && isSyncEnabled && socket && isConnected) {
                socket.emit('sync-playback', { time: player.getCurrentTime(), playing: false, duration: player.getDuration() });
              }
            }
          },
        },
      });
    };
    
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    
    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [video?.youtubeId, isCoach, isSyncEnabled, socket, isConnected]);

  // Poll YouTube player for current time (every 500ms while playing)
  useEffect(() => {
    if (!video?.youtubeId || !ytPlayerRef.current) return;
    
    const interval = setInterval(() => {
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const time = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (time !== undefined) setCurrentTime(time);
          if (dur && dur > 0) setDuration(dur);
        }
      } catch (e) {
        // Player not ready yet
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [video?.youtubeId]);

  // Connect to Socket.IO on mount
  useEffect(() => {
    if (!video || !session?.user) return;
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id, session?.user?.id]);

  useEffect(() => {
    if (!socket || !isConnected || !video || !session?.user) return;

    // Join the film study session
    socket.emit('join-session', {
      videoId: video.id,
      odataId: session.user.id,
      userName: session.user.name || 'User',
      userRole: (session.user as any)?.role || 'PLAYER',
    });

    // Listen for drawing strokes from other users
    const handleStrokeReceived = (data: { stroke: any; fromUserName: string }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !data.stroke) return;

      const { tool, fromX, fromY, toX, toY, color, width } = data.stroke;
      ctx.strokeStyle = color || '#a855f7';
      ctx.lineWidth = width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (tool === 'arrow') {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (tool === 'circle') {
        const radiusX = Math.abs(toX - fromX) / 2;
        const radiusY = Math.abs(toY - fromY) / 2;
        const centerX = fromX + (toX - fromX) / 2;
        const centerY = fromY + (toY - fromY) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.beginPath();
        ctx.strokeRect(fromX, fromY, toX - fromX, toY - fromY);
      } else {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
      }
    };

    // Listen for canvas clear events
    const handleCanvasCleared = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Listen for session state updates
    const handleSessionState = (data: { participants: any[]; currentTime?: number; isPlaying?: boolean; duration?: number }) => {
      setSessionParticipants(data.participants.map(p => ({ name: p.name, odataId: p.odataId })));
      // Sync initial playback state for non-coaches
      if (!isCoach) {
        if (data.currentTime !== undefined) {
          setCurrentTime(data.currentTime);
        }
        if (data.isPlaying !== undefined) {
          setIsPlaying(data.isPlaying);
        }
        if (data.duration && data.duration > 0) {
          setDuration(data.duration);
        }
        
        const videoEl = playerRef.current as HTMLVideoElement | null;
        if (videoEl && videoEl.tagName === 'VIDEO' && data.currentTime !== undefined) {
          videoEl.currentTime = data.currentTime;
          if (data.isPlaying) {
            videoEl.play();
          } else {
            videoEl.pause();
          }
        }
      }
    };

    // Listen for playback sync from coach
    const handlePlaybackSynced = (data: { time: number; playing: boolean; duration?: number }) => {
      if (isCoach) return; // Coach doesn't sync to themselves
      
      // Always update timeline state for players
      setCurrentTime(data.time);
      setIsPlaying(data.playing);
      if (data.duration && data.duration > 0) {
        setDuration(data.duration);
      }
      
      // Also sync native video element if available
      const videoEl = playerRef.current as HTMLVideoElement | null;
      if (videoEl && videoEl.tagName === 'VIDEO') {
        if (Math.abs(videoEl.currentTime - data.time) > 0.5) {
          videoEl.currentTime = data.time;
        }
        if (data.playing && videoEl.paused) {
          videoEl.play();
        } else if (!data.playing && !videoEl.paused) {
          videoEl.pause();
        }
      }
    };

    // Listen for marker sync from coach
    const handleMarkerSynced = (data: { action: string; marker?: any; markerId?: string }) => {
      if (data.action === 'add' && data.marker) {
        addMarkerFromSync(data.marker);
      } else if (data.action === 'delete' && data.markerId) {
        removeMarkerFromSync(data.markerId);
      }
    };

    socket.on('stroke-received', handleStrokeReceived);
    socket.on('canvas-cleared', handleCanvasCleared);
    socket.on('session-state', handleSessionState);
    socket.on('user-joined', handleSessionState);
    socket.on('user-left', handleSessionState);
    socket.on('playback-synced', handlePlaybackSynced);
    socket.on('marker-synced', handleMarkerSynced);

    return () => {
      socket.off('stroke-received', handleStrokeReceived);
      socket.off('canvas-cleared', handleCanvasCleared);
      socket.off('session-state', handleSessionState);
      socket.off('user-joined', handleSessionState);
      socket.off('user-left', handleSessionState);
      socket.off('playback-synced', handlePlaybackSynced);
      socket.off('marker-synced', handleMarkerSynced);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, video?.id, session?.user?.id, isCoach]);

  // Periodic time sync from coach (every 2 seconds while playing)
  useEffect(() => {
    if (!isCoach || !isSyncEnabled || !isPlaying || !socket || !isConnected) return;
    
    const interval = setInterval(() => {
      const videoEl = playerRef.current as HTMLVideoElement | null;
      if (videoEl && videoEl.tagName === 'VIDEO') {
        socket.emit('sync-playback', { 
          time: videoEl.currentTime, 
          playing: !videoEl.paused, 
          duration: videoEl.duration || duration 
        });
      } else if (currentTime > 0) {
        // For YouTube or other sources, sync the tracked state
        socket.emit('sync-playback', { time: currentTime, playing: isPlaying, duration });
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isCoach, isSyncEnabled, isPlaying, socket, isConnected, currentTime, duration]);

  // Emit sync event for coaches
  const emitPlaybackSync = useCallback((time: number, playing: boolean, videoDuration?: number) => {
    if (isCoach && isSyncEnabled && socket && isConnected) {
      socket.emit('sync-playback', { time, playing, duration: videoDuration || duration });
    }
  }, [isCoach, isSyncEnabled, socket, isConnected, duration]);

  // Seek to time for native video element
  const seekTo = useCallback((time: number) => {
    const videoEl = playerRef.current as HTMLVideoElement | null;
    if (videoEl && videoEl.tagName === 'VIDEO') {
      videoEl.currentTime = time;
    }
    setCurrentTime(time);
    // Sync seek for coaches
    if (isCoach && isSyncEnabled) {
      emitPlaybackSync(time, isPlaying);
    }
  }, [isCoach, isSyncEnabled, isPlaying, emitPlaybackSync]);

  // Video call functions
  const joinCall = async () => {
    if (!video || isJoiningCall) return;
    setIsJoiningCall(true);
    setShowCallModal(true);
    console.log('Joining call for video:', video.id);

    try {
      console.log('Fetching room for video:', video.id);
      const response = await fetch('/api/daily/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      const url = data.url;
      if (!url) {
        throw new Error('No URL returned from API');
      }
      console.log('Room URL:', url);
      
      // Set the URL and show in modal
      setCallRoomUrl(url);
      setIsInCall(true);
      setIsJoiningCall(false);
      console.log('Call ready at:', url);
      
    } catch (error: any) {
      console.error('Failed to join call:', error);
      setIsInCall(false);
      setIsJoiningCall(false);
      setCallRoomUrl(null);
      setShowCallModal(false);
      
      const errorMsg = error?.message || 'Unable to create call room.';
      alert(errorMsg);
    }
  };

  const leaveCall = () => {
    setIsInCall(false);
    setIsJoiningCall(false);
    setCallRoomUrl(null);
    setShowCallModal(false);
  };

  const closeCallModal = () => {
    setShowCallModal(false);
    setIsCallCollapsed(true);
    if (!callPanelPos) {
      setCallPanelPos({ x: window.innerWidth - 240, y: window.innerHeight - 80 });
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (!callPanelPos) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - callPanelPos.x,
      y: e.clientY - callPanelPos.y
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, Math.min(window.innerWidth - 250, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
    setCallPanelPos({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !callPanelPos) return;
    const newWidth = Math.max(200, Math.min(600, e.clientX - callPanelPos.x));
    const newHeight = Math.max(120, Math.min(400, e.clientY - callPanelPos.y - 40));
    setCallPanelSize({ width: newWidth, height: newHeight });
  }, [isResizing, callPanelPos]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const toggleMute = () => {
    if (dailyCallRef.current) {
      const newMuted = !isMuted;
      dailyCallRef.current.setLocalAudio(!newMuted);
      setIsMuted(newMuted);
    }
  };

  const toggleCamera = () => {
    if (dailyCallRef.current) {
      const newCameraOff = !isCameraOff;
      dailyCallRef.current.setLocalVideo(!newCameraOff);
      setIsCameraOff(newCameraOff);
    }
  };

  // Cleanup call on unmount
  useEffect(() => {
    return () => {
      if (dailyCallRef.current) {
        dailyCallRef.current.destroy();
      }
    };
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    seekTo(time);
  };

  // Marker handlers
  const handleMarkerClick = (marker: FilmStudyMarker) => {
    setSelectedMarker(marker);
    seekTo(marker.timestamp);
    setIsPlaying(false);
  };

  const handleCreateMarker = async () => {
    if (!newMarkerTitle.trim()) return;
    const newMarker = await createMarker({ timestamp: currentTime, title: newMarkerTitle, content: newMarkerContent, type: newMarkerType });
    
    // Emit marker-added event for other users
    if (newMarker && socket && isConnected && isCoach) {
      socket.emit('marker-added', { marker: newMarker });
    }
    
    setNewMarkerTitle('');
    setNewMarkerContent('');
    setShowAddMarker(false);
  };

  const handleDeleteMarker = async (markerId: string) => {
    await deleteMarker(markerId);
    
    // Emit marker-deleted event for other users
    if (socket && isConnected && isCoach) {
      socket.emit('marker-deleted', { markerId });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/videos/${videoId}/study?join=true`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Drawing handlers
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const point = getCanvasPoint(e);
    if (!point || !ctx || !canvas) return;
    
    setIsDrawing(true);
    setLastPoint(point);
    setStartPoint(point);
    
    // Save canvas state for shape preview
    if (drawingTool !== 'pen' && drawingTool !== 'eraser') {
      canvasSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !lastPoint || !startPoint) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const point = getCanvasPoint(e);
    if (!ctx || !point || !canvas) return;

    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawingTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      if (socket && isConnected) {
        socket.emit('draw-stroke', {
          stroke: { tool: 'pen', fromX: lastPoint.x, fromY: lastPoint.y, toX: point.x, toY: point.y, color: drawingColor, width: 3, timestamp: currentTime },
        });
      }
      setLastPoint(point);
    } else if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      if (socket && isConnected) {
        socket.emit('draw-stroke', {
          stroke: { tool: 'eraser', fromX: lastPoint.x, fromY: lastPoint.y, toX: point.x, toY: point.y, width: 20, timestamp: currentTime },
        });
      }
      setLastPoint(point);
    } else {
      // Shape tools - restore snapshot and draw preview
      if (canvasSnapshotRef.current) {
        ctx.putImageData(canvasSnapshotRef.current, 0, 0);
      }

      if (drawingTool === 'arrow') {
        drawArrow(ctx, startPoint.x, startPoint.y, point.x, point.y);
      } else if (drawingTool === 'circle') {
        const radiusX = Math.abs(point.x - startPoint.x) / 2;
        const radiusY = Math.abs(point.y - startPoint.y) / 2;
        const centerX = startPoint.x + (point.x - startPoint.x) / 2;
        const centerY = startPoint.y + (point.y - startPoint.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (drawingTool === 'rectangle') {
        ctx.beginPath();
        ctx.strokeRect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      setLastPoint(null);
      setStartPoint(null);
      return;
    }

    const point = getCanvasPoint(e);
    
    // Broadcast shape via Socket.IO
    if (socket && isConnected && point && (drawingTool === 'arrow' || drawingTool === 'circle' || drawingTool === 'rectangle')) {
      socket.emit('draw-stroke', {
        stroke: { tool: drawingTool, fromX: startPoint.x, fromY: startPoint.y, toX: point.x, toY: point.y, color: drawingColor, width: 3, timestamp: currentTime },
      });
    }

    setIsDrawing(false);
    setLastPoint(null);
    setStartPoint(null);
    canvasSnapshotRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (socket && isConnected) {
      socket.emit('clear-canvas', {});
    }
  };

  const getMarkerIcon = (type: FilmStudyMarker['type']) => {
    const icons: Record<string, React.ReactNode> = {
      highlight: <Flag className="h-4 w-4" />,
      note: <MessageSquare className="h-4 w-4" />,
      question: <HelpCircle className="h-4 w-4" />,
      critique: <Target className="h-4 w-4" />,
    };
    return icons[type] || <MessageSquare className="h-4 w-4" />;
  };

  if (videoLoading || sessionLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 100%)' }}>
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#a855f7' }} />
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#fca5a5', fontSize: '1.5rem', marginBottom: '12px' }}>Video Not Found</h2>
          <Link href="/videos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(168, 85, 247, 0.3)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '10px', color: '#e9d5ff', textDecoration: 'none' }}>
            <ArrowLeft className="h-4 w-4" /> Back to Videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)', borderRadius: '16px', margin: '8px', border: '1px solid rgba(138, 43, 226, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(138, 43, 226, 0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(138, 43, 226, 0.2)', background: 'rgba(10, 0, 20, 0.9)' }}>
        {/* Left - Exit Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Link href={`/videos/${videoId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#c4b5fd', textDecoration: 'none', fontSize: '0.9rem' }}>
            <ArrowLeft className="h-4 w-4" />Exit
          </Link>
        </div>
        {/* Center - Title */}
        <h1 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e9d5ff', margin: 0, padding: '0 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>{video.title}</h1>
        {/* Right - Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: isConnected ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontSize: '0.8rem', color: isConnected ? '#86efac' : '#fca5a5' }}>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          
          {/* Participants */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
            <Users className="h-4 w-4" style={{ color: '#c4b5fd' }} />
            <span style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>{sessionParticipants.length || 1}</span>
          </div>
          
          {/* Sync Toggle - Coach Only */}
          {isCoach && (
            <button
              onClick={() => setIsSyncEnabled(!isSyncEnabled)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px',
                background: isSyncEnabled ? 'rgba(168, 85, 247, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                border: isSyncEnabled ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(107, 114, 128, 0.4)',
                color: isSyncEnabled ? '#c4b5fd' : '#9ca3af',
                cursor: 'pointer', fontSize: '0.8rem'
              }}
              title={isSyncEnabled ? 'Sync ON: Players follow your video' : 'Sync OFF: Players control their own video'}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Sync {isSyncEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}
          
          {/* Video Call Controls */}
          {!isInCall ? (
            <button 
              onClick={joinCall} 
              disabled={isJoiningCall}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', 
                background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', 
                color: '#c4b5fd', cursor: isJoiningCall ? 'wait' : 'pointer', fontSize: '0.85rem',
                opacity: isJoiningCall ? 0.7 : 1, whiteSpace: 'nowrap'
              }}
            >
              {isJoiningCall ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              {isJoiningCall ? 'Connecting...' : 'Join Call'}
            </button>
          ) : (
            <>
              {/* In Call Badge */}
              <div 
                onClick={() => setShowCallModal(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', 
                  background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', 
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', color: '#86efac' }}>In Call</span>
              </div>
              
              {/* Leave Call Button */}
              <button 
                onClick={leaveCall} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', 
                  background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', 
                  color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                <PhoneOff className="h-4 w-4" />
                Leave
              </button>
            </>
          )}
          
          {/* Share Link */}
          <button onClick={copyInviteLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: copiedLink ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)', border: copiedLink ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(168, 85, 247, 0.4)', color: copiedLink ? '#86efac' : '#c4b5fd', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedLink ? 'Copied!' : 'Share Link'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Video Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: sidebarCollapsed ? '16px' : '12px 16px 8px 16px', gap: sidebarCollapsed ? '12px' : '8px' }}>
          
          
          {/* Video Player */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
            {video.youtubeId ? (
              <div 
                ref={ytContainerRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            ) : video.externalUrl || video.fileUrl ? (
              <video
                ref={playerRef}
                src={video.externalUrl || video.fileUrl}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                onPlay={() => {
                  setIsPlaying(true);
                  if (isCoach && isSyncEnabled) {
                    emitPlaybackSync((playerRef.current as HTMLVideoElement)?.currentTime || 0, true);
                  }
                }}
                onPause={() => {
                  setIsPlaying(false);
                  if (isCoach && isSyncEnabled) {
                    emitPlaybackSync((playerRef.current as HTMLVideoElement)?.currentTime || 0, false);
                  }
                }}
                onSeeked={() => {
                  if (isCoach && isSyncEnabled) {
                    emitPlaybackSync((playerRef.current as HTMLVideoElement)?.currentTime || 0, isPlaying);
                  }
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: '12px' }}>
                <MessageSquare className="h-12 w-12" style={{ opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No video source available</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>This video has no YouTube ID, URL, or file attached</p>
              </div>
            )}
            
            {/* Drawing Canvas Overlay */}
            {isDrawingMode && (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', zIndex: 10 }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            )}
            
            {/* Drawing Toggle Button */}
            {isCoach && (
              <button onClick={() => setIsDrawingMode(!isDrawingMode)} style={{ position: 'absolute', top: '12px', right: '12px', padding: '10px', borderRadius: '8px', background: isDrawingMode ? 'rgba(168, 85, 247, 0.9)' : 'rgba(0, 0, 0, 0.7)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#fff', cursor: 'pointer', zIndex: 20 }}>
                <Pencil className="h-5 w-5" />
              </button>
            )}
            
            {/* Drawing Toolbar */}
            {isDrawingMode && (
              <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(168, 85, 247, 0.5)', zIndex: 20 }}>
                {['pen', 'arrow', 'circle', 'rectangle', 'eraser'].map(mode => (
                  <button key={mode} onClick={() => setDrawingTool(mode as DrawingTool)} style={{ padding: '6px', borderRadius: '6px', background: drawingTool === mode ? 'rgba(168, 85, 247, 0.6)' : 'transparent', border: 'none', color: drawingTool === mode ? '#fff' : '#9ca3af', cursor: 'pointer' }}>
                    {mode === 'pen' && <Pencil className="h-4 w-4" />}
                    {mode === 'arrow' && <ArrowRight className="h-4 w-4" />}
                    {mode === 'circle' && <Circle className="h-4 w-4" />}
                    {mode === 'rectangle' && <Square className="h-4 w-4" />}
                    {mode === 'eraser' && <Eraser className="h-4 w-4" />}
                  </button>
                ))}
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                {['#a855f7', '#000000', '#ef4444', '#eab308'].map(c => (
                  <button key={c} onClick={() => setDrawingColor(c)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: drawingColor === c ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }} />
                ))}
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                <button onClick={clearCanvas} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.3)', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Timeline with Markers */}
          <div style={{ padding: '12px 16px', background: 'rgba(138, 43, 226, 0.08)', borderRadius: '10px', border: '1px solid rgba(138, 43, 226, 0.2)' }}>
            <div 
              style={{ position: 'relative', height: '40px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', cursor: 'pointer', padding: '0 8px' }} 
              onClick={handleTimelineClick}
              onMouseDown={(e) => {
                if (duration <= 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const handleSeek = (clientX: number) => {
                  const percent = Math.max(0, Math.min(1, (clientX - rect.left - 8) / (rect.width - 16)));
                  const time = percent * duration;
                  seekTo(time);
                  // Seek YouTube player if available
                  if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
                    ytPlayerRef.current.seekTo(time, true);
                  }
                };
                handleSeek(e.clientX);
                
                const onMouseMove = (moveEvent: MouseEvent) => handleSeek(moveEvent.clientX);
                const onMouseUp = () => {
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
            >
              {/* Track background */}
              <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', transform: 'translateY(-50%)', height: '8px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '4px' }} />
              
              {/* Progress bar */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '8px',
                transform: 'translateY(-50%)', 
                height: '8px', 
                width: duration > 0 ? `calc(${(currentTime / duration) * 100}% * (100% - 16px) / 100%)` : '0%', 
                background: 'linear-gradient(90deg, #a855f7, #7c3aed)', 
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                transition: 'width 0.1s ease-out'
              }} />
              
              {/* Slider Handle */}
              {duration > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: `calc(8px + ${(currentTime / duration) * 100}% * (100% - 16px) / 100%)`, 
                  transform: 'translate(-50%, -50%)', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #c084fc, #a855f7)', 
                  border: '3px solid #fff', 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 12px rgba(168, 85, 247, 0.6)',
                  cursor: 'grab',
                  zIndex: 15,
                  transition: 'transform 0.1s ease-out'
                }} />
              )}
              
              {/* Markers on timeline */}
              {duration > 0 && markers.map(marker => (
                <button 
                  key={marker.id} 
                  onClick={(e) => { e.stopPropagation(); handleMarkerClick(marker); }} 
                  style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: `calc(8px + ${(marker.timestamp / duration) * 100}% * (100% - 16px) / 100%)`, 
                    transform: 'translate(-50%, -50%)', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: marker.color, 
                    border: selectedMarker?.id === marker.id ? '2px solid #fff' : '2px solid rgba(0,0,0,0.5)', 
                    cursor: 'pointer', 
                    zIndex: 10,
                    boxShadow: selectedMarker?.id === marker.id ? `0 0 8px ${marker.color}` : 'none'
                  }} 
                  title={marker.title} 
                />
              ))}
              
              {/* Add marker button */}
              {isCoach && duration > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowAddMarker(true); }} 
                  style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    left: `calc(8px + ${(currentTime / duration) * 100}% * (100% - 16px) / 100%)`, 
                    transform: 'translateX(-50%)', 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)', 
                    border: 'none', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    fontSize: '0.7rem', 
                    fontWeight: '600', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    zIndex: 20, 
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Plus className="h-3 w-3" />Add
                </button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: '#9ca3af' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ position: 'absolute', right: '12px', top: '12px', padding: '8px', background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.4)', borderRadius: '8px', color: '#c4b5fd', cursor: 'pointer', zIndex: 30 }}>
          {sidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Markers Sidebar */}
        {!sidebarCollapsed && (
          <div style={{ width: '340px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(138, 43, 226, 0.2)', background: 'rgba(10, 0, 20, 0.6)' }}>
            {/* Sidebar Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(138, 43, 226, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flag className="h-4 w-4" style={{ color: '#a855f7' }} />
              <span style={{ color: '#e9d5ff', fontWeight: '600', fontSize: '0.95rem' }}>Markers</span>
              <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', color: '#c4b5fd' }}>{markers.length}</span>
              {isCoach && (
                <button 
                  onClick={() => setShowAddMarker(true)}
                  style={{ 
                    marginLeft: 'auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', 
                    border: 'none', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    fontSize: '0.75rem', 
                    fontWeight: '600' 
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>
            
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', padding: '10px 12px', flexWrap: 'nowrap', borderBottom: '1px solid rgba(138, 43, 226, 0.15)', overflowX: 'auto' }}>
              {[{ id: 'all', label: 'All' }, { id: 'highlight', label: 'Highlights', color: '#f59e0b' }, { id: 'note', label: 'Notes', color: '#22c55e' }, { id: 'question', label: 'Questions', color: '#3b82f6' }, { id: 'critique', label: 'Critiques', color: '#a855f7' }].map(f => (
                <button key={f.id} onClick={() => setMarkerFilter(f.id as typeof markerFilter)} style={{ padding: '4px 10px', borderRadius: '12px', background: markerFilter === f.id ? (f.color ? `${f.color}25` : 'rgba(168, 85, 247, 0.2)') : 'transparent', border: markerFilter === f.id ? `1px solid ${f.color || '#a855f7'}50` : '1px solid rgba(138, 43, 226, 0.2)', color: markerFilter === f.id ? (f.color || '#c4b5fd') : '#6b7280', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '500' }}>{f.label}</button>
              ))}
            </div>
            
            {/* Markers List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {filteredMarkers.length === 0 ? (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: '#6b7280' }}>
                  <Flag className="h-10 w-10" style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No markers yet</p>
                  {isCoach && <p style={{ fontSize: '0.8rem', marginTop: '6px', color: '#4b5563' }}>Click "Add" on the timeline</p>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredMarkers.map(marker => (
                    <div 
                      key={marker.id} 
                      onClick={() => handleMarkerClick(marker)} 
                      style={{ 
                        padding: '12px', 
                        background: selectedMarker?.id === marker.id 
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(138, 43, 226, 0.15) 100%)' 
                          : 'linear-gradient(135deg, rgba(10, 0, 20, 0.6) 0%, rgba(26, 10, 46, 0.4) 100%)', 
                        border: selectedMarker?.id === marker.id 
                          ? `1px solid ${marker.color}60` 
                          : '1px solid rgba(138, 43, 226, 0.2)', 
                        borderLeft: `3px solid ${marker.color}`,
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease',
                        boxShadow: selectedMarker?.id === marker.id ? `0 4px 12px ${marker.color}20` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ 
                          padding: '8px', 
                          borderRadius: '8px', 
                          background: `${marker.color}15`, 
                          border: `1px solid ${marker.color}30`,
                          color: marker.color,
                          flexShrink: 0
                        }}>
                          {getMarkerIcon(marker.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{marker.title}</h4>
                            {isCoach && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteMarker(marker.id); }} 
                                style={{ padding: '4px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              color: marker.color, 
                              background: `${marker.color}15`, 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              {formatTime(marker.timestamp)}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>•</span>
                            <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'capitalize' }}>{marker.type}</span>
                            {marker.authorName && (
                              <>
                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>•</span>
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{marker.authorName}</span>
                              </>
                            )}
                          </div>
                          {marker.content && (
                            <p style={{ 
                              color: '#a1a1aa', 
                              fontSize: '0.8rem', 
                              margin: '8px 0 0', 
                              lineHeight: 1.5,
                              background: 'rgba(0, 0, 0, 0.2)',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              borderLeft: `2px solid ${marker.color}40`
                            }}>
                              {marker.content}
                            </p>
                          )}
                          {marker.replies && marker.replies.length > 0 && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(138, 43, 226, 0.15)' }}>
                              <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>
                                💬 {marker.replies.length} {marker.replies.length === 1 ? 'reply' : 'replies'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      
      {/* Video Call Modal Overlay */}
      {showCallModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) closeCallModal(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}
        />
      )}
      
      {/* Video Call Container - Always rendered when in call, positioned based on modal state */}
      {(isInCall || isJoiningCall) && callRoomUrl && (showCallModal || callPanelPos) && (
        <div style={{ 
          position: 'fixed',
          ...(showCallModal ? {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '700px',
            zIndex: 100
          } : {
            left: `${callPanelPos?.x ?? 20}px`,
            top: `${callPanelPos?.y ?? 20}px`,
            width: isCallCollapsed ? '220px' : `${callPanelSize.width}px`,
            zIndex: 50
          }),
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)', 
          border: '1px solid rgba(138, 43, 226, 0.4)', 
          borderRadius: isCallCollapsed && !showCallModal ? '10px' : '16px', 
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(138, 43, 226, 0.2)',
          transition: (isDragging || isResizing) ? 'none' : 'all 0.2s ease'
        }}>
          {/* Header - Draggable when minimized */}
          <div 
            onMouseDown={!showCallModal ? handleDragStart : undefined}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: showCallModal ? '16px 20px' : '8px 12px', 
              borderBottom: isCallCollapsed && !showCallModal ? 'none' : '1px solid rgba(138, 43, 226, 0.3)',
              cursor: !showCallModal ? (isDragging ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone className="h-3.5 w-3.5" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontSize: showCallModal ? '1rem' : '0.8rem', fontWeight: '600' }}>
                {showCallModal ? 'Video Call' : 'Call'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.65rem', color: '#86efac' }}>Live</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {!showCallModal && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsCallCollapsed(!isCallCollapsed); }} 
                    style={{ background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '4px', color: '#c4b5fd', cursor: 'pointer', padding: '3px 6px', fontSize: '0.65rem' }}
                  >
                    {isCallCollapsed ? '▼' : '▲'}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCallModal(true); setIsCallCollapsed(false); }} 
                    style={{ background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '4px', color: '#c4b5fd', cursor: 'pointer', padding: '3px 6px', fontSize: '0.65rem' }}
                  >
                    ⛶
                  </button>
                </>
              )}
              {showCallModal && (
                <button onClick={closeCallModal} style={{ background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '6px', color: '#c4b5fd', cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X className="h-3 w-3" />
                  Minimize
                </button>
              )}
            </div>
          </div>
          
          {/* Daily.co iframe - Always rendered, visually hidden when collapsed */}
          <div style={{ 
            height: showCallModal ? '450px' : (isCallCollapsed ? '1px' : `${callPanelSize.height}px`), 
            overflow: 'hidden',
            opacity: isCallCollapsed && !showCallModal ? 0 : 1,
            position: 'relative'
          }}>
            <iframe
              src={callRoomUrl}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ 
                width: '100%', 
                height: showCallModal ? '450px' : `${callPanelSize.height}px`, 
                border: 'none',
                position: isCallCollapsed && !showCallModal ? 'absolute' : 'relative',
                top: 0,
                left: 0
              }}
            />
          </div>
          
          {/* Resize Handle - Only in mini expanded view */}
          {!showCallModal && !isCallCollapsed && (
            <div 
              onMouseDown={handleResizeStart}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '16px',
                height: '16px',
                cursor: 'se-resize',
                background: 'linear-gradient(135deg, transparent 50%, rgba(138, 43, 226, 0.5) 50%)',
                borderRadius: '0 0 10px 0'
              }}
            />
          )}
          
          {/* PIP Tip - Only in expanded view */}
          {showCallModal && isInCall && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(138, 43, 226, 0.3)', background: 'rgba(34, 197, 94, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)' }}>
                  <Video className="h-4 w-4" style={{ color: '#86efac' }} />
                </div>
                <div>
                  <p style={{ color: '#86efac', fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>
                    💡 Tip: Use Picture-in-Picture mode to continue studying
                  </p>
                  <p style={{ color: '#6b9a7a', fontSize: '0.75rem', margin: '4px 0 0' }}>
                    Click the PIP button in Daily.co, then click "Minimize" to study
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Joining Call Modal - Before iframe is ready */}
      {showCallModal && isJoiningCall && !callRoomUrl && (
        <div style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '400px',
          zIndex: 100,
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)', 
          border: '1px solid rgba(138, 43, 226, 0.4)', 
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(138, 43, 226, 0.2)'
        }}>
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#a855f7', margin: '0 auto 20px' }} />
          <p style={{ color: '#c4b5fd', fontSize: '1.1rem', margin: 0 }}>Connecting to video call...</p>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '8px 0 0' }}>Setting up your camera and microphone</p>
        </div>
      )}

      {/* Add Marker Modal */}
      {showAddMarker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(15, 5, 25, 0.98) 0%, rgba(25, 10, 40, 0.98) 100%)', border: '1px solid rgba(138, 43, 226, 0.4)', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Add Marker at {formatTime(currentTime)}</h2>
              <button onClick={() => setShowAddMarker(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}><X className="h-5 w-5" /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '6px' }}>Type</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[{ type: 'highlight', label: 'Highlight', color: '#f59e0b' }, { type: 'note', label: 'Note', color: '#22c55e' }, { type: 'question', label: 'Question', color: '#3b82f6' }, { type: 'critique', label: 'Critique', color: '#a855f7' }].map(t => (
                    <button key={t.type} onClick={() => setNewMarkerType(t.type as typeof newMarkerType)} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: newMarkerType === t.type ? `${t.color}25` : 'rgba(138, 43, 226, 0.1)', border: newMarkerType === t.type ? `1px solid ${t.color}` : '1px solid rgba(138, 43, 226, 0.2)', color: newMarkerType === t.type ? t.color : '#6b7280', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '6px' }}>Title</label>
                <input value={newMarkerTitle} onChange={(e) => setNewMarkerTitle(e.target.value)} placeholder="Enter marker title..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '6px' }}>Description (optional)</label>
                <textarea value={newMarkerContent} onChange={(e) => setNewMarkerContent(e.target.value)} placeholder="Add details..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'none' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setShowAddMarker(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleCreateMarker} disabled={!newMarkerTitle.trim()} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: newMarkerTitle.trim() ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgba(138, 43, 226, 0.2)', border: 'none', color: newMarkerTitle.trim() ? '#fff' : '#6b7280', cursor: newMarkerTitle.trim() ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: '600' }}>Add Marker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
