"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, ChevronLeft, Hash } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  roomType: string;
  onBack?: () => void;
}

export function ChatRoom({ roomId, roomName, roomType, onBack }: ChatRoomProps) {
  const { data: session } = useSession();
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    togglePinMessage,
    setReplyTo,
    replyingTo,
    sendTyping,
    typingUsers
  } = useChat(roomId);

  // Create typing indicator message
  useEffect(() => {
    const typingUserNames = Object.values(typingUsers);
    if (typingUserNames.length === 0) {
      setTypingIndicator(null);
    } else if (typingUserNames.length === 1) {
      setTypingIndicator(`${typingUserNames[0]} is typing...`);
    } else if (typingUserNames.length === 2) {
      setTypingIndicator(`${typingUserNames[0]} and ${typingUserNames[1]} are typing...`);
    } else {
      setTypingIndicator(`${typingUserNames.length} people are typing...`);
    }
  }, [typingUsers]);

  // Handle message sending
  const handleSendMessage = (content: string, mentions: string[] = [], attachments?: File[]) => {
    if (!session?.user) return;
    sendMessage(content, mentions, attachments);
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    sendTyping(isTyping);
  };

  // Handle message deletion
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Handle message pinning
  const handlePinMessage = (messageId: string) => {
    togglePinMessage(messageId);
  };

  // Handle message reply
  const handleReplyMessage = (messageId: string) => {
    const messageToReply = messages.find(msg => msg.id === messageId);
    if (messageToReply) {
      setReplyTo(messageToReply);
    }
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // Get appropriate icon for room type
  const getRoomIcon = () => {
    switch (roomType) {
      case "DIRECT":
        return <Users style={{ height: '18px', width: '18px', color: '#c084fc' }} />;
      case "PLAYERS":
      case "PRACTICE":
      case "TEAM":
      default:
        return <Hash style={{ height: '18px', width: '18px', color: '#c084fc' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.8) 0%, rgba(26, 10, 46, 0.6) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button
              onClick={onBack}
              onMouseEnter={() => setIsBackHovered(true)}
              onMouseLeave={() => setIsBackHovered(false)}
              style={{
                padding: '8px',
                marginRight: '8px',
                borderRadius: '8px',
                background: isBackHovered 
                  ? 'rgba(138, 43, 226, 0.35)' 
                  : 'rgba(138, 43, 226, 0.2)',
                border: isBackHovered 
                  ? '1px solid rgba(168, 85, 247, 0.4)' 
                  : '1px solid transparent',
                cursor: 'pointer',
                color: isBackHovered ? '#e9d5ff' : '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                transform: isBackHovered ? 'translateX(-2px)' : 'none',
              }}
            >
              <ChevronLeft style={{ height: '20px', width: '20px' }} />
            </button>
          )}
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.4) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
          }}>
            {getRoomIcon()}
          </div>
          
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              {roomName}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
              {messages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div style={{
          margin: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '3px solid #f87171',
        }}>
          <p style={{ color: '#f87171', margin: 0, fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="scrollbar-purple" style={{ flex: 1, overflowY: 'auto' }}>
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          onDeleteMessage={handleDeleteMessage}
          onPinMessage={handlePinMessage}
          onReplyMessage={handleReplyMessage}
        />
      </div>

      {/* Typing indicator */}
      {typingIndicator && (
        <div style={{
          padding: '8px 16px',
          color: '#c4b5fd',
          fontSize: '0.8rem',
          fontStyle: 'italic',
        }}>
          {typingIndicator}
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(138, 43, 226, 0.15)',
          borderLeft: '3px solid #a855f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>
              Replying to {replyingTo.sender.name}
            </p>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '0.8rem', 
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={handleCancelReply}
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            style={{
              background: isCancelHovered 
                ? 'rgba(107, 114, 128, 0.5)' 
                : 'rgba(107, 114, 128, 0.3)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              color: isCancelHovered ? '#e5e7eb' : '#9ca3af',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: isCancelHovered ? 'scale(1.05)' : 'none',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Message Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={isLoading}
        placeholder={replyingTo ? `Reply to ${replyingTo.sender.name}...` : "Type a message..."}
      />
    </div>
  );
}
