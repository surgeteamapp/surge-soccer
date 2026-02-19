"use client";

import { useState } from 'react';
import { Calendar } from '@/components/schedule/Calendar';
import { EventModal } from '@/components/schedule/EventModal';
import { EventDetails } from '@/components/schedule/EventDetails';
import { useEvents, Event } from '@/hooks/useEvents';
import { Loader2, Calendar as CalendarIcon, List, ChevronRight, MapPin, Clock, Plus } from 'lucide-react';
import { format, isToday, isThisWeek, isAfter } from 'date-fns';

// Glass card style matching dashboard design
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
  borderRadius: '16px',
  padding: '20px',
};

export default function SchedulePage() {
  const { events, isLoading, error, addEvent, updateEvent, deleteEvent, updateRSVP } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'details' | 'list'>('calendar');
  
  // Button hover states
  const [calendarBtnHover, setCalendarBtnHover] = useState(false);
  const [listBtnHover, setListBtnHover] = useState(false);
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [addBtnActive, setAddBtnActive] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Get upcoming events
  const upcomingEvents = events
    .filter((event) => isAfter(new Date(event.startTime), new Date()))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  // Handle event selection in calendar
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('details');
  };

  // Handle slot selection in calendar (for new events)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setSelectedDate(slotInfo);
    setIsNewEvent(true);
    setIsModalOpen(true);
  };

  // Open event modal for editing
  const handleEditEvent = () => {
    setIsNewEvent(false);
    setIsModalOpen(true);
  };

  // Close event modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsNewEvent(false);
    setSelectedDate(null);
  };

  // Close event details and go back to calendar
  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setViewMode('calendar');
  };

  // Save event (new or updated)
  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'rsvps' | 'createdBy'>) => {
    if (isNewEvent) {
      addEvent(eventData);
    } else if (selectedEvent) {
      updateEvent({
        ...selectedEvent,
        ...eventData,
      });
    }
    setIsModalOpen(false);
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    setSelectedEvent(null);
    setViewMode('calendar');
  };

  // Update RSVP status
  const handleUpdateRSVP = (status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE', notes?: string) => {
    if (selectedEvent) {
      updateRSVP(selectedEvent.id, status, notes);
    }
  };

  // Format date for display
  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return `${format(date, 'EEEE')}, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'TOURNAMENT': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'PRACTICE': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
      case 'MEETING': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      case 'FILM_STUDY': return { bg: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' };
      default: return { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' };
    }
  };

  // Get event type display label
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'TOURNAMENT': return 'Tournament';
      case 'PRACTICE': return 'Practice';
      case 'MEETING': return 'Meeting';
      case 'FILM_STUDY': return 'Film Study';
      case 'OTHER': return 'Other';
      default: return type;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: 0,
            textShadow: '0 0 20px rgba(138, 43, 226, 0.5)'
          }}>
            Schedule & Events
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
            {events.length} events total
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setSelectedEvent(null); setIsNewEvent(true); setSelectedDate({ start: new Date(), end: new Date() }); setIsModalOpen(true); }}
            onMouseEnter={() => setAddBtnHover(true)}
            onMouseLeave={() => { setAddBtnHover(false); setAddBtnActive(false); }}
            onMouseDown={() => setAddBtnActive(true)}
            onMouseUp={() => setAddBtnActive(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: addBtnActive
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)'
                : addBtnHover
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
              border: addBtnHover 
                ? '1px solid rgba(168, 85, 247, 0.7)' 
                : '1px solid rgba(139, 92, 246, 0.5)',
              color: '#e9d5ff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: addBtnActive ? 'scale(0.97)' : addBtnHover ? 'scale(1.03)' : 'scale(1)',
              boxShadow: addBtnHover ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Add Event
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          ...cardStyle, 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '16px'
        }}>
          <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* View Toggle */}
      <div style={{ ...cardStyle, padding: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('calendar')}
          onMouseEnter={() => setCalendarBtnHover(true)}
          onMouseLeave={() => setCalendarBtnHover(false)}
          style={{
            flex: 1,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: viewMode === 'calendar' 
              ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.3) 100%)' 
              : calendarBtnHover 
                ? 'rgba(138, 43, 226, 0.15)' 
                : 'transparent',
            color: viewMode === 'calendar' ? '#e9d5ff' : calendarBtnHover ? '#c4b5fd' : '#9ca3af',
            boxShadow: viewMode === 'calendar' ? '0 0 15px rgba(138, 43, 226, 0.3)' : 'none'
          }}
        >
          <CalendarIcon style={{ height: '16px', width: '16px' }} />
          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Calendar</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          onMouseEnter={() => setListBtnHover(true)}
          onMouseLeave={() => setListBtnHover(false)}
          style={{
            flex: 1,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: viewMode === 'list' 
              ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.3) 100%)' 
              : listBtnHover 
                ? 'rgba(138, 43, 226, 0.15)' 
                : 'transparent',
            color: viewMode === 'list' ? '#e9d5ff' : listBtnHover ? '#c4b5fd' : '#9ca3af',
            boxShadow: viewMode === 'list' ? '0 0 15px rgba(138, 43, 226, 0.3)' : 'none'
          }}
        >
          <List style={{ height: '16px', width: '16px' }} />
          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>List View</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Main Content */}
        <div>
          {isLoading ? (
            <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
              <Loader2 style={{ height: '48px', width: '48px', color: '#c084fc', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {viewMode === 'calendar' && (
                <div style={cardStyle}>
                  <Calendar
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                  />
                </div>
              )}

              {viewMode === 'details' && selectedEvent && (
                <div style={cardStyle}>
                  <EventDetails
                    event={selectedEvent}
                    onClose={handleCloseDetails}
                    onEdit={handleEditEvent}
                    onUpdateRSVP={handleUpdateRSVP}
                  />
                </div>
              )}

              {viewMode === 'list' && (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                  <div style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
                    background: 'rgba(138, 43, 226, 0.1)'
                  }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                      All Events ({events.length})
                    </h3>
                  </div>
                  <div>
                    {events.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <CalendarIcon style={{ height: '48px', width: '48px', color: 'rgba(168, 85, 247, 0.3)', margin: '0 auto 12px' }} />
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No events scheduled</p>
                      </div>
                    ) : (
                      events
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map((event, index) => {
                          const typeColor = getEventTypeColor(event.type);
                          const isHovered = hoveredEventId === event.id;
                          return (
                            <button
                              key={event.id}
                              onClick={() => handleSelectEvent(event)}
                              onMouseEnter={() => setHoveredEventId(event.id)}
                              onMouseLeave={() => setHoveredEventId(null)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: isHovered ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
                                border: 'none',
                                borderBottom: index < events.length - 1 ? '1px solid rgba(138, 43, 226, 0.15)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: typeColor.color,
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ 
                                  color: '#fff', 
                                  fontSize: '0.9rem', 
                                  fontWeight: '500', 
                                  margin: '0 0 4px 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {event.title}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock style={{ height: '12px', width: '12px' }} />
                                    {format(new Date(event.startTime), 'MMM d, h:mm a')}
                                  </span>
                                  {event.location && (
                                    <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <MapPin style={{ height: '12px', width: '12px' }} />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                background: typeColor.bg,
                                color: typeColor.color,
                                border: `1px solid ${typeColor.border}`,
                                whiteSpace: 'nowrap'
                              }}>
                                {getEventTypeLabel(event.type)}
                              </span>
                              <ChevronRight style={{ height: '16px', width: '16px', color: isHovered ? '#c084fc' : '#6b7280' }} />
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Legend - only show on calendar view */}
          {viewMode === 'calendar' && (
            <div style={cardStyle}>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0' }}>
                Legend
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { type: 'TOURNAMENT', label: 'Tournaments', color: '#f87171' },
                  { type: 'PRACTICE', label: 'Practices', color: '#4ade80' },
                  { type: 'MEETING', label: 'Meetings', color: '#60a5fa' },
                  { type: 'FILM_STUDY', label: 'Film Studies', color: '#c084fc' },
                  { type: 'OTHER', label: 'Other', color: '#fbbf24' }
                ].map((item) => (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div style={cardStyle}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0' }}>
              Upcoming Events
            </h3>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader2 style={{ height: '24px', width: '24px', color: '#c084fc', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>
                No upcoming events
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingEvents.map((event) => {
                  const typeColor = getEventTypeColor(event.type);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(138, 43, 226, 0.1)',
                        border: '1px solid rgba(138, 43, 226, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(138, 43, 226, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.2)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: typeColor.color,
                          marginTop: '6px',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ 
                            color: '#fff', 
                            fontSize: '0.85rem', 
                            fontWeight: '500', 
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {event.title}
                          </h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                            {formatEventDate(new Date(event.startTime))}
                          </p>
                          {event.location && (
                            <p style={{ color: '#6b7280', fontSize: '0.7rem', margin: '2px 0 0 0' }}>
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={isNewEvent ? undefined : selectedEvent || undefined}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isNewEvent={isNewEvent}
        />
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
