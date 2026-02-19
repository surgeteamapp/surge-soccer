"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Megaphone, Loader2, Filter } from "lucide-react";
import { AnnouncementCard } from "./AnnouncementCard";
import { CreateAnnouncementModal } from "./CreateAnnouncementModal";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import type { Announcement } from "@/hooks/useAnnouncements";

type FilterPriority = 'ALL' | Announcement['priority'];

export function AnnouncementList() {
  const { data: session } = useSession();
  const {
    announcements,
    isLoading,
    error,
    unreadCount,
    canCreateAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    togglePin,
    markAsRead,
    addReaction,
    removeReaction,
  } = useAnnouncements();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Filter announcements
  const filteredAnnouncements = filterPriority === 'ALL'
    ? announcements
    : announcements.filter(a => a.priority === filterPriority);

  // Handle create announcement
  const handleCreateAnnouncement = (data: {
    title: string;
    content: string;
    priority: Announcement['priority'];
    isPinned: boolean;
  }) => {
    createAnnouncement(data);
    setShowCreateModal(false);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
      }}>
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p style={{ color: '#9ca3af', marginTop: '12px' }}>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        color: '#f87171',
      }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#fff', fontWeight: '500', whiteSpace: 'nowrap' }}>Announcements</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'rgba(168, 85, 247, 0.3)',
              color: '#c084fc',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}>
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Filter button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-purple-500/30 active:scale-95 transition-all"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: filterPriority !== 'ALL' 
                  ? 'rgba(138, 43, 226, 0.3)' 
                  : 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                color: '#c4b5fd',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Filter className="h-3 w-3" />
              {filterPriority === 'ALL' ? 'Filter' : filterPriority}
            </button>

            {showFilters && (
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
                minWidth: '100px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}>
                {(['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'] as FilterPriority[]).map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      setFilterPriority(priority);
                      setShowFilters(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: filterPriority === priority ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                      border: 'none',
                      color: filterPriority === priority ? '#c084fc' : '#d1d5db',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: '6px',
                    }}
                    className="hover:bg-purple-500/20"
                  >
                    {priority}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create button (only for authorized users) */}
          {canCreateAnnouncement && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="hover:bg-purple-500/50 active:scale-95 transition-all"
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#e9d5ff',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          )}
        </div>
      </div>

      {/* Announcements list */}
      <div 
        className="scrollbar-purple"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {filteredAnnouncements.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#9ca3af',
          }}>
            <Megaphone className="h-12 w-12 mb-3 text-purple-400/50" />
            <p>No announcements yet</p>
            {canCreateAnnouncement && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="hover:bg-purple-500/30 active:scale-95 transition-all"
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(138, 43, 226, 0.2)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#c4b5fd',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Create the first announcement
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={deleteAnnouncement}
              onTogglePin={togglePin}
              onMarkAsRead={markAsRead}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              canManage={canCreateAnnouncement}
            />
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAnnouncement}
        />
      )}
    </div>
  );
}
