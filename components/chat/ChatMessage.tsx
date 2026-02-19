"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Pin, Trash2, Reply, Download, Play } from "lucide-react";
import type { Message, MessageAttachment } from "@/hooks/useChat";

interface ChatMessageProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

export function ChatMessage({ message, onDelete, onPin, onReply }: ChatMessageProps) {
  const { data: session } = useSession();
  const [showOptions, setShowOptions] = useState(false);
  
  const isCurrentUser = session?.user?.id === message.senderId;
  
  // Format timestamp to human-readable time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if message mentions the current user
  const isMentioned = message.mentions.includes(session?.user?.id || '');

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        position: 'relative',
      }}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Avatar for other users */}
      {!isCurrentUser && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '8px',
          flexShrink: 0,
          color: '#e9d5ff',
          fontSize: '0.7rem',
          fontWeight: '600',
        }}>
          {getInitials(message.sender.name)}
        </div>
      )}

      <div style={{
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
      }}>
        {/* Sender name for messages from others */}
        {!isCurrentUser && (
          <span style={{
            color: '#c4b5fd',
            fontSize: '0.75rem',
            fontWeight: '500',
            marginBottom: '4px',
            marginLeft: '4px',
          }}>
            {message.sender.name}
          </span>
        )}

        {/* Message bubble */}
        <div style={{
          padding: '10px 14px',
          borderRadius: isCurrentUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isCurrentUser 
            ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)'
            : isMentioned
              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)'
              : 'rgba(26, 10, 46, 0.6)',
          border: message.isPinned 
            ? '1px solid rgba(251, 191, 36, 0.5)'
            : isMentioned
              ? '1px solid rgba(251, 191, 36, 0.4)'
              : isCurrentUser 
                ? '1px solid rgba(168, 85, 247, 0.5)' 
                : '1px solid rgba(138, 43, 226, 0.3)',
          position: 'relative',
        }}>
          {/* Reply context */}
          {message.replyTo && (
            <div style={{
              padding: '6px 10px',
              marginBottom: '8px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '2px solid rgba(168, 85, 247, 0.6)',
              borderRadius: '4px',
            }}>
              <p style={{
                color: '#c4b5fd',
                fontSize: '0.7rem',
                fontWeight: '500',
                margin: 0,
              }}>
                {message.replyTo.senderName}
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.75rem',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              }}>
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: message.content ? '8px' : 0,
            }}>
              {message.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    position: 'relative',
                  }}
                >
                  {attachment.fileType.startsWith('image/') ? (
                    <a 
                      href={attachment.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'block' }}
                    >
                      <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        style={{
                          maxWidth: '240px',
                          maxHeight: '180px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </a>
                  ) : attachment.fileType.startsWith('video/') ? (
                    <div style={{ position: 'relative', maxWidth: '280px' }}>
                      <video
                        src={attachment.fileUrl}
                        controls
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          display: 'block',
                          background: '#000',
                        }}
                      />
                    </div>
                  ) : (
                    <a
                      href={attachment.fileUrl}
                      download={attachment.fileName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'rgba(138, 43, 226, 0.15)',
                        color: '#c4b5fd',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                      }}
                    >
                      <Download style={{ height: '16px', width: '16px' }} />
                      <span style={{
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {attachment.fileName}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          {message.content && (
            <p style={{
              color: '#fff',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}>
              {message.content}
            </p>
          )}
          
          {/* Pin indicator */}
          {message.isPinned && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
              color: '#fbbf24',
              fontSize: '0.7rem',
            }}>
              <Pin style={{ height: '10px', width: '10px' }} />
              <span>Pinned</span>
            </div>
          )}
          
          {/* Timestamp and read status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '4px',
            gap: '8px',
          }}>
            <span style={{
              color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#9ca3af',
              fontSize: '0.7rem',
            }}>
              {formatTimestamp(message.createdAt)}
            </span>
            
            {isCurrentUser && (
              <span style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.7rem',
              }}>
                {message.readBy.length > 1 ? `Read (${message.readBy.length - 1})` : "Sent"}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Message options */}
      {showOptions && (onDelete || onPin || onReply) && (
        <div style={{
          position: 'absolute',
          top: isCurrentUser ? '0' : '18px',
          ...(isCurrentUser ? { left: '0', transform: 'translateX(calc(-100% - 8px))' } : { right: '0', transform: 'translateX(calc(100% + 8px))' }),
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          borderRadius: '8px',
          padding: '4px',
          display: 'flex',
          gap: '2px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 10,
        }}>
          {onReply && (
            <button 
              onClick={() => onReply(message.id)}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#9ca3af',
              }}
              className="hover:bg-purple-500/20"
              title="Reply"
            >
              <Reply style={{ height: '14px', width: '14px' }} />
            </button>
          )}
          
          {onPin && (
            <button 
              onClick={() => onPin(message.id)}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: message.isPinned ? '#fbbf24' : '#9ca3af',
              }}
              className="hover:bg-purple-500/20"
              title={message.isPinned ? "Unpin" : "Pin"}
            >
              <Pin style={{ height: '14px', width: '14px' }} />
            </button>
          )}
          
          {onDelete && (isCurrentUser || session?.user?.role === "ADMIN" || session?.user?.role === "COACH") && (
            <button 
              onClick={() => onDelete(message.id)}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#f87171',
              }}
              className="hover:bg-red-500/20"
              title="Delete"
            >
              <Trash2 style={{ height: '14px', width: '14px' }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
