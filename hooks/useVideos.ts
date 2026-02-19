import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface VideoNote {
  id: string;
  videoId: string;
  userId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  timestamp: number;
  content: string;
  drawingData?: any;
  createdAt: Date;
}

export interface VideoAssignment {
  id: string;
  videoId: string;
  assignedToId: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedById: string;
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  youtubeId?: string;
  dailyVideoId?: string;
  externalUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploaderId: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  duration?: number;
  isPublic: boolean;
  tags: string[];
  category: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt?: Date;
  notes: VideoNote[];
  assignments: VideoAssignment[];
  viewCount: number;
}

export interface VideoFilter {
  search?: string;
  tags?: string[];
  category?: string;
  dateRange?: { start: Date; end: Date };
  uploaderIds?: string[];
  assignedToMe?: boolean;
  isPublic?: boolean;
}

export function useVideos() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch videos from API
  const fetchVideos = useCallback(async (category?: string, search?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/videos?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      
      // Extract all unique tags
      const allTags = new Set<string>();
      data.forEach((video: Video) => {
        video.tags?.forEach((tag: string) => allTags.add(tag));
      });
      
      setVideos(data);
      setAvailableTags(Array.from(allTags));
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchVideos();
    }
  }, [session, fetchVideos]);

  // Filter videos based on criteria
  const filterVideos = (filter: VideoFilter): Video[] => {
    return videos.filter(video => {
      // Search term filter
      if (filter.search && !video.title.toLowerCase().includes(filter.search.toLowerCase()) && 
          !video.description?.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => video.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      // Date range filter
      if (filter.dateRange) {
        const videoDate = new Date(video.createdAt);
        if (videoDate < filter.dateRange.start || videoDate > filter.dateRange.end) {
          return false;
        }
      }
      
      // Uploader filter
      if (filter.uploaderIds && filter.uploaderIds.length > 0) {
        if (!filter.uploaderIds.includes(video.uploaderId)) {
          return false;
        }
      }
      
      // Assigned to me filter
      if (filter.assignedToMe && session?.user) {
        const assignedToMe = video.assignments.some(
          assignment => assignment.assignedToId === session.user.id
        );
        if (!assignedToMe) return false;
      }
      
      // Public/private filter
      if (filter.isPublic !== undefined && video.isPublic !== filter.isPublic) {
        return false;
      }
      
      return true;
    });
  };

  // Get a single video by ID
  const getVideoById = (id: string): Video | undefined => {
    return videos.find(video => video.id === id);
  };

  // Add a new video
  const addVideo = async (videoData: {
    title: string;
    description?: string;
    youtubeId?: string;
    externalUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    duration?: number;
  }): Promise<Video> => {
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add video');
      }
      
      const newVideo = await response.json();
      
      // Update local state
      setVideos(prevVideos => [newVideo, ...prevVideos]);
      
      // Update tags
      if (videoData.tags) {
        const newTags = videoData.tags.filter(tag => !availableTags.includes(tag));
        if (newTags.length > 0) {
          setAvailableTags(prevTags => [...prevTags, ...newTags]);
        }
      }
      
      return newVideo;
    } catch (err) {
      console.error('Failed to add video:', err);
      const message = err instanceof Error ? err.message : 'Failed to add video. Please try again later.';
      setError(message);
      throw err;
    }
  };

  // Upload a video file
  const uploadVideoFile = async (file: File): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload video');
    }
    
    return response.json();
  };

  // Add a note to a video
  const addNoteToVideo = async (
    videoId: string,
    noteData: { timestamp: number; content: string; drawingData?: any }
  ): Promise<VideoNote> => {
    if (!session?.user) {
      throw new Error('User must be authenticated to add notes');
    }
    
    try {
      // TODO: Implement API call for notes
      const newNote: VideoNote = {
        ...noteData,
        id: `note-${Date.now()}`,
        videoId,
        userId: session.user.id,
        createdAt: new Date(),
      };
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              notes: [...video.notes, newNote],
            };
          }
          return video;
        })
      );
      
      return newNote;
    } catch (err) {
      console.error('Failed to add note:', err);
      setError('Failed to add note. Please try again later.');
      throw err;
    }
  };

  // Assign a video to users
  const assignVideo = async (
    videoId: string,
    assignedToId: string,
    dueDate?: Date,
    notes?: string
  ): Promise<VideoAssignment> => {
    if (!session?.user) {
      throw new Error('User must be authenticated to assign videos');
    }
    
    try {
      // TODO: Implement API call for assignments
      const newAssignment: VideoAssignment = {
        id: `assignment-${Date.now()}`,
        videoId,
        assignedToId,
        assignedById: session.user.id,
        dueDate,
        isCompleted: false,
        notes,
      };
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              assignments: [...video.assignments, newAssignment],
            };
          }
          return video;
        })
      );
      
      return newAssignment;
    } catch (err) {
      console.error('Failed to assign video:', err);
      setError('Failed to assign video. Please try again later.');
      throw err;
    }
  };

  // Mark a video assignment as completed
  const completeVideoAssignment = async (videoId: string, assignmentId: string): Promise<void> => {
    if (!session?.user) {
      throw new Error('User must be authenticated to complete assignments');
    }
    
    try {
      // In a real implementation, we would send this to the API
      // For now, we'll just simulate it
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video.id === videoId) {
            const updatedAssignments = video.assignments.map(assignment => {
              if (assignment.id === assignmentId) {
                return {
                  ...assignment,
                  isCompleted: true,
                  completedAt: new Date(),
                };
              }
              return assignment;
            });
            
            return {
              ...video,
              assignments: updatedAssignments,
            };
          }
          return video;
        })
      );
    } catch (err) {
      console.error('Failed to complete assignment:', err);
      setError('Failed to mark assignment as completed. Please try again later.');
      throw err;
    }
  };

  // Record a video view
  const recordVideoView = async (videoId: string): Promise<void> => {
    try {
      // In a real implementation, we would send this to the API
      // For now, we'll just simulate it
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              viewCount: video.viewCount + 1,
            };
          }
          return video;
        })
      );
    } catch (err) {
      console.error('Failed to record view:', err);
      // Don't set error here as this is a non-critical operation
    }
  };

  return {
    videos,
    availableTags,
    isLoading,
    error,
    fetchVideos,
    filterVideos,
    getVideoById,
    addVideo,
    uploadVideoFile,
    addNoteToVideo,
    assignVideo,
    completeVideoAssignment,
    recordVideoView,
  };
}
