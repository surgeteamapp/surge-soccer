"use client";

import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { Event } from '@/hooks/useEvents';

// Set up the localizer for the calendar using date-fns (ESM-friendly)
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventWithColor extends Event {
  color?: string;
}

interface CalendarProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onNavigate?: (date: Date, view: string) => void;
  onView?: (view: string) => void;
}

export function Calendar({
  events,
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  onView,
}: CalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);

  // Format the events for the calendar
  const formattedEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Filter out events with invalid dates
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return !isNaN(start.getTime()) && !isNaN(end.getTime());
      })
      .map((event) => ({
        ...event,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
      }));
  }, [events]);

  // Button styles
  const navBtnStyle = {
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(138, 43, 226, 0.15)',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const viewBtnStyle = (isActive: boolean) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    background: isActive 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.5) 0%, rgba(168, 85, 247, 0.4) 100%)' 
      : 'transparent',
    border: 'none',
    color: isActive ? '#e9d5ff' : '#9ca3af',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isActive ? '0 0 10px rgba(138, 43, 226, 0.3)' : 'none'
  });

  // Navigate by year
  const navigateByYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setDate(newDate);
    if (onNavigate) {
      onNavigate(newDate, view as string);
    }
  };

  // Custom toolbar for the calendar
  const CustomToolbar = ({
    onNavigate,
    onView,
    label,
  }: any) => {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        padding: '0 4px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Previous Year */}
          <button
            style={navBtnStyle}
            onClick={() => navigateByYear('prev')}
            title="Previous Year"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
            }}
          >
            <ChevronsLeft style={{ height: '16px', width: '16px', color: '#c4b5fd' }} />
          </button>
          {/* Previous (Month/Week/Day) */}
          <button
            style={navBtnStyle}
            onClick={() => onNavigate('PREV')}
            title="Previous"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
            }}
          >
            <ChevronLeft style={{ height: '16px', width: '16px', color: '#c4b5fd' }} />
          </button>
          {/* Today */}
          <button
            onClick={() => onNavigate('TODAY')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#4ade80',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.5) 100%)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Today
          </button>
          {/* Next (Month/Week/Day) */}
          <button
            style={navBtnStyle}
            onClick={() => onNavigate('NEXT')}
            title="Next"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
            }}
          >
            <ChevronRight style={{ height: '16px', width: '16px', color: '#c4b5fd' }} />
          </button>
          {/* Next Year */}
          <button
            style={navBtnStyle}
            onClick={() => navigateByYear('next')}
            title="Next Year"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
            }}
          >
            <ChevronsRight style={{ height: '16px', width: '16px', color: '#c4b5fd' }} />
          </button>
        </div>

        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          color: '#fff',
          textShadow: '0 0 10px rgba(138, 43, 226, 0.4)'
        }}>
          {label}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              style={viewBtnStyle(view === v)}
              onClick={() => onView(v)}
              onMouseEnter={(e) => {
                if (view !== v) {
                  e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)';
                  e.currentTarget.style.color = '#c4b5fd';
                }
              }}
              onMouseLeave={(e) => {
                if (view !== v) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Custom event component to handle event styling
  const EventComponent = ({ event }: { event: EventWithColor }) => {
    const eventTypeColor = event.color || getEventColor(event.type);
    
    return (
      <div 
        className="text-sm font-medium"
        style={{ 
          backgroundColor: eventTypeColor,
          color: '#fff',
          lineHeight: '1.3',
          width: '100%',
          height: '100%',
          padding: '4px 6px',
          borderRadius: '6px',
          display: 'block',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative'
        }}
        title={event.title}
      >
        {event.title}
      </div>
    );
  };

  // Get colors for different event types - distinct colors for each type
  const getEventColor = (type: string): string => {
    switch (type) {
      case 'TOURNAMENT':
        return 'rgba(239, 68, 68, 0.8)'; // red
      case 'PRACTICE':
        return 'rgba(34, 197, 94, 0.8)'; // green
      case 'MEETING':
        return 'rgba(59, 130, 246, 0.8)'; // blue
      default:
        return 'rgba(251, 191, 36, 0.8)'; // orange
    }
  };

  // Custom styles for the calendar
  const calendarStyles = {
    height: 600,
  };

  // Handle internal navigation
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
    if (onNavigate) {
      onNavigate(newDate, view as string);
    }
  };

  // Handle view changes
  const handleView = (newView: View) => {
    setView(newView);
    if (onView) {
      onView(newView as string);
    }
  };

  return (
    <div>
      <BigCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={calendarStyles}
        selectable
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onNavigate={handleNavigate}
        onView={handleView}
        components={{
          toolbar: CustomToolbar,
          event: EventComponent,
        }}
        views={['month', 'week', 'day', 'agenda']}
        date={date}
        view={view}
      />
      
      <style jsx global>{`
        .rbc-calendar {
          background: transparent !important;
          font-family: inherit;
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          background: transparent !important;
          border: 1px solid rgba(138, 43, 226, 0.2) !important;
          border-radius: 12px;
          overflow: hidden;
        }
        .rbc-header {
          background: rgba(138, 43, 226, 0.15) !important;
          border-bottom: 1px solid rgba(138, 43, 226, 0.2) !important;
          padding: 10px 4px !important;
          color: #c4b5fd !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
        }
        .rbc-header + .rbc-header {
          border-left: 1px solid rgba(138, 43, 226, 0.2) !important;
        }
        .rbc-month-row {
          border-top: 1px solid rgba(138, 43, 226, 0.15) !important;
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid rgba(138, 43, 226, 0.15) !important;
        }
        .rbc-day-bg {
          background: transparent !important;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid rgba(138, 43, 226, 0.15) !important;
        }
        .rbc-off-range-bg {
          background: rgba(0, 0, 0, 0.2) !important;
        }
        .rbc-today {
          background: rgba(34, 197, 94, 0.15) !important;
          box-shadow: inset 0 0 0 2px rgba(74, 222, 128, 0.5) !important;
        }
        .rbc-date-cell {
          color: #d1d5db !important;
          padding: 4px 8px !important;
          font-size: 0.85rem !important;
        }
        .rbc-date-cell.rbc-now {
          color: #4ade80 !important;
          font-weight: 700 !important;
        }
        .rbc-off-range {
          color: #6b7280 !important;
        }
        .rbc-event {
          border: none !important;
          border-radius: 6px !important;
          color: #fff !important;
          font-size: 0.75rem !important;
          padding: 0 !important;
          margin: 1px !important;
          min-height: 28px !important;
          height: auto !important;
          max-width: 100% !important;
          width: 100% !important;
          display: block !important;
          background: transparent !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        .rbc-event > div {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          display: block !important;
        }
        .rbc-event > div > * {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .rbc-event-content {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          filter: brightness(1.1) !important;
        }
        .rbc-event.rbc-selected {
          filter: brightness(1.2) !important;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5) !important;
        }
        .rbc-show-more {
          color: #c084fc !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
        }
        .rbc-time-header {
          border-bottom: 1px solid rgba(138, 43, 226, 0.2) !important;
        }
        .rbc-time-content {
          border-top: none !important;
        }
        .rbc-time-gutter, .rbc-time-column {
          background: transparent !important;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid rgba(138, 43, 226, 0.1) !important;
        }
        .rbc-time-slot {
          color: #9ca3af !important;
          font-size: 0.75rem !important;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid rgba(138, 43, 226, 0.1) !important;
        }
        .rbc-current-time-indicator {
          background-color: #c084fc !important;
        }
        .rbc-agenda-view table {
          border: none !important;
        }
        .rbc-agenda-view table thead th {
          background: rgba(138, 43, 226, 0.15) !important;
          color: #c4b5fd !important;
          border-bottom: 1px solid rgba(138, 43, 226, 0.2) !important;
          padding: 10px !important;
        }
        .rbc-agenda-view table tbody tr {
          border-bottom: 1px solid rgba(138, 43, 226, 0.1) !important;
        }
        .rbc-agenda-view table tbody td {
          color: #d1d5db !important;
          padding: 10px !important;
        }
        .rbc-agenda-date-cell, .rbc-agenda-time-cell {
          color: #9ca3af !important;
        }
        .rbc-agenda-event-cell {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
