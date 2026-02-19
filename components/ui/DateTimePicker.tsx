"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const AMPM = ['AM', 'PM'];

export function DateTimePicker({ value, onChange, label, required }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse the value into date components
  const parseValue = () => {
    if (!value) {
      return { date: null, hour: 12, minute: '00', ampm: 'PM' };
    }
    const d = new Date(value);
    let hour = d.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const minute = String(Math.floor(d.getMinutes() / 5) * 5).padStart(2, '0');
    return { date: d, hour, minute, ampm };
  };
  
  const { date: selectedDate, hour: selectedHour, minute: selectedMinute, ampm: selectedAmPm } = parseValue();
  
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get calendar days for the display month
  const getCalendarDays = () => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };
  
  // Handle date selection
  const handleDateSelect = (day: Date) => {
    const current = selectedDate || new Date();
    let hour24 = selectedHour;
    if (selectedAmPm === 'PM' && selectedHour !== 12) hour24 += 12;
    if (selectedAmPm === 'AM' && selectedHour === 12) hour24 = 0;
    
    const newDate = new Date(day);
    newDate.setHours(hour24, parseInt(selectedMinute), 0, 0);
    
    const formatted = formatDateTimeForInput(newDate);
    onChange(formatted);
    setShowTimePicker(true);
  };
  
  // Handle time selection
  const handleTimeChange = (hour: number, minute: string, ampm: string) => {
    const current = selectedDate || new Date();
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
    
    const newDate = new Date(current);
    newDate.setHours(hour24, parseInt(minute), 0, 0);
    
    const formatted = formatDateTimeForInput(newDate);
    onChange(formatted);
  };
  
  // Format date for input value
  const formatDateTimeForInput = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  
  // Format display value
  const getDisplayValue = () => {
    if (!value || !selectedDate) return 'Select date & time';
    return format(selectedDate, 'MMM d, yyyy') + ' at ' + format(selectedDate, 'h:mm a');
  };
  
  const calendarDays = getCalendarDays();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label style={{
        display: 'block',
        color: '#c4b5fd',
        fontSize: '0.8rem',
        fontWeight: '500',
        marginBottom: '6px'
      }}>
        {label} {required && '*'}
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setShowTimePicker(false); }}
        style={{
          width: '100%',
          padding: '12px 14px',
          paddingLeft: '38px',
          borderRadius: '10px',
          background: 'rgba(138, 43, 226, 0.1)',
          border: isOpen ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(138, 43, 226, 0.3)',
          color: value ? '#fff' : '#9ca3af',
          fontSize: '0.9rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        <span>{getDisplayValue()}</span>
        <ChevronDown style={{
          height: '16px',
          width: '16px',
          color: '#c4b5fd',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }} />
      </button>
      <Calendar style={{
        position: 'absolute',
        left: '12px',
        top: '38px',
        height: '16px',
        width: '16px',
        color: '#9ca3af',
        pointerEvents: 'none'
      }} />
      
      {/* Dropdown Picker */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {!showTimePicker ? (
            /* Calendar View */
            <div style={{ padding: '12px' }}>
              {/* Month Navigation */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'rgba(138, 43, 226, 0.2)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    cursor: 'pointer',
                    color: '#c4b5fd',
                    display: 'flex'
                  }}
                >
                  <ChevronLeft style={{ height: '14px', width: '14px' }} />
                </button>
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                  {format(displayMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'rgba(138, 43, 226, 0.2)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    cursor: 'pointer',
                    color: '#c4b5fd',
                    display: 'flex'
                  }}
                >
                  <ChevronRight style={{ height: '14px', width: '14px' }} />
                </button>
              </div>
              
              {/* Week Headers */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '2px',
                marginBottom: '4px'
              }}>
                {weekDays.map(day => (
                  <div key={day} style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '4px'
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '2px'
              }}>
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, displayMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '6px',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.6) 0%, rgba(168, 85, 247, 0.5) 100%)'
                          : isToday
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'transparent',
                        border: isToday && !isSelected ? '1px solid rgba(74, 222, 128, 0.5)' : 'none',
                        color: isSelected 
                          ? '#fff' 
                          : isToday 
                            ? '#4ade80'
                            : isCurrentMonth 
                              ? '#d1d5db' 
                              : '#4b5563',
                        fontSize: '0.8rem',
                        fontWeight: isSelected || isToday ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = isToday ? 'rgba(34, 197, 94, 0.2)' : 'transparent';
                        }
                      }}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
              
              {/* Time Button */}
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.4) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    color: '#e9d5ff',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock style={{ height: '14px', width: '14px' }} />
                  Set Time: {format(selectedDate, 'h:mm a')}
                </button>
              )}
            </div>
          ) : (
            /* Time Picker View */
            <div style={{ padding: '12px' }}>
              <button
                type="button"
                onClick={() => setShowTimePicker(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#c4b5fd',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronLeft style={{ height: '14px', width: '14px' }} />
                Back to Calendar
              </button>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'center'
              }}>
                {/* Hour */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>Hour</div>
                  <div 
                    className="datetime-picker-scroll"
                    style={{ 
                      maxHeight: '150px', 
                      overflowY: 'auto',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      padding: '4px'
                    }}
                  >
                    {HOURS.map(hour => (
                      <button
                        type="button"
                        key={hour}
                        onClick={() => handleTimeChange(hour, selectedMinute, selectedAmPm)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          background: selectedHour === hour ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                          border: 'none',
                          color: selectedHour === hour ? '#e9d5ff' : '#d1d5db',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: selectedHour === hour ? '600' : '400'
                        }}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Minute */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>Min</div>
                  <div 
                    className="datetime-picker-scroll"
                    style={{ 
                      maxHeight: '150px', 
                      overflowY: 'auto',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      padding: '4px'
                    }}
                  >
                    {MINUTES.map(min => (
                      <button
                        type="button"
                        key={min}
                        onClick={() => handleTimeChange(selectedHour, min, selectedAmPm)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          background: selectedMinute === min ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                          border: 'none',
                          color: selectedMinute === min ? '#e9d5ff' : '#d1d5db',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: selectedMinute === min ? '600' : '400'
                        }}
                      >
                        {min}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* AM/PM */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>AM/PM</div>
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '4px'
                  }}>
                    {AMPM.map(ap => (
                      <button
                        type="button"
                        key={ap}
                        onClick={() => handleTimeChange(selectedHour, selectedMinute, ap)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          background: selectedAmPm === ap ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                          border: 'none',
                          color: selectedAmPm === ap ? '#e9d5ff' : '#d1d5db',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: selectedAmPm === ap ? '600' : '400'
                        }}
                      >
                        {ap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Done Button */}
              <button
                type="button"
                onClick={() => { setIsOpen(false); setShowTimePicker(false); }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)',
                  border: '1px solid rgba(196, 181, 253, 0.5)',
                  color: '#c4b5fd',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx global>{`
        /* Custom scrollbar for DateTimePicker */
        .datetime-picker-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(138, 43, 226, 0.5) rgba(0, 0, 0, 0.2);
        }
        .datetime-picker-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .datetime-picker-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .datetime-picker-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(138, 43, 226, 0.6) 0%, rgba(168, 85, 247, 0.5) 100%);
          border-radius: 3px;
          border: 1px solid rgba(138, 43, 226, 0.3);
        }
        .datetime-picker-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.8) 0%, rgba(192, 132, 252, 0.7) 100%);
        }
      `}</style>
    </div>
  );
}
