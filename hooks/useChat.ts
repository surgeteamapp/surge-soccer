import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string | null;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  readBy: string[];
  mentions: string[];
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  attachments?: MessageAttachment[];
}

export function useChat(roomId: string | null) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const lastFetchRef = useRef<string | null>(null);
  const isSendingRef = useRef(false);
  
  // Fetch messages from API
  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!roomId || !session?.user) return;
    
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Only update if messages have changed (compare by length and last message id)
      setMessages(prev => {
        if (prev.length !== data.length) return data;
        if (prev.length === 0 && data.length === 0) return prev;
        if (prev[prev.length - 1]?.id !== data[data.length - 1]?.id) return data;
        // Check if any message was updated (e.g., pinned)
        const hasChanges = data.some((msg: Message, i: number) => 
          prev[i]?.isPinned !== msg.isPinned
        );
        return hasChanges ? data : prev;
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [roomId, session]);

  // Load messages when room changes
  useEffect(() => {
    if (!roomId || !session?.user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    
    // Only show loading if this is a different room
    const isNewRoom = lastFetchRef.current !== roomId;
    if (isNewRoom) {
      setMessages([]);
      lastFetchRef.current = roomId;
    }
    
    fetchMessages(isNewRoom);
  }, [roomId, session, fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!roomId || !session?.user) return;
    
    const interval = setInterval(() => {
      // Don't poll while sending to avoid race conditions
      if (!isSendingRef.current) {
        fetchMessages(false);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [roomId, session, fetchMessages]);

  // Send message function
  const sendMessage = useCallback(async (content: string, mentions: string[] = [], attachments?: File[]) => {
    if (!session?.user || !roomId) return;
    
    // Allow sending if there's content OR attachments
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
    
    isSendingRef.current = true;
    
    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: content.trim(),
      senderId: session.user.id,
      chatRoomId: roomId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      readBy: [session.user.id],
      mentions,
      sender: {
        id: session.user.id,
        name: session.user.name || 'You',
      },
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setReplyingTo(null);
    
    try {
      let response;
      
      if (attachments && attachments.length > 0) {
        // Use FormData for multipart upload with attachments
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('mentions', JSON.stringify(mentions));
        
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
        
        response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Standard JSON request for text-only messages
        response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: content.trim(), mentions }),
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? newMessage : msg
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
    } finally {
      isSendingRef.current = false;
    }
  }, [session, roomId]);

  // Delete message function
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!session?.user || !roomId) return;
    
    // Optimistic update
    const originalMessages = [...messages];
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      // Restore messages on error
      setMessages(originalMessages);
      setError('Failed to delete message');
    }
  }, [session, roomId, messages]);

  // Pin/unpin message function
  const togglePinMessage = useCallback(async (messageId: string) => {
    if (!session?.user || !roomId) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const newPinnedState = !message.isPinned;
    
    // Optimistic update
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, isPinned: newPinnedState }
        : m
    ));
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPinned: newPinnedState }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message');
      }
    } catch (err) {
      console.error('Error updating message:', err);
      // Revert on error
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, isPinned: !newPinnedState }
          : m
      ));
      setError('Failed to pin message');
    }
  }, [session, roomId, messages]);

  // Set reply to message
  const setReplyTo = useCallback((message: Message | null) => {
    setReplyingTo(message);
  }, []);
  
  // Typing indicator (no-op for now without WebSocket)
  const sendTyping = useCallback((isTyping: boolean) => {
    // Could implement with a separate API endpoint if needed
  }, []);
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    togglePinMessage,
    setReplyTo,
    replyingTo,
    sendTyping,
    typingUsers,
  };
}
