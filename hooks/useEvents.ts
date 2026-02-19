import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';

export interface EventRSVP {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
  notes?: string;
  respondedAt?: Date;
}

export interface SubEvent {
  id: string;
  title: string;
  opponent?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  notes?: string;
  result?: string;
  jerseyColor?: string;
  arrivalTime?: Date | string;
  speedCheckTime?: Date | string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type: 'TOURNAMENT' | 'PRACTICE' | 'MEETING' | 'FILM_STUDY' | 'OTHER';
  teamId: string;
  isRecurring: boolean;
  recurringPattern?: string;
  createdBy: string;
  rsvps: EventRSVP[];
  subEvents?: SubEvent[];
  color?: string;
  // Practice-specific fields
  practiceNotes?: string;
  // Meeting-specific fields
  meetingLocation?: string;
  meetingLink?: string;
  // Film Study-specific fields
  filmLocation?: string;
  filmLink?: string;
  requiredEquipment?: string;
}

export function useEvents() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedInitialRef = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to load events from localStorage first
        let eventsToLoad: Event[] = [];
        
        const savedEvents = safeLocalStorage.getItem(STORAGE_KEYS.EVENTS);
        console.log('Loading events from localStorage:', savedEvents);
        
        if (savedEvents) {
          try {
            const parsedEvents = JSON.parse(savedEvents);
            console.log('Parsed events:', parsedEvents);
            if (Array.isArray(parsedEvents)) {
              eventsToLoad = parsedEvents
                .filter((e: any) => {
                  // Filter out events with invalid dates
                  const start = new Date(e.startTime);
                  const end = new Date(e.endTime);
                  return e.startTime && e.endTime && !isNaN(start.getTime()) && !isNaN(end.getTime());
                })
                .map((e: any) => ({
                  ...e,
                  startTime: new Date(e.startTime),
                  endTime: new Date(e.endTime),
                  rsvps: e.rsvps?.map((r: any) => ({
                    ...r,
                    respondedAt: r.respondedAt ? new Date(r.respondedAt) : undefined,
                  })) || [],
                  subEvents: e.subEvents?.filter((s: any) => {
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);
                    return s.startTime && s.endTime && !isNaN(start.getTime()) && !isNaN(end.getTime());
                  }).map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                    arrivalTime: s.arrivalTime ? new Date(s.arrivalTime) : s.arrivalTime,
                    speedCheckTime: s.speedCheckTime ? new Date(s.speedCheckTime) : s.speedCheckTime,
                  })) || [],
                }));
              console.log('Events to load:', eventsToLoad);
            }
          } catch (parseError) {
            console.warn('Failed to parse saved events:', parseError);
            // Clear corrupted data
            safeLocalStorage.removeItem(STORAGE_KEYS.EVENTS);
          }
        }
        
        // If no stored events or parsing failed, start with empty array
        if (eventsToLoad.length === 0) {
          // No mock data - start with clean calendar
          eventsToLoad = [];
        }
        
        setEvents(eventsToLoad);
        setIsLoading(false);
        hasLoadedInitialRef.current = true;
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
        setIsLoading(false);
        hasLoadedInitialRef.current = true; // Prevent persistence from overwriting on error
      }
    };

    // For now, always load events regardless of auth state
    // This avoids the schedule page being stuck on a loading spinner
    fetchEvents();
  }, []);

  // Persist events to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    
    console.log('Persisting events to localStorage:', events);
    
    // Prevent race condition: don't overwrite existing data with empty array
    if (events.length === 0) {
      const existingData = safeLocalStorage.getItem(STORAGE_KEYS.EVENTS);
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Skipping save - would overwrite non-empty data with empty array');
            return; // Don't overwrite non-empty data with empty array
          }
        } catch (e) {
          // If parsing fails, allow the save
        }
      }
    }
    
    const serializedEvents = events.map(e => ({
      ...e,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      rsvps: e.rsvps?.map(r => ({
        ...r,
        respondedAt: r.respondedAt?.toISOString(),
      })) || [],
      subEvents: e.subEvents?.map(s => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        arrivalTime: s.arrivalTime instanceof Date ? s.arrivalTime.toISOString() : s.arrivalTime,
        speedCheckTime: s.speedCheckTime instanceof Date ? s.speedCheckTime.toISOString() : s.speedCheckTime,
      })) || [],
    }));
    
    safeLocalStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(serializedEvents));
    console.log('Events saved to localStorage');
  }, [events]);

  const addEvent = async (newEvent: Omit<Event, 'id' | 'rsvps' | 'createdBy'>) => {
    try {
      // In a real implementation, we would send the new event to the API
      // For now, we'll just simulate it
      
      const event: Event = {
        ...newEvent,
        id: `new-${Date.now()}`,
        createdBy: session?.user?.id || 'anonymous',
        rsvps: [],
      };
      
      const updatedEvents = [...events, event];
      setEvents(updatedEvents);
      
      // Save to localStorage
      localStorage.setItem('surge-soccer-events', JSON.stringify(updatedEvents));
      
      return event;
    } catch (err) {
      console.error('Failed to add event:', err);
      setError('Failed to add event. Please try again later.');
      throw err;
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    try {
      // In a real implementation, we would send the updated event to the API
      // For now, we'll just simulate it
      
      const updatedEvents = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event));
      setEvents(updatedEvents);
      
      // Save to localStorage
      localStorage.setItem('surge-soccer-events', JSON.stringify(updatedEvents));
      
      return updatedEvent;
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event. Please try again later.');
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      // In a real implementation, we would send a delete request to the API
      // For now, we'll just simulate it
      
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      
      // Save to localStorage
      localStorage.setItem('surge-soccer-events', JSON.stringify(updatedEvents));
      
      return true;
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event. Please try again later.');
      throw err;
    }
  };

  const updateRSVP = async (eventId: string, status: EventRSVP['status'], notes?: string) => {
    if (!session?.user) return; // RSVP still requires auth
    
    try {
      // In a real implementation, we would send the RSVP to the API
      // For now, we'll just simulate it
      
      const rsvp: EventRSVP = {
        id: `rsvp-${Date.now()}`,
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        userEmail: session.user.email || undefined,
        status,
        notes,
        respondedAt: new Date(),
      };
      
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          // Remove any existing RSVP from this user
          const filteredRSVPs = event.rsvps.filter(r => r.userId !== session.user.id);
          
          return {
            ...event,
            rsvps: [...filteredRSVPs, rsvp],
          };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      // Save to localStorage
      localStorage.setItem('surge-soccer-events', JSON.stringify(updatedEvents));
      
      return rsvp;
    } catch (err) {
      console.error('Failed to update RSVP:', err);
      setError('Failed to update RSVP. Please try again later.');
      throw err;
    }
  };

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    updateRSVP,
  };
}
