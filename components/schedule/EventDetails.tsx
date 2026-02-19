"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Edit,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  X,
  RefreshCw,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import type { Event, EventRSVP, SubEvent } from '@/hooks/useEvents';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
  onUpdateRSVP: (status: EventRSVP['status'], notes?: string) => void;
}

export function EventDetails({
  event,
  onClose,
  onEdit,
  onUpdateRSVP,
}: EventDetailsProps) {
  const { data: session } = useSession();
  const [rsvpStatus, setRsvpStatus] = useState<EventRSVP['status'] | null>(
    getUserRSVPStatus()
  );
  const [notes, setNotes] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'ATTENDING' | 'MAYBE' | 'NOT_ATTENDING' | null>(null);
  const [expandedSubEvents, setExpandedSubEvents] = useState<Set<string>>(new Set());

  // Get the user's RSVP status for this event
  function getUserRSVPStatus(): EventRSVP['status'] | null {
    if (!session?.user) return null;
    
    const userRSVP = event.rsvps.find(
      rsvp => rsvp.userId === session.user.id
    );
    
    return userRSVP ? userRSVP.status : null;
  }

  // Check if user has admin-level access
  function hasAdminAccess(): boolean {
    if (!session?.user?.role) return false;
    return ['ADMIN', 'COACH', 'TEAM_MANAGER'].includes(session.user.role);
  }

  // Toggle sub-event expansion
  const toggleSubEventExpansion = (subEventId: string) => {
    const newExpanded = new Set(expandedSubEvents);
    if (newExpanded.has(subEventId)) {
      newExpanded.delete(subEventId);
    } else {
      newExpanded.add(subEventId);
    }
    setExpandedSubEvents(newExpanded);
  };

  // Format dates for display
  const formatEventDate = (date: Date) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  const formatEventTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  // Format time string (HH:MM) or Date to display format (h:mm AM/PM)
  const formatTimeString = (time: string | Date) => {
    if (!time) return '';
    
    // If it's a Date object, format it directly
    if (time instanceof Date) {
      return format(time, 'h:mm a');
    }
    
    // If it's a string, try to parse it
    const timeStr = String(time);
    
    // Check if it's already a Date string
    if (timeStr.includes('T') || timeStr.includes('GMT')) {
      return format(new Date(timeStr), 'h:mm a');
    }
    
    // Otherwise, it's a time string like "14:00"
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  // Handle RSVP button clicks
  const handleRSVP = (status: EventRSVP['status']) => {
    setRsvpStatus(status);
    
    if (status === 'MAYBE' || status === 'NOT_ATTENDING') {
      setShowNotesInput(true);
    } else {
      handleSubmitRSVP(status);
    }
  };

  // Submit RSVP
  const handleSubmitRSVP = (status: EventRSVP['status'] = rsvpStatus as EventRSVP['status']) => {
    if (!status) return;
    
    onUpdateRSVP(status, notes || undefined);
    setShowNotesInput(false);
  };

  // Get color based on event type
  const getEventTypeStyle = () => {
    switch (event.type) {
      case 'TOURNAMENT':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'PRACTICE':
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
      case 'MEETING':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      case 'FILM_STUDY':
        return { bg: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' };
      default:
        return { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' };
    }
  };

  // Get event type label
  const getEventTypeLabel = () => {
    switch (event.type) {
      case 'TOURNAMENT':
        return 'Tournament';
      case 'PRACTICE':
        return 'Practice';
      case 'MEETING':
        return 'Meeting';
      case 'FILM_STUDY':
        return 'Film Study';
      default:
        return 'Other';
    }
  };
  
  const typeStyle = getEventTypeStyle();

  // Count RSVPs by status
  const rsvpCounts = {
    ATTENDING: event.rsvps.filter(rsvp => rsvp.status === 'ATTENDING').length,
    NOT_ATTENDING: event.rsvps.filter(rsvp => rsvp.status === 'NOT_ATTENDING').length,
    MAYBE: event.rsvps.filter(rsvp => rsvp.status === 'MAYBE').length,
  };

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: typeStyle.bg,
              color: typeStyle.color,
              border: `1px solid ${typeStyle.border}`
            }}>
              {getEventTypeLabel()}
            </span>
            {event.isRecurring && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c084fc', fontSize: '0.8rem' }}>
                <RefreshCw style={{ height: '12px', width: '12px' }} />
                {event.recurringPattern?.replace('_', '-')}
              </span>
            )}
          </div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            textShadow: '0 0 15px rgba(138, 43, 226, 0.4)'
          }}>
            {event.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            color: '#e9d5ff',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
          }}
        >
          <X style={{ height: '18px', width: '18px' }} />
        </button>
      </div>

      {/* Event Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Date & Time and Location Side by Side */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Date & Time */}
          <div style={{ 
            flex: 1,
            padding: '16px',
            background: 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.2)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar style={{ height: '18px', width: '18px', color: '#c084fc', flexShrink: 0 }} />
              <p style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '600' }}>Date & Time</p>
            </div>
            <div style={{ marginTop: '8px', paddingLeft: '30px' }}>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                {formatEventDate(event.startTime)}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
              </p>
            </div>
          </div>

          {/* Location */}
          {(event.location || event.address) && (
            <div style={{ 
              flex: 1,
              padding: '16px',
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin style={{ height: '18px', width: '18px', color: '#c084fc', flexShrink: 0 }} />
                <p style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '600' }}>Location</p>
              </div>
              <div style={{ marginTop: '8px', paddingLeft: '30px' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || event.location || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const children = e.currentTarget.querySelectorAll('p');
                    children.forEach(child => (child as HTMLElement).style.textDecoration = 'underline');
                  }}
                  onMouseLeave={(e) => {
                    const children = e.currentTarget.querySelectorAll('p');
                    children.forEach(child => (child as HTMLElement).style.textDecoration = 'none');
                  }}
                >
                  {event.location && <p style={{ color: '#d1d5db', fontSize: '0.9rem', margin: 0 }}>{event.location}</p>}
                  {event.address && <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{event.address}</p>}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ 
            padding: '16px',
            background: 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.2)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText style={{ height: '18px', width: '18px', color: '#c084fc', flexShrink: 0 }} />
              <p style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '600' }}>Details</p>
            </div>
            <div style={{ marginTop: '12px', paddingLeft: '30px' }}>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{event.description}</p>
            </div>
          </div>
        )}

        {/* Practice-specific details */}
        {event.type === 'PRACTICE' && event.practiceNotes && (
          <div style={{ 
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText style={{ height: '18px', width: '18px', color: '#4ade80', flexShrink: 0 }} />
              <p style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: '600' }}>Practice Notes</p>
            </div>
            <div style={{ marginTop: '12px', paddingLeft: '30px' }}>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{event.practiceNotes}</p>
            </div>
          </div>
        )}

        {/* Meeting-specific details */}
        {event.type === 'MEETING' && (event.meetingLocation || event.meetingLink) && (
          <div style={{ 
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Users style={{ height: '18px', width: '18px', color: '#60a5fa', flexShrink: 0 }} />
              <p style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: '600' }}>Meeting Details</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '30px' }}>
              {event.meetingLocation && (
                <div>
                  <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: '500', marginBottom: '4px' }}>Location</p>
                  <p style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{event.meetingLocation}</p>
                </div>
              )}
              {event.meetingLink && (
                <div>
                  <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: '500', marginBottom: '4px' }}>Meeting Link</p>
                  <a 
                    href={event.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#60a5fa', 
                      fontSize: '0.9rem', 
                      textDecoration: 'none',
                      wordBreak: 'break-all'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {event.meetingLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sub-Events (for Tournaments) */}
        {event.type === 'TOURNAMENT' && event.subEvents && event.subEvents.length > 0 && (
          <div style={{ 
            marginTop: '8px',
            padding: '16px',
            background: 'rgba(138, 43, 226, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Trophy style={{ height: '18px', width: '18px', color: '#f87171' }} />
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                Tournament Schedule ({event.subEvents.length} games)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {event.subEvents.map((subEvent, index) => (
                <div key={subEvent.id}>
                  <div
                    style={{
                      padding: '12px',
                      background: 'rgba(10, 0, 20, 0.5)',
                      borderRadius: '10px',
                      border: '1px solid rgba(138, 43, 226, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleSubEventExpansion(subEvent.id)}
                  >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                        {subEvent.title}
                      </span>
                      {subEvent.opponent && (
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          vs {subEvent.opponent}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ height: '12px', width: '12px' }} />
                        {format(new Date(subEvent.startTime), 'h:mm a')} - {format(new Date(subEvent.endTime), 'h:mm a')}
                      </span>
                      {subEvent.location && (
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin style={{ height: '12px', width: '12px' }} />
                          {subEvent.location}
                        </span>
                      )}
                    </div>
                    {subEvent.result && (
                      <span style={{ 
                        marginTop: '6px',
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80'
                      }}>
                        {subEvent.result}
                      </span>
                    )}
                  </div>
                  <ChevronRight style={{ 
                    height: '16px', 
                    width: '16px', 
                    color: '#6b7280',
                    transition: 'transform 0.2s',
                    transform: expandedSubEvents.has(subEvent.id) ? 'rotate(90deg)' : 'rotate(0deg)'
                  }} />
                </div>
                
                {/* Expandable Match Details */}
                {expandedSubEvents.has(subEvent.id) && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: 'rgba(138, 43, 226, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(138, 43, 226, 0.1)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Jersey Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: subEvent.jerseyColor || '#3b82f6',
                          border: '1px solid rgba(138, 43, 226, 0.3)'
                        }} />
                        <div>
                          <p style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '500', margin: '0 0 2px 0' }}>
                            Jersey Color
                          </p>
                          <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>
                            {subEvent.jerseyColor ? `Wear ${subEvent.jerseyColor} jersey` : 'Team jersey TBD'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Arrival Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Clock style={{ height: '12px', width: '12px', color: '#4ade80' }} />
                        </div>
                        <div>
                          <p style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '500', margin: '0 0 2px 0' }}>
                            In Chairs By
                          </p>
                          <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>
                            {subEvent.arrivalTime 
                              ? `Be in chairs by ${formatTimeString(subEvent.arrivalTime)}`
                              : 'Time TBD'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Speed Check */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(251, 191, 36, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Trophy style={{ height: '12px', width: '12px', color: '#fbbf24' }} />
                        </div>
                        <div>
                          <p style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '500', margin: '0 0 2px 0' }}>
                            Speed Check
                          </p>
                          <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>
                            {subEvent.speedCheckTime 
                              ? `Speed check at ${formatTimeString(subEvent.speedCheckTime)}`
                              : 'Time TBD'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Notes */}
                      {subEvent.notes && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(139, 92, 246, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px'
                          }}>
                            <FileText style={{ height: '12px', width: '12px', color: '#c084fc' }} />
                          </div>
                          <div>
                            <p style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '500', margin: '0 0 2px 0' }}>
                              Additional Notes
                            </p>
                            <p style={{ color: '#d1d5db', fontSize: '0.85rem', margin: 0 }}>
                              {subEvent.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Status - Expandable - Admin Only */}
        {hasAdminAccess() && (
          <div style={{ 
            background: 'rgba(138, 43, 226, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <Users style={{ height: '18px', width: '18px', color: '#c084fc' }} />
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
              Responses ({rsvpCounts.ATTENDING + rsvpCounts.MAYBE + rsvpCounts.NOT_ATTENDING})
            </span>
          </div>
          
          {/* Attending */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'ATTENDING' ? null : 'ATTENDING')}
              style={{
                width: '100%',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: expandedSection === 'ATTENDING' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsUp style={{ height: '14px', width: '14px', color: '#4ade80' }} />
                <span style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: '500' }}>Going</span>
                <span style={{ 
                  background: 'rgba(34, 197, 94, 0.3)', 
                  color: '#4ade80', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {rsvpCounts.ATTENDING}
                </span>
              </div>
              <ChevronRight style={{ 
                height: '14px', 
                width: '14px', 
                color: '#4ade80',
                transition: 'transform 0.2s',
                transform: expandedSection === 'ATTENDING' ? 'rotate(90deg)' : 'rotate(0deg)'
              }} />
            </button>
            {expandedSection === 'ATTENDING' && (
              <div style={{ padding: '0 16px 12px 16px' }}>
                {event.rsvps.filter(r => r.status === 'ATTENDING').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {event.rsvps.filter(r => r.status === 'ATTENDING').map(rsvp => (
                      <div key={rsvp.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '6px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4ade80',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          {rsvp.userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>{rsvp.userName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>No responses yet</span>
                )}
              </div>
            )}
          </div>
          
          {/* Maybe */}
          <div style={{ borderTop: '1px solid rgba(138, 43, 226, 0.15)' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'MAYBE' ? null : 'MAYBE')}
              style={{
                width: '100%',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: expandedSection === 'MAYBE' ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle style={{ height: '14px', width: '14px', color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: '500' }}>Maybe</span>
                <span style={{ 
                  background: 'rgba(251, 191, 36, 0.3)', 
                  color: '#fbbf24', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {rsvpCounts.MAYBE}
                </span>
              </div>
              <ChevronRight style={{ 
                height: '14px', 
                width: '14px', 
                color: '#fbbf24',
                transition: 'transform 0.2s',
                transform: expandedSection === 'MAYBE' ? 'rotate(90deg)' : 'rotate(0deg)'
              }} />
            </button>
            {expandedSection === 'MAYBE' && (
              <div style={{ padding: '0 16px 12px 16px' }}>
                {event.rsvps.filter(r => r.status === 'MAYBE').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {event.rsvps.filter(r => r.status === 'MAYBE').map(rsvp => (
                      <div key={rsvp.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(251, 191, 36, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fbbf24',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            {rsvp.userName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>{rsvp.userName}</span>
                        </div>
                        {rsvp.notes && (
                          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            "{rsvp.notes}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>No responses yet</span>
                )}
              </div>
            )}
          </div>
          
          {/* Not Attending */}
          <div style={{ borderTop: '1px solid rgba(138, 43, 226, 0.15)' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'NOT_ATTENDING' ? null : 'NOT_ATTENDING')}
              style={{
                width: '100%',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: expandedSection === 'NOT_ATTENDING' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsDown style={{ height: '14px', width: '14px', color: '#f87171' }} />
                <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '500' }}>Not Going</span>
                <span style={{ 
                  background: 'rgba(239, 68, 68, 0.3)', 
                  color: '#f87171', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {rsvpCounts.NOT_ATTENDING}
                </span>
              </div>
              <ChevronRight style={{ 
                height: '14px', 
                width: '14px', 
                color: '#f87171',
                transition: 'transform 0.2s',
                transform: expandedSection === 'NOT_ATTENDING' ? 'rotate(90deg)' : 'rotate(0deg)'
              }} />
            </button>
            {expandedSection === 'NOT_ATTENDING' && (
              <div style={{ padding: '0 16px 12px 16px' }}>
                {event.rsvps.filter(r => r.status === 'NOT_ATTENDING').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {event.rsvps.filter(r => r.status === 'NOT_ATTENDING').map(rsvp => (
                      <div key={rsvp.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f87171',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            {rsvp.userName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>{rsvp.userName}</span>
                        </div>
                        {rsvp.notes && (
                          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            "{rsvp.notes}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>No responses yet</span>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* RSVP Section */}
      {session?.user && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(138, 43, 226, 0.2)' }}>
          <h4 style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '500', marginBottom: '12px' }}>
            Your Response
          </h4>

          {!showNotesInput ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleRSVP('ATTENDING')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: rsvpStatus === 'ATTENDING' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)',
                  border: rsvpStatus === 'ATTENDING' ? '1px solid rgba(74, 222, 128, 0.5)' : '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80'
                }}
              >
                <ThumbsUp style={{ height: '14px', width: '14px' }} />
                Going
              </button>
              <button
                onClick={() => handleRSVP('MAYBE')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: rsvpStatus === 'MAYBE' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.1)',
                  border: rsvpStatus === 'MAYBE' ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(251, 191, 36, 0.3)',
                  color: '#fbbf24'
                }}
              >
                <HelpCircle style={{ height: '14px', width: '14px' }} />
                Maybe
              </button>
              <button
                onClick={() => handleRSVP('NOT_ATTENDING')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: rsvpStatus === 'NOT_ATTENDING' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)',
                  border: rsvpStatus === 'NOT_ATTENDING' ? '1px solid rgba(248, 113, 113, 0.5)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171'
                }}
              >
                <ThumbsDown style={{ height: '14px', width: '14px' }} />
                Not Going
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                placeholder={
                  rsvpStatus === 'MAYBE' 
                    ? "Please provide a reason for 'Maybe' (optional)"
                    : "Please provide a reason for 'Not Going' (optional)"
                }
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(138, 43, 226, 0.1)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setShowNotesInput(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'rgba(138, 43, 226, 0.25)',
                    border: '1px solid rgba(168, 85, 247, 0.6)',
                    color: '#e9d5ff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1.03)',
                    boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitRSVP()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    color: '#e9d5ff',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Submit RSVP
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        {hasAdminAccess() && (
          <button
          onClick={onEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            color: '#e9d5ff',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
          }}
        >
          <Edit style={{ height: '14px', width: '14px' }} />
          Edit Event
        </button>
        )}
      </div>
    </div>
  );
}
