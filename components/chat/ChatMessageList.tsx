"use client";

import { useRef, useEffect } from "react";
import { Loader2, Pin, MessageSquare } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "@/hooks/useChat";

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onPinMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onDeleteMessage,
  onPinMessage,
  onReplyMessage,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Group messages by date for date separators
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      const existingGroup = groups.find((group) => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  };
  
  // Format date for display
  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  // Get pinned messages at the top
  const pinnedMessages = messages.filter((message) => message.isPinned);
  const messageGroups = groupMessagesByDate();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <Loader2 style={{ height: '32px', width: '32px', color: '#a855f7' }} className="animate-spin" />
        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading messages...</span>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        flexDirection: 'column',
        gap: '12px',
        color: '#9ca3af',
      }}>
        <MessageSquare style={{ height: '48px', width: '48px', color: 'rgba(168, 85, 247, 0.4)' }} />
        <p style={{ margin: 0 }}>No messages yet. Start the conversation!</p>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '16px' }}>
      {/* Pinned Messages Section */}
      {pinnedMessages.length > 0 && (
        <div style={{
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px',
          }}>
            <Pin style={{ height: '12px', width: '12px', color: '#fbbf24' }} />
            <span style={{ 
              color: '#fbbf24', 
              fontSize: '0.75rem', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Pinned Messages
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pinnedMessages.map((message) => (
              <ChatMessage
                key={`pinned-${message.id}`}
                message={message}
                onDelete={onDeleteMessage}
                onPin={onPinMessage}
                onReply={onReplyMessage}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Message Groups by Date */}
      {messageGroups.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '20px 0',
          }}>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.3) 50%, transparent 100%)',
            }} />
            <span style={{
              padding: '6px 16px',
              background: 'rgba(138, 43, 226, 0.15)',
              borderRadius: '20px',
              color: '#c4b5fd',
              fontSize: '0.75rem',
              fontWeight: '500',
              border: '1px solid rgba(138, 43, 226, 0.2)',
            }}>
              {formatDateSeparator(group.date)}
            </span>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.3) 50%, transparent 100%)',
            }} />
          </div>
          
          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {group.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onDelete={onDeleteMessage}
                onPin={onPinMessage}
                onReply={onReplyMessage}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Automatic scroll to bottom anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
