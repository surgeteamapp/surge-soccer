"use client";

import { Users, MessageSquare, UserPlus, Search, Loader2, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { ChatRoom } from "@/hooks/useChatRooms";
import { NewDirectMessageModal } from "./NewDirectMessageModal";

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  isLoading: boolean;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateDirectChat?: (userId: string, userName: string) => void;
  onCreateGroupChat?: (userIds: string[], groupName: string) => void;
}

export function ChatRoomList({
  chatRooms,
  isLoading,
  selectedRoomId,
  onSelectRoom,
  onCreateDirectChat,
  onCreateGroupChat,
}: ChatRoomListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "TEAM": true,
    "PLAYERS": true,
    "PRACTICE": true,
    "DIRECT": true,
  });
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isNewMsgHovered, setIsNewMsgHovered] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState<string | null>(null);
  
  const handleCreateChat = (userId: string, userName: string) => {
    if (onCreateDirectChat) {
      onCreateDirectChat(userId, userName);
    }
  };
  
  const handleCreateGroupChat = (userIds: string[], groupName: string) => {
    if (onCreateGroupChat) {
      onCreateGroupChat(userIds, groupName);
    }
  };
  
  // Group rooms by type
  const groupedRooms: Record<string, ChatRoom[]> = chatRooms.reduce(
    (groups, room) => {
      if (!groups[room.type]) {
        groups[room.type] = [];
      }
      groups[room.type].push(room);
      return groups;
    },
    {} as Record<string, ChatRoom[]>
  );
  
  // Filter rooms by search query (name AND message content)
  const filterRooms = (rooms: ChatRoom[]) => {
    if (!searchQuery) return rooms;
    const query = searchQuery.toLowerCase();
    return rooms.filter(room => 
      room.name.toLowerCase().includes(query) ||
      (room.lastMessage?.content?.toLowerCase().includes(query)) ||
      (room.lastMessage?.sender?.toLowerCase().includes(query))
    );
  };

  // Get search results with matches for preview
  const getSearchResults = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const results: { roomId: string; roomName: string; matchType: 'name' | 'message' | 'sender'; matchText: string }[] = [];
    
    chatRooms.forEach(room => {
      if (room.name.toLowerCase().includes(query)) {
        results.push({ roomId: room.id, roomName: room.name, matchType: 'name', matchText: room.name });
      }
      if (room.lastMessage?.content?.toLowerCase().includes(query)) {
        results.push({ roomId: room.id, roomName: room.name, matchType: 'message', matchText: room.lastMessage.content });
      }
      if (room.lastMessage?.sender?.toLowerCase().includes(query)) {
        results.push({ roomId: room.id, roomName: room.name, matchType: 'sender', matchText: room.lastMessage.sender });
      }
    });
    
    return results.slice(0, 8); // Limit to 8 results
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} style={{ background: 'rgba(168, 85, 247, 0.5)', color: '#fff', padding: '0 2px', borderRadius: '2px' }}>{part}</span>
        : part
    );
  };

  const searchResults = getSearchResults();
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  
  // Get category title
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "TEAM": return "Team Chats";
      case "PLAYERS": return "Player Chats";
      case "PRACTICE": return "Practice Chats";
      case "DIRECT": return "Direct Messages";
      default: return category;
    }
  };
  
  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Get room icon
  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case "DIRECT":
        return <UserPlus style={{ height: '16px', width: '16px' }} />;
      case "TEAM":
      case "PLAYERS":
      case "PRACTICE":
      default:
        return <Users style={{ height: '16px', width: '16px' }} />;
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search Box */}
      <div style={{ padding: '16px', borderBottom: searchResults.length > 0 ? 'none' : '1px solid rgba(138, 43, 226, 0.2)' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            height: '16px', 
            width: '16px', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search chats & messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '38px',
              paddingRight: '14px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '10px',
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
      
      {/* Search Results Preview */}
      {searchResults.length > 0 && (
        <div style={{
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
          maxHeight: '250px',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(138, 43, 226, 0.05)',
            borderBottom: '1px solid rgba(138, 43, 226, 0.1)',
          }}>
            <span style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Results ({searchResults.length})
            </span>
          </div>
          {searchResults.map((result, index) => (
            <button
              key={`${result.roomId}-${result.matchType}-${index}`}
              onClick={() => {
                onSelectRoom(result.roomId);
                setSearchQuery('');
              }}
              onMouseEnter={() => setHoveredSearchResult(`${result.roomId}-${index}`)}
              onMouseLeave={() => setHoveredSearchResult(null)}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '10px 16px',
                background: hoveredSearchResult === `${result.roomId}-${index}` 
                  ? 'rgba(138, 43, 226, 0.15)' 
                  : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(138, 43, 226, 0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '500' }}>
                  {result.roomName}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: result.matchType === 'name' 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : result.matchType === 'sender'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(168, 85, 247, 0.2)',
                  color: result.matchType === 'name' 
                    ? '#60a5fa' 
                    : result.matchType === 'sender'
                      ? '#34d399'
                      : '#c4b5fd',
                }}>
                  {result.matchType === 'name' ? 'Chat' : result.matchType === 'sender' ? 'Person' : 'Message'}
                </span>
              </div>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.75rem',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>
                {highlightText(result.matchText, searchQuery)}
              </p>
            </button>
          ))}
        </div>
      )}
      
      {/* Room List */}
      <div className="scrollbar-purple" style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Loader2 style={{ height: '32px', width: '32px', color: '#a855f7' }} className="animate-spin" />
          </div>
        ) : chatRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
            <MessageSquare style={{ height: '40px', width: '40px', margin: '0 auto 8px', color: '#a855f7' }} />
            <p>No chat rooms available</p>
          </div>
        ) : (
          <div style={{ padding: '8px' }}>
            {Object.entries(groupedRooms).map(([category, rooms]) => {
              const filteredRooms = filterRooms(rooms);
              if (filteredRooms.length === 0) return null;
              
              return (
                <div key={category} style={{ marginBottom: '8px' }}>
                  {/* Category header */}
                  <button 
                    onClick={() => toggleCategory(category)}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: hoveredCategory === category ? 'rgba(138, 43, 226, 0.1)' : 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: hoveredCategory === category ? '#e9d5ff' : '#c4b5fd',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{getCategoryTitle(category)}</span>
                    <ChevronRight style={{ 
                      height: '14px', 
                      width: '14px',
                      transition: 'transform 0.2s',
                      transform: expandedCategories[category] ? 'rotate(90deg)' : 'rotate(0deg)',
                    }} />
                  </button>
                  
                  {/* Category rooms */}
                  {expandedCategories[category] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {filteredRooms.map((room) => {
                        const isSelected = selectedRoomId === room.id;
                        const hasUnread = room.unreadCount > 0;
                        
                        return (
                          <button
                            key={room.id}
                            onClick={() => onSelectRoom(room.id)}
                            onMouseEnter={() => setHoveredRoom(room.id)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              background: isSelected 
                                ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.4) 100%)'
                                : hoveredRoom === room.id
                                  ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%)'
                                  : 'rgba(138, 43, 226, 0.05)',
                              border: isSelected 
                                ? '1px solid rgba(168, 85, 247, 0.5)' 
                                : hoveredRoom === room.id
                                  ? '1px solid rgba(168, 85, 247, 0.3)'
                                  : '1px solid transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              transform: hoveredRoom === room.id && !isSelected ? 'translateX(4px)' : 'none',
                            }}
                          >
                            {/* Room icon */}
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: hasUnread 
                                ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)'
                                : 'rgba(138, 43, 226, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '12px',
                              color: hasUnread ? '#e9d5ff' : '#c4b5fd',
                              flexShrink: 0,
                            }}>
                              {getRoomIcon(room.type)}
                            </div>
                            
                            {/* Room info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{
                                  color: hasUnread ? '#fff' : '#d1d5db',
                                  fontSize: '0.9rem',
                                  fontWeight: hasUnread ? '600' : '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {room.name}
                                </span>
                                {room.lastMessage && (
                                  <span style={{ 
                                    color: '#6b7280', 
                                    fontSize: '0.7rem',
                                    marginLeft: '8px',
                                    flexShrink: 0,
                                  }}>
                                    {formatTime(room.lastMessage.timestamp)}
                                  </span>
                                )}
                              </div>
                              
                              {room.lastMessage && (
                                <p style={{
                                  color: hasUnread ? '#9ca3af' : '#6b7280',
                                  fontSize: '0.8rem',
                                  margin: '2px 0 0 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  <span style={{ fontWeight: '500' }}>{room.lastMessage.sender}:</span>{" "}
                                  {room.lastMessage.content}
                                </p>
                              )}
                            </div>
                            
                            {/* Unread badge */}
                            {hasUnread && (
                              <div style={{
                                marginLeft: '8px',
                                minWidth: '20px',
                                height: '20px',
                                padding: '0 6px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.8) 0%, rgba(168, 85, 247, 0.9) 100%)',
                                color: '#fff',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                {room.unreadCount}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* New Chat Button */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(138, 43, 226, 0.2)' }}>
        <button 
          onClick={() => setIsNewMessageModalOpen(true)}
          onMouseEnter={() => setIsNewMsgHovered(true)}
          onMouseLeave={() => setIsNewMsgHovered(false)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: isNewMsgHovered 
              ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)'
              : 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            transform: isNewMsgHovered ? 'translateY(-2px)' : 'none',
            boxShadow: isNewMsgHovered ? '0 4px 15px rgba(138, 43, 226, 0.4)' : 'none',
          }}>
          <Plus style={{ height: '16px', width: '16px' }} />
          New Message
        </button>
      </div>
      
      {/* New Direct Message Modal */}
      <NewDirectMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onCreateChat={handleCreateChat}
        onCreateGroupChat={handleCreateGroupChat}
      />
    </div>
  );
}
