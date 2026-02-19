"use client";

import { useState, useEffect } from 'react';
import { X, MapPin, FileText, ChevronDown, CheckCircle, Trash2, Plus, Clock, Edit } from 'lucide-react';
import type { Event } from '@/hooks/useEvents';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { TimePicker } from '@/components/ui/TimePicker';

// Modal styles
const modalOverlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalStyle = {
  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
  border: '1px solid rgba(138, 43, 226, 0.4)',
  borderRadius: '16px',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.2)',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowX: 'hidden' as const,
  overflowY: 'auto' as const
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  background: 'rgba(138, 43, 226, 0.1)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box' as const
};

const labelStyle = {
  display: 'block',
  color: '#c4b5fd',
  fontSize: '0.8rem',
  fontWeight: '500' as const,
  marginBottom: '6px'
};

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  onSave: (event: Omit<Event, 'id' | 'rsvps' | 'createdBy'>) => void;
  onDelete?: (id: string) => void;
  isNewEvent?: boolean;
}

const EVENT_TYPES = [
  { value: 'TOURNAMENT', label: 'Tournament', color: '#f87171', icon: '🏆' },
  { value: 'PRACTICE', label: 'Practice', color: '#4ade80', icon: '🏀' },
  { value: 'MEETING', label: 'Meeting', color: '#60a5fa', icon: '👥' },
  { value: 'FILM_STUDY', label: 'Film Study', color: '#c084fc', icon: '🎬' },
  { value: 'OTHER', label: 'Other', color: '#fbbf24', icon: '📋' },
];

const JERSEY_COLORS = [
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'white', label: 'White', color: '#ffffff' },
];

// Generate time options for dropdowns
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      times.push({ value: timeString, label: displayTime });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Helper function to format time for display
const formatTimeDisplay = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};

const RECURRING_PATTERNS = [
  { value: '', label: 'Select a pattern' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
];

export function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  isNewEvent = false,
}: EventModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    type: 'PRACTICE',
    isRecurring: false,
    recurringPattern: '',
    teamId: 'team-1',
    // Tournament-specific fields
    jerseyColor: '',
    arrivalTime: '',
    speedCheckTime: '',
    // Practice-specific fields
    practiceNotes: '',
    // Meeting-specific fields
    meetingLocation: '',
    meetingLink: '',
    // Film Study-specific fields
    filmLocation: '',
    filmLink: '',
    requiredEquipment: '',
  });
  
  // Button hover states
  const [closeBtnHover, setCloseBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [cancelBtnActive, setCancelBtnActive] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  const [submitBtnActive, setSubmitBtnActive] = useState(false);
  const [deleteBtnHover, setDeleteBtnHover] = useState(false);
  const [deleteBtnActive, setDeleteBtnActive] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGameIndex, setEditingGameIndex] = useState<number | null>(null);
  const [showJerseyColorDropdown, setShowJerseyColorDropdown] = useState(false);
  const [showGameJerseyColorDropdown, setShowGameJerseyColorDropdown] = useState(false);
  const [games, setGames] = useState<Array<{
    id: string;
    opponent: string;
    startTime: string;
    endTime: string;
    location: string;
    jerseyColor: string;
    arrivalTime: string;
    speedCheckTime: string;
    notes?: string;
  }>>([]);

  // Game form state
  const [gameForm, setGameForm] = useState({
    opponent: '',
    startTime: '',
    endTime: '',
    location: '',
    jerseyColor: '',
    arrivalTime: '',
    speedCheckTime: '',
    notes: '',
  });

  // Initialize games when editing an existing tournament
  useEffect(() => {
    if (event && event.subEvents && event.type === 'TOURNAMENT') {
      const existingGames = event.subEvents.map(subEvent => ({
        id: subEvent.id,
        opponent: subEvent.opponent || '',
        startTime: formatDateForInput(subEvent.startTime),
        endTime: formatDateForInput(subEvent.endTime),
        location: subEvent.location || '',
        jerseyColor: subEvent.jerseyColor || '',
        arrivalTime: typeof subEvent.arrivalTime === 'string' ? subEvent.arrivalTime : (subEvent.arrivalTime ? formatDateForInput(subEvent.arrivalTime) : ''),
        speedCheckTime: typeof subEvent.speedCheckTime === 'string' ? subEvent.speedCheckTime : (subEvent.speedCheckTime ? formatDateForInput(subEvent.speedCheckTime) : ''),
        notes: subEvent.notes || '',
      }));
      setGames(existingGames);
    } else if (!event) {
      // Reset games for new event
      setGames([]);
    }
  }, [event]);

  // Game management functions
  const handleAddGame = () => {
    setGameForm({
      opponent: '',
      startTime: '',
      endTime: '',
      location: '',
      jerseyColor: '',
      arrivalTime: '',
      speedCheckTime: '',
      notes: '',
    });
    setEditingGameIndex(null);
    setShowGameModal(true);
  };

  const handleEditGame = (index: number) => {
    const game = games[index];
    setGameForm({
      ...game,
      notes: game.notes || '',
    });
    setEditingGameIndex(index);
    setShowGameModal(true);
  };

  const handleDeleteGame = (index: number) => {
    const updatedGames = games.filter((_, i) => i !== index);
    setGames(updatedGames);
  };

  const handleSaveGame = () => {
    if (!gameForm.opponent || !gameForm.startTime) {
      return; // Validate required fields
    }

    const newGame = {
      ...gameForm,
      id: editingGameIndex !== null ? games[editingGameIndex].id : `game-${Date.now()}`,
    };

    if (editingGameIndex !== null) {
      // Update existing game
      const updatedGames = [...games];
      updatedGames[editingGameIndex] = newGame;
      setGames(updatedGames);
    } else {
      // Add new game
      setGames([...games, newGame]);
    }

    setShowGameModal(false);
  };

  const handleGameFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGameForm({ ...gameForm, [name]: value });
  };

  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description || '',
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
        location: event.location || '',
        address: event.address || '',
        type: event.type,
        isRecurring: event.isRecurring,
        recurringPattern: event.recurringPattern || '',
        teamId: event.teamId,
        // Tournament-specific fields
        jerseyColor: '',
        arrivalTime: '',
        speedCheckTime: '',
        // Practice-specific fields
        practiceNotes: '',
        // Meeting-specific fields
        meetingLocation: '',
        meetingLink: '',
        // Film Study-specific fields
        filmLocation: '',
        filmLink: '',
        requiredEquipment: '',
      });
    } else {
      // Reset form for new event
      setForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        address: '',
        type: 'PRACTICE',
        isRecurring: false,
        recurringPattern: '',
        teamId: 'team-1',
        // Tournament-specific fields
        jerseyColor: '',
        arrivalTime: '',
        speedCheckTime: '',
        // Practice-specific fields
        practiceNotes: '',
        // Meeting-specific fields
        meetingLocation: '',
        meetingLink: '',
        // Film Study-specific fields
        filmLocation: '',
        filmLink: '',
        requiredEquipment: '',
      });
    }
  }, [event]);

  // Format date for input fields
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...form,
      type: form.type as 'TOURNAMENT' | 'PRACTICE' | 'MEETING' | 'FILM_STUDY' | 'OTHER',
      startTime: new Date(form.startTime),
      endTime: new Date(form.endTime),
      subEvents: form.type === 'TOURNAMENT' ? games.map((game, index) => ({
        id: game.id,
        title: `Game ${index + 1}`,
        opponent: game.opponent,
        startTime: new Date(game.startTime),
        endTime: new Date(new Date(game.startTime).getTime() + 2 * 60 * 60 * 1000), // Default 2 hours duration
        location: '', // Empty since we removed location field
        jerseyColor: game.jerseyColor,
        arrivalTime: game.arrivalTime || undefined,
        speedCheckTime: game.speedCheckTime || undefined,
        notes: game.notes || undefined,
      })) : undefined,
      // Include practice-specific fields
      practiceNotes: form.type === 'PRACTICE' ? form.practiceNotes : undefined,
      meetingLocation: form.type === 'MEETING' ? form.meetingLocation : undefined,
      meetingLink: form.type === 'MEETING' ? form.meetingLink : undefined,
      filmLocation: form.type === 'FILM_STUDY' ? form.filmLocation : undefined,
      filmLink: form.type === 'FILM_STUDY' ? form.filmLink : undefined,
      requiredEquipment: form.type === 'FILM_STUDY' ? form.requiredEquipment : undefined,
    };
    
    onSave(eventData);
    onClose();
  };

  // Handle event deletion
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm event deletion
  const confirmDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  // Get selected type info
  const selectedType = EVENT_TYPES.find(t => t.value === form.type) || EVENT_TYPES[1];

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div className="scrollbar-purple" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)'
        }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            margin: 0,
            textShadow: '0 0 15px rgba(138, 43, 226, 0.5)'
          }}>
            {isNewEvent ? 'Create New Event' : 'Edit Event'}
          </h2>
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseBtnHover(true)}
            onMouseLeave={() => setCloseBtnHover(false)}
            style={{
              background: closeBtnHover ? 'rgba(239, 68, 68, 0.2)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: closeBtnHover ? '#f87171' : '#9ca3af',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              transform: closeBtnHover ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Event Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Event Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(138, 43, 226, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Event Type Dropdown */}
          <div style={{ marginBottom: '16px', position: 'relative', zIndex: 50 }}>
            <label style={labelStyle}>Event Type *</label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: showTypeDropdown ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                border: showTypeDropdown ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: selectedType.color 
                }} />
                <span>{selectedType.label}</span>
              </div>
              <ChevronDown style={{
                height: '16px',
                width: '16px',
                color: '#c4b5fd',
                transition: 'transform 0.2s',
                transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>
            {showTypeDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                border: '1px solid rgba(138, 43, 226, 0.4)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                {EVENT_TYPES.map((type, index) => {
                  const isSelected = form.type === type.value;
                  const isHovered = hoveredType === type.value;
                  return (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => {
                        setForm({ ...form, type: type.value });
                        setShowTypeDropdown(false);
                      }}
                      onMouseEnter={() => setHoveredType(type.value)}
                      onMouseLeave={() => setHoveredType(null)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isSelected ? type.color : isHovered ? '#e9d5ff' : '#d1d5db',
                        background: isSelected
                          ? `${type.color}20`
                          : isHovered
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'transparent',
                        borderBottom: index < EVENT_TYPES.length - 1 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        border: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: type.color
                        }} />
                        {type.label}
                      </div>
                      {isSelected && <CheckCircle style={{ height: '14px', width: '14px', color: type.color }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <DateTimePicker
              label="Start Time"
              value={form.startTime}
              onChange={(value) => setForm({ ...form, startTime: value })}
              required
            />
            <DateTimePicker
              label="End Time"
              value={form.endTime}
              onChange={(value) => setForm({ ...form, endTime: value })}
              required
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location name"
                style={{ ...inputStyle, paddingLeft: '38px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
                }}
              />
              <MapPin style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '16px',
                width: '16px',
                color: '#9ca3af',
                pointerEvents: 'none'
              }} />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address, city, state, ZIP"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Event details and notes..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
              }}
            />
          </div>

          {/* Recurring Checkbox */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#a855f7',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="isRecurring" style={{ color: '#d1d5db', fontSize: '0.9rem', cursor: 'pointer' }}>
              Recurring Event
            </label>
          </div>

          {/* Recurring Pattern */}
          {form.isRecurring && (
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 40 }}>
              <label style={labelStyle}>Recurring Pattern</label>
              <button
                type="button"
                onClick={() => setShowPatternDropdown(!showPatternDropdown)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: showPatternDropdown ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  border: showPatternDropdown ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
                }}
              >
                <span style={{ color: form.recurringPattern ? '#fff' : '#9ca3af' }}>
                  {RECURRING_PATTERNS.find(p => p.value === form.recurringPattern)?.label || 'Select a pattern'}
                </span>
                <ChevronDown style={{
                  height: '16px',
                  width: '16px',
                  color: '#c4b5fd',
                  transition: 'transform 0.2s',
                  transform: showPatternDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>
              {showPatternDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                  border: '1px solid rgba(138, 43, 226, 0.4)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  {RECURRING_PATTERNS.filter(p => p.value !== '').map((pattern, index) => {
                    const isSelected = form.recurringPattern === pattern.value;
                    const isHovered = hoveredPattern === pattern.value;
                    return (
                      <button
                        type="button"
                        key={pattern.value}
                        onClick={() => {
                          setForm({ ...form, recurringPattern: pattern.value });
                          setShowPatternDropdown(false);
                        }}
                        onMouseEnter={() => setHoveredPattern(pattern.value)}
                        onMouseLeave={() => setHoveredPattern(null)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isSelected ? '#c084fc' : isHovered ? '#e9d5ff' : '#d1d5db',
                          background: isSelected
                            ? 'rgba(138, 43, 226, 0.3)'
                            : isHovered
                              ? 'rgba(168, 85, 247, 0.15)'
                              : 'transparent',
                          borderBottom: index < RECURRING_PATTERNS.length - 2 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          border: 'none'
                        }}
                      >
                        {pattern.label}
                        {isSelected && <CheckCircle style={{ height: '14px', width: '14px', color: '#c084fc' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Event Type Specific Fields */}
          {form.type === 'TOURNAMENT' && (
            <div style={{ 
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '16px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px' 
              }}>
                <h4 style={{ 
                  color: '#f87171', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  Game Schedule ({games.length} games)
                </h4>
                <button
                  type="button"
                  onClick={handleAddGame}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <Plus style={{ height: '14px', width: '14px' }} />
                  Add Game
                </button>
              </div>
              
              {games.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: '#9ca3af',
                  fontSize: '0.85rem'
                }}>
                  No games scheduled yet. Click "Add Game" to schedule your first game.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {games.map((game, index) => (
                    <div
                      key={game.id}
                      style={{
                        padding: '12px',
                        background: 'rgba(10, 0, 20, 0.5)',
                        borderRadius: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
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
                            {game.opponent || 'Opponent TBD'}
                          </span>
                          {game.jerseyColor && (
                            <span style={{ 
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171'
                            }}>
                              {game.jerseyColor}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ height: '12px', width: '12px' }} />
                            {new Date(game.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {game.arrivalTime && (
                            <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>
                              In chairs: {formatTimeDisplay(game.arrivalTime)}
                            </span>
                          )}
                          {game.speedCheckTime && (
                            <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>
                              Speed check: {formatTimeDisplay(game.speedCheckTime)}
                            </span>
                          )}
                        </div>
                        {game.notes && (
                          <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                            {game.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditGame(index)}
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          <Edit style={{ height: '12px', width: '12px' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGame(index)}
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                        >
                          <Trash2 style={{ height: '12px', width: '12px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {form.type === 'PRACTICE' && (
            <div style={{ 
              padding: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                color: '#4ade80', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '12px' 
              }}>
                Practice Details
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Practice Notes</label>
                <textarea
                  name="practiceNotes"
                  rows={3}
                  value={form.practiceNotes}
                  onChange={handleChange}
                  placeholder="Focus areas, drills, objectives..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>
            </div>
          )}

          {form.type === 'MEETING' && (
            <div style={{ 
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                color: '#60a5fa', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '12px' 
              }}>
                Meeting Details
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Meeting Location</label>
                <input
                  type="text"
                  name="meetingLocation"
                  value={form.meetingLocation}
                  onChange={handleChange}
                  placeholder="Conference room, virtual, etc."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Meeting Link</label>
                <input
                  type="url"
                  name="meetingLink"
                  value={form.meetingLink}
                  onChange={handleChange}
                  placeholder="Zoom, Teams, etc."
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {form.type === 'FILM_STUDY' && (
            <div style={{ 
              padding: '16px',
              background: 'rgba(192, 132, 252, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(192, 132, 252, 0.2)',
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                color: '#c084fc', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '12px' 
              }}>
                Film Study Details
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Game to be studied</label>
                <input
                  type="text"
                  name="filmLocation"
                  value={form.filmLocation}
                  onChange={handleChange}
                  placeholder="Opponent, date, or game identifier"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>VideoChat Link</label>
                <input
                  type="url"
                  name="filmLink"
                  value={form.filmLink}
                  onChange={handleChange}
                  placeholder="Zoom, Teams, or video conference link"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            {!isNewEvent && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                onMouseEnter={() => setDeleteBtnHover(true)}
                onMouseLeave={() => { setDeleteBtnHover(false); setDeleteBtnActive(false); }}
                onMouseDown={() => setDeleteBtnActive(true)}
                onMouseUp={() => setDeleteBtnActive(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: deleteBtnActive
                    ? 'rgba(239, 68, 68, 0.4)'
                    : deleteBtnHover
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: deleteBtnHover
                    ? '1px solid rgba(248, 113, 113, 0.6)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: deleteBtnActive ? 'scale(0.97)' : deleteBtnHover ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <Trash2 style={{ height: '14px', width: '14px' }} />
                Delete
              </button>
            )}
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={onClose}
                onMouseEnter={() => setCancelBtnHover(true)}
                onMouseLeave={() => { setCancelBtnHover(false); setCancelBtnActive(false); }}
                onMouseDown={() => setCancelBtnActive(true)}
                onMouseUp={() => setCancelBtnActive(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: cancelBtnActive
                    ? 'rgba(139, 92, 246, 0.4)'
                    : cancelBtnHover
                      ? 'rgba(139, 92, 246, 0.3)'
                      : 'rgba(139, 92, 246, 0.15)',
                  border: cancelBtnHover
                    ? '1px solid rgba(168, 85, 247, 0.6)'
                    : '1px solid rgba(139, 92, 246, 0.3)',
                  color: cancelBtnHover ? '#e9d5ff' : '#c4b5fd',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: cancelBtnActive ? 'scale(0.97)' : cancelBtnHover ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: cancelBtnHover ? '0 0 12px rgba(139, 92, 246, 0.2)' : 'none'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onMouseEnter={() => setSubmitBtnHover(true)}
                onMouseLeave={() => { setSubmitBtnHover(false); setSubmitBtnActive(false); }}
                onMouseDown={() => setSubmitBtnActive(true)}
                onMouseUp={() => setSubmitBtnActive(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: submitBtnActive
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)'
                    : submitBtnHover
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
                  border: submitBtnHover
                    ? '1px solid rgba(168, 85, 247, 0.7)'
                    : '1px solid rgba(139, 92, 246, 0.5)',
                  color: '#e9d5ff',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: submitBtnActive ? 'scale(0.97)' : submitBtnHover ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: submitBtnHover ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none'
                }}
              >
                {isNewEvent ? 'Create Event' : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
        
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Trash2 style={{ height: '24px', width: '24px', color: '#f87171' }} />
                </div>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Delete Event
                </h3>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.6)',
                    color: '#c4b5fd',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.6) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Scheduling Modal */}
        {showGameModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {editingGameIndex !== null ? 'Edit Game' : 'Add Game'}
                </h3>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  Schedule game details including opponent, time, and team requirements
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Opponent */}
                <div>
                  <label style={labelStyle}>Opponent *</label>
                  <input
                    type="text"
                    name="opponent"
                    value={gameForm.opponent}
                    onChange={handleGameFormChange}
                    placeholder="Enter opponent name"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Date and Time */}
                <div>
                  <DateTimePicker
                    label="Start Time *"
                    value={gameForm.startTime}
                    onChange={(value) => setGameForm({ ...gameForm, startTime: value })}
                    required
                  />
                </div>

                {/* Jersey Color */}
                <div style={{ position: 'relative', zIndex: 70 }}>
                  <label style={labelStyle}>Jersey Color</label>
                  <button
                    type="button"
                    onClick={() => setShowGameJerseyColorDropdown(!showGameJerseyColorDropdown)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: showGameJerseyColorDropdown ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                      border: showGameJerseyColorDropdown ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
                    }}
                  >
                    <span style={{ color: gameForm.jerseyColor ? '#fff' : '#9ca3af' }}>
                      {gameForm.jerseyColor ? JERSEY_COLORS.find(c => c.value === gameForm.jerseyColor)?.label : 'Select jersey color'}
                    </span>
                    <ChevronDown 
                      style={{ 
                        height: '16px', 
                        width: '16px', 
                        color: '#c4b5fd',
                        transition: 'transform 0.2s',
                        transform: showGameJerseyColorDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                      }} 
                    />
                  </button>
                  {showGameJerseyColorDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
                      border: '1px solid rgba(138, 43, 226, 0.4)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      zIndex: 1600,
                      overflow: 'hidden'
                    }}>
                      {JERSEY_COLORS.map((color) => {
                        const isSelected = gameForm.jerseyColor === color.value;
                        return (
                          <button
                            key={color.value}
                            onClick={() => {
                              setGameForm({ ...gameForm, jerseyColor: color.value });
                              setShowGameJerseyColorDropdown(false);
                            }}
                            onMouseEnter={() => {}}
                            onMouseLeave={() => {}}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              background: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: color.color,
                              border: color.value === 'white' ? '1px solid #374151' : 'none'
                            }} />
                            {color.label}
                            {isSelected && <CheckCircle style={{ height: '14px', width: '14px', color: '#c084fc' }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Arrival Time */}
                <div>
                  <TimePicker
                    value={gameForm.arrivalTime}
                    onChange={(value) => setGameForm({ ...gameForm, arrivalTime: value })}
                    label="In Chairs By"
                  />
                </div>

                {/* Speed Check Time */}
                <div>
                  <TimePicker
                    value={gameForm.speedCheckTime}
                    onChange={(value) => setGameForm({ ...gameForm, speedCheckTime: value })}
                    label="Speed Check Time"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Game Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={gameForm.notes}
                    onChange={handleGameFormChange}
                    placeholder="Additional game information, special instructions, etc."
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => setShowGameModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#c4b5fd',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGame}
                  disabled={!gameForm.opponent || !gameForm.startTime}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: (!gameForm.opponent || !gameForm.startTime)
                      ? 'rgba(139, 92, 246, 0.2)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)',
                    border: (!gameForm.opponent || !gameForm.startTime)
                      ? '1px solid rgba(139, 92, 246, 0.3)'
                      : '1px solid rgba(139, 92, 246, 0.5)',
                    color: (!gameForm.opponent || !gameForm.startTime)
                      ? '#6b7280'
                      : '#e9d5ff',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: (!gameForm.opponent || !gameForm.startTime)
                      ? 'not-allowed'
                      : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {editingGameIndex !== null ? 'Update Game' : 'Add Game'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
