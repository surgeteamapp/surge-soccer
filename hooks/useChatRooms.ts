import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  teamId?: string;
  unreadCount: number;
  participants?: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
}

// Helper to check if rooms data has changed
const hasRoomsChanged = (oldRooms: ChatRoom[], newRooms: ChatRoom[]): boolean => {
  if (oldRooms.length !== newRooms.length) return true;
  
  for (let i = 0; i < newRooms.length; i++) {
    const oldRoom = oldRooms.find(r => r.id === newRooms[i].id);
    if (!oldRoom) return true;
    
    // Check if key properties changed
    if (oldRoom.unreadCount !== newRooms[i].unreadCount) return true;
    if (oldRoom.lastMessage?.content !== newRooms[i].lastMessage?.content) return true;
    if (oldRoom.lastMessage?.timestamp !== newRooms[i].lastMessage?.timestamp) return true;
  }
  
  return false;
};

export function useChatRooms() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Fetch chat rooms from API
  const fetchChatRooms = useCallback(async (showLoading = false) => {
    if (!session?.user) {
      if (showLoading) setIsLoading(false);
      return;
    }
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await fetch('/api/chat/rooms');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      
      const data = await response.json();
      
      // Only update state if data has actually changed
      setChatRooms(prev => {
        if (hasRoomsChanged(prev, data)) {
          return data;
        }
        return prev;
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load chat rooms';
      console.error('Error fetching chat rooms:', errorMessage);
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [session]);

  // Load chat rooms on mount
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchChatRooms(true);
      isInitialLoad.current = false;
    }
  }, [fetchChatRooms]);

  // Poll for updates every 10 seconds (less frequent to reduce flicker)
  useEffect(() => {
    if (!session?.user) return;
    
    const interval = setInterval(() => {
      fetchChatRooms(false); // Don't show loading on polls
    }, 10000);
    
    return () => clearInterval(interval);
  }, [session, fetchChatRooms]);

  // Create a new direct message chat room
  const createDirectChat = useCallback(async (userId: string): Promise<string | null> => {
    if (!session?.user) return null;
    
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'DIRECT',
          participantIds: [userId],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }
      
      const data = await response.json();
      
      // If it's a new room, add it to the list
      if (!data.isExisting) {
        setChatRooms(prev => [{
          id: data.id,
          name: data.name,
          type: data.type,
          unreadCount: 0,
          participants: data.participants,
        }, ...prev]);
      }
      
      return data.id;
    } catch (err) {
      console.error('Error creating direct chat:', err);
      setError('Failed to create chat');
      return null;
    }
  }, [session]);

  // Create a new group chat room
  const createGroupChat = useCallback(async (participantIds: string[], groupName: string): Promise<string | null> => {
    if (!session?.user) return null;
    
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'GROUP',
          name: groupName,
          participantIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create group chat');
      }
      
      const data = await response.json();
      
      // Add new group to the list
      setChatRooms(prev => [{
        id: data.id,
        name: data.name,
        type: data.type,
        unreadCount: 0,
        participants: data.participants,
      }, ...prev]);
      
      return data.id;
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError('Failed to create group chat');
      return null;
    }
  }, [session]);

  // Refresh chat rooms
  const refreshRooms = useCallback(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    chatRooms,
    isLoading,
    error,
    createDirectChat,
    createGroupChat,
    refreshRooms,
  };
}
