"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Megaphone, Plus, Filter, X, AlertTriangle } from "lucide-react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function CommunicationPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"chats" | "announcements">("chats");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnounceHover, setNewAnnounceHover] = useState(false);
  const [filterHover, setFilterHover] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  
  const { chatRooms, isLoading, error, createDirectChat, createGroupChat } = useChatRooms();
  const { 
    announcements, 
    isLoading: announcementsLoading,
    deleteAnnouncement,
    togglePin,
    markAsRead,
    addReaction,
    removeReaction,
    createAnnouncement,
  } = useAnnouncements();
  
  // New announcement form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [isCreating, setIsCreating] = useState(false);
  
  // Check if user can view announcements (admin, team manager, coach only)
  const userRole = (session?.user?.role as string)?.toUpperCase();
  const canViewAnnouncements = ['ADMIN', 'TEAM_MANAGER', 'COACH'].includes(userRole);
  
  // Separate pinned and non-pinned announcements
  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const nonPinnedAnnouncements = announcements
    .filter(a => !a.isPinned)
    .filter(a => !priorityFilter || a.priority === priorityFilter);
  
  // Check if user can create announcements
  const canCreateAnnouncements = ['ADMIN', 'TEAM_MANAGER', 'COACH'].includes(userRole);
  
  // Check if we're in mobile view (only for very small screens)
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobileView();
    
    // Listen for resize events
    window.addEventListener("resize", checkMobileView);
    
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);
  
  // Get selected room details
  const selectedRoomDetails = chatRooms.find(room => room.id === selectedRoom);
  
  // Handle room selection
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };
  
  // Handle back button click in mobile view
  const handleBack = () => {
    setSelectedRoom(null);
  };

  // Handle creating a new direct message chat
  const handleCreateDirectChat = async (userId: string, userName: string) => {
    const roomId = await createDirectChat(userId);
    if (roomId) {
      setSelectedRoom(roomId);
    }
  };

  // Handle creating a new group chat
  const handleCreateGroupChat = async (userIds: string[], groupName: string) => {
    const roomId = await createGroupChat(userIds, groupName);
    if (roomId) {
      setSelectedRoom(roomId);
    }
  };

  // Unread counts for badges
  const unreadChats = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  // Handle creating a new announcement
  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsCreating(true);
    try {
      await createAnnouncement({
        title: newTitle.trim(),
        content: newContent.trim(),
        priority: newPriority,
      });
      setNewTitle("");
      setNewContent("");
      setNewPriority("NORMAL");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create announcement:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        gap: '16px',
        minHeight: '600px',
      }}>
        {/* Sidebar - always visible */}
        <div style={{
          width: '280px',
          minWidth: '220px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: isMobileView && selectedRoom ? 'none' : 'flex',
          flexDirection: 'column',
          height: '600px',
        }}>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
            }}>
              <button
                onClick={() => setActiveTab("chats")}
                onMouseEnter={() => setHoveredTab("chats")}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  flex: 1,
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeTab === "chats" 
                    ? 'linear-gradient(180deg, rgba(138, 43, 226, 0.2) 0%, transparent 100%)' 
                    : hoveredTab === "chats"
                      ? 'linear-gradient(180deg, rgba(138, 43, 226, 0.1) 0%, transparent 100%)'
                      : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === "chats" 
                    ? '2px solid #a855f7' 
                    : '2px solid transparent',
                  color: activeTab === "chats" ? '#c084fc' : hoveredTab === "chats" ? '#e9d5ff' : '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  transform: hoveredTab === "chats" && activeTab !== "chats" ? 'translateY(-2px)' : 'none',
                }}
              >
                <MessageSquare style={{ height: '20px', width: '20px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Chats</span>
                {unreadChats > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '30%',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    borderRadius: '9px',
                    background: '#a855f7',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadChats}
                  </span>
                )}
              </button>
              {canViewAnnouncements && (
                <button
                  onClick={() => setActiveTab("announcements")}
                  onMouseEnter={() => setHoveredTab("announcements")}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    flex: 1,
                    padding: '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeTab === "announcements" 
                      ? 'linear-gradient(180deg, rgba(138, 43, 226, 0.2) 0%, transparent 100%)' 
                      : hoveredTab === "announcements"
                        ? 'linear-gradient(180deg, rgba(138, 43, 226, 0.1) 0%, transparent 100%)'
                        : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === "announcements" 
                      ? '2px solid #a855f7' 
                      : '2px solid transparent',
                    color: activeTab === "announcements" ? '#c084fc' : hoveredTab === "announcements" ? '#e9d5ff' : '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: hoveredTab === "announcements" && activeTab !== "announcements" ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <Megaphone style={{ height: '20px', width: '20px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Announcements</span>
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === "chats" && (
              <ChatRoomList 
                chatRooms={chatRooms} 
                isLoading={isLoading} 
                selectedRoomId={selectedRoom} 
                onSelectRoom={handleSelectRoom}
                onCreateDirectChat={handleCreateDirectChat}
                onCreateGroupChat={handleCreateGroupChat}
              />
            )}

            {activeTab === "announcements" && canViewAnnouncements && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Pinned Announcements Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📌 Pinned
                  </span>
                  <span style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                  }}>
                    {pinnedAnnouncements.length}
                  </span>
                </div>
                
                {/* Pinned Announcements List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                  {pinnedAnnouncements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '0.85rem' }}>
                      No pinned announcements
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pinnedAnnouncements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement.id}
                          announcement={announcement}
                          onDelete={deleteAnnouncement}
                          onTogglePin={togglePin}
                          onMarkAsRead={markAsRead}
                          onAddReaction={addReaction}
                          onRemoveReaction={removeReaction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 3,
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '600px',
        }}>
          {activeTab === "announcements" && canViewAnnouncements ? (
            /* All Announcements (non-pinned) View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Megaphone style={{ height: '24px', width: '24px', color: '#a855f7' }} />
                <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                  All Announcements
                </h2>
                <span style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#c4b5fd',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}>
                  {nonPinnedAnnouncements.length}
                </span>
                
                {/* Right side buttons */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Filter Button */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setFilterOpen(!filterOpen)}
                      onMouseEnter={() => setFilterHover(true)}
                      onMouseLeave={() => setFilterHover(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: filterOpen || priorityFilter
                          ? 'rgba(168, 85, 247, 0.3)'
                          : filterHover 
                            ? 'rgba(138, 43, 226, 0.2)' 
                            : 'rgba(138, 43, 226, 0.1)',
                        border: filterOpen || priorityFilter
                          ? '1px solid rgba(168, 85, 247, 0.5)'
                          : '1px solid rgba(138, 43, 226, 0.3)',
                        color: filterOpen || priorityFilter ? '#e9d5ff' : filterHover ? '#c4b5fd' : '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Filter style={{ height: '14px', width: '14px' }} />
                      {priorityFilter || 'Filter'}
                    </button>
                    
                    {filterOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                        border: '1px solid rgba(138, 43, 226, 0.4)',
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 50,
                        minWidth: '120px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                      }}>
                        {['All', 'URGENT', 'HIGH', 'NORMAL', 'LOW'].map((priority) => (
                          <button
                            key={priority}
                            onClick={() => {
                              setPriorityFilter(priority === 'All' ? null : priority);
                              setFilterOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: (priority === 'All' && !priorityFilter) || priorityFilter === priority
                                ? 'rgba(168, 85, 247, 0.2)'
                                : 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#c4b5fd',
                              fontSize: '0.8rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* New Announcement Button */}
                  {canCreateAnnouncements && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      onMouseEnter={() => setNewAnnounceHover(true)}
                      onMouseLeave={() => setNewAnnounceHover(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: newAnnounceHover
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.35) 100%)'
                          : 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(138, 43, 226, 0.2) 100%)',
                        border: newAnnounceHover
                          ? '1px solid rgba(168, 85, 247, 0.6)'
                          : '1px solid rgba(138, 43, 226, 0.4)',
                        color: newAnnounceHover ? '#fff' : '#e9d5ff',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: newAnnounceHover ? '0 0 20px rgba(138, 43, 226, 0.4)' : 'none',
                        transform: newAnnounceHover ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Plus style={{ height: '16px', width: '16px' }} />
                      New
                    </button>
                  )}
                </div>
              </div>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {announcementsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Loading announcements...
                  </div>
                ) : nonPinnedAnnouncements.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                  }}>
                    <Megaphone style={{ height: '48px', width: '48px', color: 'rgba(168, 85, 247, 0.4)', marginBottom: '16px' }} />
                    <p style={{ color: '#9ca3af', margin: 0 }}>No announcements yet</p>
                  </div>
                ) : (
                  nonPinnedAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onDelete={deleteAnnouncement}
                      onTogglePin={togglePin}
                      onMarkAsRead={markAsRead}
                      onAddReaction={addReaction}
                      onRemoveReaction={removeReaction}
                    />
                  ))
                )}
              </div>
            </div>
          ) : selectedRoom && selectedRoomDetails ? (
            <ChatRoom 
              roomId={selectedRoomDetails.id} 
              roomName={selectedRoomDetails.name} 
              roomType={selectedRoomDetails.type}
              onBack={isMobileView ? handleBack : undefined}
            />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(168, 85, 247, 0.3) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <MessageSquare style={{ height: '36px', width: '36px', color: '#c084fc' }} />
              </div>
              <h3 style={{ 
                color: '#fff', 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                margin: '0 0 8px 0',
                textAlign: 'center',
              }}>
                Select a chat to start messaging
              </h3>
              <p style={{ 
                color: '#9ca3af', 
                margin: 0, 
                textAlign: 'center',
                maxWidth: '300px',
              }}>
                Choose a chat room from the sidebar to begin your conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 10, 40, 0.98) 0%, rgba(30, 15, 50, 0.95) 100%)',
            border: '1px solid rgba(138, 43, 226, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                Create Announcement
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Announcement title..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(138, 43, 226, 0.1)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(138, 43, 226, 0.1)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Priority
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'LOW', label: 'Low', color: '#6b7280' },
                    { value: 'NORMAL', label: 'Normal', color: '#3b82f6' },
                    { value: 'HIGH', label: 'High', color: '#f59e0b' },
                    { value: 'URGENT', label: 'Urgent', color: '#ef4444' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setNewPriority(p.value as any)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: newPriority === p.value ? `${p.color}30` : 'rgba(138, 43, 226, 0.1)',
                        border: newPriority === p.value ? `2px solid ${p.color}` : '1px solid rgba(138, 43, 226, 0.2)',
                        color: newPriority === p.value ? p.color : '#9ca3af',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(138, 43, 226, 0.1)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#c4b5fd',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={!newTitle.trim() || !newContent.trim() || isCreating}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: !newTitle.trim() || !newContent.trim() || isCreating
                    ? 'rgba(138, 43, 226, 0.2)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  color: !newTitle.trim() || !newContent.trim() || isCreating ? '#6b7280' : '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: !newTitle.trim() || !newContent.trim() || isCreating ? 'not-allowed' : 'pointer',
                }}
              >
                {isCreating ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
