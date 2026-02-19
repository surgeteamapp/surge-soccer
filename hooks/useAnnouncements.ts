import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  authorId: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  teamId?: string;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  reactions: {
    userId: string;
    emoji: string;
  }[];
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority: Announcement['priority'];
  teamId?: string;
  isPinned?: boolean;
  expiresAt?: string;
}

export function useAnnouncements() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async (showLoading = false) => {
    if (!session?.user) {
      if (showLoading) setIsLoading(false);
      return;
    }
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await fetch('/api/announcements');
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      
      // Only update if data changed
      setAnnouncements(prev => {
        if (prev.length !== data.length) return data;
        const hasChanges = data.some((ann: Announcement, i: number) => 
          prev[i]?.id !== ann.id || 
          prev[i]?.isPinned !== ann.isPinned ||
          prev[i]?.readBy.length !== ann.readBy.length ||
          prev[i]?.reactions.length !== ann.reactions.length
        );
        return hasChanges ? data : prev;
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load announcements';
      console.error('Error fetching announcements:', errorMessage);
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [session]);

  // Load announcements on mount
  useEffect(() => {
    if (isInitialLoad.current && session?.user) {
      fetchAnnouncements(true);
      isInitialLoad.current = false;
    }
  }, [session, fetchAnnouncements]);

  // Poll for updates every 15 seconds
  useEffect(() => {
    if (!session?.user) return;
    
    const interval = setInterval(() => {
      fetchAnnouncements(false);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [session, fetchAnnouncements]);

  // Check if user can create announcements (admin, coach, team_manager)
  const canCreateAnnouncement = useCallback(() => {
    if (!session?.user) return false;
    const role = session.user.role;
    return role === 'ADMIN' || role === 'COACH' || role === 'TEAM_MANAGER';
  }, [session]);

  // Create a new announcement
  const createAnnouncement = useCallback(async (input: CreateAnnouncementInput) => {
    if (!session?.user || !canCreateAnnouncement()) {
      setError('You do not have permission to create announcements');
      return null;
    }

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      const newAnnouncement = await response.json();
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Failed to create announcement');
      return null;
    }
  }, [session, canCreateAnnouncement]);

  // Delete an announcement
  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!session?.user) return;
    
    // Optimistic update
    const originalAnnouncements = [...announcements];
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));

    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setAnnouncements(originalAnnouncements);
      setError('Failed to delete announcement');
    }
  }, [session, announcements]);

  // Pin/unpin an announcement
  const togglePin = useCallback(async (announcementId: string) => {
    if (!session?.user || !canCreateAnnouncement()) return;

    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement) return;

    const newPinnedState = !announcement.isPinned;

    // Optimistic update
    setAnnouncements(prev => prev.map(a => 
      a.id === announcementId 
        ? { ...a, isPinned: newPinnedState }
        : a
    ));

    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinnedState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update announcement');
      }
    } catch (err) {
      console.error('Error updating announcement:', err);
      // Revert on error
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId 
          ? { ...a, isPinned: !newPinnedState }
          : a
      ));
      setError('Failed to pin announcement');
    }
  }, [session, canCreateAnnouncement, announcements]);

  // Mark announcement as read
  const markAsRead = useCallback(async (announcementId: string) => {
    if (!session?.user) return;

    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement || announcement.readBy.includes(session.user.id)) return;

    // Optimistic update
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        return { ...a, readBy: [...a.readBy, session.user.id] };
      }
      return a;
    }));

    try {
      await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [session, announcements]);

  // Add reaction to announcement
  const addReaction = useCallback(async (announcementId: string, emoji: string) => {
    if (!session?.user) return;

    // Optimistic update
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const filteredReactions = a.reactions.filter(r => r.userId !== session.user.id);
        return {
          ...a,
          reactions: [...filteredReactions, { userId: session.user.id, emoji }],
        };
      }
      return a;
    }));

    try {
      await fetch(`/api/announcements/${announcementId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  }, [session]);

  // Remove reaction from announcement
  const removeReaction = useCallback(async (announcementId: string) => {
    if (!session?.user) return;

    const announcement = announcements.find(a => a.id === announcementId);
    const userReaction = announcement?.reactions.find(r => r.userId === session.user.id);

    // Optimistic update
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        return {
          ...a,
          reactions: a.reactions.filter(r => r.userId !== session.user.id),
        };
      }
      return a;
    }));

    try {
      await fetch(`/api/announcements/${announcementId}/reactions`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error removing reaction:', err);
      // Revert on error
      if (userReaction) {
        setAnnouncements(prev => prev.map(a => {
          if (a.id === announcementId) {
            return {
              ...a,
              reactions: [...a.reactions, userReaction],
            };
          }
          return a;
        }));
      }
    }
  }, [session, announcements]);

  // Get sorted announcements (pinned first, then by date)
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // Pinned items first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by priority (urgent > high > normal > low)
    const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get unread count
  const unreadCount = announcements.filter(
    a => session?.user && !a.readBy.includes(session.user.id)
  ).length;

  return {
    announcements: sortedAnnouncements,
    isLoading,
    error,
    unreadCount,
    canCreateAnnouncement: canCreateAnnouncement(),
    createAnnouncement,
    deleteAnnouncement,
    togglePin,
    markAsRead,
    addReaction,
    removeReaction,
  };
}
