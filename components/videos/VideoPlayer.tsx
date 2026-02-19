"use client";

import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import DailyIframe from '@daily-co/daily-js';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface VideoPlayerProps {
  youtubeId?: string;
  dailyVideoId?: string;
  title: string;
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (time: number) => void;
  initialTimestamp?: number;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  drawingMode?: boolean;
}

export function VideoPlayer({
  youtubeId,
  dailyVideoId,
  title,
  onTimeUpdate,
  onSeek,
  initialTimestamp = 0,
  onFullscreenChange,
  drawingMode = false,
}: VideoPlayerProps) {
  // Player states
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTimestamp);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Refs
  const playerRef = useRef<any>(null);
  const dailyRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Daily.co setup
  useEffect(() => {
    let dailyObject: any = null;

    if (dailyVideoId && dailyRef.current) {
      // In a real app, you would get the Daily.co room URL from your backend
      const dailyUrl = `https://yourdomain.daily.co/${dailyVideoId}`;

      dailyObject = DailyIframe.createFrame({
        url: dailyUrl,
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
        },
      });

      dailyObject.join().catch((error: any) => {
        console.error('Failed to join Daily.co room:', error);
      });

      dailyRef.current.appendChild(dailyObject.iframe);
    }

    return () => {
      if (dailyObject) {
        dailyObject.destroy();
      }
    };
  }, [dailyVideoId]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocumentFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isDocumentFullscreen);
      
      if (onFullscreenChange) {
        onFullscreenChange(isDocumentFullscreen);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
      
      setControlsTimeout(timeout);
    };
    
    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [playing, controlsTimeout]);

  // Handle play/pause
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    
    const bounds = progressRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percent = x / bounds.width;
    const seekTime = percent * duration;
    
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime);
    }
    
    if (onSeek) {
      onSeek(seekTime);
    }
  };

  // Handle progress update from player
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    
    if (onTimeUpdate) {
      onTimeUpdate(state.playedSeconds);
    }
  };

  // Handle duration update from player
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  // Skip forward/backward
  const skipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(currentTime + 10, duration);
      playerRef.current.seekTo(newTime);
      
      if (onSeek) {
        onSeek(newTime);
      }
    }
  };

  const skipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      playerRef.current.seekTo(newTime);
      
      if (onSeek) {
        onSeek(newTime);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  // Determine what kind of player to show
  const renderPlayer = () => {
    if (youtubeId) {
      return (
        <ReactPlayer
          {...({
            ref: playerRef,
            url: `https://www.youtube.com/watch?v=${youtubeId}`,
            width: "100%",
            height: "100%",
            playing: playing,
            volume: volume,
            muted: muted,
            onProgress: handleProgress as any,
            onDuration: handleDuration,
            config: {
              youtube: {
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
                start: Math.floor(initialTimestamp),
              },
            } as any,
          } as any)}
        />
      );
    } else if (dailyVideoId) {
      return <div ref={dailyRef} className="w-full h-full" />;
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-white">No video source provided</p>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Video Player */}
      <div className="absolute inset-0">
        {renderPlayer()}
      </div>
      
      {/* Drawing Canvas Layer (if drawing mode is enabled) */}
      {drawingMode && (
        <div className="absolute inset-0 pointer-events-auto z-10">
          {/* Drawing canvas will be rendered here by parent component */}
        </div>
      )}
      
      {/* Video Title Overlay */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}
      
      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-2 group"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full relative group-hover:h-3 transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            {/* Play/Pause Button */}
            <button 
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            
            {/* Skip Backward */}
            <button
              onClick={skipBackward}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            
            {/* Time Display */}
            <div className="text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Volume Control */}
            <div className="flex items-center space-x-1 group relative">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 focus:outline-none"
              >
                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              
              {/* Volume Slider (shown on hover) */}
              <div className="hidden group-hover:flex items-center h-5 w-20">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
